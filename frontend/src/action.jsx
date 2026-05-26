import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './action.css';

// API Requests will be sent to this url
const API_URL_KEY = 'http://127.0.0.1:8000/actions'


export default function expense() {
  const [actionLog, setActionLog] = useState([]); // Stores an array of "items", each item has a title, amt, etc etc.
  const [email, setEmail] = useState(localStorage.getItem('email'));


  // Store reference to input fields so we dont trigger a re-render when we update values+.
  const inputTitleRef = useRef(null);
  const inputAmountRef = useRef(null);
  const inputCategoryRef = useRef(null);
  const inputDateRef = useRef(null);
  const inputDescriptionRef = useRef(null);

  const navigate = useNavigate();

  // Fetch expenditure records from the database and calculates amt on initial render.
  useEffect(() => {
     setEmail(localStorage.getItem('email'))
  }, []);

    useEffect(() => {
     fetchActionLog();
  }, []);

  // Fetch actions from the database, 
  const fetchActionLog = async () => {
    try {
      const response = await fetch(API_URL_KEY);
      const data = await response.json();
      setActionLog(data);
    } catch (error) {
      console.error("[Get] Error fetching action logs: ", error)
    }
  }

  const userLogout = () => {
    if (confirm("[User] Logout of the expense log tracker?")) {
      localStorage.removeItem('email');
      setEmail('');
      navigate('/login', { replace: true })
    }
  }


  return (
    <div className="main-container">

      <div className="main-wrapper">
        <div className="header-container">
          <h1 className="header-title">Expense Tracker</h1>
          <br/>
          <div className="login-tracker">
            <span>You are logged in as {email}!</span>
            <button className="logout-button"
              onClick={userLogout}>Logout
            </button>
          </div>
          <br/>
        </div>

        <div className="content-container">
          {/* List of all expenses */}
          <div className="logbook-container">
            <div className="section-heading">
              <h3>Action Log</h3>
            </div>
            <div className="section-content">
              <ul className="action-list">
                {/* Map out all entries in expenditureItem as its own record in the logbook */}
                {actionLog.map((action) => (
                  <li key={action.id} className="action-item">
                    <span className="action-user">{action.user}</span>
                    <span className="action-time">{action.time}</span>
                    <span className="action-event">{action.action}</span>
                    <span className="action-description">{action.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}