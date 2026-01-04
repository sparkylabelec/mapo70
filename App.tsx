import React, { useState, useEffect } from 'react';
import { LayoutGrid, PlusCircle, LogOut, ChevronRight, Home as HomeIcon, Sparkles } from 'lucide-react';
import MatchList from './components/MatchList';
import MatchForm from './components/MatchForm';
import AdminLogin from './components/AdminLogin';
import MatchReport from './components/MatchReport';
import ScorerStats from './components/ScorerStats';
import AIInput from './components/AIInput';
import Home from './components/Home';
import Logo from './components/Logo';
import { ViewType, MatchResult } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedScorerName, setSelectedScorerName] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<MatchResult | null>(null);
  const [aiExtractedData, setAiExtractedData] = useState<Partial<MatchResult> | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    
    try {
      const params = new URLSearchParams(window.location.search);
      const reportId = params.get('reportId');
      const scorerName = params.get('scorer');

      if (reportId) {
        setSelectedMatchId(reportId);
        setView('report');
      } else if (scorerName) {
        setSelectedScorerName(scorerName);
        setView('scorer_stats');
      }
    } catch (e) {
      console.warn("URL 파라미터 읽기 실패:", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
    setView('home');
    safePushState('/');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('list');
  };

  const safePushState = (path: string) => {
    try {
      const currentUrl = new URL(window.location.href);
      const newUrl = new URL(path, currentUrl.origin);
      if (currentUrl.origin === newUrl.origin && !currentUrl.protocol.startsWith('blob')) {
        window.history.pushState({}, '', path);
      }
    } catch (e) {
      console.debug("History API restricted in this environment");
    }
  };

  const handleViewReport = (id: string) => {
    setSelectedMatchId(id);
    setView('report');
    safePushState(`?reportId=${id}`);
  };

  const handleEditMatch = (match: MatchResult) => {
    setEditingMatch(match);
    setAiExtractedData(null);
    setView('input');
  };

  const handleViewScorerStats = (name: string) => {
    setSelectedScorerName(name);
    setView('scorer_stats');
    safePushState(`?scorer=${encodeURIComponent(name)}`);
  };

  const handleGoBack = () => {
    setView('list');
    setSelectedMatchId(null);
    setSelectedScorerName(null);
    setEditingMatch(null);
    setAiExtractedData(null);
    safePushState('/');
  };

  const handleGoHome = () => {
    setView('home');
    setSelectedMatchId(null);
    setSelectedScorerName(null);
    setEditingMatch(null);
    setAiExtractedData(null);
    safePushState('/');
  };

  const handleAiExtracted = (data: Partial<MatchResult>) => {
    setAiExtractedData(data);
    setEditingMatch(null);
    setView('input');
  };

  // 폼 취소 시 동작 (AI 데이터가 있으면 AI 입력창으로, 아니면 목록으로)
  const handleCancelForm = () => {
    if (aiExtractedData) {
      setView('ai_input');
    } else {
      handleGoBack();
    }
  };

  return (
    <div className="min-h-screen pb-20 print:p-0 print:pb-0 bg-[#f8fafc]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleGoHome}>
            <div className="w-10 h-10 group-hover:scale-110 transition-transform">
              <Logo className="w-full h-full" />
            </div>
            <h1 className="text-xl font-black text-zinc-900 hidden sm:block tracking-tighter">마포70대 <span className="text-emerald-600">상비군</span></h1>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setView('home')} className={`px-4 py-2 text-sm font-bold transition-colors ${view === 'home' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}>홈</button>
                <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-bold transition-colors ${view === 'list' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}>기록실</button>
                <div className="w-px h-4 bg-zinc-200 mx-1" />
                <button onClick={() => setView('login')} className="px-4 py-2 text-sm font-black text-zinc-900 hover:text-emerald-600 transition-colors">로그인</button>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                <button onClick={handleGoHome} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'home' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}><HomeIcon size={16} /></button>
                <button onClick={handleGoBack} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}><LayoutGrid size={16} /> 목록</button>
                <button onClick={() => { setAiExtractedData(null); setView('ai_input'); }} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'ai_input' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}><Sparkles size={16} /> AI 입력</button>
                <button onClick={() => { setEditingMatch(null); setAiExtractedData(null); setView('input'); }} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'input' && !editingMatch && !aiExtractedData ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}><PlusCircle size={16} /> 등록</button>
                <div className="w-px h-4 bg-zinc-300 mx-1" />
                <button onClick={handleLogout} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" title="로그아웃"><LogOut size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 print:p-0">
        {view === 'home' ? (
          <Home onStart={() => setView('list')} onAdminLogin={() => setView('login')} />
        ) : view === 'login' ? (
          <AdminLogin onLogin={handleLoginSuccess} />
        ) : view === 'ai_input' ? (
          <AIInput onDataExtracted={handleAiExtracted} onCancel={handleGoBack} />
        ) : view === 'input' ? (
          <MatchForm 
            initialData={editingMatch} 
            aiExtractedData={aiExtractedData}
            onSuccess={() => { setEditingMatch(null); setAiExtractedData(null); setView('list'); }} 
            onCancel={handleCancelForm}
          />
        ) : view === 'report' && selectedMatchId ? (
          <MatchReport 
            id={selectedMatchId} 
            onBack={handleGoBack} 
            onViewScorerStats={handleViewScorerStats} 
            isAuthenticated={isAuthenticated} 
            onEdit={handleEditMatch} 
            onNavigate={handleViewReport}
          />
        ) : view === 'scorer_stats' && selectedScorerName ? (
          <ScorerStats name={selectedScorerName} onBack={handleGoBack} onViewMatch={handleViewReport} />
        ) : (
          <MatchList isAuthenticated={isAuthenticated} onViewReport={handleViewReport} />
        )}
      </main>

      {isAuthenticated && view === 'list' && (
        <button onClick={() => { setEditingMatch(null); setView('input'); }} className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-900 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 sm:hidden print:hidden">
          <PlusCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default App;