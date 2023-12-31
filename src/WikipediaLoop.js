// WikipediaLoop.js

import React, { useState } from 'react';
import axios from 'axios';
import './WikipediaLoop.css'; // Import the CSS file

const WikipediaLoop = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleStartLoop = async () => {
    // Check for empty input
    if (!url.trim()) {
      setError('Please enter a valid Wikipedia URL.');
      return;
    }

    // Check for a valid URL
    if (!isValidUrl(url)) {
      setError('Please enter a valid Wikipedia URL format.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/wikipedia-loop', { url });
      setResult(response.data);
      setError(null);
    } catch (error) {
      setError(`Error: ${error.response ? error.response.data.error : 'Unknown error'}`);
      setResult(null);
    }
  };

  // Function to check for a valid URL format
  const isValidUrl = (inputUrl) => {
    try {
      new URL(inputUrl);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="wikipedia-loop-container">
      <h1>Wikipedia Loop</h1>
      <div className="input-container">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Computer_science)"
        />
        <button onClick={handleStartLoop}>Start Loop</button>
      </div>

      {result && (
        <div className="result-container">
          <p className="result-header">Wikipedia Loop Result</p>
          <p>Steps: {result.steps}</p>
          <ul>
            {result.visitedPages.map((page, index) => (
              <li key={index}>{page}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default WikipediaLoop;
