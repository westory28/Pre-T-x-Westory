import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';

const Week1: React.FC = () => {
  const figures = ["세종대왕", "충무공 이순신", "유관순 열사", "백범 김구", "안중근 의사", "다산 정약용"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [spirits, setSpirits] = useState<{ id: number; text: string; leftOffset: number }[]>([]);
  
  const lastXRef = useRef(0);
  const touchStartXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to add a floating spirit text
  const addSpirit = useCallback((text: string) => {
    const id = Date.now();
    const randomOffset = (Math.random() - 0.5) * 40;
    
    setSpirits(prev => [...prev, { id, text, leftOffset: randomOffset }]);

    // Remove spirit after animation (3s)
    setTimeout(() => {
      setSpirits(prev => prev.filter(s => s.id !== id));
    }, 3000);
  }, []);

  const turnPage = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);

    const figureName = figures[currentIndex % figures.length];
    addSpirit(figureName);

    // Animation timing sequence
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      
      // Reset flipping state after the animation completes
      // We wait a bit for the cover to return to position visually if we want a continuous feel,
      // but based on original code, it flips, updates content, then snaps back or transitions back.
      // Original logic: 
      // 1. transform -150deg
      // 2. wait 600ms
      // 3. update index
      // 4. disable transition, reset to 0deg
      // 5. wait 50ms, re-enable transition, isFlipping = false
      
      setTimeout(() => {
        setIsFlipping(false);
      }, 50); // Small buffer after state update
    }, 600);
  }, [currentIndex, isFlipping, addSpirit, figures]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFlipping) return;
    const currentX = e.clientX;
    const deltaX = currentX - lastXRef.current;

    // Fast swipe left detection
    if (deltaX < -15) {
      turnPage();
    }
    lastXRef.current = currentX;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isFlipping) return;
    const touchCurrentX = e.touches[0].clientX;
    if (touchCurrentX - touchStartXRef.current < -30) {
      turnPage();
      touchStartXRef.current = touchCurrentX;
    }
  };

  // The displayed name updates immediately on index change, but we want the *next* card to show 
  // underneath while the cover flips.
  // In the original code: 
  // Cover shows "currentInfo". When flipped, content updates.
  // We will stick to the React state flow.
  const currentFigureName = figures[currentIndex % figures.length];

  return (
    <Layout title="Week 1: 역사의 책">
      <div className="flex-1 flex flex-col justify-center items-center bg-[#2c2c2c] overflow-hidden relative">
        
        {/* Style injection for the spirit animation keyframes */}
        <style>{`
          @keyframes floatUp {
            0% { opacity: 0; transform: translate(-50%, 20px) scale(0.5); filter: blur(10px); }
            20% { opacity: 1; filter: blur(0px); }
            100% { opacity: 0; transform: translate(-50%, -150px) scale(1.5); filter: blur(5px); }
          }
        `}</style>

        <div 
          ref={containerRef}
          className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] perspective-[1500px] cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Spirits Container */}
          {spirits.map(spirit => (
            <div
              key={spirit.id}
              className="absolute bottom-[60%] left-1/2 px-10 py-5 text-black text-3xl font-bold whitespace-nowrap rounded-full pointer-events-none z-50"
              style={{
                marginLeft: `${spirit.leftOffset}px`,
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
                animation: 'floatUp 3s ease-out forwards',
              }}
            >
              {spirit.text}
            </div>
          ))}

          <div className="w-full h-full relative preserve-3d shadow-2xl">
             {/* Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-[30px] bg-[#3e2723] origin-left -translate-x-[15px] rotate-y-90"></div>
            
            {/* Back Page (static background visible when cover flips) */}
            <div className="absolute inset-0 bg-[#f4e4bc] border-2 border-[#5d4037] rounded-r-2xl flex flex-col justify-center items-center text-[#3e2723] p-8 text-center -z-10">
               <h3 className="text-xl font-bold mb-4">다음 인물</h3>
               <p className="opacity-50">준비중...</p>
            </div>

            {/* Front Cover (The animating part) */}
            <div 
              className={`absolute w-full h-full bg-[#4e342e] text-[#d7ccc8] border-[3px] border-[#3e2723] rounded-r-2xl flex flex-col justify-center items-center text-center p-4 backface-hidden origin-left z-10 transition-transform duration-600 ease-[cubic-bezier(0.645,0.045,0.355,1)]`}
              style={{ 
                transform: isFlipping ? 'rotateY(-150deg)' : 'rotateY(0deg)',
                transition: isFlipping ? 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)' : 'none'
              }}
            >
              <div className="border-4 border-[#3e2723] p-8 rounded-lg w-full h-full flex flex-col justify-center items-center bg-[#4e342e]">
                 <div className="w-full border-b border-[#d7ccc8]/20 mb-8"></div>
                 <h2 className="text-4xl font-bold mb-6 font-serif break-keep leading-tight">{currentFigureName}</h2>
                 <div className="w-16 h-16 border-2 border-[#d7ccc8]/30 rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl font-serif">{currentIndex + 1}</span>
                 </div>
                 <p className="text-[#d7ccc8]/70 text-sm leading-relaxed">
                   오른쪽에서 왼쪽으로<br/>마우스를 빠르게 스치세요
                 </p>
                 <div className="w-full border-b border-[#d7ccc8]/20 mt-8"></div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-10 text-stone-500 text-sm animate-pulse">
          마우스를 책 위에서 빠르게 왼쪽으로 이동해보세요.
        </div>
      </div>
    </Layout>
  );
};

export default Week1;