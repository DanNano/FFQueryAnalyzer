import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components required for Line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Query1() {
    const [playerId, setPlayerId] = useState('');
    const [playerInfo, setPlayerInfo] = useState(null);
    const [chartData, setChartData] = useState({});

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
                    const labels = data.map(item => item.YEAR);
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

    return (
        <div>
            <h1>Player Fantasy Points Per Game</h1>
            <input
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Enter Player ID"
            />
            <button onClick={fetchData}>Get Player Stats</button>
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
