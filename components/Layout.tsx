import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-[#2c2c2c] text-[#d7ccc8] flex flex-col">
      <header className="p-4 flex items-center justify-between bg-[#1a1a1a] border-b border-[#3e2723] sticky top-0 z-50">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-[#f4e4bc] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Main</span>
        </Link>
        <h1 className="text-xl font-bold tracking-widest text-[#f4e4bc]">{title}</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </header>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;