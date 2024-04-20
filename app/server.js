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
      SELECT p.name, p.playerid, p.position, ps.year, ps.team,
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
      `SELECT p.name, p.playerid, p.position, MIN(ps.year) as firstyear, MAX(ps.year) as lastyear
       FROM DLAFORCE.player p
       JOIN DLAFORCE.playerstats ps ON p.playerid = ps.playerid
       WHERE p.name = :name
       GROUP BY p.name, p.playerid, p.position`,
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
// Endpoint to get target share percentage for a specific player by their player ID, Query3
app.get('/api/player-target-share', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const playerId = req.query.playerid || '00-0032765'; // Default player ID if none provided
    const result = await connection.execute(`
      SELECT p.name, p.playerid, p.position, ps.year, ps.team, 
        TO_CHAR(ROUND((COUNT(CASE WHEN pl.playtype = 'pass' AND pl.receivingplayerid = ps.playerid THEN 1 END) / 
        COUNT(CASE WHEN pl.playtype = 'pass' AND pl.receivingplayerid IS NOT NULL THEN 1 END)) * 100, 2), '999.99') || '%' AS targetsharepercentage
      FROM dlaforce.player p
      JOIN dlaforce.playerstats ps ON p.playerid = ps.playerid
      JOIN dlaforce.play pl ON ps.team = pl.possessingteam AND SUBSTR(pl.gameid, 1, 4) = ps.year
      WHERE p.playerid = :playerId AND EXISTS (
        SELECT 1 FROM dlaforce.playersnapcounts psc 
        WHERE psc.playerid = p.playerid AND psc.gameid = pl.gameid
      )
      GROUP BY p.name, p.playerid, p.position, ps.year, ps.team
      ORDER BY ps.year
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
// ---------------------------------------------------------------------------------------------------------------------------
// Endpoint for Goal-Line Carry Percentage by playerID, Query 4
app.get('/api/player-goalline-carry-percentage', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const playerId = req.query.id || '00-0034791'; // Default player ID if none provided
    const result = await connection.execute(`
      SELECT p.name, p.playerid, p.position, ps.year, ps.team, 
        TO_CHAR(ROUND((COUNT(CASE WHEN pl.playtype = 'run' AND pl.rushingplayerid = ps.playerid AND pl.yardline <= 5 THEN 1 END) / 
        COUNT(CASE WHEN pl.playtype = 'run' AND pl.yardline <= 5 THEN 1 END)) * 100, 2), '999.99') || '%' AS goallinecarrypercentage
      FROM dlaforce.player p
      JOIN dlaforce.playerstats ps ON p.playerid = ps.playerid
      JOIN dlaforce.play pl ON ps.team = pl.possessingteam AND SUBSTR(pl.gameid, 1, 4) = ps.year
      WHERE p.playerid = :playerId AND EXISTS (
        SELECT 1 FROM dlaforce.playersnapcounts psc 
        WHERE psc.playerid = p.playerid AND psc.gameid = pl.gameid
      )
      GROUP BY p.name, p.playerid, p.position, ps.year, ps.team
      ORDER BY ps.year
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
// ---------------------------------------------------------------------------------------------------------------------------
/* Add other SQL query endpoints here */
// Query2
// Query4
// Query5

//-----------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
