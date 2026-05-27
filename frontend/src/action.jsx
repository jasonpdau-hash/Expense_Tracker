import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './action.css';

// API Requests will be sent to this base url
const API_URL_BASE = 'http://127.0.0.1:8000'


export default function action() {
  const [actionLog, setActionLog] = useState([]); // Stores an array of "events", each item has a email, action, time and optional description.
  const [credentials, setCredentials] = useState({
    email: localStorage.getItem('email'),
    access_token: localStorage.getItem('access_token'),
    access_role: localStorage.getItem('access_role')
  });
  // Store credentials as an object. We set the initial values to what is stored on local storage.

  // Use navigate hook
  const navigate = useNavigate();

  
  // If we have a token and the valid access role, we sync the state with whatever is in local storage and fetch events for our action log.
  useEffect(() => {
    if (credentials.access_token && credentials.access_role == "admin") {
      setCredentials({
        email: localStorage.getItem('email'),
        access_token: localStorage.getItem('access_token'),
        access_role: localStorage.getItem('access_role')
      })
      fetchActionLog();
    }
  }, [credentials.access_token]);


  // Fetch actions from the events collection in the database.
  const fetchActionLog = async () => {
    try {
      const response = await fetch(API_URL_BASE + '/actions');
      const data = await response.json();
      setActionLog(data);
    } catch (error) {
      console.error("[Get] Error fetching action logs: ", error)
    }
  }


  // Handle user logout.
  const userLogout = async () => {
    if (confirm("[User] Logout of the expense log tracker?")) {

    // Clear local storage and reset the state of the credentials.
      localStorage.removeItem('email');
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_role');
      setCredentials({
        email: localStorage.getItem(''),
        access_token: localStorage.getItem(''),
        access_role: localStorage.getItem('')
      })
      // Navigate back to the login page
      navigate('/login', { replace: true })

      // Send logout event to the action log. We can place this here since we dont actually need to depend on the "logout action" being received by the backend 
      try {
        const response = await fetch(API_URL_BASE + '/logout', {
          method: "POST",
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify({
            email: credentials.email
          }),
        });
      } catch (error) {
        alert("[Logout] Logout error. ", error);
      }
    }
  }


  return (
    <div className="main-container">

      <div className="main-wrapper">
        <div className="header-container">
          <h1 className="header-title">Expense Tracker</h1>
          <br/>
          <div className="login-tracker">
            <span>You are logged in as {credentials.email}!</span>
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
                {/* We render all event actions in a similar fashion to our expenditure items */}
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