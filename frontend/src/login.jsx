import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const API_URL_KEY = 'http://127.0.0.1:8000/login';

export default function Login() {
  const [credentials, setCredentials] = useState({}); // Stores credientials as an object
  const navigate = useNavigate();

  const handleChange = (inp) => {
    const name = inp.target.id;
    const value = inp.target.value;
    setCredentials(values => ({...values, [name]: value}))
  };

  const userLogin = async (inp) => {
    inp.preventDefault();
    if (credentials.email.trim() && credentials.password.trim()) {
      try {
        const response = await fetch (API_URL_KEY, {
          method: 'POST',
          headers: {
            'Content-Type': "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log("[User] Successful login:", data);
          sessionStorage.setItem('email', data.email);
          navigate('/user');
        } else {
          alert("[User] Failed login. Please check your credientials.")
        }
      } catch (error) {
        alert("[User] Login error.", error)
      }
    }
  }


  return (
    <div className='main-container'>
    <div className='main-wrapper'>

      <div className='login-container'>
      <h2>Login to Expense Tracker</h2>
        <form onSubmit={userLogin}>
          <div className="form-control">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              alt="email-input"
              placeholder="email@address.com"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label for="email">Password</label>
            <input
              id="password"
              type="password"
              alt="password-input"
              placeholder="········"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <br/>
          <button
            className="login-button"
            alt="login-button"
            type="submit">
            Login</button>
        </form>
      </div>
    </div>
  </div>
  )
}