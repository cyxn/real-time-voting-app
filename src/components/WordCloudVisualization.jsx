// src/components/WordCloudVisualization.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import ReactWordcloud from 'react-wordcloud';

function WordCloudVisualization() {
  const [words, setWords] = useState([]);

  const fetchWords = async () => {
    const { data, error } = await supabase
      .from('topics')
      .select('id, title, votes(id)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      const wordData = data.map(topic => ({
        text: topic.title,
        value: topic.votes.length,
      }));
      setWords(wordData);
    }
  };

  useEffect(() => {
    fetchWords();

    // Subscribe to real-time changes in topics and votes
    const topicsSubscription = supabase
      .from('topics')
      .on('*', payload => {
        fetchWords();
      })
      .subscribe();

    const votesSubscription = supabase
      .from('votes')
      .on('*', payload => {
        fetchWords();
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(topicsSubscription);
      supabase.removeSubscription(votesSubscription);
    };
    // eslint-disable-next-line
  }, []);

  const options = {
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [20, 60],
  };

  return (
    <div className="w-3/4 p-4">
      <h2 className="text-xl font-bold mb-4">Word Cloud</h2>
      <ReactWordcloud words={words} options={options} />
    </div>
  );
}

export default WordCloudVisualization;