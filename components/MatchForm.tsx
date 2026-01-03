import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, MapPin, Users, Calendar, Image as ImageIcon, X, Loader2, AlertCircle, Footprints, UserCheck, ArrowLeft } from 'lucide-react';
import { Scorer, MatchResult } from '../types';
import { saveMatchResult, updateMatchResult } from '../services/matchService';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface MatchFormProps {
  onSuccess: () => void;
  onCancel?: () => void; // 취소 콜백 추가
  initialData?: MatchResult | null;
  aiExtractedData?: Partial<MatchResult> | null;
}

const MatchForm: React.FC<MatchFormProps> = ({ onSuccess, onCancel, initialData, aiExtractedData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [opponent, setOpponent] = useState('');
  const [ourScore, setOurScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [stadium, setStadium] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(11);
  
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 데이터 또는 AI 추출 데이터 반영
  useEffect(() => {
    const data = initialData || aiExtractedData;
    if (data) {
      if (data.opponent !== undefined) setOpponent(data.opponent);
      if (data.ourScore !== undefined) setOurScore(data.ourScore);
      if (data.opponentScore !== undefined) setOpponentScore(data.opponentScore);
      if (data.stadium !== undefined) setStadium(data.stadium);
      if (data.date !== undefined) setDate(data.date);
      if (data.scorers !== undefined) setScorers(data.scorers);
      if (data.playerCount !== undefined) setPlayerCount(data.playerCount);
      
      if (initialData?.imageUrls) {
        setExistingImageUrls(initialData.imageUrls);
      }
    }
  }, [initialData, aiExtractedData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const validFiles = selectedFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });
      if ((existingImageUrls.length + newImageFiles.length + validFiles.length) > 6) {
        setError('최대 6장의 사진만 등록 가능합니다.');
        return;
      }
      if (validFiles.length > 0) {
        setError(null);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setNewImageFiles(prev => [...prev, ...validFiles]);
        setNewImagePreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };

  const removeExistingImage = (index: number) => setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index: number) => {
    if (newImagePreviews[index]) {
      URL.revokeObjectURL(newImagePreviews[index]);
    }
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addScorer = () => setScorers([...scorers, { name: '', goals: 1 }]);
  const updateScorer = (index: number, field: keyof Scorer, value: string | number) => {
    const updated = [...scorers];
    updated[index] = { ...updated[index], [field]: value };
    setScorers(updated);
  };
  const removeScorer = (index: number) => setScorers(scorers.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent || !stadium) {
      setError('상대 팀 이름과 경기장 정보는 필수입니다.');
      return;
    }
    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, `matches/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }
      const finalImageUrls = [...existingImageUrls, ...uploadedUrls];
      const matchData = {
        opponent,
        ourScore,
        opponentScore,
        stadium,
        date,
        scorers: scorers.filter(s => s.name.trim() !== ''),
        playerCount: playerCount,
        imageUrls: finalImageUrls
      };
      if (initialData?.id) {
        await updateMatchResult(initialData.id, matchData);
      } else {
        await saveMatchResult(matchData);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
          <Plus className="text-emerald-600 bg-emerald-50 p-1.5 rounded-xl" size={32} /> 
          {initialData ? '경기 결과 수정' : aiExtractedData ? 'AI 데이터 검토' : '경기 결과 등록'}
        </h2>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
            title="취소"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
          <AlertCircle size={24} />
          <span className="text-sm font-bold">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400"><X size={20} /></button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Users size={16} /> 상대팀</label>
            <input required value={opponent} onChange={(e) => setOpponent(e.target.value)} className="w-full px-5 py-3.5 border-2 border-zinc-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-zinc-800" />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={16} /> 경기 날짜</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-3.5 border-2 border-zinc-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-zinc-800" />
          </div>
        </div>

        <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100">
          <div className="grid grid-cols-2 gap-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-200 text-4xl">:</div>
            <div className="space-y-4 text-center">
              <label className="text-[10px] font-black text-emerald-600 uppercase">우리 팀 점수</label>
              <input type="number" min="0" value={ourScore} onChange={(e) => setOurScore(parseInt(e.target.value) || 0)} className="w-full text-center text-5xl font-black py-4 border-2 border-transparent focus:border-emerald-500 rounded-3xl outline-none bg-white shadow-sm" />
            </div>
            <div className="space-y-4 text-center">
              <label className="text-[10px] font-black text-zinc-400 uppercase">상대 팀 점수</label>
              <input type="number" min="0" value={opponentScore} onChange={(e) => setOpponentScore(parseInt(e.target.value) || 0)} className="w-full text-center text-5xl font-black py-4 border-2 border-transparent focus:border-zinc-300 rounded-3xl outline-none bg-white shadow-sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={16} /> 경기장</label>
            <input required value={stadium} onChange={(e) => setStadium(e.target.value)} className="w-full px-5 py-3.5 border-2 border-zinc-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-zinc-800" />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><UserCheck size={16} /> 참여 인원수 (명)</label>
            <input 
              type="number" 
              min="1" 
              value={playerCount} 
              onChange={(e) => setPlayerCount(parseInt(e.target.value) || 0)} 
              className="w-full px-5 py-3.5 border-2 border-zinc-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-zinc-800" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} /> 갤러리</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {existingImageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-100 group shadow-sm">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(index)} className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={24} /></button>
              </div>
            ))}
            {newImagePreviews.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-100 group shadow-sm">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewImage(index)} className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={24} /></button>
              </div>
            ))}
            {(existingImageUrls.length + newImageFiles.length) < 6 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-300 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                <Plus size={32} />
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
        </div>

        <div className="space-y-6 pt-4 border-t border-zinc-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Footprints size={16} /> 득점 선수</label>
            <button type="button" onClick={addScorer} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase hover:bg-emerald-100 transition-colors"><Plus size={16} className="inline mr-1" /> 추가</button>
          </div>
          <div className="space-y-3">
            {scorers.map((scorer, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input value={scorer.name} onChange={(e) => updateScorer(index, 'name', e.target.value)} placeholder="선수명" className="flex-1 px-4 py-3 border-2 border-zinc-50 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 bg-zinc-50 focus:bg-white transition-all" />
                <input type="number" min="1" value={scorer.goals} onChange={(e) => updateScorer(index, 'goals', parseInt(e.target.value) || 1)} className="w-20 px-4 py-3 border-2 border-zinc-50 rounded-2xl text-sm font-black text-center outline-none focus:border-emerald-500 bg-zinc-50 focus:bg-white" />
                <button type="button" onClick={() => removeScorer(index)} className="p-3 text-zinc-300 hover:text-red-500"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="flex-1 py-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-black rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ArrowLeft size={20} />
              입력 취소
            </button>
          )}
          <button 
            disabled={loading} 
            type="submit" 
            className="flex-[2] py-5 bg-zinc-900 hover:bg-black text-white font-black rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-zinc-200"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            {initialData ? '리포트 수정하기' : '리포트 발행하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchForm;