import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Week1 from './views/Week1';
import Week2 from './views/Week2';
import Week3 from './views/Week3';
import Week4 from './views/Week4';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/week1" element={<Week1 />} />
        <Route path="/week2" element={<Week2 />} />
        <Route path="/week3" element={<Week3 />} />
        <Route path="/week4" element={<Week4 />} />
      </Routes>
    </HashRouter>
  );
};

export default App;