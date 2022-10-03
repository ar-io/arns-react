import React from 'react';
import {Routes, Route} from 'react-router-dom'
import NavBar from './components/Navbar';
import Home from './components/pages/Home';
import Register from './components/pages/Register';
import About from './components/pages/About';
import FAQ from './components/pages/FAQ';
import Success from './components/pages/Success';
import ManageNames from './components/pages/ManageNames';
import {useState, useEffect} from 'react';
import ConnectWalletModal from './components/modals/ConnectWalletModal';

function App() {

  const [connected, setConnected] = useState(false)

  return (
    <div className="App">
      {connected ? <ConnectWalletModal setConnected={setConnected} /> : <></>}
      <NavBar connected={connected} setConnected={setConnected}/>

      <Routes>
      <Route path="*" element={<Home />}/>
        <Route path="/Home" element={<Home />}/>
        <Route path="/FAQ" element={<FAQ />}/>
        <Route path="/About" element={<About />}/>
        <Route path="/Success" element={<Success />}/>
        <Route path="/Register" element={<Register />}/>
        <Route path="/ManageNames" element={<ManageNames />}/>
      </Routes>
    
    </div>
  );
}

export default App;
