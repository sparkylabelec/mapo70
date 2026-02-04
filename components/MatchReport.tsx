
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MatchResult } from '../types';
import { deleteMatchResult, fetchMatchResults } from '../services/matchService';
import Logo from './Logo';
import html2canvas from 'html2canvas';
import { 
  ArrowLeft, MapPin, Calendar, Footprints, Loader2, Link as LinkIcon,
  CheckCircle2, Image as ImageIcon, AlertCircle, Edit2, Trash2, 
  Download, X, UserCheck, Star
} from 'lucide-react';

interface MatchReportProps {
  id: string;
  onBack: () => void;
  onViewScorerStats: (name: string) => void;
  isAuthenticated?: boolean;
  onEdit: (match: MatchResult) => void;
  onNavigate?: (id: string) => void;
}

const MatchReport: React.FC<MatchReportProps> = ({ id, onBack, onViewScorerStats, isAuthenticated, onEdit, onNavigate }) => {
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [allMatches, setAllMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const getSecureProxyUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('firebasestorage.googleapis.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(url)}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'matches', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as MatchResult;
          setMatch(data);
        }
        const results = await fetchMatchResults();
        setAllMatches(results);
      } catch (err) {
        console.error("[MatchReport] 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToastMessage('리포트 링크가 복사되었습니다!', 'success');
    });
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!match?.id) return;
    setIsDeleting(true);
    try {
      await deleteMatchResult(match.id);
      showToastMessage('경기가 삭제되었습니다.', 'success');
      setTimeout(onBack, 1000);
    } catch (err) {
      showToastMessage('삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const toBase64 = async (url: string): Promise<string> => {
    try {
      const proxyUrl = getSecureProxyUrl(url);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) { return url; }
  };

  const handleDownloadJPG = async () => {
    if (!reportRef.current || !match) return;
    
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      
      // CORS 문제를 피하기 위해 모든 이미지를 Base64로 미리 변환
      const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      const originalSrcs = images.map(img => img.src);
      
      const base64Images = await Promise.all(images.map(img => toBase64(img.src)));
      images.forEach((img, i) => { img.src = base64Images[i]; });
      
      // 렌더링 동기화를 위해 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(element, { 
        useCORS: true, 
        scale: 2, 
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // 원본 소스 복구
      images.forEach((img, i) => { img.src = originalSrcs[i]; });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `MATCH_REPORT_${match.date}_vs_${match.opponent}.jpg`;
      link.click();
      
      showToastMessage('리포트가 저장되었습니다.', 'success');
    } catch (error) {
      console.error("JPG 생성 오류:", error);
      showToastMessage('저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="animate-spin text-emerald-600 w-12 h-12" /><p className="text-zinc-500 font-bold">로딩 중...</p></div>;
  if (!match) return <div className="text-center py-20 text-zinc-400">데이터를 찾을 수 없습니다.</div>;

  const isWin = match.ourScore > match.opponentScore;
  const isDraw = match.ourScore === match.opponentScore;

  const allScorers = [...(match.scorers || [])].sort((a, b) => b.goals - a.goals);
  const allAssistants = [...(match.assists || [])].sort((a, b) => b.assists - a.assists);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between mb-2 print:hidden px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors"><ArrowLeft size={20} /> 리스트</button>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <button onClick={() => onEdit(match)} className="px-4 py-2 bg-white border rounded-xl font-bold text-zinc-700 hover:text-emerald-600 transition-colors"><Edit2 size={18} className="inline mr-1" /> 수정</button>
              <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-white border rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={18} className="inline mr-1" /> 삭제</button>
            </>
          )}
          <button onClick={handleShare} className="px-4 py-2 bg-white border rounded-xl font-bold text-zinc-700 hover:border-zinc-400 transition-colors"><LinkIcon size={18} className="inline mr-1" /> 링크</button>
          <button onClick={handleDownloadJPG} disabled={isGenerating} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors min-w-[120px] flex items-center justify-center">
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <><Download size={18} className="inline mr-1" /> JPG 저장</>}
          </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-emerald-600 p-6 sm:p-10 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo variant="light" className="w-12 h-12 sm:w-16 sm:h-16" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">경기 리포트</h1>
                <p className="text-emerald-100 text-xs sm:text-sm font-bold opacity-80 tracking-widest">MAPO 70 SENIOR ELITE</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/20">
                <Calendar size={16} />
                <span className="font-black text-lg sm:text-xl">{match.date}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-16 border-b border-zinc-50 text-zinc-900 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/20 to-transparent pointer-events-none" />
          <div className="flex justify-between items-center max-w-3xl mx-auto relative z-10">
            <div className="w-1/3 flex flex-col items-center">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Home</span>
               <span className="text-xl sm:text-3xl font-black leading-tight">마포70대<br className="hidden sm:block" />상비군</span>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-4 sm:gap-10">
                <span className="text-6xl sm:text-9xl font-black tracking-tighter text-zinc-900 drop-shadow-sm">{match.ourScore}</span>
                <span className="text-3xl sm:text-5xl font-light text-zinc-200">:</span>
                <span className="text-6xl sm:text-9xl font-black tracking-tighter text-zinc-900 drop-shadow-sm">{match.opponentScore}</span>
              </div>
              <div className={`mt-6 px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-xs sm:text-sm shadow-sm ${
                isWin ? 'bg-emerald-500 text-white' : 
                isDraw ? 'bg-zinc-400 text-white' : 'bg-red-500 text-white'
              }`}>
                {isWin ? '승리' : isDraw ? '무승부' : '패배'}
              </div>
            </div>

            <div className="w-1/3 flex flex-col items-center">
               <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Away</span>
               <span className="text-xl sm:text-3xl font-black leading-tight break-all px-2">{match.opponent}</span>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-12 bg-white text-zinc-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 flex items-center gap-5 group transition-all hover:bg-zinc-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 shadow-sm">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">경기 장소</h3>
                <p className="font-black text-lg sm:text-xl text-zinc-900">{match.stadium}</p>
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-5 group transition-all hover:bg-emerald-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">총 출전 인원</h3>
                <p className="font-black text-lg sm:text-xl text-emerald-800">{match.playerCount || 0} <span className="text-sm">명</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-zinc-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                <Footprints size={18} className="text-emerald-500" /> 득점 기록
              </h3>
            </div>
            
            {match.scorers && match.scorers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allScorers.map((scorer, idx) => (
                  <div key={idx} onClick={() => onViewScorerStats(scorer.name)} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 hover:scale-[1.02] transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-500'}`}>{idx + 1}</div>
                      <span className="font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">{scorer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Goals</span>
                      <span className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-black group-hover:bg-emerald-600 transition-all shadow-sm">{scorer.goals}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100 text-center"><p className="text-zinc-400 text-sm font-bold italic">득점 기록이 없습니다.</p></div>
            )}
          </div>

          {match.assists && match.assists.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-zinc-400 uppercase flex items-center gap-2 tracking-[0.2em]">
                  <Star size={18} className="text-amber-500" /> 어시스트 기록
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allAssistants.map((assist, idx) => (
                  <div key={idx} onClick={() => onViewScorerStats(assist.name)} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100 shadow-sm cursor-pointer hover:bg-amber-50 hover:border-amber-200 hover:scale-[1.02] transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-600'}`}>{idx + 1}</div>
                      <span className="font-black text-zinc-900 group-hover:text-amber-700 transition-colors">{assist.name}</span>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Assts</span>
                      <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black group-hover:bg-amber-600 transition-all shadow-sm">{assist.assists}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {match.imageUrls && match.imageUrls.length > 0 && (
            <div className="space-y-6 pt-10 border-t border-zinc-100">
              <h3 className="text-xs font-black text-zinc-400 uppercase flex items-center gap-2 tracking-[0.2em] mb-4">
                <ImageIcon size={18} className="text-emerald-500" /> 경기 갤러리
              </h3>
              <div className="grid grid-cols-2 gap-1 rounded-[2.5rem] overflow-hidden border border-zinc-200 shadow-inner bg-zinc-100">
                {match.imageUrls.map((url, idx) => (
                  <div key={idx} onClick={() => setSelectedZoomImage(url)} className="aspect-[4/3] bg-zinc-200 relative cursor-pointer active:opacity-80 overflow-hidden group">
                    {!imageErrors[idx] ? (
                      <img src={getSecureProxyUrl(url)} alt={`Highlight ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" onError={() => setImageErrors(prev => ({...prev, [idx]: true}))} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><AlertCircle size={32} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                       <div className="bg-white/90 p-3 rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-300"><ImageIcon className="text-emerald-600" size={24} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-10 border-t border-zinc-50 bg-zinc-50/50 text-center">
          <Logo variant="dark" className="w-10 h-10 opacity-20 grayscale mx-auto mb-4" />
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Official Record of Mapo Senior Elite Squad</p>
        </div>
      </div>

      {selectedZoomImage && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedZoomImage(null)}>
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors p-2" title="닫기"><X size={36} /></button>
          <img src={getSecureProxyUrl(selectedZoomImage)} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500" alt="확대된 이미지" />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-300 border border-zinc-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2 text-red-600"><Trash2 size={40} /></div>
            <h3 className="text-2xl font-black text-zinc-900">리포트 삭제</h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">정말로 이 경기 리포트를 삭제하시겠습니까?<br/>삭제 후에는 복구할 수 없습니다.</p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-black transition-all">취소</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg shadow-red-100 transition-all active:scale-95">{isDeleting ? <Loader2 className="animate-spin inline" /> : '삭제하기'}</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4">
          <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border ${showToast.type === 'success' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
            {showToast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-400" /> : <AlertCircle size={24} />}
            <span className="font-black text-sm tracking-tight">{showToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchReport;
