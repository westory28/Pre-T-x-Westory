import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Newspaper, ChevronRight, ChevronLeft, ExternalLink, Loader2, Share2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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
      // API Key handling: must be obtained exclusively from process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Prompt logic
      const prompt = `
        You are a history teacher's assistant.
        Perform a Google Search using exactly this query: "역사 고고학 문화유산 발굴 site:n.news.naver.com"
        
        From the search results, select 4 distinct and interesting articles from 'n.news.naver.com' (Naver News).
        
        For each article:
        1. Summarize the content in Korean (keep it interesting for students).
        2. Create a '3줄 요약' (3-line summary) at the end of the content.
        
        Strictly output ONLY a valid JSON object matching this structure:
        {
          "news": [
            {
              "title": "Title of the article",
              "content": "Summary content... \\n\\n[3줄 요약]\\n1. First point\\n2. Second point\\n3. Third point",
              "source": "Naver News (Press Name)",
              "url": "Full URL starting with https://n.news.naver.com"
            }
          ],
          "summary": "A brief analysis of these 4 news items in Korean."
        }
        
        Do not include markdown code blocks like \`\`\`json. Just the raw JSON.
      `;

      // New SDK usage with gemini-3-flash-preview and googleSearch tool
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      
      console.log("Raw AI Response:", text);

      if (!text) {
          throw new Error("No response text received from AI.");
      }

      // JSON parsing safe-guard
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      const parsedData: NewsData = JSON.parse(cleanedText);
      
      if (!parsedData.news || parsedData.news.length === 0) {
        throw new Error("네이버 뉴스에서 관련 기사를 찾지 못했습니다. 잠시 후 다시 시도해주세요.");
      }

      setNewsData(parsedData);

    } catch (err: any) {
      console.error("Fetch Error:", err);
      let errorMsg = "뉴스를 불러오는 중 오류가 발생했습니다.";
      
      if (err.message?.includes("API Key")) errorMsg = "API Key가 없습니다. 설정을 확인해주세요.";
      else if (err.message?.includes("JSON")) errorMsg = "데이터를 분석하는 데 실패했습니다. 다시 시도해주세요.";
      else if (err.message?.includes("SAFETY")) errorMsg = "안전 필터에 의해 차단되었습니다.";
      
      setError(errorMsg);
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
            <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
              <p className="text-lg leading-relaxed text-[#d7ccc8]/90 whitespace-pre-wrap text-left md:text-center">
                {newsData.summary}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#5d4037]">
            <p className="text-sm text-stone-500">Pre-T x Westory Newsroom</p>
          </div>
        </div>
      );
    }

    // 뉴스 카드
    const item = newsData.news[activeIndex];
    if (!item) return null;

    return (
      <div className="flex flex-col h-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#3e2723] shadow-2xl relative animate-fade-in">
        {/* 헤더 */}
        <div className="bg-[#2c2c2c] p-4 flex justify-between items-center border-b border-[#3e2723] shrink-0">
          <span className="text-xs font-bold text-amber-600 tracking-widest">NEWS FLASH #{activeIndex + 1}</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-stone-400 truncate max-w-[120px]">네이버 뉴스</span>
          </div>
        </div>

        {/* 본문 (스크롤 가능 영역) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative flex flex-col min-h-0">
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none fixed-bg"></div>
           
           <h3 className="text-xl md:text-2xl font-bold text-[#f4e4bc] mb-4 leading-snug z-10 sticky top-0 bg-[#1a1a1a]/95 py-2">
             {item.title}
           </h3>
           <div className="w-12 h-1 bg-amber-700 mb-4 z-10 shrink-0"></div>
           
           {/* 내용 줄바꿈 처리 */}
           <div className="text-base md:text-lg text-stone-300 leading-relaxed z-10 whitespace-pre-wrap pb-4">
             {item.content}
           </div>
        </div>

        {/* 푸터 */}
        <div className="bg-[#2c2c2c] p-4 border-t border-[#3e2723] flex justify-between items-center z-20 shrink-0">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-500 transition-colors font-medium"
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

        {!newsData && !loading && (
          <div className="text-center z-10 max-w-lg animate-fade-in-up">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-stone-700 shadow-xl">
              <Newspaper className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#f4e4bc] mb-4">역사의 기록을 찾아서</h2>
            <p className="text-stone-400 mb-8 leading-relaxed">
              AI가 <span className="text-green-500 font-bold">네이버 뉴스</span>를 검색하여<br/>
              가장 흥미로운 역사/고고학 소식을 카드 뉴스로 정리해드립니다.
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

        {loading && (
          <div className="text-center z-10">
            <Loader2 className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-6" />
            <h3 className="text-xl text-[#f4e4bc] animate-pulse">사료를 수집 중입니다...</h3>
            <p className="text-sm text-stone-500 mt-2">네이버 뉴스 서버와 통신하고 있습니다.</p>
          </div>
        )}

        {newsData && (
          <div className="w-full max-w-5xl h-[70vh] min-h-[500px] flex items-center justify-center gap-4 md:gap-8 z-10 relative">
            
            {/* 왼쪽 버튼 (카드 밖으로 이동) */}
            <div className="shrink-0 z-20">
              <button 
                 onClick={prevCard} 
                 disabled={activeIndex === 0}
                 className={`p-3 rounded-full border-2 border-stone-600 bg-stone-900/80 backdrop-blur-sm transition-all ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-amber-900/50 hover:border-amber-600 text-[#f4e4bc] scale-100 hover:scale-110 shadow-lg'}`}
               >
                 <ChevronLeft className="w-8 h-8" />
               </button>
            </div>

            {/* 카드 영역 */}
            <div className="flex-1 h-full w-full relative perspective-[1000px] max-w-2xl">
              {renderCardContent()}
              
              {/* 인디케이터 (카드 하단에 위치) */}
              <div className="flex justify-center gap-2 mt-4 absolute -bottom-8 left-0 right-0">
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
            </div>

            {/* 오른쪽 버튼 (카드 밖으로 이동) */}
            <div className="shrink-0 z-20">
               <button 
                 onClick={nextCard} 
                 disabled={activeIndex === newsData.news.length}
                 className={`p-3 rounded-full border-2 border-stone-600 bg-stone-900/80 backdrop-blur-sm transition-all ${activeIndex === newsData.news.length ? 'opacity-0 pointer-events-none' : 'hover:bg-amber-900/50 hover:border-amber-600 text-[#f4e4bc] scale-100 hover:scale-110 shadow-lg'}`}
               >
                 <ChevronRight className="w-8 h-8" />
               </button>
            </div>
            
            <div className="absolute -bottom-16">
              <button 
                onClick={fetchNews} 
                className="text-xs text-stone-500 hover:text-amber-600 underline text-center"
              >
                새로운 뉴스 다시 검색하기
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Week3;