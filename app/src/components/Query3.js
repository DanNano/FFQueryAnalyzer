import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components required for Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Query3() {
    const [name, setName] = useState('');
    const [playerDetails, setPlayerDetails] = useState(null);
    const [error, setError] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [targetData, setTargetData] = useState({});
    const [playerInfo, setPlayerInfo] = useState(null);
    const [targetTop, setTargetTop] = useState({});
    const [year, setYear] = useState(2022);

    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.5)`;
    }

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

    const fetchTargetShare = () => {
        fetch(`/api/player-target-share?playerid=${playerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setPlayerInfo({
                        name: data[0].NAME,
                        playerid: data[0].PLAYERID,
                        position: data[0].POSITION
                    });
                    const labels = data.map(item => `${item.YEAR}, ${item.TEAM}`);
                    const dataPoints = data.map(item => parseFloat(item.TARGETSHAREPERCENTAGE.slice(0, -1))); // Remove '%' and convert to float
                    setTargetData({
                        labels,
                        datasets: [{
                            label: 'Target Share Percentage',
                            data: dataPoints,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    });
                } else {
                    setPlayerInfo(null);
                    setTargetData({});
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setPlayerInfo(null);
                setTargetData({});
            });
    };

    const fetchTargetData = () => {
        fetch(`/api/topTargets?year=${year}`)
            .then(response => response.json())
            .then(data => {
                const chartData = {
                    labels: data.map(d => d[0]), // Assuming the name is the first element
                    datasets: [{
                        label: 'Target Percentage',
                        data: data.map(d => {
                            // Parse and replace % as necessary
                            const percentage = typeof d[5] === 'string' ? parseFloat(d[5].replace('%', '')) : d[5];
                            return percentage;
                        }),
                        backgroundColor: data.map(() => getRandomColor()), // Generate a random color for each bar
                        borderColor: data.map(() => 'rgba(0, 0, 0, 0.1)'), // Optional: specific border color for all
                        borderWidth: 1
                    }]
                };
                setTargetTop(chartData);
            })
            .catch(error => console.error('Error:', error));
    };


    return (
        <div>
            <h1>Player Information and Target Share</h1>
            <p>Player Target Share is the percentage of a teams total passes that are thrown to a specific player. This statistic gives insight into how often this player is involved in his teams passing attack and how often he receives opportunities to gain receiving yards. A players target share can be calculated as follows: <small>Number Of Passes Thrown To Player / Total Number of Passes Thrown By Team</small></p>
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
                <button onClick={fetchTargetShare}>Get Target Share</button>
            </div>

            {playerInfo && (
                <div>
                    <h2>Player Information</h2>
                    <p>Name: {playerInfo.name}</p>
                    <p>Player ID: {playerInfo.playerid}</p>
                    <p>Position: {playerInfo.position}</p>
                </div>
            )}

            {targetData.labels && (
                <div style={{ width: '70%', margin: 'auto' }}>
                    <h2>Target Share Percentage by Year and Team</h2>
                    <Bar data={targetData} />
                </div>
            )}

            <div>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                    {Array.from({ length: 11 }, (_, i) => 2012 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <button onClick={fetchTargetData}>Fetch Yearly Target Data</button>
            </div>

            {targetTop.labels && (
                <div style={{ width: '70%', margin: 'auto' }}>
                    <Bar data={targetTop} options={{
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }} />
                </div>
            )}
        </div>
    );
}

export default Query3;
