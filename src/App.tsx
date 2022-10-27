
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/layout/Navbar/Navbar';
import Home from './components/pages/Home/Home';
import Register from './components/pages/Register/Register';
import About from './components/pages/About/About';
import FAQ from './components/pages/FAQ/FAQ';
import Success from './components/pages/Success/Success';
import ManageNames from './components/pages/ManageNames/ManageNames';
import { useState, useEffect } from 'react';
import ConnectWalletModal from './components/modals/ConnectWalletModal/ConnectWalletModal';
import HelpButton from './components/inputs/buttons/HelpButton/HelpButton';

function App() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="App">
      {connected ? <ConnectWalletModal setConnected={setConnected} /> : <></>}
      <NavBar connected={connected} setConnected={setConnected} />

      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/About" element={<About />} />
        <Route path="/Success" element={<Success />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/ManageNames" element={<ManageNames />} />
      </Routes>
      <HelpButton />
    </div>
  );
}

export default App;
