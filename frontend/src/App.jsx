import { BrowserRouter, Routes, Router, Link, Navigate, Route } from 'react-router-dom';
import Expense from './expense';

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
        <Route path="/" element={<Expense />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}