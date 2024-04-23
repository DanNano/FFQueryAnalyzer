import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Query2() {
    const [name, setName] = useState('');
    const [playerDetails, setPlayerDetails] = useState(null);
    const [error, setError] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [snapData, setSnapData] = useState({});
    const [playerInfo, setPlayerInfo] = useState(null);

    const fetchPlayerDetails = () => {
        fetch(`/api/player-by-name?name=${encodeURIComponent(name)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch player details');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    setError('No player found');
                    setPlayerDetails(null);
                } else {
                    setPlayerDetails(data);
                    setError('');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to fetch data');
                setPlayerDetails(null);
            });
    };
    const fetchSnapPercentage = () => {
        fetch(`/api/player-snap-count?playerid=${playerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setPlayerInfo({
                        name: data[0].NAME,
                        playerid: data[0].PLAYERID,
                        position: data[0].POSITION
                    });
                    const labels = data.map(item => `${item.YEAR}, ${item.TEAM}`);
                    const dataPoints = data.map(item => parseFloat(item.SNAPCOUNTPERCENTAGEPERGAME.slice(0, -1))); // Remove '%' and convert to float
                    setSnapData({
                        labels,
                        datasets: [{
                            label: 'Snap Count percentage',
                            data: dataPoints,
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    });
                } else {
                    setPlayerInfo(null);
                    setSnapData({});
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setPlayerInfo(null);
                setSnapData({});
            });
    };

    return (
        <div>
            <h1>Player Snap Count Percentage</h1>
            <p>Player Snap Count Percentage is the percentage of the game a player is on the field for his team. This statistic gives insight into how often this player is utilized by his teams offense and how often he receives opportunities to potentially score fantasy points. A players snap count percentage can be calculated as follows: <small>Number Of Plays On The Field / (Number Of Plays On The Field + Number Of Plays On The Bench)</small></p>
            <div>
                <h2>Search Player by Name</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Player Name"
                />
                <button onClick={fetchPlayerDetails}>Search</button>
            </div>
            {error && <p>{error}</p>}
            {playerDetails && (
                <div>
                    <h3>Player Details</h3>
                    <ul>
                        {playerDetails.map((player, index) => (
                            <li key={index}>
                                {player.NAME}, {player.PLAYERID}, {player.POSITION}, {player.FIRSTYEAR} - {player.LASTYEAR}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div>
                <input
                    type="text"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Enter Player ID"
                />
                <button onClick={fetchSnapPercentage}>Get Snap Count Percentage</button>
            </div>
            {playerInfo && (
                <div>
                    <h2>Player Information</h2>
                    <p>Name: {playerInfo.name}</p>
                    <p>Player ID: {playerInfo.playerid}</p>
                    <p>Position: {playerInfo.position}</p>
                </div>
            )}
            {snapData.labels && (
                <div style={{ width: '70%', margin: 'auto' }}>
                    <h2>{name} Snap Count Percentage by Season</h2>
                    <Line data={snapData} />
                </div>
            )}
        </div>
    );
}

export default Query2;
