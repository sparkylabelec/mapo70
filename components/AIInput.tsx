
import React, { useState } from 'react';
import { Sparkles, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { MatchResult } from '../types';

interface AIInputProps {
  onDataExtracted: (data: Partial<MatchResult>) => void;
  onCancel: () => void;
}

const AIInput: React.FC<AIInputProps> = ({ onDataExtracted, onCancel }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('경기 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fix: Use process.env.API_KEY directly for initialization and remove manual validation as per Google GenAI guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `다음은 축구 경기 결과에 대한 설명입니다. 정보를 추출하여 JSON 형식으로 반환하세요: "${inputText}"`,
        config: {
          systemInstruction: `당신은 축구 경기 기록원입니다. 텍스트에서 다음 정보를 정확히 추출하세요:
1. opponent: 상대 팀 이름
2. ourScore: 우리 팀(마포70대 상비군) 점수 (숫자)
3. opponentScore: 상대 팀 점수 (숫자)
4. stadium: 경기장 이름
5. date: 경기 날짜 (YYYY-MM-DD 형식)
6. playerCount: 참여 인원수 (숫자)
7. scorers: 득점자 목록 (name: 이름, goals: 골수)

반드시 유효한 JSON 객체 하나만 반환하세요. 정보를 알 수 없는 경우 date는 오늘 날짜, 숫자는 0, 문자열은 ""로 채우세요.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              opponent: { type: Type.STRING },
              ourScore: { type: Type.INTEGER },
              opponentScore: { type: Type.INTEGER },
              stadium: { type: Type.STRING },
              date: { type: Type.STRING },
              playerCount: { type: Type.INTEGER },
              scorers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    goals: { type: Type.INTEGER }
                  },
                  required: ["name", "goals"]
                }
              }
            },
            required: ["opponent", "ourScore", "opponentScore", "stadium", "date", "playerCount", "scorers"]
          }
        },
      });

      // response.text 속성을 사용하여 생성된 텍스트를 가져옵니다 (메서드 아님).
      const jsonStr = response.text;
      if (!jsonStr) {
        throw new Error("AI로부터 응답을 받지 못했습니다.");
      }

      const extractedData = JSON.parse(jsonStr.trim());
      onDataExtracted(extractedData);
    } catch (err) {
      console.error("[AI 분석 오류]", err);
      setError('AI가 내용을 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 p-8 sm:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">AI 경기 결과 분석</h2>
              <p className="text-zinc-400 text-sm font-bold">자연어로 경기를 기록하고 자동으로 폼을 채워보세요</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest px-1">
              <MessageSquare size={14} /> 경기 내용 입력
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="예: 어제 한강공원에서 용산FC랑 2대2로 비겼어. 13명 참석했고 박지성이 2골 넣었어."
              className="w-full h-48 px-6 py-5 bg-zinc-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl outline-none font-bold text-zinc-800 transition-all resize-none shadow-inner"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl animate-in shake duration-500">
              <AlertCircle size={20} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-black rounded-2xl transition-all"
            >
              취소
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText.trim()}
              className="flex-[2] py-4 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-zinc-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  AI 분석하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">분석 가능한 항목</h4>
        <div className="flex flex-wrap gap-2">
          {['상대팀', '점수', '경기 일자', '장소', '참여 인원', '득점자'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-emerald-600 border border-emerald-200 shadow-sm">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInput;
