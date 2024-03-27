// server.js

/* This file contains the endpoints of interacting with the oracle database */
require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');

const app = express();
const port = process.env.PORT || 5000;

// Oracle database connection configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: 'oracle.cise.ufl.edu:1521/orcl'
};

// Endpoint to get the total row count for DatabaseInfo page
app.get('/api/total-rows', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`
      SELECT SUM(rowcount) AS total_rows
      FROM (
        SELECT COUNT(*) AS rowcount FROM DLAFORCE.SEASON
        UNION ALL
        SELECT COUNT(*) AS rowcount FROM DLAFORCE.GAME
        UNION ALL
        SELECT COUNT(*) AS rowcount FROM DLAFORCE.PLAYER
        UNION ALL
        SELECT COUNT(*) AS rowcount FROM DLAFORCE.PLAY
        UNION ALL
        SELECT COUNT(*) AS rowcount FROM DLAFORCE.PLAYERSNAPCOUNTS
        UNION ALL
        SELECT COUNT(*) AS rowcount FROM DLAFORCE.PLAYERSTATS
      )
    `);
    console.log(result);
    res.json(result.rows);
  } catch (err) {
    console.error('Error on database execution: ', err);
    res.status(500).send({ message: 'Error connecting to the database' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection: ', err);
      }
    }
  }
});
// ---------------------------------------------------------------------------------------------------------------------------

/* Add other SQL query endpoints here */
// Query1
// Query2
// Query3
// Query4
// Query5

//-----------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
