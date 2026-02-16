import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Map, Scroll, Award, ArrowRight, Grid3X3, Newspaper } from 'lucide-react';

const assignments = [
  {
    id: 1,
    title: "Week 1: 역사의 책",
    description: "한국사 인물열전을 담은 인터랙티브 3D 북",
    icon: <BookOpen className="w-8 h-8" />,
    path: "/week1",
    status: "Completed",
    color: "bg-amber-900"
  },
  {
    id: 2,
    title: "Week 2: 자리 배치 & 룰렛",
    description: "학급 자리 배치 자동화 및 랜덤 발표자 선정 도구",
    icon: <Grid3X3 className="w-8 h-8" />,
    path: "/week2",
    status: "Completed",
    color: "bg-stone-800"
  },
  {
    id: 3,
    title: "Week 3: 역사 뉴스룸",
    description: "AI가 선별한 최신 역사/고고학 카드뉴스",
    icon: <Newspaper className="w-8 h-8" />,
    path: "/week3",
    status: "Completed",
    color: "bg-stone-800"
  },
  {
    id: 4,
    title: "Week 4: 명예의 전당",
    description: "Pre-T x Westory 여정의 마침표",
    icon: <Award className="w-8 h-8" />,
    path: "/week4",
    status: "Pending",
    color: "bg-stone-800"
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
              className={`group relative overflow-hidden rounded-2xl border border-[#3e2723] p-8 hover:border-amber-600 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-1 ${item.color}`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-[#2c2c2c] rounded-lg text-amber-500 group-hover:text-amber-400 transition-colors">
                    {item.icon}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${item.status === 'Completed' ? 'border-amber-600 text-amber-500 bg-amber-900/30' : 'border-stone-600 text-stone-500'}`}>
                    {item.status}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-[#f4e4bc] mb-2">{item.title}</h3>
                <p className="text-stone-400 mb-6 flex-grow">{item.description}</p>
                
                <div className="flex items-center text-amber-600 font-semibold group-hover:gap-2 transition-all">
                  <span>프로젝트 보기</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <footer className="text-center py-8 text-stone-600 text-sm">
        © 2024 Pre-T x Westory Project. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;