import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Download, Upload, Shuffle, Dices, RefreshCw, User, X, Plus, GripHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  number: string | number;
  name: string;
}

const Week2: React.FC = () => {
  // 32 seats (0-31)
  const [seats, setSeats] = useState<(Student | null)[]>(Array(32).fill(null));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempStudent, setTempStudent] = useState({ number: '', name: '' });
  
  // Roulette State
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteDisplay, setRouletteDisplay] = useState("Ready");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Excel Functions --

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = [
      ["번호", "이름"],
      ["1", "홍길동"],
      ["2", "이순신"],
      ["3", "강감찬"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "명렬표");
    XLSX.writeFile(wb, "자리배치_양식.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Expect headers: 번호, 이름
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newSeats = Array(32).fill(null);
      
      data.slice(0, 32).forEach((row, idx) => {
        // Handle variations in header naming loosely if needed, or strictly
        const number = row['번호'] || row['Number'] || (idx + 1);
        const name = row['이름'] || row['Name'];
        
        if (name) {
            newSeats[idx] = {
                id: Date.now() + idx,
                number: number,
                name: name
            };
        }
      });
      
      setSeats(newSeats);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // -- Seating Logic --

  const handleShuffle = () => {
    if (!window.confirm("모든 자리를 무작위로 재배치하시겠습니까?")) return;

    // Collect all existing students
    const existingStudents = seats.filter((s) => s !== null) as Student[];
    
    // Shuffle logic (Fisher-Yates)
    for (let i = existingStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [existingStudents[i], existingStudents[j]] = [existingStudents[j], existingStudents[i]];
    }

    // Place them back into seats sequentially
    const newSeats = Array(32).fill(null);
    existingStudents.forEach((student, index) => {
      if (index < 32) newSeats[index] = student;
    });

    setSeats(newSeats);
  };

  const handleReset = () => {
    if (window.confirm("모든 자리를 초기화하시겠습니까?")) {
      setSeats(Array(32).fill(null));
    }
  };

  // -- Manual Edit Logic --

  const openEdit = (index: number) => {
    setEditingIndex(index);
    const s = seats[index];
    setTempStudent(s ? { number: String(s.number), name: s.name } : { number: '', name: '' });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    
    if (!tempStudent.name.trim()) {
        // Remove student if name is empty
        const newSeats = [...seats];
        newSeats[editingIndex] = null;
        setSeats(newSeats);
    } else {
        const newSeats = [...seats];
        newSeats[editingIndex] = {
            id: newSeats[editingIndex]?.id || Date.now(),
            number: tempStudent.number,
            name: tempStudent.name
        };
        setSeats(newSeats);
    }
    setEditingIndex(null);
  };

  // -- Roulette Logic --

  const startRoulette = () => {
    const candidates = seats.filter(s => s !== null) as Student[];
    if (candidates.length === 0) {
        alert("배치된 학생이 없습니다.");
        return;
    }

    setIsRouletteOpen(true);
    setRouletteResult(null);
    setIsSpinning(false);
    setRouletteDisplay("Ready");
  };

  const spin = () => {
    const candidates = seats.filter(s => s !== null) as Student[];
    if (candidates.length === 0) return;

    setIsSpinning(true);
    
    let counter = 0;
    const maxIterations = 30; // Number of flickers
    let speed = 50;

    const flicker = () => {
        const randomIdx = Math.floor(Math.random() * candidates.length);
        setRouletteDisplay(candidates[randomIdx].name);
        
        counter++;
        if (counter < maxIterations) {
            // Slow down gradually
            if (counter > maxIterations - 10) speed += 30;
            setTimeout(flicker, speed);
        } else {
            // Final pick
            const winnerIdx = Math.floor(Math.random() * candidates.length);
            const winner = candidates[winnerIdx];
            setRouletteDisplay(winner.name);
            setRouletteResult(winner);
            setIsSpinning(false);
        }
    };
    
    flicker();
  };

  return (
    <Layout title="Week 2: 자리 배치 & 룰렛">
      <div className="flex-1 flex flex-col bg-[#2c2c2c] overflow-hidden">
        
        {/* Toolbar */}
        <div className="bg-[#1a1a1a] p-4 border-b border-[#3e2723] flex flex-wrap gap-4 items-center justify-center md:justify-between">
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded text-stone-200 text-sm transition-colors"
            >
              <Download className="w-4 h-4" /> 양식 다운로드
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded text-stone-200 text-sm transition-colors"
            >
              <Upload className="w-4 h-4" /> 엑셀 업로드
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx, .xls" 
              className="hidden" 
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleShuffle}
              className="flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-700 rounded text-amber-100 text-sm transition-colors font-bold"
            >
              <Shuffle className="w-4 h-4" /> 자리 섞기
            </button>
            <button 
              onClick={startRoulette}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded text-indigo-100 text-sm transition-colors font-bold"
            >
              <Dices className="w-4 h-4" /> 룰렛 모드
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900 rounded text-red-100 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> 초기화
            </button>
          </div>
        </div>

        {/* Main Content Area: The Classroom */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-stone-900 relative">
          
          {/* Blackboard / Front */}
          <div className="max-w-4xl mx-auto mb-10 bg-[#2b3a28] border-8 border-[#3e2723] rounded-lg p-6 shadow-2xl relative">
            <h2 className="text-center text-white/80 font-serif text-2xl tracking-widest border-b border-white/20 pb-2 mb-2">교 탁</h2>
            <div className="text-center text-white/40 text-sm">Front of Class</div>
            {/* Chalk dust effect */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
          </div>

          {/* Seating Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 mb-20">
            {seats.map((student, idx) => (
              <div 
                key={idx}
                onClick={() => openEdit(idx)}
                className={`
                  aspect-[4/3] rounded-lg border-b-4 relative cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg group
                  ${student 
                    ? 'bg-[#d7ccc8] border-[#8d6e63] text-stone-900' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                {student ? (
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <span className="text-xs font-bold bg-[#5d4037] text-[#d7ccc8] rounded-full px-2 py-0.5 mb-1 opacity-70">
                      {student.number}
                    </span>
                    <span className="font-bold text-lg md:text-xl truncate w-full text-center">
                      {student.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/20 group-hover:text-white/40">
                    <Plus className="w-6 h-6" />
                  </div>
                )}
                
                {/* Desk number indicator */}
                <div className="absolute top-1 left-2 text-[10px] opacity-30">
                    {idx + 1}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2c2c2c] border border-[#3e2723] p-6 rounded-lg w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-[#f4e4bc] mb-4">
              자리 설정 ({editingIndex + 1}번)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-stone-400 mb-1">번호</label>
                <input 
                  type="text" 
                  value={tempStudent.number}
                  onChange={e => setTempStudent({...tempStudent, number: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#3e2723] rounded p-2 text-white focus:outline-none focus:border-amber-600"
                  placeholder="예: 1"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">이름</label>
                <input 
                  type="text" 
                  value={tempStudent.name}
                  onChange={e => setTempStudent({...tempStudent, name: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#3e2723] rounded p-2 text-white focus:outline-none focus:border-amber-600"
                  placeholder="예: 홍길동"
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setEditingIndex(null)}
                className="flex-1 py-2 bg-stone-700 text-stone-300 rounded hover:bg-stone-600"
              >
                취소
              </button>
              <button 
                onClick={saveEdit}
                className="flex-1 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 font-bold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roulette Modal */}
      {isRouletteOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <button 
                onClick={() => setIsRouletteOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="text-center">
                <h2 className="text-2xl text-amber-500 mb-8 font-serif tracking-widest">LUCKY DRAW</h2>
                
                <div className={`
                    w-64 h-64 md:w-96 md:h-96 rounded-full border-8 
                    flex items-center justify-center bg-[#2c2c2c] relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.3)]
                    ${rouletteResult ? 'border-amber-500 animate-pulse' : 'border-stone-700'}
                `}>
                    {/* Decorative Spinner Lines */}
                    <div className="absolute inset-0 opacity-10">
                         <div className="w-full h-full absolute animate-[spin_10s_linear_infinite]" style={{background: 'conic-gradient(from 0deg, transparent 0 20%, #ffffff 20% 25%, transparent 25%)'}}></div>
                    </div>

                    <div className="relative z-10 text-center">
                        <div className={`text-5xl md:text-7xl font-bold font-serif transition-all duration-100 ${rouletteResult ? 'text-amber-400 scale-110' : 'text-stone-300'}`}>
                            {rouletteDisplay}
                        </div>
                        {rouletteResult && (
                             <div className="text-xl text-stone-400 mt-4 animate-bounce">
                                 축하합니다!
                             </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={spin}
                    disabled={isSpinning}
                    className={`
                        mt-12 px-12 py-4 rounded-full text-xl font-bold tracking-widest transition-all
                        ${isSpinning 
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                            : 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95'}
                    `}
                >
                    {isSpinning ? 'SPINNING...' : rouletteResult ? 'AGAIN' : 'START'}
                </button>
            </div>
        </div>
      )}
    </Layout>
  );
};

export default Week2;