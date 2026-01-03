
import React, { useEffect, useState, useMemo } from 'react';
import { MatchResult } from '../types';
import { fetchMatchResults } from '../services/matchService';
import { 
  ArrowLeft, Star, Target, TrendingUp, Calendar, MapPin, 
  ChevronRight, Loader2, Footprints, Users, Activity
} from 'lucide-react';

interface ScorerStatsProps {
  name: string;
  onBack: () => void;
  onViewMatch: (id: string) => void;
}

const ScorerStats: React.FC<ScorerStatsProps> = ({ name, onBack, onViewMatch }) => {
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
  }, []);

  const stats = useMemo(() => {
    const playerMatches = matches.filter(m => 
      m.scorers.some(s => s.name === name)
    );

    const totalGoals = playerMatches.reduce((acc, m) => {
      const playerScorer = m.scorers.find(s => s.name === name);
      return acc + (playerScorer?.goals || 0);
    }, 0);

    const averageGoals = playerMatches.length > 0 
      ? (totalGoals / playerMatches.length).toFixed(2) 
      : '0.00';

    return {
      playerMatches,
      totalGoals,
      averageGoals,
      matchCount: playerMatches.length
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
      <div className="flex items-center justify-between mb-4">
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
                <span className="text-sm font-bold uppercase">득점: <span className="text-emerald-400 ml-1">{stats.totalGoals}</span></span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-sm">
                <Activity size={18} className="text-blue-400" />
                <span className="text-sm font-bold uppercase">출전: <span className="text-blue-400 ml-1">{stats.matchCount}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">경기당 득점</p>
          <p className="text-3xl font-black text-zinc-900">{stats.averageGoals}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">참여 기록</p>
          <p className="text-3xl font-black text-zinc-900">{stats.matchCount} <span className="text-sm font-bold text-zinc-400">경기</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">영향력 수준</p>
          <p className="text-3xl font-black text-emerald-600 uppercase tracking-tighter">{stats.totalGoals > 10 ? '엘리트' : '레전드'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-3 uppercase tracking-tight">
          <Footprints className="text-emerald-600" /> 경기 기록
        </h3>
        
        <div className="space-y-4">
          {stats.playerMatches.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-zinc-100 text-center">
              <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">경기 참여 기록이 없습니다</p>
            </div>
          ) : (
            stats.playerMatches.map((m) => {
              const playerScorer = m.scorers.find(s => s.name === name);
              return (
                <div 
                  key={m.id}
                  onClick={() => onViewMatch(m.id!)}
                  className="group bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 font-black text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                      {playerScorer?.goals}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1">
                          <Calendar size={12} /> {m.date}
                        </span>
                        <span className="text-zinc-200 text-xs">|</span>
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1">
                          <MapPin size={12} /> {m.stadium}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-zinc-900 flex items-center gap-3">
                        <span className="tracking-tighter">마포70대 상비군</span> <span className="text-zinc-300 font-light">vs</span> {m.opponent}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(playerScorer?.goals)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200" />
                      ))}
                    </div>
                    <ChevronRight size={24} className="text-zinc-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-10 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Mapo Senior Elite Player Statistics Bureau</p>
      </div>
    </div>
  );
};

export default ScorerStats;
