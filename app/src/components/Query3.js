import React, { useState } from 'react';

function Query3() {
    const [name, setName] = useState('');
    const [playerDetails, setPlayerDetails] = useState(null);
    const [error, setError] = useState('');

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
            <h1>Query 3</h1>
            <p>This page will allow you to search for player details by name.</p>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Player Name"
            />
            <button onClick={fetchPlayerDetails}>Search</button>
            {error && <p>{error}</p>}
            {playerDetails && (
                <div>
                    <h2>Player Details</h2>
                    <ul>
                        {playerDetails.map((player, index) => (
                            <li key={index}>
                                Name: {player.NAME}, Player ID: {player.PLAYERID}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Query3;
