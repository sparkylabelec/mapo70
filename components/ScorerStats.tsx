
import React, { useEffect, useState, useMemo } from 'react';
import { MatchResult } from '../types';
import { fetchMatchResults } from '../services/matchService';
import { 
  ArrowLeft, Star, Target, TrendingUp, Calendar, MapPin, 
  ChevronRight, Loader2, Footprints, Users, Activity, Medal
} from 'lucide-react';

interface ScorerStatsProps {
  name: string;
  onBack: () => void;
  onViewMatch: (id: string) => void;
  onViewScorer: (name: string) => void;
}

const SoccerBallIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m12 12-4-2.5" />
    <path d="m12 12 4-2.5" />
    <path d="M12 12v5" />
    <path d="m8 9.5-3.5-.5" />
    <path d="m16 9.5 3.5-.5" />
    <path d="M12 17H7.5" />
    <path d="M12 17h4.5" />
    <path d="m5.5 14-.5-4.5" />
    <path d="m18.5 14 .5-4.5" />
    <path d="m7.5 17-2-3" />
    <path d="m16.5 17 2-3" />
  </svg>
);

const ScorerStats: React.FC<ScorerStatsProps> = ({ name, onBack, onViewMatch, onViewScorer }) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMatchResults();
        setMatches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [name]);

  const stats = useMemo(() => {
    const playerMatchParticipation = matches.filter(m => 
      m.scorers.some(s => s.name === name) || (m.assists?.some(a => a.name === name))
    );

    const totalGoals = matches.reduce((acc, m) => {
      const playerScorer = m.scorers.find(s => s.name === name);
      return acc + (playerScorer?.goals || 0);
    }, 0);

    const totalAssists = matches.reduce((acc, m) => {
      const playerAssistant = m.assists?.find(a => a.name === name);
      return acc + (playerAssistant?.assists || 0);
    }, 0);

    const matchCount = playerMatchParticipation.length;

    const scorerMap: Record<string, number> = {};
    matches.forEach(m => {
      m.scorers.forEach(s => {
        scorerMap[s.name] = (scorerMap[s.name] || 0) + s.goals;
      });
    });

    const topScorers = Object.entries(scorerMap)
      .map(([playerName, goals]) => ({ name: playerName, goals }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5);

    return {
      playerMatchParticipation,
      totalGoals,
      totalAssists,
      matchCount,
      topScorers
    };
  }, [matches, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
        <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-widest text-xs">선수 데이터를 분석 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
          <ArrowLeft size={20} /> 목록으로 돌아가기
        </button>
      </div>

      <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl rounded-[2rem] border-4 border-white/10 flex items-center justify-center shadow-inner">
            <Star className="text-emerald-400 w-12 h-12 md:w-16 md:h-16" fill="currentColor" />
          </div>
          <div className="text-center md:text-left">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-2 block">마포 정예 상비군</span>
            <h2 className="text-4xl md:text-6xl font-black mb-2 uppercase tracking-tighter">{name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-sm">
                <Target size={18} className="text-emerald-400" />
                <span className="text-sm font-bold uppercase">총 득점: <span className="text-emerald-400 ml-1">{stats.totalGoals}</span></span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-sm">
                <Star size={18} className="text-amber-400" />
                <span className="text-sm font-bold uppercase">총 도움: <span className="text-amber-400 ml-1">{stats.totalAssists}</span></span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-sm">
                <Activity size={18} className="text-blue-400" />
                <span className="text-sm font-bold uppercase">기록 경기: <span className="text-blue-400 ml-1">{stats.matchCount}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">총 포인트 (G+A)</p>
          <p className="text-3xl font-black text-zinc-900">{stats.totalGoals + stats.totalAssists}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">기록 기여율</p>
          <p className="text-3xl font-black text-zinc-900">{stats.matchCount > 0 ? ((stats.totalGoals + stats.totalAssists) / stats.matchCount).toFixed(1) : '0.0'}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">영향력 수준</p>
          <p className="text-3xl font-black text-emerald-600 uppercase tracking-tighter">{(stats.totalGoals + stats.totalAssists) > 10 ? '엘리트' : '레전드'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-3 uppercase tracking-tight">
          <Footprints className="text-emerald-600" /> 기록 상세
        </h3>
        
        <div className="space-y-4">
          {stats.playerMatchParticipation.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-zinc-100 text-center">
              <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">기록된 경기 데이터가 없습니다</p>
            </div>
          ) : (
            stats.playerMatchParticipation.map((m) => {
              const playerScorer = m.scorers.find(s => s.name === name);
              const playerAssistant = m.assists?.find(a => a.name === name);
              return (
                <div key={m.id} onClick={() => onViewMatch(m.id!)} className="group bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-900 font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                        G {playerScorer?.goals || 0}
                      </div>
                      <div className="w-16 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-900 font-black text-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        A {playerAssistant?.assists || 0}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1"><Calendar size={12} /> {m.date}</span>
                      </div>
                      <h4 className="text-xl font-black text-zinc-900 flex items-center gap-3">
                        <span className="tracking-tighter">마포 상비군</span> <span className="text-zinc-300 font-light">vs</span> {m.opponent}
                      </h4>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-zinc-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ScorerStats;
