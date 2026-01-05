
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
      {/* Hero Section: 스크린샷의 딥 그린 테마 및 레이아웃 반영 (높이 및 크기 70% 수준 조정) */}
      <section className="relative rounded-[3rem] overflow-hidden mb-12 shadow-2xl min-h-[550px] sm:min-h-[650px] flex flex-col items-center justify-center">
        {/* 배경색: 마포70대 상비군의 상징적인 딥 그린 */}
        <div className="absolute inset-0 bg-[#064e3b] z-0" />
        
        {/* 배경 장식 원형 요소들 */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none opacity-40" />

        <div className="relative z-10 px-6 py-12 sm:py-16 flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* 중앙 화이트 원형 로고 영역 (이전 요청에 따라 축소된 크기 유지) */}
          <div className="mb-8 sm:mb-10 relative flex items-center justify-center">
            {/* 은은한 동심원 장식 (축소된 크기) */}
            <div className="absolute w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] border border-white/5 rounded-full pointer-events-none" />
            <div className="absolute w-[240px] h-[240px] sm:w-[310px] sm:h-[310px] border border-white/5 rounded-full pointer-events-none" />
            
            {/* 화이트 로고 박스 */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white rounded-full flex items-center justify-center shadow-[0_15px_30px_-8px_rgba(0,0,0,0.5)] border-[6px] sm:border-[8px] border-emerald-900/10 relative z-10">
               <Logo className="w-[70%] h-[70%] relative z-10" />
            </div>
          </div>
          
          {/* 대형 타이틀 */}
          <div className="mb-6 px-4">
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black leading-tight sm:leading-none tracking-tighter">
              <span className="text-white">마포70대</span>{' '}
              <span className="text-[#10b981]">상비군</span>
            </h1>
          </div>
          
          <p className="text-sm sm:text-xl text-white/60 font-medium mb-10 sm:mb-12 max-w-2xl leading-relaxed px-4">
            서울시 마포구의 자부심, 70세 이상의 열정이 모여<br className="hidden sm:block" /> 
            새로운 역사를 기록하는 명문 축구 클럽입니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-8 sm:px-0">
            <button 
              onClick={onStart}
              className="group px-8 py-3.5 sm:px-12 sm:py-4 bg-[#10b981] hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 text-base sm:text-lg"
            >
              경기 결과 보기 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onAdminLogin}
              className="px-8 py-3.5 sm:px-12 sm:py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/20 transition-all text-base sm:text-lg backdrop-blur-sm"
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
              <p className="text-sm sm:text-base font-bold tracking-tight">주소: 마포구 잔다리로 30-1</p>
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
