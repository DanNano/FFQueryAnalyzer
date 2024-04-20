import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components required for Line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Query1() {
    const [playerId, setPlayerId] = useState('');
    const [playerInfo, setPlayerInfo] = useState(null);
    const [chartData, setChartData] = useState({});
    const [name, setName] = useState('');
    const [playerDetails, setPlayerDetails] = useState(null);
    const [error, setError] = useState('');

    const fetchData = () => {
        fetch(`/api/player-stats?playerid=${playerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setPlayerInfo({
                        name: data[0].NAME,
                        playerid: data[0].PLAYERID,
                        position: data[0].POSITION
                    });
                    const labels = data.map(item => `${item.YEAR}, ${item.TEAM}`);
                    const dataPoints = data.map(item => item.FANTASYPOINTSPERGAME);
                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: 'Fantasy Points',
                                data: dataPoints,
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }
                        ]
                    });
                } else {
                    setPlayerInfo(null);
                    setChartData({});
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setPlayerInfo(null);
                setChartData({});
            });
    };

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

    return (
        <div>
            <h1>Player Fantasy Points Per Game</h1>
    
            {/* Search by Player Name */}
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
    
            {/* Input for Player ID and Fetch Button */}
            <div>
                <input
                    type="text"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Enter Player ID"
                />
                <button onClick={fetchData}>Get Player Stats</button>
            </div>
    
            {playerInfo && (
                <div>
                    <h2>Player Information</h2>
                    <p>Name: {playerInfo.name}</p>
                    <p>Player ID: {playerInfo.playerid}</p>
                    <p>Position: {playerInfo.position}</p>
                </div>
            )}
            
            {chartData.labels && (
                <div style={{ width: '70%', margin: 'auto' }}>
                    <h2>Fantasy Points Per Game by Year</h2>
                    <Line data={chartData} />
                </div>
            )}
        </div>
    );
    
}

export default Query1;
