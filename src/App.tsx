import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';import './index.css';
import Home from './components/pages/Home/Home';

function App() {
  return (
    <div>
      <Routes>
      <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
        
      </Routes>
    </div>
  );
}

export default App;
