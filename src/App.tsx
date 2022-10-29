import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import Home from './components/pages/Home/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
