import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import './index.css';
//pages
import About from './components/pages/About/About';
import FAQ from './components/pages/FAQ/FAQ';
import Home from './components/pages/Home/Home';
//layout
import NavBar from './components/layout/Navbar/Navbar';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
