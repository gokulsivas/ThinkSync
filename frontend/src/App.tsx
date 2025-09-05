import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<div>Dashboard Page</div>} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/search" element={<div>Search Page</div>} />
            <Route path="/opportunities" element={<div>Opportunities Page</div>} />
            <Route path="/messages" element={<div>Messages Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
