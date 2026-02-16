import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Newspaper, ChevronRight, ChevronLeft, ExternalLink, Loader2, Share2, RefreshCw, AlertTriangle } from 'lucide-react';
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

  // 컴포넌트 마운트 시 API 키 체크
  useEffect(() => {
    // 안전하게 window.process 접근
    const apiKey = (window as any).process?.env?.API_KEY;
    if (!apiKey) {
      setError("API Key가 설정되지 않았습니다. .env 파일 또는 설정을 확인해주세요.");
    }
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    setActiveIndex(0);

    try {
      // 1. API Key 가져오기 (Polyfill 된 window.process 사용)
      const apiKey = (window as any).process?.env?.API_KEY;
      if (!apiKey) throw new Error("API Key를 찾을 수 없습니다.");

      // 2. 새로운 SDK(@google/genai) 초기화
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const prompt = `
        You are a history teacher's assistant.
        Perform a Google Search using exactly this query: "역사 고고학 문화유산 발굴 site:n.news.naver.com"
        
        From the search results, select 4 distinct and interesting articles from 'n.news.naver.com' (Naver News).
        
        For each article:
        1. Summarize the content in Korean (keep it interesting for students).
        2. Create a '3줄 요약' (3-line summary) at the end of the content.
        
        Output valid JSON only matching this structure:
        {
          "news": [
            {
              "title": "Korean Title",
              "content": "Summary... \\n\\n[3줄 요약]\\n1. ...\\n2. ...\\n3. ...",
              "source": "Naver News",
              "url": "https://n.news.naver.com/..."
            }
          ],
          "summary": "Trend analysis in Korean"
        }
      `;

      // 3. 모델 호출 (gemini-2.0-flash-exp 사용)
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      
      if (!text) throw new Error("AI 응답이 비어있습니다.");

      // 4. JSON 파싱
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      const parsedData: NewsData = JSON.parse(cleanedText);

      if (!parsedData.news || parsedData.news.length === 0) {
        throw new Error("네이버 뉴스에서 기사를 찾지 못했습니다.");
      }

      setNewsData(parsedData);

    } catch (err: any) {
      console.error("Fetch Error:", err);
      let msg = err.message || "뉴스를 불러오는 데 실패했습니다.";
      if (msg.includes("404")) msg = "모델을 찾을 수 없습니다 (404).";
      setError(msg);
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

    const item = newsData.news[activeIndex];
    if (!item) return null;

    return (
      <div className="flex flex-col h-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#3e2723] shadow-2xl relative animate-fade-in">
        <div className="bg-[#2c2c2c] p-4 flex justify-between items-center border-b border-[#3e2723] shrink-0">
          <span className="text-xs font-bold text-amber-600 tracking-widest">NEWS FLASH #{activeIndex + 1}</span>
          <span className="text-xs text-stone-400">네이버 뉴스</span>
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
        
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-stone-700/10 rounded-full blur-[100px]"></div>
        </div>

        {error && !loading && !newsData && (
          <div className="z-10 p-6 bg-red-900/20 border border-red-900/50 rounded-lg max-w-md text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-red-400 font-bold mb-2">오류 발생</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {!newsData && !loading && !error && (
          <div className="text-center z-10 max-w-lg animate-fade-in-up">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-stone-700 shadow-xl">
              <Newspaper className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#f4e4bc] mb-4">역사의 기록을 찾아서</h2>
            <p className="text-stone-400 mb-8 leading-relaxed">
              AI가 <span className="text-green-500 font-bold">네이버 뉴스</span>를 검색하여<br/>
              역사/고고학 소식을 브리핑합니다.
            </p>
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
            <h3 className="text-xl text-[#f4e4bc] animate-pulse">사료 분석 중...</h3>
            <p className="text-sm text-stone-500 mt-2">네이버 뉴스에서 정보를 수집하고 있습니다.</p>
          </div>
        )}

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