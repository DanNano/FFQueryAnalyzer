import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Query5() {
    const [name, setName] = useState('');
    const [playerDetails, setPlayerDetails] = useState(null);
    const [error, setError] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [TDData, setTDData] = useState({});
    const [playerInfo, setPlayerInfo] = useState(null);
    const [year, setYear] = useState(2022);
    const [touchdownData, setTouchdownData] = useState({});

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

    const fetchTDPercentage = () => {
        fetch(`/api/player-TD?playerid=${playerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setPlayerInfo({
                        name: data[0].NAME,
                        playerid: data[0].PLAYERID,
                        position: data[0].POSITION
                    });
                    const labels = data.map(item => `${item.YEAR}, ${item.TEAM}`);
                    const dataPoints = data.map(item => parseFloat(item.TOUCHDOWNPERCENTAGE.slice(0, -1))); // Remove '%' and convert to float
                    setTDData({
                        labels,
                        datasets: [{
                            label: 'Touchdown Percentage',
                            data: dataPoints,
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    });
                } else {
                    setPlayerInfo(null);
                    setTDData({});
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setPlayerInfo(null);
                setTDData({});
            });
    };

    const fetchTouchdownData = () => {
        fetch(`/api/touchdown-percentage?year=${year}`)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched Data:", data);  // Debugging line to confirm data structure
                const chartData = {
                    labels: data.map(d => d[0]),  // Assuming the name is the first element
                    datasets: [{
                        label: 'Touchdown Percentage',
                        data: data.map(d => parseFloat(d[5].replace('%', ''))),  // Adjust the index as per your actual data structure
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    }]
                };
                setTouchdownData(chartData);
            })
            .catch(error => console.error('Error:', error));
    };



    return (
        <div>
            <h1>Player Touchdown Percentage</h1>
            <p>Player Touchdown Percentage is the percentage of a teams total touchdowns that are scored by a specific player. This statistic gives insight into how often this player capitalizes on opportunities to score high-volume fantasy points on a single play. A players touchdown percentage can be calculated as follows: <small>Number Of Touchdowns Scored / Total Number Of Touchdowns Scored By Team</small></p>
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
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Enter Player ID"
                />
                <button onClick={fetchTDPercentage}>Get Yearly Touchdown Percentage</button>
            </div>
            {playerInfo && (
                <div>
                    <h2>Player Information</h2>
                    <p>Name: {playerInfo.name}</p>
                    <p>Player ID: {playerInfo.playerid}</p>
                    <p>Position: {playerInfo.position}</p>
                </div>
            )}
            {TDData.labels && (
                <div style={{ width: '70%', margin: 'auto' }}>
                    <h2>Touchdown Percentage Yearly</h2>
                    <Line data={TDData} />
                </div>
            )}
            {/* New Dropdown and Button for Touchdown Percentage */}
            <div>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                    {Array.from({ length: 11 }, (_, i) => 2012 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <button onClick={fetchTouchdownData}>Fetch Yearly Touchdown Data</button>
            </div>
            {/* Line Chart to display Touchdown Data */}
            {touchdownData.labels && (
                <div style={{ width: '70%', margin: 'auto' }}>
                    <Line data={touchdownData} options={{
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

export default Query5;
