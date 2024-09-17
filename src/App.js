// src/App.js
import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import WordCloudVisualization from './components/WordCloudVisualization';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [votes, setVotes] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [loading, setLoading] = useState(false);

  // Initialize session ID
  useEffect(() => {
    let session = localStorage.getItem('sessionId');
    if (!session) {
      session = uuidv4();
      localStorage.setItem('sessionId', session);
    }
    setSessionId(session);
  }, []);

  // Subscribe to loading state changes to show/hide progress bar
  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  // Fetch topics and votes
  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates
    const topicSubscription = supabase
      .channel('topics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'topics' },
        (payload) => {
          fetchTopics(); // Re-fetch topics on any change
        },
      )
      .subscribe();

    const voteSubscription = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          fetchVotes();
        },
      )
      .subscribe();

    return () => {
      topicSubscription.unsubscribe();
      voteSubscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    await fetchTopics();
    await fetchVotes();
  };

  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching topics:', error);
    } else {
      setTopics(data);
    }
  };

  const fetchVotes = async () => {
    const { data, error } = await supabase.from('votes').select('*');

    if (error) {
      console.error('Error fetching votes:', error);
    } else {
      setVotes(data);
    }
  };

  // Add new topic
  const addTopic = async (title) => {
    if (title.length === 0 || title.length > 200) {
      alert('Topic title must be between 1 and 200 characters.');
      return;
    }

    setLoading(true); // Start loading
    const { error } = await supabase.from('topics').insert([
      {
        title,
        created_by: sessionId,
      },
    ]);
    setLoading(false); // End loading

    if (error) {
      console.error('Error adding topic:', error);
    }
  };

  // Remove topic
  const removeTopic = async (topicId) => {
    const topicVotes = votes.filter((vote) => vote.topic_id === topicId);

    if (topicVotes.length > 0) {
      alert('Cannot delete topic with votes.');
      return;
    }

    setLoading(true); // Start loading
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId)
      .eq('created_by', sessionId);
    setLoading(false); // End loading

    if (error) {
      console.error('Error deleting topic:', error);
    }
  };

  // Vote for a topic
  const voteForTopic = async (topicId) => {
    const userVotes = votes.filter((vote) => vote.session_id === sessionId);

    if (userVotes.length >= 5) {
      alert('You have used all your votes.');
      return;
    }

    setLoading(true); // Start loading
    const { error } = await supabase.from('votes').insert([
      {
        topic_id: topicId,
        session_id: sessionId,
      },
    ]);
    setLoading(false); // End loading

    if (error) {
      console.error('Error casting vote:', error);
    }
  };

  // Remove a vote
  const removeVote = async (voteId) => {
    setLoading(true); // Start loading
    const { error } = await supabase.from('votes').delete().eq('id', voteId);
    setLoading(false); // End loading

    if (error) {
      console.error('Error removing vote:', error);
    }
  };

  // Prepare data for word cloud
  const getWordCloudData = () => {
    return topics.map((topic) => {
      const topicVotes = votes.filter((vote) => vote.topic_id === topic.id);
      return {
        text: topic.title,
        value: topicVotes.length,
      };
    });
  };

  // Filtered topics for sidebar
  const filteredTopics = topics
    .map((topic) => {
      const topicVotes = votes.filter((vote) => vote.topic_id === topic.id);
      return {
        ...topic,
        voteCount: topicVotes.length,
      };
    })
    .sort((a, b) => {
      if (filter === 'votes') {
        return b.voteCount - a.voteCount;
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Calculate votes left
  const totalVotesUsed = votes.filter(
    (vote) => vote.session_id === sessionId,
  ).length;

  return (
    <div className="flex h-screen">
      {/* The NProgress progress bar will be automatically added to the top of the page */}
      <Sidebar
        topics={filteredTopics}
        filter={filter}
        setFilter={setFilter}
        addTopic={addTopic}
        voteForTopic={voteForTopic}
        removeVote={removeVote}
        removeTopic={removeTopic}
        sessionId={sessionId}
        votes={votes}
        loading={loading} // Pass loading state
        totalVotesUsed={totalVotesUsed} // Pass total votes used
      />
      <div className="flex-grow p-6">
        <WordCloudVisualization data={getWordCloudData()} />
      </div>
    </div>
  );
}

export default App;
