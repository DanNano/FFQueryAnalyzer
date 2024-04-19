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
// Endpoint to get fantasy points per game for a specific player by their player ID, Query1
app.get('/api/player-stats', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const playerId = req.query.playerid || '00-0032765'; // Default player ID if none provided
    const result = await connection.execute(`
      SELECT p.name, p.playerid, p.position, ps.year,
        ROUND((
          (ps.passingyards * 0.04) + 
          (ps.passingtds * 4) - 
          (ps.intsthrown * 2) + 
          (ps.rushingyards * 0.1) + 
          (ps.rushingtds * 6) + 
          (ps.receivingyards * 0.1) + 
          (ps.receivingtds * 6) - 
          (ps.rushingfumbles * 2) - 
          (ps.receivingfumbles * 2)
        ) / ps.gamesplayed, 2) AS fantasypointspergame
      FROM DLAFORCE.player p
      JOIN DLAFORCE.playerstats ps ON p.playerid = ps.playerid
      WHERE p.playerid = :playerId
    `, [playerId], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
// Endpoint to get player details by name, defaulting to 'Michael Thomas' if no name is provided
app.get('/api/player-by-name', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const playerName = req.query.name || 'Michael Thomas'; // Default player name if none provided
    const result = await connection.execute(
      `SELECT p.name, p.playerid
       FROM DLAFORCE.player p
       WHERE p.name = :name`, 
      { name: playerName }, // Use parameter binding to safely insert the name
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log(result);
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).send({ message: 'Player not found' });
    }
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
// Query2
// Query3
// Query4
// Query5

//-----------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
