
import React from 'react';
import { 
  ArrowRight, Activity, Star, ChevronRight, MapPin 
} from 'lucide-react';
import Logo from './Logo';

interface HomeProps {
  onStart: () => void;
  onAdminLogin: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart, onAdminLogin }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section: 강화된 축구장 패턴 디자인 */}
      <section className="relative rounded-[3rem] overflow-hidden mb-12 shadow-2xl min-h-[550px] sm:min-h-[650px] flex flex-col items-center justify-center">
        {/* 베이스 배경색: 깊고 진한 필드 그린 */}
        <div className="absolute inset-0 bg-[#053e2f] z-0" />
        
        {/* 선명한 잔디 패턴 (격자형) */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0,0,0,0.2) 50%, transparent 50%),
              linear-gradient(rgba(0,0,0,0.1) 50%, transparent 50%)
            `,
            backgroundSize: '15% 100%, 100% 15%'
          }}
        />

        {/* 경기장 라인 디자인 (가시성 강화) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 외곽 사이드라인 */}
          <div className="absolute inset-8 border-[2px] border-white/15 rounded-[2rem]" />

          {/* 중앙선 (더 진하게) */}
          <div className="absolute left-1/2 top-8 bottom-8 w-[2px] bg-white/25 -translate-x-1/2" />
          
          {/* 센터 서클 (더 선명하게) */}
          <div className="absolute left-1/2 top-1/2 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] border-[2px] border-white/25 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_30px_rgba(255,255,255,0.05)]" />
          <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          {/* 좌측 골대 에어리어 (페널티 박스) */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[120px] h-[260px] sm:w-[180px] sm:h-[360px] border-[2px] border-white/20 border-l-0 rounded-r-xl bg-white/5" />
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[50px] h-[120px] sm:w-[70px] sm:h-[160px] border-[2px] border-white/20 border-l-0 rounded-r-lg" />
          
          {/* 우측 골대 에어리어 (페널티 박스) */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[120px] h-[260px] sm:w-[180px] sm:h-[360px] border-[2px] border-white/20 border-r-0 rounded-l-xl bg-white/5" />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[50px] h-[120px] sm:w-[70px] sm:h-[160px] border-[2px] border-white/20 border-r-0 rounded-l-lg" />

          {/* 코너킥 아크 */}
          <div className="absolute top-8 left-8 w-12 h-12 border-b-[2px] border-r-[2px] border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-8 right-8 w-12 h-12 border-b-[2px] border-l-[2px] border-white/20 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-t-[2px] border-r-[2px] border-white/20 rounded-full -translate-x-1/2 translate-y-1/2" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-t-[2px] border-l-[2px] border-white/20 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        
        {/* 배경 글로우 효과 (포인트) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 px-6 py-12 sm:py-16 flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* 중앙 로고 영역 */}
          <div className="mb-8 sm:mb-10 relative flex items-center justify-center">
            {/* 동심원 장식 */}
            <div className="absolute w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] border border-white/10 rounded-full pointer-events-none animate-pulse" />
            
            {/* 로고 박스 */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white rounded-full flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-[8px] border-white/30 relative z-10 overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 via-white to-emerald-50 opacity-100" />
               <Logo className="w-[70%] h-[70%] relative z-10 drop-shadow-2xl" />
            </div>
          </div>
          
          {/* 타이틀 */}
          <div className="mb-6 px-4">
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black leading-tight sm:leading-none tracking-tighter">
              <span className="text-white drop-shadow-lg">마포70대</span>{' '}
              <span className="text-[#10b981] drop-shadow-lg">상비군</span>
            </h1>
          </div>
          
          <p className="text-sm sm:text-xl text-white/80 font-bold mb-10 sm:mb-12 max-w-2xl leading-relaxed px-4 drop-shadow-md bg-black/10 backdrop-blur-sm py-2 rounded-2xl">
            서울시 마포구의 자부심, 68세 이상의 열정이 모여<br className="hidden sm:block" /> 
            새로운 역사를 기록하는 명문 축구 클럽입니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-8 sm:px-0">
            <button 
              onClick={onStart}
              className="group px-8 py-4 sm:px-14 sm:py-5 bg-[#10b981] hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_30px_rgba(16,185,129,0.4)] text-base sm:text-lg uppercase tracking-tight"
            >
              경기 결과 보기 
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onAdminLogin}
              className="px-8 py-4 sm:px-14 sm:py-5 bg-white/5 hover:bg-white/15 text-white font-black rounded-2xl border-2 border-white/20 transition-all text-base sm:text-lg backdrop-blur-md shadow-lg"
            >
              관리자 접속
            </button>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-4 sm:px-0">
        <div className="bg-white p-10 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] border border-zinc-100 shadow-sm flex flex-col justify-center group hover:shadow-xl transition-all">
          <Activity className="text-emerald-600 mb-6 sm:mb-8 transition-transform group-hover:rotate-12 w-10 h-10 sm:w-12 sm:h-12" />
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-4 sm:mb-5 tracking-tight">건강한 열정, 끝없는 도전</h2>
          <p className="text-zinc-500 text-base sm:text-lg leading-relaxed font-medium">
            축구는 나이를 가리지 않습니다. 우리는 매 순간 최선을 다하며 필드 위에서 
            젊음보다 더 뜨거운 열정을 증명하고 있습니다.
          </p>
        </div>
        <div className="bg-emerald-50 p-10 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] border border-emerald-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-200/30 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
          <Star className="text-emerald-600 mb-6 sm:mb-8 group-hover:scale-110 transition-transform w-10 h-10 sm:w-12 sm:h-12" />
          <h2 className="text-3xl sm:text-4xl font-black text-emerald-900 mb-4 sm:mb-5 tracking-tight">정교한 데이터 관리</h2>
          <p className="text-emerald-700/80 text-base sm:text-lg leading-relaxed font-medium">
            우리의 모든 경기는 체계적으로 기록됩니다. 승패를 넘어 득점자, 경기장, 컨디션 분석까지 
            디지털 리포트로 관리하여 팀의 전술을 발전시킵니다.
          </p>
          <button 
            onClick={onStart}
            className="mt-8 sm:mt-10 flex items-center gap-2 text-emerald-700 font-black uppercase tracking-[0.2em] text-xs sm:text-sm hover:gap-4 transition-all"
          >
            기록실 바로가기 <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-16 py-12 border-t border-zinc-100 text-center animate-in fade-in slide-in-from-bottom-2 duration-1000">
        <div className="flex flex-col items-center gap-6">
          <Logo variant="dark" className="w-10 h-10 opacity-20 grayscale" />
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <MapPin size={16} className="text-zinc-300" />
              <p className="text-sm sm:text-base font-bold tracking-tight">주소: 서울특별시 마포구 잔다리로 30-10</p>
            </div>
            <p className="text-[10px] sm:text-xs font-black text-zinc-300 uppercase tracking-[0.3em]">
              Official Record of Mapo Senior Elite Squad
            </p>
            <p className="text-[9px] font-bold text-zinc-400 mt-4 opacity-60">
              © 2025 Mapo70 Senior. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
