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
                    <Link to="/query1" className="query-button">Query 1</Link>
                    <Link to="/query2" className="query-button">Query 2</Link>
                    <Link to="/query3" className="query-button">Query 3</Link>
                    <Link to="/query4" className="query-button">Query 4</Link>
                    <Link to="/query5" className="query-button">Query 5</Link>
                    <Link to="/databaseinfo" className="query-button">Database Info</Link>
                </div>
                <div>
                    <h1 className="project-title">Fantasy Football Query Analyzer</h1>
                    <p className="placeholder-text">DD EXPLANATION/DETAILS OF PROJECT HERE. Welcome to the Fantasy Football Query Analyzer. Please select a query
                        to begin your analysis, or view the database info for more details on the data sources and methodology.
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
