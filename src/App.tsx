import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import './index.css';
//pages
import About from './components/pages/About/About';
import FAQ from './components/pages/FAQ/FAQ';
import Home from './components/pages/Home/Home';
import ManageNames from './components/pages/ManageNames/ManageNames';
import Tutorial from './components/pages/Tutorial/Tutorial';
//layout
import NavBar from './components/layout/Navbar/Navbar';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/ManageNames" element={<ManageNames />} />
        <Route path="/Tutorial" element={<Tutorial />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
