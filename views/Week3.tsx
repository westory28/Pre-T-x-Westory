import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Newspaper, ChevronRight, ChevronLeft, ExternalLink, Loader2, Share2, RefreshCw } from 'lucide-react';
// 변경점 1: 안정적인 공식 SDK 임포트
import { GoogleGenerativeAI } from "@google/generative-ai";

interface NewsItem {
  title: string;
  content: string;
  source: string;
  url: string;
}

interface NewsData {
  news: NewsItem[];
  summary: string;
}

const Week3: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    setActiveIndex(0);

    try {
      // 변경점 2: Vite 등 최신 프론트엔드 환경에 맞는 환경변수 호출 (없을 경우를 대비한 방어 코드)
      const apiKey = import.meta.env?.VITE_API_KEY || process.env.REACT_APP_API_KEY || (window as any).process?.env?.API_KEY;

      if (!apiKey) {
        throw new Error("API Key를 찾을 수 없습니다. .env 파일을 확인해주세요.");
      }

      // 변경점 3: 모델 초기화 및 유효한 모델명(gemini-2.0-flash) 사용
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", // 최신 안정화 모델
        // 검색 도구 설정 (Google Search Grounding)
        tools: [{ googleSearch: {} } as any], 
      });

      const prompt = `
        Find 4 recent (within last 3 months) interesting news articles related to history, archaeology, or cultural heritage, focusing on Korea or major global discoveries.
        
        STRICTLY return ONLY a JSON object. No markdown formatting, no code blocks.
        Structure:
        {
          "news": [
            {
              "title": "Korean Headline",
              "content": "Korean Summary (2-3 sentences)",
              "source": "Source Name",
              "url": "Source URL"
            }
          ],
          "summary": "Overall trend analysis in Korean"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 변경점 4: JSON 파싱 강화
      // 마크다운 코드 블록 제거 및 공백 제거
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData: NewsData = JSON.parse(cleanedText);
      setNewsData(parsedData);

    } catch (err: any) {
      console.error("Fetch Error:", err);
      // 사용자에게 더 친절한 에러 메시지 표시
      setError(err.message || "뉴스를 가져오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (!newsData) return;
    if (activeIndex < newsData.news.length) {
      setActiveIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  const renderCardContent = () => {
    if (!newsData) return null;

    // 종합 요약 카드 (마지막)
    if (activeIndex === newsData.news.length) {
      return (
        <div className="flex flex-col h-full justify-between p-8 text-center bg-[#3e2723] text-[#d7ccc8] rounded-xl border-4 border-[#5d4037] shadow-2xl animate-fade-in">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="mb-6 p-4 bg-[#2c2c2c] rounded-full inline-block">
              <RefreshCw className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-[#f4e4bc]">금주의 역사 트렌드</h2>
            <p className="text-lg leading-relaxed text-[#d7ccc8]/90 whitespace-pre-wrap">
              {newsData.summary}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-[#5d4037]">
            <p className="text-sm text-stone-500">Pre-T x Westory Newsroom</p>
          </div>
        </div>
      );
    }

    // 뉴스 카드
    const item = newsData.news[activeIndex];
    // 방어 코드: item이 없을 경우 렌더링 하지 않음
    if (!item) return null; 

    return (
      <div className="flex flex-col h-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#3e2723] shadow-2xl relative animate-fade-in">
        <div className="bg-[#2c2c2c] p-4 flex justify-between items-center border-b border-[#3e2723]">
          <span className="text-xs font-bold text-amber-600 tracking-widest">NEWS FLASH #{activeIndex + 1}</span>
          <span className="text-xs text-stone-500 truncate max-w-[150px]">{item.source}</span>
        </div>

        <div className="flex-1 p-8 flex flex-col justify-center relative">
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
           <h3 className="text-2xl md:text-3xl font-bold text-[#f4e4bc] mb-6 leading-tight z-10">
             {item.title}
           </h3>
           <div className="w-12 h-1 bg-amber-700 mb-6 z-10"></div>
           <p className="text-lg text-stone-300 leading-relaxed z-10">
             {item.content}
           </p>
        </div>

        <div className="bg-[#2c2c2c] p-4 border-t border-[#3e2723] flex justify-between items-center">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-500 transition-colors"
          >
            기사 원문 보기 <ExternalLink className="w-3 h-3" />
          </a>
          <button className="text-stone-500 hover:text-stone-300 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Week 3: 역사 뉴스룸">
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-stone-900 relative overflow-hidden min-h-[calc(100vh-64px)]">
        
        {/* 배경 효과 */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-stone-700/10 rounded-full blur-[100px]"></div>
        </div>

        {/* 초기 화면 (데이터 없고, 로딩 아닐 때) */}
        {!newsData && !loading && (
          <div className="text-center z-10 max-w-lg animate-fade-in-up">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-stone-700 shadow-xl">
              <Newspaper className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#f4e4bc] mb-4">역사의 기록을 찾아서</h2>
            <p className="text-stone-400 mb-8 leading-relaxed">
              AI가 전 세계의 최신 역사 및 고고학 뉴스를 검색하여<br/>
              가장 흥미로운 소식을 카드 뉴스로 정리해드립니다.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
                <strong className="block mb-1 text-red-300">오류 발생</strong>
                {error}
              </div>
            )}
            <button 
              onClick={fetchNews}
              className="px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-900/30 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" /> 뉴스 발행하기
            </button>
          </div>
        )}

        {/* 로딩 화면 */}
        {loading && (
          <div className="text-center z-10">
            <Loader2 className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-6" />
            <h3 className="text-xl text-[#f4e4bc] animate-pulse">고대 문헌을 분석 중입니다...</h3>
            <p className="text-sm text-stone-500 mt-2">최신 발굴 소식과 연구 자료를 수집하고 있습니다.</p>
          </div>
        )}

        {/* 결과 화면 (카드) */}
        {newsData && (
          <div className="w-full max-w-md md:max-w-lg h-[600px] flex flex-col z-10 relative">
            <div className="flex-1 w-full relative perspective-[1000px]">
              {renderCardContent()}
            </div>

            {/* 네비게이션 */}
            <div className="flex justify-between items-center mt-8 px-4">
               <button 
                 onClick={prevCard} 
                 disabled={activeIndex === 0}
                 className={`p-3 rounded-full border border-stone-600 transition-all ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-800 text-[#f4e4bc]'}`}
               >
                 <ChevronLeft className="w-6 h-6" />
               </button>
               
               <div className="flex gap-2">
                 {newsData.news.map((_, idx) => (
                   <div 
                     key={idx} 
                     className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-amber-600 w-6' : 'bg-stone-700'}`}
                   />
                 ))}
                 <div 
                   className={`w-2 h-2 rounded-full transition-all ${activeIndex === newsData.news.length ? 'bg-amber-600 w-6' : 'bg-stone-700'}`} 
                 />
               </div>

               <button 
                 onClick={nextCard} 
                 disabled={activeIndex === newsData.news.length}
                 className={`p-3 rounded-full border border-stone-600 transition-all ${activeIndex === newsData.news.length ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-800 text-[#f4e4bc]'}`}
               >
                 <ChevronRight className="w-6 h-6" />
               </button>
            </div>

            <button 
              onClick={fetchNews} 
              className="mt-6 text-xs text-stone-500 hover:text-amber-600 underline text-center"
            >
              새로운 뉴스 다시 검색하기
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Week3;