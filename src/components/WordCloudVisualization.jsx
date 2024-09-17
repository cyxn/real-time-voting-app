// src/components/WordCloudVisualization.js
import React from 'react';
import WordCloud from 'react-wordcloud';

function WordCloudVisualization({ data }) {
  const options = {
    rotations: 2,
    rotationAngles: [0, 0],
    fontSizes: [20, 60, 120, 180],
    colors: ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444'],
    fontFamily: 'sans-serif',
  };

  return (
    <div className="h-full">
      <WordCloud
        words={data}
        options={options}
        maxWords={100}
        className="w-full h-full"
      />
    </div>
  );
}

export default WordCloudVisualization;
