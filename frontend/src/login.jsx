import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const [credentials, setCredentials] = useState({}); // Stores credientials as an object
  const navigate = useNavigate();

  const handleChange = (inp) => {
    const name = inp.target.id;
    const value = inp.target.value;
    setCredentials(values => ({...values, [name]: value}))
  };


  return (
    <div className='main-container'>
    <div className='main-wrapper'>

      <div className='login-container'>
      <h2>Login to Expense Tracker</h2>
        <form>
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