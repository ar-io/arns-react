import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { About, FAQ, Home } from './components/pages';
import { NavBar } from './components/layout';

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
