import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, MapPin, Users, Calendar, Image as ImageIcon, X, Loader2, AlertCircle, Footprints } from 'lucide-react';
import { Scorer, MatchResult } from '../types';
import { saveMatchResult, updateMatchResult } from '../services/matchService';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface MatchFormProps {
  onSuccess: () => void;
  initialData?: MatchResult | null;
}

const MatchForm: React.FC<MatchFormProps> = ({ onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [opponent, setOpponent] = useState('');
  const [ourScore, setOurScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [stadium, setStadium] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  
  // Existing URLs vs New Files
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setOpponent(initialData.opponent);
      setOurScore(initialData.ourScore);
      setOpponentScore(initialData.opponentScore);
      setStadium(initialData.stadium);
      setDate(initialData.date);
      setScorers(initialData.scorers || []);
      setExistingImageUrls(initialData.imageUrls || []);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      
      const validFiles = selectedFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });

      const totalCount = existingImageUrls.length + newImageFiles.length + validFiles.length;
      if (totalCount > 6) {
        setError('최대 6장의 사진만 유지 가능합니다.');
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

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addScorer = () => {
    setScorers([...scorers, { name: '', goals: 1 }]);
  };

  const updateScorer = (index: number, field: keyof Scorer, value: string | number) => {
    const updated = [...scorers];
    updated[index] = { ...updated[index], [field]: value };
    setScorers(updated);
  };

  const removeScorer = (index: number) => {
    setScorers(scorers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent || !stadium) {
      setError('상대 팀 이름과 경기장 정보는 필수입니다.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // 1. Upload New Images
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
        imageUrls: finalImageUrls
      };

      if (initialData?.id) {
        await updateMatchResult(initialData.id, matchData);
      } else {
        await saveMatchResult(matchData);
      }
      
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
          <Plus className="text-emerald-600 bg-emerald-50 p-1.5 rounded-xl" size={32} /> 
          {initialData ? '경기 결과 수정' : '경기 결과 등록'}
        </h2>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
          <AlertCircle size={24} className="flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={20} />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={16} /> Opponent Team
            </label>
            <input
              required
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full px-5 py-3.5 border-2 border-zinc-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-zinc-800"
              placeholder="상대 팀 이름"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} /> Match Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 border-2 border-zinc-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-zinc-800"
            />
          </div>
        </div>

        <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100">
          <div className="grid grid-cols-2 gap-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-200 text-4xl font-light">:</div>
            <div className="space-y-4">
              <label className="block text-center text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Our Score</label>
              <input
                type="number"
                min="0"
                value={ourScore}
                onChange={(e) => setOurScore(parseInt(e.target.value) || 0)}
                className="w-full text-center text-5xl font-black py-4 border-2 border-transparent focus:border-emerald-500 rounded-3xl outline-none bg-white shadow-sm transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-center text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Opponent Score</label>
              <input
                type="number"
                min="0"
                value={opponentScore}
                onChange={(e) => setOpponentScore(parseInt(e.target.value) || 0)}
                className="w-full text-center text-5xl font-black py-4 border-2 border-transparent focus:border-zinc-300 rounded-3xl outline-none bg-white shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={16} /> Stadium Name
          </label>
          <input
            required
            value={stadium}
            onChange={(e) => setStadium(e.target.value)}
            className="w-full px-5 py-3.5 border-2 border-zinc-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-zinc-800"
            placeholder="경기장 위치"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={16} /> Match Gallery (Max 6)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {existingImageUrls.map((url, index) => (
              <div key={`exist-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-100 bg-white group shadow-sm">
                <img src={url} alt="existing" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute inset-0 bg-red-600/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
            {newImagePreviews.map((url, index) => (
              <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-100 bg-white group shadow-sm">
                <img src={url} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute inset-0 bg-red-600/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={24} />
                </button>
                <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black">NEW</div>
              </div>
            ))}
            {(existingImageUrls.length + newImageFiles.length) < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-300 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <Plus size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] mt-2 font-black uppercase tracking-widest">Add Photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="space-y-6 pt-4 border-t border-zinc-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Goal Scorers</label>
            <button
              type="button"
              onClick={addScorer}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-xs font-black uppercase tracking-widest"
            >
              <Plus size={16} /> Add Scorer
            </button>
          </div>
          
          <div className="space-y-3">
            {scorers.map((scorer, index) => (
              <div key={index} className="flex gap-3 items-center animate-in slide-in-from-left-4 duration-300">
                <div className="flex-1 relative">
                  <Footprints className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                  <input
                    value={scorer.name}
                    onChange={(e) => updateScorer(index, 'name', e.target.value)}
                    placeholder="선수명"
                    className="w-full pl-12 pr-4 py-3 border-2 border-zinc-50 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 bg-zinc-50 focus:bg-white transition-all"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={scorer.goals}
                    onChange={(e) => updateScorer(index, 'goals', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border-2 border-zinc-50 rounded-2xl text-sm font-black text-center outline-none focus:border-emerald-500 bg-zinc-50 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeScorer(index)}
                  className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-5 bg-zinc-900 hover:bg-black text-white font-black rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-zinc-200"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Save size={24} />
          )}
          {initialData ? 'Update Report' : 'Publish Report'}
        </button>
      </form>
    </div>
  );
};

export default MatchForm;