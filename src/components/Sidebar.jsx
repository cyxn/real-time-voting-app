// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

function Sidebar({ sessionId }) {
  const [topics, setTopics] = useState([]);
  const [filter, setFilter] = useState('recent'); // 'recent' or 'votes'
  const [newTopic, setNewTopic] = useState('');
  const [userVotes, setUserVotes] = useState({}); // { topicId: voteCount }
  const [availableVotes, setAvailableVotes] = useState(5);

  // Fetch topics based on filter
  const fetchTopics = async () => {
    let query = supabase.from('topics').select('*, votes(id)');
    if (filter === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (filter === 'votes') {
      query = query.order('votes', { ascending: false });
    }
    const { data, error } = await query;
    if (error) console.error(error);
    else setTopics(data);
  };

  // Fetch user votes
  const fetchUserVotes = async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('topic_id')
      .eq('session_id', sessionId);
    if (error) {
      console.error(error);
    } else {
      const votes = data.reduce((acc, vote) => {
        acc[vote.topic_id] = (acc[vote.topic_id] || 0) + 1;
        return acc;
      }, {});
      setUserVotes(votes);
      setAvailableVotes(5 - data.length);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchUserVotes();

    // Subscribe to real-time changes
    const subscription = supabase
      .from('topics')
      .on('*', payload => {
        fetchTopics();
      })
      .subscribe();

    const votesSubscription = supabase
      .from('votes')
      .on('*', payload => {
        fetchUserVotes();
        fetchTopics();
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
      supabase.removeSubscription(votesSubscription);
    };
    // eslint-disable-next-line
  }, [filter]);

  const handleAddTopic = async () => {
    if (newTopic.trim() === '' || newTopic.length > 200) {
      alert('Topic must be between 1 and 200 characters.');
      return;
    }
    const { data, error } = await supabase
      .from('topics')
      .insert([{ title: newTopic, created_by: sessionId }]);
    if (error) console.error(error);
    else setNewTopic('');
  };

  const handleVote = async (topicId) => {
    if (availableVotes <= 0) {
      alert('You have no votes left this session.');
      return;
    }
    const { data, error } = await supabase
      .from('votes')
      .insert([{ topic_id: topicId, session_id: sessionId }]);
    if (error) console.error(error);
  };

  const handleRemoveVote = async (topicId) => {
    const { data, error } = await supabase
      .from('votes')
      .delete()
      .match({ topic_id: topicId, session_id: sessionId })
      .limit(userVotes[topicId]);
    if (error) console.error(error);
  };

  const handleDeleteTopic = async (topic) => {
    if (topic.votes.length > 0) {
      alert('Cannot delete a topic that has votes.');
      return;
    }
    const { data, error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topic.id)
      .eq('created_by', sessionId);
    if (error) console.error(error);
  };

  return (
    <div className="w-1/4 p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Topics</h2>

      {/* Add New Topic */}
      <div className="mb-4">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          maxLength={200}
          placeholder="Add a new topic (max 200 chars)"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleAddTopic}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
        >
          Add Topic
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <label className="mr-2">Sort By:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-1 border rounded"
        >
          <option value="recent">Recently Added</option>
          <option value="votes">Most Votes</option>
        </select>
      </div>

      {/* Topics List */}
      <ul>
        {topics.map((topic) => (
          <li key={topic.id} className="mb-2">
            <div className="flex justify-between items-center">
              <span>{topic.title} ({topic.votes.length})</span>
              {topic.created_by === sessionId && (
                <button
                  onClick={() => handleDeleteTopic(topic)}
                  className="text-red-500"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center mt-1">
              <button
                onClick={() => handleVote(topic.id)}
                className="mr-2 bg-green-500 text-white px-2 py-1 rounded"
              >
                Vote
              </button>
              {userVotes[topic.id] > 0 && (
                <button
                  onClick={() => handleRemoveVote(topic.id)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Remove Vote ({userVotes[topic.id]})
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Votes Remaining */}
      <div className="mt-4">
        <strong>Votes Left:</strong> {availableVotes}
      </div>
    </div>
  );
}

export default Sidebar;