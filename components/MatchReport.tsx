import React, { useEffect, useState, useRef, useMemo } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MatchResult } from '../types';
import { deleteMatchResult, fetchMatchResults } from '../services/matchService';
import Logo from './Logo';
import { 
  ArrowLeft, MapPin, Calendar, Users, Footprints, Loader2, Link as LinkIcon,
  CheckCircle2, Activity, Image as ImageIcon, AlertCircle, Edit2, Trash2, 
  ChevronRight, ChevronLeft, Shield, Download, X, Maximize2, UserCheck
} from 'lucide-react';

declare var html2canvas: any;

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

  const { prevMatch, nextMatch } = useMemo(() => {
    if (allMatches.length === 0 || !id) return { prevMatch: null, nextMatch: null };
    const currentIndex = allMatches.findIndex(m => m.id === id);
    if (currentIndex === -1) return { prevMatch: null, nextMatch: null };
    return {
      nextMatch: currentIndex > 0 ? allMatches[currentIndex - 1] : null,
      prevMatch: currentIndex < allMatches.length - 1 ? allMatches[currentIndex + 1] : null
    };
  }, [allMatches, id]);

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
    const canvasLib = (window as any).html2canvas;
    if (!canvasLib) {
      showToastMessage('도구를 불러오는 중입니다...', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      const base64Images = await Promise.all(images.map(img => toBase64(img.src)));
      const originalSrcs = images.map(img => img.src);
      images.forEach((img, i) => { img.src = base64Images[i]; });
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await canvasLib(element, { useCORS: true, scale: 2, backgroundColor: '#ffffff' });
      images.forEach((img, i) => { img.src = originalSrcs[i]; });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `MATCH_REPORT_${match.date}_vs_${match.opponent}.jpg`;
      link.click();
      showToastMessage('리포트가 저장되었습니다.', 'success');
    } catch (error) {
      showToastMessage('저장 실패.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="animate-spin text-emerald-600 w-12 h-12" /><p className="text-zinc-500 font-bold">로딩 중...</p></div>;
  if (!match) return <div className="text-center py-20 text-zinc-400">데이터를 찾을 수 없습니다.</div>;

  const isWin = match.ourScore > match.opponentScore;
  const isDraw = match.ourScore === match.opponentScore;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between mb-2 print:hidden px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors"><ArrowLeft size={20} /> 리스트</button>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <button onClick={() => onEdit(match)} className="px-4 py-2 bg-white border rounded-xl font-bold text-zinc-700 hover:text-emerald-600"><Edit2 size={18} className="inline mr-1" /> 수정</button>
              <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-white border rounded-xl font-bold text-red-500 hover:bg-red-50"><Trash2 size={18} className="inline mr-1" /> 삭제</button>
            </>
          )}
          <button onClick={handleShare} className="px-4 py-2 bg-white border rounded-xl font-bold text-zinc-700"><LinkIcon size={18} className="inline mr-1" /> 링크</button>
          <button onClick={handleDownloadJPG} disabled={isGenerating} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md">{isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="inline mr-1" />} JPG 저장</button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden">
        <div className="bg-emerald-600 p-8 sm:p-12 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo variant="light" className="w-16 h-16" />
              <div><h1 className="text-3xl font-black uppercase">경기 리포트</h1><p className="text-emerald-100 font-bold">마포70대 상비군</p></div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20"><Calendar size={18} /><span className="font-black text-xl">{match.date}</span></div>
          </div>
        </div>

        <div className="p-8 sm:p-12 border-b border-zinc-100 text-zinc-900 text-center">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <span className="text-xl sm:text-2xl font-black w-1/3">마포70대<br/>상비군</span>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4 sm:gap-8">
                <span className="text-5xl sm:text-8xl font-black">{match.ourScore}</span>
                <span className="text-3xl font-light text-zinc-200">:</span>
                <span className="text-5xl sm:text-8xl font-black">{match.opponentScore}</span>
              </div>
              <div className={`mt-2 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-xs ${isWin ? 'bg-emerald-500 text-white' : isDraw ? 'bg-zinc-400 text-white' : 'bg-red-500 text-white'}`}>{isWin ? '승리' : isDraw ? '무승부' : '패배'}</div>
            </div>
            <span className="text-xl sm:text-2xl font-black w-1/3">{match.opponent}</span>
          </div>
        </div>

        <div className="p-6 sm:p-12 space-y-8 bg-white text-zinc-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
              <h3 className="text-xs font-black text-zinc-400 uppercase flex items-center gap-2 mb-3"><MapPin size={16} /> 경기 장소</h3>
              <p className="font-black text-xl">{match.stadium}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
              <h3 className="text-xs font-black text-zinc-800 uppercase flex items-center gap-2 mb-3"><UserCheck size={16} /> 총 출전 인원</h3>
              <p className="font-black text-xl text-emerald-700">{match.playerCount || 0} 명</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-400 uppercase flex items-center gap-2"><Footprints size={16} className="text-emerald-500" /> 득점 기록</h3>
            {match.scorers && match.scorers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {match.scorers.map((scorer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-transparent shadow-sm">
                    <button 
                      onClick={() => onViewScorerStats(scorer.name)}
                      className="font-black text-zinc-900 hover:text-emerald-600 hover:underline transition-all text-left group"
                    >
                      <span className="flex items-center gap-2">
                        {scorer.name}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </span>
                    </button>
                    <span className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black">{scorer.goals}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm italic">득점 기록이 없습니다.</p>
            )}
          </div>

          {match.imageUrls && match.imageUrls.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-zinc-100 -mx-6 sm:mx-[-3rem]">
              <h3 className="px-6 sm:px-12 text-xs font-black text-zinc-400 uppercase flex items-center gap-2 mb-4"><ImageIcon size={16} /> 갤러리</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                {match.imageUrls.map((url, idx) => (
                  <div key={idx} onClick={() => setSelectedZoomImage(url)} className="aspect-video bg-zinc-100 relative cursor-pointer active:opacity-80 overflow-hidden group">
                    {!imageErrors[idx] ? (
                      <img src={getSecureProxyUrl(url)} alt={`Highlight ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={() => setImageErrors(prev => ({...prev, [idx]: true}))} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><AlertCircle size={32} /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-8 border-t border-zinc-100 bg-zinc-50 text-center">
          <Logo variant="dark" className="w-8 h-8 opacity-20 grayscale mx-auto mb-2" />
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Official Record of Mapo Senior Elite Squad</p>
        </div>
      </div>

      {selectedZoomImage && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedZoomImage(null)}>
          <button className="absolute top-6 right-6 text-white/60"><X size={32} /></button>
          <img src={getSecureProxyUrl(selectedZoomImage)} className="max-w-full max-h-[90vh] object-contain rounded-xl" />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl text-center space-y-4">
            <Trash2 size={40} className="mx-auto text-red-600" />
            <h3 className="text-2xl font-black">리포트 삭제</h3>
            <p className="text-zinc-500 text-sm">정말로 삭제하시겠습니까?</p>
            <div className="flex gap-3 pt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-zinc-100 rounded-2xl font-black">취소</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black">{isDeleting ? <Loader2 className="animate-spin inline" /> : '삭제'}</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${showToast.type === 'success' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
            {showToast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} />}
            <span className="font-black text-sm">{showToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchReport;