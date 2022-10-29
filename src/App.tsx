import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router} from 'react-router-dom';
import './index.css';
//pages
import Home from './components/pages/Home/Home';
//layout
import NavBar from './components/layout/Navbar/Navbar';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
