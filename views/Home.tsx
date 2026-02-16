import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Grid3X3, Newspaper, Leaf, ArrowRight } from 'lucide-react';

const assignments = [
  {
    id: 1,
    title: "Week 1: 역사의 책",
    description: "한국사 인물열전을 담은 인터랙티브 3D 북",
    icon: <BookOpen className="w-8 h-8" />,
    path: "/week1",
    status: "Completed",
    color: "hover:border-amber-600 hover:shadow-amber-900/20"
  },
  {
    id: 2,
    title: "Week 2: 자리 배치 & 룰렛",
    description: "학급 자리 배치 자동화 및 랜덤 발표자 선정 도구",
    icon: <Grid3X3 className="w-8 h-8" />,
    path: "/week2",
    status: "Completed",
    color: "hover:border-orange-600 hover:shadow-orange-900/20"
  },
  {
    id: 3,
    title: "Week 3: 역사 뉴스룸",
    description: "AI가 선별한 최신 역사/고고학 카드뉴스",
    icon: <Newspaper className="w-8 h-8" />,
    path: "/week3",
    status: "Completed",
    color: "hover:border-yellow-600 hover:shadow-yellow-900/20"
  },
  {
    id: 4,
    title: "Week 4: 생태환경사",
    description: "역사 속 인간과 자연의 관계를 탐구하는 글쓰기",
    icon: <Leaf className="w-8 h-8" />,
    path: "/week4",
    status: "New",
    color: "hover:border-emerald-500 hover:shadow-emerald-900/20"
  }
];

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#d7ccc8] font-serif">
      {/* Hero Section */}
      <div className="relative py-20 px-6 text-center border-b border-[#3e2723] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center">
            <div className="w-[600px] h-[600px] rounded-full bg-amber-500 blur-[150px]"></div>
        </div>
        
        <h1 className="relative text-5xl md:text-7xl font-bold mb-4 text-[#f4e4bc] tracking-tighter">
          Pre-T <span className="text-amber-600">x</span> Westory
        </h1>
        <p className="relative text-xl md:text-2xl text-stone-400 max-w-2xl mx-auto mb-8">
          과거의 기록을 미래의 기술로 잇다.
        </p>
      </div>

      {/* Grid Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {assignments.map((item) => (
            <Link 
              key={item.id} 
              to={item.path}
              className={`group relative overflow-hidden rounded-2xl border border-[#3e2723] bg-[#222] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${item.color}`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 bg-[#2c2c2c] rounded-lg transition-colors ${
                    item.id === 4 ? 'text-emerald-500 group-hover:text-emerald-400' : 'text-amber-500 group-hover:text-amber-400'
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${
                    item.status === 'New' 
                      ? 'border-emerald-600 text-emerald-500 bg-emerald-900/30' 
                      : 'border-amber-600 text-amber-500 bg-amber-900/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-[#f4e4bc] mb-2">{item.title}</h3>
                <p className="text-stone-400 mb-6 flex-grow leading-relaxed">{item.description}</p>
                
                <div className={`flex items-center font-semibold transition-all group-hover:gap-2 ${
                   item.id === 4 ? 'text-emerald-500' : 'text-amber-600'
                }`}>
                  <span>프로젝트 시작하기</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <footer className="text-center py-8 text-stone-600 text-sm border-t border-[#3e2723]/30">
        © 2026 용신중학교 역사교사 방재석. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
