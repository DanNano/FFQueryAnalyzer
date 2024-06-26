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
// Endpoint to get fantasy points per game for top players with stats available for at least 3 different years
app.get('/api/top-players-stats', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`
      SELECT 
          p.name,
          p.playerid,
          p.position,
          ps.year,
          ps.team,
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
      FROM 
          DLAFORCE.player p
      JOIN 
          DLAFORCE.playerstats ps ON p.playerid = ps.playerid
      WHERE 
          p.playerid IN (
              SELECT 
                  p.playerid
              FROM 
                  DLAFORCE.player p
              JOIN 
                  DLAFORCE.playerstats ps ON p.playerid = ps.playerid
              WHERE 
                  ps.year = 2022
                  AND p.playerid IN (
                      SELECT 
                          ps.playerid
                      FROM 
                          DLAFORCE.playerstats ps
                      GROUP BY 
                          ps.playerid
                      HAVING 
                          COUNT(DISTINCT ps.year) >= 3
                  )
              ORDER BY 
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
                  ) / ps.gamesplayed, 2) DESC
              FETCH FIRST 10 ROWS ONLY
          )
      ORDER BY 
          p.playerid, ps.year
    `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
    const playerId = req.query.playerid || '00-0034791'; // Default player ID if none provided
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
app.get('/api/player-snap-count', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const playerId = req.query.playerid || '00-0032765'; // Default player ID if none provided
        const result = await connection.execute(`
        select p.name, p.playerid, p.position, substr(psc.gameid, 1, 4) as year, ps.team, to_char(round(sum(psc.snapcountpercentage * 100) / count(*), 2), '999.99') || '%' as snapcountpercentagepergame
        from dlaforce.player p
        join dlaforce.playersnapcounts psc on p.playerid = psc.playerid
        join dlaforce.playerstats ps on p.playerid = ps.playerid and substr(psc.gameid, 1, 4) = ps.year
        where p.playerid = :playerId
        group by p.name, p.playerid, p.position, substr(psc.gameid, 1, 4), ps.team
        order by year        

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

// Query5

app.get('/api/player-TD', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const playerId = req.query.playerid || '00-0031408'; // Default player ID if none provided
        const result = await connection.execute(`
        select p.name, p.playerid, p.position, ps.year, ps.team, to_char(round((count(case when pl.tdplayerid = p.playerid then 1 end) / count(case when pl.tdplayerid is not null then 1 end)) * 100, 2), '999.99') || '%' as touchdownpercentage
        from dlaforce.player p
        join dlaforce.playerstats ps on p.playerid = ps.playerid
        join dlaforce.play pl on ps.team = pl.possessingteam and substr(pl.gameid, 1, 4) = ps.year
        where p.playerid = :playerId and exists (select 1 from dlaforce.playersnapcounts psc where psc.playerid = p.playerid and psc.gameid = pl.gameid) /* placeholder id, this will need to be fed into the query by the app */
        group by p.name, p.playerid, p.position, ps.year, ps.team
        order by ps.year

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

app.get('/api/touchdown-percentage', async (req, res) => {
    const year = req.query.year;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
            SELECT
                p.Name,
                p.PlayerID,
                p.Position,
                ps.Year,
                ps.Team,
                TO_CHAR(ROUND((COUNT(CASE WHEN pl.tdplayerid = p.playerid THEN 1 END) / COUNT(CASE WHEN pl.tdplayerid IS NOT NULL THEN 1 END)) * 100, 2), '999.99') || '%' AS TouchdownPercentage
            FROM
                dlaforce.Player p
            JOIN
                dlaforce.PlayerStats ps ON p.PlayerID = ps.PlayerID
            JOIN
                dlaforce.Play pl ON ps.Team = pl.PossessingTeam AND SUBSTR(pl.GameID, 1, 4) = TO_CHAR(ps.Year)
            JOIN
                dlaforce.Game g ON pl.GameID = g.GameID AND g.Year = :year
            WHERE
                ps.Year = :year
            GROUP BY
                p.Name, p.PlayerID, p.Position, ps.Year, ps.Team
            ORDER BY
                TouchdownPercentage DESC
            FETCH FIRST 10 ROWS ONLY
        `, { year: parseInt(year) });
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

app.get('/api/topTargets', async (req, res) => {
    const year = req.query.year;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
            SELECT
            p.name,
            p.playerid,
            p.position,
            ps.year,
            ps.team,
            ROUND((COUNT(CASE WHEN pl.playtype = 'pass' AND pl.receivingplayerid = ps.playerid THEN 1 END) /
           COUNT(CASE WHEN pl.playtype = 'pass' THEN 1 END)) * 100, 2) AS targetsharepercentage
  FROM
      dlaforce.Player p
  JOIN
      dlaforce.PlayerStats ps ON p.playerid = ps.playerid
    JOIN
      dlaforce.Play pl ON pl.possessingteam = ps.team AND pl.gameid LIKE ps.year || '%'
    WHERE
    ps.year = :year AND
    pl.playtype = 'pass' -- Ensuring we only count passing plays
    GROUP BY
    p.name, p.playerid, p.position, ps.year, ps.team
    ORDER BY
      targetsharepercentage DESC
    FETCH FIRST 5 ROWS ONLY
        `, { year: parseInt(year) });
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

//-----------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
