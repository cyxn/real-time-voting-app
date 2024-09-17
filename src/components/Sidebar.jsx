// src/components/Sidebar.js
import React, { useState } from 'react';

function Sidebar({
  topics,
  filter,
  setFilter,
  addTopic,
  voteForTopic,
  removeVote,
  removeTopic,
  sessionId,
  votes,
  loading,
  totalVotesUsed,
}) {
  const [newTopicTitle, setNewTopicTitle] = useState('');

  const handleAddTopic = (e) => {
    e.preventDefault();
    addTopic(newTopicTitle);
    setNewTopicTitle('');
  };

  const votesLeft = 5 - totalVotesUsed;

  return (
    <div className="w-80 p-6 bg-gray-100 border-r border-gray-300">
      <h2 className="text-2xl font-bold mb-4">Topics</h2>

      {/* Display votes left */}
      <div className="mb-4">
        <p className="text-sm text-gray-700">
          Votes Left: <span className="font-semibold">{votesLeft}</span>
        </p>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            filter === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('recent')}
          disabled={loading} // Disable during loading
        >
          Recently Added
        </button>
        <button
          className={`px-3 py-1 rounded ${
            filter === 'votes' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('votes')}
          disabled={loading} // Disable during loading
        >
          Most Votes
        </button>
      </div>

      <form onSubmit={handleAddTopic} className="mb-4">
        <input
          type="text"
          value={newTopicTitle}
          onChange={(e) => setNewTopicTitle(e.target.value)}
          placeholder="Add new topic"
          maxLength={200}
          className="w-full p-2 border border-gray-300 rounded mb-2"
          disabled={loading} // Disable during loading
        />
        <button
          type="submit"
          className={`w-full py-2 rounded ${
            loading
              ? 'bg-green-300 text-white cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          disabled={loading} // Disable during loading
        >
          Add Topic
        </button>
      </form>

      <ul className="space-y-4">
        {topics.map((topic) => {
          const userVotes = votes.filter(
            (vote) =>
              vote.topic_id === topic.id && vote.session_id === sessionId,
          );
          return (
            <li key={topic.id} className="border-b pb-2">
              <div className="font-semibold">{topic.title}</div>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-sm text-gray-600">
                  {topic.voteCount} votes
                </span>
                <button
                  onClick={() => voteForTopic(topic.id)}
                  className={`px-2 py-1 text-sm rounded ${
                    loading || votesLeft <= 0
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={loading || votesLeft <= 0}
                >
                  Vote
                </button>
                {userVotes.length > 0 && (
                  <button
                    onClick={() => removeVote(userVotes[0].id)}
                    className={`px-2 py-1 text-sm rounded ${
                      loading
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                    disabled={loading}
                  >
                    Remove Vote
                  </button>
                )}
                {topic.created_by === sessionId && topic.voteCount === 0 && (
                  <button
                    onClick={() => removeTopic(topic.id)}
                    className={`px-2 py-1 text-sm rounded ${
                      loading
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                    disabled={loading}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Sidebar;
