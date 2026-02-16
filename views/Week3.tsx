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
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Find 4 recent (within last 3 months) interesting news articles related to history, archaeology, or cultural heritage, focusing on Korea or major global discoveries.
        
        Format the response as a valid JSON object with the following structure:
        {
          "news": [
            {
              "title": "A catchy headline for a social media card",
              "content": "A summary of the news suitable for a card news format (approx 2-3 sentences). Engaging and easy to read.",
              "source": "Name of the news outlet",
              "url": "URL of the source article"
            }
          ],
          "summary": "A comprehensive summary paragraph (approx 3-4 sentences) analyzing the trend of these news items or providing a concluding thought for the final card."
        }
        
        Ensure the content is in Korean.
        Ensure the JSON is valid and strictly follows the schema. Do not include markdown formatting like \`\`\`json.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "";
      
      // Clean up markdown code blocks if present, though we asked not to.
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let parsedData: NewsData;
      try {
        parsedData = JSON.parse(jsonString);
      } catch (e) {
        console.error("JSON Parse Error", e);
        console.log("Raw Text:", text);
        throw new Error("Failed to parse news data. The ancient scrolls are unreadable.");
      }

      setNewsData(parsedData);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch historical records.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (!newsData) return;
    if (activeIndex < newsData.news.length) { // length implies index of last news + 1 is the summary card
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

    // Final Summary Card
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

    // News Cards
    const item = newsData.news[activeIndex];
    return (
      <div className="flex flex-col h-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#3e2723] shadow-2xl relative animate-fade-in">
        {/* Decorative Header */}
        <div className="bg-[#2c2c2c] p-4 flex justify-between items-center border-b border-[#3e2723]">
          <span className="text-xs font-bold text-amber-600 tracking-widest">NEWS FLASH #{activeIndex + 1}</span>
          <span className="text-xs text-stone-500">{item.source}</span>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col justify-center relative">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
           <h3 className="text-2xl md:text-3xl font-bold text-[#f4e4bc] mb-6 leading-tight z-10">
             {item.title}
           </h3>
           <div className="w-12 h-1 bg-amber-700 mb-6 z-10"></div>
           <p className="text-lg text-stone-300 leading-relaxed z-10">
             {item.content}
           </p>
        </div>

        {/* Footer */}
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
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-stone-900 relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-stone-700/10 rounded-full blur-[100px]"></div>
        </div>

        {!newsData && !loading && (
          <div className="text-center z-10 max-w-lg">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-stone-700 shadow-xl">
              <Newspaper className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#f4e4bc] mb-4">역사의 기록을 찾아서</h2>
            <p className="text-stone-400 mb-8 leading-relaxed">
              AI가 전 세계의 역사 및 고고학 뉴스를 검색하여<br/>
              가장 흥미로운 소식을 카드 뉴스로 정리해드립니다.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
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
            <h3 className="text-xl text-[#f4e4bc] animate-pulse">고대 문헌을 분석 중입니다...</h3>
            <p className="text-sm text-stone-500 mt-2">최신 발굴 소식과 연구 자료를 수집하고 있습니다.</p>
          </div>
        )}

        {newsData && (
          <div className="w-full max-w-md md:max-w-lg h-[600px] flex flex-col z-10 relative">
            {/* Card Container */}
            <div className="flex-1 w-full relative perspective-[1000px]">
              {renderCardContent()}
            </div>

            {/* Navigation Controls */}
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