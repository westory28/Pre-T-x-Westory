import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Leaf, PenTool, MessageCircle, RefreshCw, Loader2, BookOpen, Send, AlertTriangle } from 'lucide-react';
// [중요] 여기가 @google/genai가 아니라 @google/generative-ai 여야만 합니다!
import { GoogleGenerativeAI } from "@google/generative-ai";

// ----------------------------------------------------------------------
// 타입 정의
// ----------------------------------------------------------------------
type Step = 'intro' | 'loading_case' | 'view_case' | 'writing' | 'loading_feedback' | 'feedback';

interface HistoryCase {
  topic: string;
  description: string;
  question: string;
}

interface FeedbackData {
  praise: string;
  insight: string;
  suggestion: string;
}

const Week4: React.FC = () => {
  // ----------------------------------------------------------------------
  // 상태 관리
  // ----------------------------------------------------------------------
  const [step, setStep] = useState<Step>('intro');
  const [historyCase, setHistoryCase] = useState<HistoryCase | null>(null);
  const [studentText, setStudentText] = useState('');
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------------------
  // API 키 안전하게 가져오기
  // ----------------------------------------------------------------------
  const getApiKey = () => {
    if (import.meta.env?.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
    if (process.env?.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    if ((window as any).process?.env?.API_KEY) return (window as any).process.env.API_KEY;
    return null;
  };

  const initGenAI = () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key가 없습니다. 환경 변수를 확인해주세요.");
    return new GoogleGenerativeAI(apiKey);
  };

  // ----------------------------------------------------------------------
  // 기능 1: 생태환경사 사례 생성하기
  // ----------------------------------------------------------------------
  const generateCase = async () => {
    setStep('loading_case');
    setError(null);

    try {
      const genAI = initGenAI();
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        당신은 중학교 역사 선생님입니다. '생태환경사(Ecological History)' 수업을 진행하고 있습니다.
        
        다음 주제들 중 하나를 무작위로 골라 학생들에게 흥미로운 역사적 사례를 소개해주세요:
        1. 이스터섬의 숲 파괴와 문명 붕괴
        2. 미국 더스트 볼(Dust Bowl)과 농업의 실패
        3. 조선 시대의 송금(소나무 벌목 금지) 정책
        4. 산업혁명 당시 런던의 스모그
        5. 흑사병과 유럽의 인구/환경 변화

        [요청 사항]
        - 중학생이 이해하기 쉽게 3~4문장으로 설명하세요.
        - 역사적 사실(Fact)에 기반해야 합니다. 환각을 일으키지 마세요.
        - 마지막에는 학생이 생각해볼 만한 질문을 하나 던져주세요.

        [출력 형식 - JSON Only]
        {
          "topic": "주제 제목",
          "description": "사례 설명 내용...",
          "question": "학생에게 던지는 질문"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // JSON 파싱 (안전 장치)
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }
      
      const jsonData: HistoryCase = JSON.parse(cleanedText);

      setHistoryCase(jsonData);
      setStep('view_case');

    } catch (err: any) {
      console.error(err);
      setError("역사 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
      setStep('intro');
    }
  };

  // ----------------------------------------------------------------------
  // 기능 2: 학생 글 피드백 받기
  // ----------------------------------------------------------------------
  const submitWriting = async () => {
    if (!studentText.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    setStep('loading_feedback');
    setError(null);

    try {
      const genAI = initGenAI();
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        당신은 따뜻하고 예리한 역사 선생님입니다.
        학생이 '${historyCase?.topic}'에 대해 쓴 글을 읽고 '생태환경사적 관점'에서 피드백을 해주세요.

        [학생의 글]
        ${studentText}

        [피드백 지침]
        1. 칭찬하기: 학생이 잘 포착한 부분 (인간과 자연의 관계 등)
        2. 깊이 더하기: 역사적 사실이나 생태학적 관점에서 덧붙일 설명
        3. 제안하기: 앞으로 더 생각해보면 좋을 점
        
        * 말투는 "~~했구나", "~~란다" 처럼 친절한 선생님 말투를 사용하세요.
        * 절대 거짓 정보를 지어내지 마세요.

        [출력 형식 - JSON Only]
        {
          "praise": "칭찬 내용 (1~2문장)",
          "insight": "심화 설명 (2~3문장)",
          "suggestion": "추가 제안 (1~2문장)"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // JSON 파싱
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      const jsonData: FeedbackData = JSON.parse(cleanedText);

      setFeedback(jsonData);
      setStep('feedback');

    } catch (err: any) {
      console.error(err);
      setError("피드백을 생성하는 중 오류가 발생했습니다.");
      setStep('view_case');
    }
  };

  // ----------------------------------------------------------------------
  // 화면 렌더링
  // ----------------------------------------------------------------------
  return (
    <Layout title="Week 4: 인간과 자연의 역사">
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-stone-900 relative min-h-[calc(100vh-64px)] font-sans">
        
        {/* 배경 효과 */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-stone-700/10 rounded-full blur-[100px]"></div>
        </div>

        {error && (
          <div className="absolute top-4 z-50 p-4 bg-red-900/80 border border-red-500 rounded-lg text-white flex items-center gap-2 animate-bounce">
            <AlertTriangle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Step 1: 인트로 */}
        {step === 'intro' && (
          <div className="text-center z-10 max-w-lg animate-fade-in-up">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-800 shadow-2xl shadow-emerald-900/20">
              <Leaf className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-[#e7e5e4] mb-4">역사와 환경의 대화</h2>
            <p className="text-stone-400 mb-8 leading-relaxed">
              인간은 자연을 어떻게 대했을까요?<br/>
              역사 속 사건을 통해 인간과 자연의 관계를 되돌아보고,<br/>
              나만의 생각을 기록해보는 시간입니다.
            </p>
            <button 
              onClick={generateCase}
              className="px-8 py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
            >
              <BookOpen className="w-5 h-5" /> 역사적 사례 살펴보기
            </button>
          </div>
        )}

        {/* Step 2: 로딩 중 */}
        {(step === 'loading_case' || step === 'loading_feedback') && (
          <div className="text-center z-10">
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
            <h3 className="text-xl text-[#e7e5e4] animate-pulse">
              {step === 'loading_case' ? '역사 기록을 찾는 중입니다...' : '선생님이 글을 읽고 계십니다...'}
            </h3>
          </div>
        )}

        {/* Step 3: 사례 보기 및 글쓰기 */}
        {(step === 'view_case' || step === 'writing') && historyCase && (
          <div className="w-full max-w-2xl bg-[#1c1917] border border-stone-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col animate-fade-in">
            <div className="bg-[#292524] p-6 border-b border-stone-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs font-bold rounded border border-emerald-800">생태환경사</span>
                <span className="text-stone-500 text-xs">오늘의 탐구 주제</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#e7e5e4]">{historyCase.topic}</h2>
            </div>

            <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-[#1c1917] to-[#151312]">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {historyCase.description}
                </p>
              </div>
              
              <div className="bg-stone-800/50 p-4 rounded-lg border-l-4 border-emerald-600">
                <h4 className="font-bold text-emerald-500 mb-1 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> 생각해보기
                </h4>
                <p className="text-stone-200 font-medium">{historyCase.question}</p>
              </div>

              {step === 'view_case' ? (
                <button 
                  onClick={() => setStep('writing')}
                  className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <PenTool className="w-5 h-5" /> 내 생각 적어보기
                </button>
              ) : (
                <div className="animate-fade-in space-y-4">
                  <textarea
                    value={studentText}
                    onChange={(e) => setStudentText(e.target.value)}
                    placeholder="여기에 자유롭게 자신의 생각을 적어보세요. (예: 인간의 욕심이 자연을 어떻게 망쳤는지 느꼈어요...)"
                    className="w-full h-40 bg-[#0c0a09] border border-stone-700 rounded-lg p-4 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all resize-none"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStep('view_case')}
                      className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-lg transition-all"
                    >
                      취소
                    </button>
                    <button 
                      onClick={submitWriting}
                      className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> 선생님께 제출하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: 피드백 결과 */}
        {step === 'feedback' && feedback && (
          <div className="w-full max-w-3xl z-10 animate-fade-in space-y-6">
            <div className="bg-[#292524] border-2 border-emerald-800/50 rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Leaf className="w-32 h-32 text-emerald-500" />
               </div>

               <h3 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center border border-emerald-700">
                    <span className="text-xl">👩‍🏫</span>
                 </div>
                 선생님의 피드백
               </h3>

               <div className="space-y-6 relative z-10">
                 <div className="bg-stone-900/50 p-4 rounded-lg">
                    <span className="block text-emerald-600 font-bold text-sm mb-1">👍 잘한 점</span>
                    <p className="text-stone-200 leading-relaxed">{feedback.praise}</p>
                 </div>

                 <div className="bg-stone-900/50 p-4 rounded-lg">
                    <span className="block text-amber-600 font-bold text-sm mb-1">🧐 역사적 깊이 더하기</span>
                    <p className="text-stone-200 leading-relaxed">{feedback.insight}</p>
                 </div>

                 <div className="bg-stone-900/50 p-4 rounded-lg">
                    <span className="block text-blue-500 font-bold text-sm mb-1">🚀 더 생각해볼 점</span>
                    <p className="text-stone-200 leading-relaxed">{feedback.suggestion}</p>
                 </div>
               </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => { setStep('view_case'); setFeedback(null); }}
                className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full transition-all"
              >
                내 글 다시 수정하기
              </button>
              <button 
                onClick={generateCase}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-full transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> 다른 사례 살펴보기
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Week4;
