import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Query1 from './components/Query1';
import Query2 from './components/Query2';
import Query3 from './components/Query3';
import Query4 from './components/Query4';
import Query5 from './components/Query5';
import DatabaseInfo from './components/DatabaseInfo';

function App() {
    return (
        <Router>
            <div className="App">
                <div className="sidebar">
                    <Link to="/query1" className="query-button"><small>Fantasy Points Per Game</small></Link>
                    <Link to="/query2" className="query-button"><small>Snap Count Percentage</small></Link>
                    <Link to="/query3" className="query-button"><small>Target Share</small></Link>
                    <Link to="/query4" className="query-button"><small>Goal Line Carry Percentage</small></Link>
                    <Link to="/query5" className="query-button"><small>Touchdown Percentage</small></Link>
                    <Link to="/databaseinfo" className="query-button">Database Info</Link>
                </div>
                <div>
                    <h1 className="project-title">Fantasy Football Analytic Hub</h1>
                    <p className="placeholder-text">Welcome to the Fantasy Football Analytics Hub. Please select an advanced stat of your choosing to begin your analysis, or view the database info for more details on the data sources.

                        After clicking on the advanced stat needed for your inquiry, search for the player in question by typing his first and last name into the initial search bar. If a valid name is entered, the players ID number should populate in the space below the first search bar. Next, copy and paste the players ID number into the second search bar. This should generate a season-by-season trend-analysis graph for the player in question based off the specified stat. Enjoy!

                    </p>
                    <Routes>
                        <Route path="/query1" element={<Query1 />} />
                        <Route path="/query2" element={<Query2 />} />
                        <Route path="/query3" element={<Query3 />} />
                        <Route path="/query4" element={<Query4 />} />
                        <Route path="/query5" element={<Query5 />} />
                        <Route path="/databaseinfo" element={<DatabaseInfo />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}
export default App;
