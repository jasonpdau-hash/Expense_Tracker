import { BrowserRouter, Routes, Router, Link, Navigate, Route } from 'react-router-dom';
import Expense from './expense';
import Login from './login';
import Action from './action';


// Route to the login page
const LoginRoute = ({ children }) => {
  const user = localStorage.getItem('email');

  // If there is no "email" item in local storage, then we can assume the user has not logged in yet
  // So we return the login page
  if (!user) {
    return children;
  }

  // If we reach here, we check the priviliege level of the user.
  // Route to action if admin, otherwise route to expense.  
  const priviliege = localStorage.getItem('access_role');
  if (priviliege == "admin") {
    return <Navigate to="/action" replace />
  } else {
    return <Navigate to="/expense" replace />
  }
}

// Route to expenses's page. Likewise, if there is no user we route to the login page.
const UserRoute = ({ children }) => {
  const user = localStorage.getItem('email');
  if (!user) {
    return <Navigate to="/login" replace />
  } else {
    return children;
  }
}

// Route to actions's page. In addition, we will check the priviliege level of that user.
// Route to actions if admin, otherwise return to login - if it is a user, they will be routed to expense instead.
const ActionRoute = ({ children }) => {
  const user = localStorage.getItem('email');
  const priviliege = localStorage.getItem('access_role');
  if (user && priviliege == "admin") {
    return children;
  } else {
    return <Navigate to="/login" replace />
  }
}

// No valid route
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
        <Route path="/expense" element={<UserRoute><Expense /></UserRoute>} />
        <Route path="/action" element={<ActionRoute><Action /></ActionRoute>} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}