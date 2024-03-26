
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="sidebar">
        <a href="#" className="query-button">Query 1</a>
        <a href="#" className="query-button">Query 2</a>
        <a href="#" className="query-button">Query 3</a>
        <a href="#" className="query-button">Query 4</a>
        <a href="#" className="query-button">Query 5</a>
        <a href="#" className="query-button">Database Info</a>
      </div>
      <div>
        <h1 className="project-title">Fantasy Football Query Analyzer</h1>
        <p className="placeholder-text">
          ADD EXPLANATION/DETAILS OF PROJECT HERE. Welcome to the Fantasy Football Query Analyzer. Please select a query
          to begin your analysis, or view the database info for more details on
          the data sources and methodology.
        </p>
      </div>
    </div>
  );
}

export default App;
