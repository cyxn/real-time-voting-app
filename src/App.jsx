// src/App.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabaseClient';
import Sidebar from './components/Sidebar';
import WordCloudVisualization from './components/WordCloudVisualization';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let storedSession = localStorage.getItem('session_id');
    if (!storedSession) {
      storedSession = uuidv4();
      localStorage.setItem('session_id', storedSession);
    }
    setSessionId(storedSession);
  }, []);

  if (!sessionId) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar sessionId={sessionId} />
      <WordCloudVisualization />
    </div>
  );
}

export default App;