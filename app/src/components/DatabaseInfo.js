// DatabaseInfo.js
import React, { useState } from 'react';

function DatabaseInfo() {
  const [totalRows, setTotalRows] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const getTotalRows = () => {
    // Prevent further fetches if we've already fetched the data
    if (hasFetched) {
      return;
    }

    fetch('/api/total-rows')
      .then(response => response.json())
      .then(data => {
        // The data is an array of arrays, we want the first element of the first array
        if (data && data.length > 0 && data[0].length > 0) {
          setTotalRows(data[0][0]); // data[0][0] is the number of total rows
        } else {
          // If there's no data, set it to zero or another appropriate default value
          setTotalRows(0);
        }
        setHasFetched(true); // Update the state to indicate we've fetched the data
      })
      .catch(error => {
        console.error('Error fetching total rows:', error);
        setTotalRows('Error fetching data');
        setHasFetched(true); // Update the state to indicate we've attempted to fetch the data
      });
  };

  return (
    <div>
      <h1>Database Information</h1>
      <button onClick={getTotalRows} disabled={hasFetched}>
        Get Total Number of Tuples
      </button>
      {totalRows !== null ? (
        <p>Total rows in all tables: {totalRows}</p>
      ) : (
        hasFetched ? <p>No data found.</p> : null
      )}
    </div>
  );
}

export default DatabaseInfo;
