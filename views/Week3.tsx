import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Newspaper, ChevronRight, ChevronLeft, ExternalLink, Loader2, Share2, RefreshCw, AlertTriangle } from 'lucide-react';
// 안정적인 공식 웹 SDK 사용
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

  // 1. API Key 추출 헬퍼 함수 (가장 중요: 흰 화면 방지)
  const getApiKey = () => {
    // Vite 환경
    if (import.meta.env?.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
    // Create React App 환경
    if (process.env?.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    // 수동 설정 (index.html)
    if ((window as any).process?.env?.API_KEY) return (window as any).process.env.API_KEY;
    return null;
  };

  useEffect(() => {
    const key = getApiKey();
    if (!key) {
      setError("API Key를 찾을 수 없습니다. .env 파일을 확인해주세요.");
    }
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    setActiveIndex(0);

    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error("API Key가 설정되지 않았습니다.");

      // 2. 모델 초기화 (안정적인 gemini-2.0-flash 사용)
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        // 구글 검색 도구 연결
        tools: [{ googleSearch: {} } as any], 
      });

      // 3. 프롬프트: 네이버 뉴스 강제 지정
      const prompt = `
        You are a history teacher's assistant.
        
        Task: Perform a Google Search using strictly this query: "역사 고고학 문화유산 발굴 site:n.news.naver.com"
        
        Goal: Find 4 interesting articles from 'n.news.naver.com' (Naver News).
        
        Constraint:
        1. Summarize in Korean.
        2. Must include a '3줄 요약' (3-line summary) at the end of content.
        3. Output MUST be valid JSON only.
        
        JSON Structure:
        {
          "news": [
            {
              "title": "Article Title",
              "content": "Summary here... \\n\\n[3줄 요약]\\n1. ...\\n2. ...\\n3. ...",
              "source": "Naver News (Press Name)",
              "url": "https://n.news.naver.com/..."
            }
          ],
          "summary": "Overall trend summary in Korean"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("AI Response:", text); // 디버깅용

      // 4. JSON 파싱 (안전장치)
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      const parsedData: NewsData = JSON.parse(cleanedText);

      if (!parsedData.news || parsedData.news.length === 0) {
        throw new Error("네이버 뉴스에서 기사를 찾지 못했습니다. 잠시 후 다시 시도해주세요.");
      }

      setNewsData(parsedData);

    } catch (err: any) {
      console.error("Fetch Error:", err);
      let msg = "뉴스를 불러오는 중 오류가 발생했습니다.";
      if (err.message.includes("API Key")) msg = "API Key 설정이 잘못되었습니다.";
      if (err.message.includes("JSON")) msg = "데이터를 분석하는 데 실패했습니다.";
      
      setError(`${msg} (${err.message})`);
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

    // 종합 요약 카드
    if (activeIndex === newsData.news.length) {
      return (
        <div className="flex flex-col h-full justify-between p-8 text-center bg-[#3e2723] text-[#d7ccc8] rounded-xl border-4 border-[#5d4037] shadow-2xl animate-fade-in">
          <div className="flex-1 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar">
            <div className="mb-6 p-4 bg-[#2c2c2c] rounded-full inline-block shrink-0">
              <RefreshCw className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-[#f4e4bc] shrink-0">금주의 역사 트렌드</h2>
            <p className="text-lg leading-relaxed text-[#d7ccc8]/90 whitespace-pre-wrap text-left md:text-center">
              {newsData.summary}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-[#5d4037] shrink-0">
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
        <div className="bg-[#2c2c2c] p-4 flex justify-between items-center border-b border-[#3e2723] shrink-0">
          <span className="text-xs font-bold text-amber-600 tracking-widest">NEWS FLASH #{activeIndex + 1}</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-stone-400">네이버 뉴스</span>
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8 flex flex-col relative overflow-y-auto custom-scrollbar">
           <h3 className="text-xl md:text-2xl font-bold text-[#f4e4bc] mb-4 leading-tight shrink-0">
             {item.title}
           </h3>
           <div className="w-12 h-1 bg-amber-700 mb-4 shrink-0"></div>
           <div className="text-base md:text-lg text-stone-300 leading-relaxed whitespace-pre-wrap">
             {item.content}
           </div>
        </div>

        <div className="bg-[#2c2c2c] p-4 border-t border-[#3e2723] flex justify-between items-center shrink-0">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-500">
            원문 보기 <ExternalLink className="w-3 h-3" />
          </a>
          <Share2 className="w-4 h-4 text-stone-500" />
        </div>
      </div>
    );
  };

  return (
    <Layout title="Week 3: 역사 뉴스룸">
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-stone-900 relative overflow-hidden min-h-[calc(100vh-64px)]">
        
        {/* 배경 */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-stone-700/10 rounded-full blur-[100px]"></div>
        </div>

        {/* 에러 표시 */}
        {error && !loading && !newsData && (
          <div className="z-10 p-6 bg-red-900/20 border border-red-900/50 rounded-lg max-w-md text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-red-400 font-bold mb-2">설정 오류</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* 초기 화면 */}
        {!newsData && !loading && !error && (
          <div className="text-center z-10 max-w-lg animate-fade-in-up">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-stone-700 shadow-xl">
              <Newspaper className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#f4e4bc] mb-4">역사의 기록을 찾아서</h2>
            <p className="text-stone-400 mb-8 leading-relaxed">
              AI가 <span className="text-green-500 font-bold">네이버 뉴스</span>를 검색하여<br/>
              가장 흥미로운 역사/고고학 소식을 브리핑합니다.
            </p>
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
            <h3 className="text-xl text-[#f4e4bc] animate-pulse">사료 분석 중...</h3>
            <p className="text-sm text-stone-500 mt-2">네이버 뉴스에서 정보를 수집하고 있습니다.</p>
          </div>
        )}

        {/* 결과 카드 */}
        {newsData && (
          <div className="w-full max-w-5xl h-[70vh] min-h-[500px] flex items-center justify-center gap-4 md:gap-8 z-10 relative">
             <div className="shrink-0 z-20">
               <button onClick={prevCard} disabled={activeIndex === 0} className={`p-3 rounded-full border-2 border-stone-600 bg-stone-900/80 backdrop-blur-sm transition-all ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-amber-900/50 text-[#f4e4bc]'}`}>
                 <ChevronLeft className="w-8 h-8" />
               </button>
             </div>

             <div className="flex-1 h-full w-full relative perspective-[1000px] max-w-2xl">
               {renderCardContent()}
               <div className="flex justify-center gap-2 mt-4 absolute -bottom-8 left-0 right-0">
                 {newsData.news.map((_, idx) => (
                   <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-amber-600 w-6' : 'bg-stone-700'}`}/>
                 ))}
                 <div className={`w-2 h-2 rounded-full transition-all ${activeIndex === newsData.news.length ? 'bg-amber-600 w-6' : 'bg-stone-700'}`} />
               </div>
             </div>

             <div className="shrink-0 z-20">
                <button onClick={nextCard} disabled={activeIndex === newsData.news.length} className={`p-3 rounded-full border-2 border-stone-600 bg-stone-900/80 backdrop-blur-sm transition-all ${activeIndex === newsData.news.length ? 'opacity-0 pointer-events-none' : 'hover:bg-amber-900/50 text-[#f4e4bc]'}`}>
                  <ChevronRight className="w-8 h-8" />
                </button>
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Week3;