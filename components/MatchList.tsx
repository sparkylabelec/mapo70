
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trophy, Frown, MapPin, Calendar, Loader2, Footprints, 
  Trash2, CheckSquare, Square, AlertCircle, X, ExternalLink,
  Activity, Target, Star, TrendingUp, Minus, LayoutGrid, List,
  Search, Filter, User, Users
} from 'lucide-react';
import { MatchResult, Scorer } from '../types';
import { fetchMatchResults, deleteMatchResult, deleteMultipleMatchResults } from '../services/matchService';

interface MatchListProps {
  isAuthenticated?: boolean;
  onViewReport: (id: string) => void;
}

type DeleteType = 'individual' | 'bulk';
type ViewMode = 'card' | 'list';
type SearchType = 'opponent' | 'scorer';

interface PendingDelete {
  type: DeleteType;
  id?: string;
}

const MatchList: React.FC<MatchListProps> = ({ isAuthenticated, onViewReport }) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('opponent');
  
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMatchResults();
      setMatches(data);
    } catch (err) {
      console.error(err);
      setErrorMessage('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtering Logic
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    
    const query = searchQuery.toLowerCase().trim();
    const regex = new RegExp(query, 'i');

    return matches.filter(m => {
      if (searchType === 'opponent') {
        return regex.test(m.opponent);
      } else {
        return m.scorers.some(s => regex.test(s.name));
      }
    });
  }, [matches, searchQuery, searchType]);

  const stats = useMemo(() => {
    if (filteredMatches.length === 0) return null;

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let totalGoals = 0;
    const scorerMap: Record<string, number> = {};

    filteredMatches.forEach(m => {
      if (m.ourScore > m.opponentScore) wins++;
      else if (m.ourScore === m.opponentScore) draws++;
      else losses++;

      totalGoals += m.ourScore;

      m.scorers.forEach(s => {
        scorerMap[s.name] = (scorerMap[s.name] || 0) + s.goals;
      });
    });

    const topScorerEntry = Object.entries(scorerMap).sort((a, b) => b[1] - a[1])[0];
    const topScorer = topScorerEntry ? { name: topScorerEntry[0], goals: topScorerEntry[1] } : null;
    const winRate = ((wins / filteredMatches.length) * 100).toFixed(1);

    return { wins, draws, losses, totalGoals, topScorer, winRate, totalMatches: filteredMatches.length };
  }, [filteredMatches]);

  const openDeleteModal = (e: React.MouseEvent, type: DeleteType, id?: string) => {
    e.stopPropagation();
    setPendingDelete({ type, id });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      if (pendingDelete.type === 'individual' && pendingDelete.id) {
        await deleteMatchResult(pendingDelete.id);
        setMatches(prev => prev.filter(m => m.id !== pendingDelete.id));
      } else if (pendingDelete.type === 'bulk') {
        const ids = Array.from(selectedIds) as string[];
        await deleteMultipleMatchResults(ids);
        setMatches(prev => prev.filter(m => !selectedIds.has(m.id!)));
        setSelectedIds(new Set());
      }
      setPendingDelete(null);
    } catch (err) {
      setErrorMessage('삭제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
        <p className="text-zinc-500 font-medium font-bold">전술 데이터를 분석 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        {/* Statistics Dashboard - Now at the Top */}
        {stats && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Record (W-D-L)</p>
                <p className="text-xl font-black text-zinc-900">
                  {stats.wins} <span className="text-zinc-300 font-normal">/</span> {stats.draws} <span className="text-zinc-300 font-normal">/</span> {stats.losses}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Target size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total Goals</p>
                <p className="text-xl font-black text-zinc-900">{stats.totalGoals} <span className="text-sm font-bold text-zinc-400">Goals</span></p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Star size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Top Scorer</p>
                <p className="text-xl font-black text-zinc-900 truncate max-w-[120px]">
                  {stats.topScorer ? stats.topScorer.name : 'N/A'} 
                  {stats.topScorer && <span className="text-sm font-bold text-zinc-400 ml-1">({stats.topScorer.goals})</span>}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Win Rate</p>
                <p className="text-xl font-black text-zinc-900">{stats.winRate}%</p>
              </div>
            </div>
          </section>
        )}

        {/* Search Bar UI - Now below the Stats */}
        <section className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex bg-zinc-100 p-1 rounded-2xl w-full md:w-auto">
              <button 
                onClick={() => setSearchType('opponent')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${searchType === 'opponent' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <Users size={16} /> 상대팀
              </button>
              <button 
                onClick={() => setSearchType('scorer')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${searchType === 'scorer' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <User size={16} /> 득점자
              </button>
            </div>

            <div className="relative flex-1 group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder={searchType === 'opponent' ? "상대팀 이름으로 검색..." : "득점자 이름으로 검색..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-3.5 bg-zinc-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-bold text-zinc-800 transition-all placeholder:text-zinc-300"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-200 text-zinc-500 rounded-full hover:bg-zinc-300 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)}><X size={18} /></button>
          </div>
        )}

        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={() => {
                  if (selectedIds.size === filteredMatches.length) setSelectedIds(new Set());
                  else setSelectedIds(new Set(filteredMatches.map(m => m.id!)));
                }}
                className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-emerald-600 transition-colors px-2"
              >
                {selectedIds.size === filteredMatches.length && filteredMatches.length > 0 ? <CheckSquare size={18} className="text-emerald-600" /> : <Square size={18} />}
                결과 전체 선택 <span className="hidden sm:inline">({selectedIds.size}/{filteredMatches.length})</span>
              </button>
            )}
            
            <div className="bg-zinc-100 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <LayoutGrid size={14} /> 카드형
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <List size={14} /> 리스트형
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && isAuthenticated && (
              <button
                onClick={(e) => openDeleteModal(e, 'bulk')}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95 shadow-md shadow-red-200"
              >
                <Trash2 size={14} /> 선택 항목 일괄 삭제
              </button>
            )}
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-200 animate-in zoom-in-95">
            <Activity className="mx-auto text-zinc-200 mb-4" size={48} />
            <p className="text-zinc-500 font-black uppercase tracking-widest text-sm mb-4">
              {searchQuery ? "검색 결과가 없습니다" : "저장된 경기 기록이 없습니다"}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-colors uppercase tracking-widest"
              >
                검색 초기화
              </button>
            )}
          </div>
        ) : (
          viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => {
                const isWin = match.ourScore > match.opponentScore;
                const isDraw = match.ourScore === match.opponentScore;
                const isSelected = selectedIds.has(match.id!);
                
                return (
                  <div 
                    key={match.id} 
                    onClick={() => onViewReport(match.id!)}
                    className={`group relative bg-white rounded-[2rem] shadow-sm border transition-all flex flex-col cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-2 ${isSelected ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-zinc-100 hover:shadow-xl hover:-translate-y-1'}`}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                    
                    <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg">
                      <ExternalLink size={18} className="text-emerald-600" />
                    </div>

                    {isAuthenticated && (
                      <div className="absolute top-6 left-6 z-30 flex gap-2">
                        <button
                          onClick={(e) => toggleSelect(e, match.id!)}
                          className={`p-1.5 rounded-xl shadow-md border transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-zinc-200 text-zinc-300'}`}
                        >
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <button
                          onClick={(e) => openDeleteModal(e, 'individual', match.id)}
                          className="p-1.5 bg-white rounded-xl shadow-md border border-zinc-200 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}

                    <div className={`h-2.5 ${isWin ? 'bg-emerald-500' : isDraw ? 'bg-zinc-400' : 'bg-red-500'}`} />
                    
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-black uppercase tracking-widest">
                          <Calendar size={14} /> {match.date}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                          isWin ? 'bg-emerald-100 text-emerald-700' : 
                          isDraw ? 'bg-zinc-100 text-zinc-600' : 'bg-red-100 text-red-700'
                        }`}>
                          {isWin ? 'Victorious' : isDraw ? 'Draw' : 'Defeated'}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-8 px-2">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[10px] font-black text-zinc-300 mb-1 uppercase tracking-widest">Home</span>
                          <span className="text-sm font-black text-zinc-900 text-center leading-tight">마포70대<br/>상비군</span>
                        </div>
                        <div className="text-4xl font-black text-zinc-900 mx-4 flex items-center gap-3">
                          {match.ourScore}
                          <span className="text-zinc-200 text-2xl font-light">:</span>
                          {match.opponentScore}
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[10px] font-black text-zinc-300 mb-1 uppercase tracking-widest">Away</span>
                          <span className="text-sm font-black text-zinc-900 truncate max-w-[80px]">{match.opponent}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-2xl text-zinc-500 text-[11px] font-bold">
                        <MapPin size={14} className="text-zinc-400" />
                        <span className="truncate">{match.stadium}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table: Visible on md and up */}
              <div className="hidden md:block bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        {isAuthenticated && <th className="p-4 w-12"></th>}
                        <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                        <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Match</th>
                        <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Score</th>
                        <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Venue</th>
                        <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Result</th>
                        <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatches.map((match) => {
                        const isWin = match.ourScore > match.opponentScore;
                        const isDraw = match.ourScore === match.opponentScore;
                        const isSelected = selectedIds.has(match.id!);
                        
                        return (
                          <tr 
                            key={match.id}
                            onClick={() => onViewReport(match.id!)}
                            className={`border-b border-zinc-50 hover:bg-emerald-50/30 transition-colors cursor-pointer group ${isSelected ? 'bg-emerald-50/50' : ''}`}
                          >
                            {isAuthenticated && (
                              <td className="p-4" onClick={(e) => toggleSelect(e, match.id!)}>
                                <div className={`p-1.5 rounded-lg border transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-zinc-200 text-zinc-200'}`}>
                                  {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                </div>
                              </td>
                            )}
                            <td className="p-4 text-sm font-bold text-zinc-500 font-mono">{match.date}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-zinc-900">상비군</span>
                                <span className="text-zinc-300 text-xs font-bold">VS</span>
                                <span className="text-sm font-black text-zinc-900">{match.opponent}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center items-center gap-2">
                                <span className="text-lg font-black text-zinc-900">{match.ourScore}</span>
                                <span className="text-zinc-200">-</span>
                                <span className="text-lg font-black text-zinc-900">{match.opponentScore}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                                <MapPin size={12} className="text-zinc-300" />
                                <span className="truncate max-w-[150px]">{match.stadium}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-black shadow-sm ${
                                isWin ? 'bg-emerald-500 text-white' : 
                                isDraw ? 'bg-zinc-400 text-white' : 'bg-red-500 text-white'
                              }`}>
                                {isWin ? 'W' : isDraw ? 'D' : 'L'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button className="p-2 text-zinc-300 group-hover:text-emerald-600 transition-colors">
                                <ExternalLink size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile List: Visible only on mobile */}
              <div className="md:hidden space-y-3">
                <div className="px-4 py-2 flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                  <div className="w-16">DATE</div>
                  <div className="flex-1 text-center">MATCH</div>
                  <div className="w-12 text-center">SCORE</div>
                  <div className="w-16 text-center">VENUE</div>
                  <div className="w-8 text-right">RESULT</div>
                </div>
                {filteredMatches.map((match) => {
                  const isWin = match.ourScore > match.opponentScore;
                  const isDraw = match.ourScore === match.opponentScore;
                  const isSelected = selectedIds.has(match.id!);
                  
                  return (
                    <div 
                      key={match.id}
                      onClick={() => onViewReport(match.id!)}
                      className={`bg-white px-4 py-4 rounded-2xl shadow-sm border flex items-center gap-3 transition-all active:scale-[0.98] ${isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-zinc-100'}`}
                    >
                      <div className="w-16 flex flex-col items-start">
                        <span className="text-[10px] font-bold text-zinc-400 font-mono leading-tight">{match.date.split('-')[0]}</span>
                        <span className="text-xs font-black text-zinc-500 font-mono">{match.date.split('-').slice(1).join('-')}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                        <span className="text-xs font-black text-zinc-900 leading-none">상비군</span>
                        <span className="text-[8px] font-black text-zinc-300 uppercase leading-none">VS</span>
                        <span className="text-xs font-black text-zinc-900 leading-none truncate max-w-[80px]">{match.opponent}</span>
                      </div>
                      <div className="w-12 text-center">
                        <span className="text-sm font-black text-zinc-900">{match.ourScore}</span>
                        <span className="text-zinc-200 mx-0.5">-</span>
                        <span className="text-sm font-black text-zinc-900">{match.opponentScore}</span>
                      </div>
                      <div className="w-16 flex flex-col items-center gap-1 opacity-60">
                        <MapPin size={10} className="text-zinc-400" />
                        <span className="text-[9px] font-bold text-zinc-500 truncate w-full text-center">@{match.stadium}</span>
                      </div>
                      <div className="w-8 flex justify-end">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-black shadow-sm ${
                          isWin ? 'bg-emerald-500 text-white' : 
                          isDraw ? 'bg-zinc-400 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {isWin ? 'W' : isDraw ? 'D' : 'L'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setPendingDelete(null)} />
          <div className="relative bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 border border-zinc-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-2">
                <Trash2 size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-zinc-900">영구 삭제</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  {pendingDelete.type === 'bulk' 
                    ? `선택된 ${selectedIds.size}개의 경기 기록이 모두 삭제됩니다.` 
                    : '이 경기 기록이 영구적으로 삭제됩니다.'}
                  <br />삭제된 데이터는 복구할 수 없습니다.
                </p>
              </div>
              <div className="flex w-full gap-3 pt-6">
                <button 
                  onClick={() => setPendingDelete(null)} 
                  className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-black transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleConfirmDelete} 
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg shadow-red-200 flex justify-center items-center gap-2 transition-all active:scale-95"
                >
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchList;
