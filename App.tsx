import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy load components to isolate errors and improve initial load performance
const Home = React.lazy(() => import('./views/Home'));
const Week1 = React.lazy(() => import('./views/Week1'));
const Week2 = React.lazy(() => import('./views/Week2'));
const Week3 = React.lazy(() => import('./views/Week3'));
const Week4 = React.lazy(() => import('./views/Week4'));

const Loading = () => (
  <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-[#d7ccc8]">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/week1" element={<Week1 />} />
          <Route path="/week2" element={<Week2 />} />
          <Route path="/week3" element={<Week3 />} />
          <Route path="/week4" element={<Week4 />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;