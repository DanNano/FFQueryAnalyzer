// DatabaseInfo.js
import React, { useState } from 'react';

function DatabaseInfo() {
  const [totalRows, setTotalRows] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const getTotalRows = () => {
    if (hasFetched) {
      return;
    }

    fetch('/api/total-rows')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0 && data[0].length > 0) {
          setTotalRows(data[0][0]);
        } else {
          setTotalRows(0);
        }
        setHasFetched(true);
      })
      .catch(error => {
        console.error('Error fetching total rows:', error);
        setTotalRows('Error fetching data');
        setHasFetched(true);
      });
  };

  return (
    <div>
      <h1>Database Information</h1>
      <button onClick={getTotalRows} disabled={hasFetched}>
        Get Total Number of Tuples in Database
      </button>
      {totalRows !== null ? (
        <p>Total rows in all tables: {totalRows}</p>
      ) : (
        hasFetched ? <p>No data found.</p> : null
      )}
      <pre style={{
        textAlign: 'left', 
        whiteSpace: 'pre-wrap', 
        wordWrap: 'break-word', 
        maxWidth: '95%', 
        margin: '1rem', 
        padding: '10px', 
        overflowX: 'auto'
      }}>
        Our database gives fans of Fantasy Football access to an extensive analytical playground by utilizing the power of actual NFL player statistics. This data is sourced from an extensive Kaggle dataset, which you can explore here.
        https://www.kaggle.com/datasets/dubradave/nfl-player-statistics-2002-present/
      </pre>
    </div>
  );
  
}

export default DatabaseInfo;
