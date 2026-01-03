
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MatchResult } from '../types';
import { deleteMatchResult } from '../services/matchService';
import Logo from './Logo';
import { 
  ArrowLeft, MapPin, Calendar, Users, Footprints, Loader2, Link as LinkIcon,
  CheckCircle2, Activity, Image as ImageIcon, AlertCircle, Edit2, Trash2, 
  ChevronRight, Shield, Download, X, Maximize2
} from 'lucide-react';

declare var html2canvas: any;

interface MatchReportProps {
  id: string;
  onBack: () => void;
  onViewScorerStats: (name: string) => void;
  isAuthenticated?: boolean;
  onEdit: (match: MatchResult) => void;
}

const MatchReport: React.FC<MatchReportProps> = ({ id, onBack, onViewScorerStats, isAuthenticated, onEdit }) => {
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // 이미지 프록시 URL 생성 (CORS 해결용)
  const getSecureProxyUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('firebasestorage.googleapis.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(url)}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const docRef = doc(db, 'matches', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as MatchResult;
          setMatch(data);
        }
      } catch (err) {
        console.error("[MatchReport] 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToastMessage('리포트 링크가 복사되었습니다!', 'success');
    }).catch(() => {
      showToastMessage('링크 복사에 실패했습니다.', 'error');
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

  // 이미지를 Base64로 강제 변환하여 캔버스 오염 방지
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
    } catch (e) {
      console.warn("Base64 변환 실패, 원본 사용:", url);
      return url;
    }
  };

  const handleDownloadJPG = async () => {
    if (!reportRef.current || !match) return;
    
    const canvasLib = typeof html2canvas !== 'undefined' ? html2canvas : (window as any).html2canvas;
    if (!canvasLib) {
      showToastMessage('이미지 생성 도구를 불러오는 중입니다...', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const element = reportRef.current;
      const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      
      // 1. 모든 이미지를 미리 Base64로 변환 (CORS 원천 해결)
      const base64Images = await Promise.all(images.map(img => toBase64(img.src)));
      
      // 2. 원래 주소 백업 및 Base64로 교체
      const originalSrcs = images.map(img => img.src);
      images.forEach((img, i) => { img.src = base64Images[i]; });

      // 3. 브라우저가 이미지를 다시 그릴 시간을 충분히 줌
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await canvasLib(element, {
        useCORS: true, 
        allowTaint: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // 4. 이미지 주소 복구
      images.forEach((img, i) => { img.src = originalSrcs[i]; });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `MATCH_REPORT_${match.date}_vs_${match.opponent}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToastMessage('JPG 리포트가 저장되었습니다.', 'success');
    } catch (error) {
      console.error('[JPG Error]', error);
      showToastMessage('JPG 생성 실패. 화면 캡처 기능을 권장합니다.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
        <p className="text-zinc-500 font-bold animate-pulse">데이터 로딩 중...</p>
      </div>
    );
  }

  if (!match) return <div className="text-center py-20 text-zinc-400">데이터를 찾을 수 없습니다.</div>;

  const isWin = match.ourScore > match.opponentScore;
  const isDraw = match.ourScore === match.opponentScore;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:max-w-none print:m-0 pb-12">
      <div className="flex items-center justify-between mb-2 print:hidden px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
          <ArrowLeft size={20} /> 리스트로 돌아가기
        </button>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <button onClick={() => onEdit(match)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-700 hover:text-emerald-600 transition-all shadow-sm">
                <Edit2 size={18} /> 수정
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all shadow-sm">
                <Trash2 size={18} /> 삭제
              </button>
            </>
          )}
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm">
            <LinkIcon size={18} /> 링크 복사
          </button>
          <button 
            onClick={handleDownloadJPG} 
            disabled={isGenerating} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
              isGenerating ? 'bg-zinc-400 cursor-not-allowed text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} JPG 저장
          </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden print:shadow-none print:border-none mx-1 sm:mx-0">
        {/* Header Section */}
        <div className="bg-emerald-600 p-8 sm:p-12 text-white relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <Logo variant="light" className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase text-white leading-none">Match Report</h1>
                <p className="text-emerald-100 font-bold mt-1">마포70대 상비군 공식 기록</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <Calendar size={18} />
                <span className="font-black text-xl text-white">{match.date}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
        </div>

        {/* Score Section */}
        <div className="p-8 sm:p-12 border-b border-zinc-100 bg-white text-zinc-900">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-4 w-1/3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                <Shield size={32} className="sm:w-10 sm:h-10" />
              </div>
              <span className="text-lg sm:text-xl font-black text-center leading-tight">마포70대<br/>상비군</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4 sm:gap-8">
                <span className="text-5xl sm:text-8xl font-black tabular-nums leading-none">{match.ourScore}</span>
                <span className="text-3xl sm:text-4xl font-light text-zinc-200">:</span>
                <span className="text-5xl sm:text-8xl font-black tabular-nums leading-none">{match.opponentScore}</span>
              </div>
              <div className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-sm ${
                isWin ? 'bg-emerald-500 text-white' : isDraw ? 'bg-zinc-400 text-white' : 'bg-red-500 text-white'
              }`}>
                {isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 w-1/3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-400 shadow-inner">
                <Users size={32} className="sm:w-10 sm:h-10" />
              </div>
              <span className="text-lg sm:text-xl font-black text-center leading-tight truncate w-full">{match.opponent}</span>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="p-6 sm:p-12 space-y-8 bg-white text-zinc-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Activity size={16} className="text-emerald-500" /> Match Venue
              </h3>
              <div className="flex items-center gap-4 bg-zinc-50 p-5 rounded-3xl border border-zinc-100 shadow-sm">
                <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600"><MapPin size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Stadium</p>
                  <p className="font-black text-lg sm:text-xl leading-tight">{match.stadium}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Shield size={16} className="text-emerald-500" /> Team Performance
              </h3>
              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-tight">Efficiency</span>
                  <span className="text-xl font-black text-emerald-600">85%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Footprints size={16} className="text-emerald-500" /> Goal Scorers
            </h3>
            {match.scorers && match.scorers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {match.scorers.map((scorer, idx) => (
                  <button key={idx} onClick={() => onViewScorerStats(scorer.name)} className="flex items-center justify-between p-4 bg-zinc-50 hover:bg-emerald-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">{scorer.goals}</div>
                      <span className="font-black text-base">{scorer.name}</span>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300 group-hover:text-emerald-600 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No goals recorded</p>
              </div>
            )}
          </div>

          {/* Gallery Section - 사진 크기 극대화 (간격 및 여백 최소화) */}
          <div className="space-y-4 pt-8 border-t border-zinc-100 -mx-6 sm:mx-[-3rem]">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4 px-6 sm:px-12">
              <ImageIcon size={16} className="text-emerald-500" /> Match Gallery
            </h3>
            {match.imageUrls && match.imageUrls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                {match.imageUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedZoomImage(url)}
                    className="aspect-video overflow-hidden bg-zinc-100 group relative cursor-pointer active:opacity-80 transition-all"
                  >
                    {!imageErrors[idx] ? (
                      <>
                        <img 
                          src={getSecureProxyUrl(url)} 
                          alt={`Match Highlight ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={() => handleImageError(idx)}
                          loading="eager"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white drop-shadow-lg" size={48} />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
                        <AlertCircle size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Image Load Error</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mx-6 sm:mx-12 py-16 rounded-[2rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-200 gap-4 bg-zinc-50 shadow-inner">
                <ImageIcon size={48} className="opacity-10" />
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">No match photos available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-8 border-t border-zinc-100 bg-zinc-50 text-center">
          <div className="flex flex-col items-center gap-2">
            <Logo variant="dark" className="w-8 h-8 opacity-20 grayscale" />
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-1">Official Record of Mapo Senior Elite Squad</p>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal (Lightbox) */}
      {selectedZoomImage && (
        <div 
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedZoomImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-4 text-white/60 hover:text-white transition-colors bg-white/10 rounded-full"
            onClick={() => setSelectedZoomImage(null)}
          >
            <X size={32} />
          </button>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getSecureProxyUrl(selectedZoomImage)} 
              alt="Zoomed Highlight" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 border border-zinc-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-2 shadow-inner">
                <Trash2 size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-zinc-900">리포트 삭제</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">이 경기 리포트를 영구적으로 삭제하시겠습니까?</p>
              </div>
              <div className="flex w-full gap-3 pt-6">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-black transition-colors">취소</button>
                <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg shadow-red-200 flex justify-center items-center gap-2 transition-all active:scale-95">
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />} 삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            showToast.type === 'success' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-red-600 border-red-500 text-white'
          }`}>
            {showToast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} />}
            <span className="font-black text-sm">{showToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchReport;
