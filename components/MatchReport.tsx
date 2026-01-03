import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MatchResult } from '../types';
import { deleteMatchResult } from '../services/matchService';
import Logo from './Logo';
import { 
  ArrowLeft, Download, Share2, MapPin, Calendar, Trophy, 
  Users, Footprints, Loader2, Link as LinkIcon,
  CheckCircle2, Printer, Activity, FileDown, AlertCircle, Shield,
  Edit2, Trash2, Image as ImageIcon
} from 'lucide-react';

declare var html2pdf: any;

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
  const reportRef = useRef<HTMLDivElement>(null);

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
        console.error(err);
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

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !match) return;
    if (typeof html2pdf === 'undefined') {
      showToastMessage('PDF 라이브러리를 불러오지 못했습니다.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const element = reportRef.current;
      const options = {
        margin: 10,
        filename: `MAPO_SENIOR_${match.date}_vs_${match.opponent}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(options).from(element).save();
      showToastMessage('PDF 리포트가 저장되었습니다.', 'success');
    } catch (error) {
      console.error('PDF Error:', error);
      showToastMessage('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
        <p className="text-zinc-500 font-bold animate-pulse">리포트 데이터를 분석 중...</p>
      </div>
    );
  }

  if (!match) return <div className="text-center py-20 text-zinc-400">데이터를 찾을 수 없습니다.</div>;

  const isWin = match.ourScore > match.opponentScore;
  const isDraw = match.ourScore === match.opponentScore;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:max-w-none print:m-0">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-2 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
          <ArrowLeft size={20} /> 리스트로 돌아가기
        </button>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <button 
                onClick={() => onEdit(match)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-700 hover:text-emerald-600 transition-all shadow-sm"
              >
                <Edit2 size={18} /> 수정
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                <Trash2 size={18} /> 삭제
              </button>
            </>
          )}
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <LinkIcon size={18} /> 링크 복사
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
              isGenerating ? 'bg-zinc-400 cursor-not-allowed text-white' : 'bg-zinc-900 hover:bg-black text-white'
            }`}
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            {isGenerating ? 'PDF 생성 중...' : 'PDF 저장'}
          </button>
        </div>
      </div>

      {/* Main Magazine Card */}
      <div 
        ref={reportRef}
        className="pdf-content bg-white rounded-[2rem] shadow-2xl border border-zinc-100 overflow-hidden print:shadow-none print:border-none print:rounded-none"
      >
        
        {/* Header Visual */}
        <div className={`relative h-64 sm:h-80 overflow-hidden flex items-center justify-center ${
          isWin ? 'bg-emerald-600' : isDraw ? 'bg-zinc-700' : 'bg-red-700'
        }`}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 border border-white/30">
              Official Match Report
            </span>
            <div className="flex items-center gap-4 sm:gap-12">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full border-4 border-white/20 flex items-center justify-center mb-4 shadow-xl">
                  <Logo className="w-full h-full p-2" />
                </div>
                <h2 className="text-white text-lg sm:text-2xl font-black tracking-tight">마포70대 상비군</h2>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="text-6xl sm:text-8xl font-black text-white drop-shadow-2xl">
                  {match.ourScore} <span className="text-white/40 text-4xl sm:text-6xl mx-2">:</span> {match.opponentScore}
                </div>
                <div className={`px-4 py-1 rounded font-black text-xs uppercase tracking-tighter shadow-lg ${
                  isWin ? 'bg-white text-emerald-600' : isDraw ? 'bg-white text-zinc-700' : 'bg-white text-red-600'
                }`}>
                  {isWin ? 'Victorious' : isDraw ? 'Stalemate' : 'Defeated'}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-xl rounded-full border-4 border-white/20 flex items-center justify-center mb-4">
                  <Users className="text-white/60 w-10 h-10 sm:w-14 sm:h-14" />
                </div>
                <h2 className="text-white text-lg sm:text-2xl font-black truncate max-w-[120px]">{match.opponent.toUpperCase()}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-12">
          {/* Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-zinc-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400"><Calendar size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Match Date</p>
                <p className="font-bold text-zinc-800">{match.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400"><MapPin size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Stadium</p>
                <p className="font-bold text-zinc-800">{match.stadium}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 col-span-2 md:col-span-1">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400"><Users size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase">Opponent</p>
                <p className="font-bold text-zinc-800">{match.opponent}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {match.imageUrls && match.imageUrls.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                    <Activity className="text-zinc-400" size={18} /> Match Highlights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {match.imageUrls.map((url, idx) => (
                      <div key={idx} className={`w-full overflow-hidden rounded-3xl border border-zinc-100 shadow-lg bg-zinc-50 flex items-center justify-center min-h-[200px] ${
                        idx === 0 && match.imageUrls!.length > 1 ? 'sm:col-span-2 aspect-video' : 'aspect-square'
                      }`}>
                        <img 
                          src={url} 
                          alt={`match highlight ${idx + 1}`} 
                          className="w-full h-full object-cover block"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl -mr-16 -mt-16" />
                <h4 className="text-xl font-black mb-8 flex items-center gap-2">
                  <Footprints className="text-emerald-400" /> GOALSCORERS
                </h4>
                <div className="space-y-6">
                  {match.scorers && match.scorers.length > 0 ? (
                    match.scorers.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <button 
                            type="button"
                            onClick={() => onViewScorerStats(s.name)}
                            className="font-bold text-lg hover:text-emerald-400 underline-offset-4 transition-all print:no-underline"
                          >
                            {s.name}
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(s.goals)].map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                          ))}
                          <span className="ml-2 font-black text-emerald-400">{s.goals} G</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-sm font-medium italic text-center py-4">No goals recorded</p>
                  )}
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                  <p className="text-[10px] font-black text-white/30 tracking-[0.2em]">MAPO SENIOR ELITE ANALYTICS</p>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-emerald-600" size={20} />
                  <span className="font-black text-emerald-800 text-sm">TEAM PERFORMANCE</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-[11px] text-emerald-600 mt-3 font-bold">
                  마포70대 상비군만의 조직력과 노련한 경기 운영이 빛났습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-12 px-6 sm:px-12 border-t-2 border-zinc-100 bg-white">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12" />
            <div>
              <p className="text-xs font-black text-zinc-900">THE OFFICIAL MAGAZINE</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mapo Senior Elite Publishing</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Issue #2024 - Vol. 01</p>
             <p className="text-[10px] font-bold text-zinc-400">© Mapo Senior Football Association.</p>
          </div>
        </div>
      </div>

      {showToast && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          showToast.type === 'success' ? 'bg-zinc-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {showToast.type === 'success' ? (
            <CheckCircle2 className="text-emerald-400" size={20} />
          ) : (
            <AlertCircle className="text-white" size={20} />
          )}
          <span className="font-bold text-sm">{showToast.message}</span>
        </div>
      )}
    </div>
  );
};

export default MatchReport;