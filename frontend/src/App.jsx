import { BrowserRouter, Routes, Router, Link, Navigate, Route } from 'react-router-dom';
import Expense from './expense';
import Login from './login';

// Route to user's page
const UserRoute = ({ children }) => {
  const user = sessionStorage.getItem('email');
  if (!user) {
    return <Navigate to="/login" replace />
  } else {
    return children;
  }
}

// Route to login page
const LoginRoute = ({ children }) => {
  const user = sessionStorage.getItem('email');
  if (user) {
    return <Navigate to="/user" replace />
  } else {
    return children;
  }
}

function NoMatch() {
  return (
    <div>
      <h1>404 Error: Page not found.</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserRoute><Expense /></UserRoute>} />
        <Route path="/login" element={<LoginRoute><Login /></LoginRoute>} />
        <Route path="/user" element={<UserRoute><Expense /></UserRoute>} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}