
import React from 'react';
import { 
  Trophy, Users, Calendar, ArrowRight, Shield, 
  MapPin, Activity, Star, ChevronRight 
} from 'lucide-react';
import Logo from './Logo';

interface HomeProps {
  onStart: () => void;
  onAdminLogin: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart, onAdminLogin }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative rounded-[3rem] overflow-hidden mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-zinc-900 z-0" />
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="relative z-10 px-8 py-20 sm:py-24 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Logo variant="light" className="w-5 h-5" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-widest">마포70대 상비군</span>
          </div>

          {/* Main Logo Container */}
          <div className="mb-8 w-44 h-44 sm:w-56 sm:h-56 bg-white rounded-full p-4 shadow-2xl border-4 border-emerald-500/30 flex items-center justify-center relative group">
            <Logo className="w-full h-full transition-transform duration-500 group-hover:scale-110" />
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight tracking-tighter">
            마포70대 <span className="text-emerald-400">상비군</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-emerald-100/80 font-medium mb-12 max-w-2xl leading-relaxed">
            서울시 마포구의 자부심, 70세 이상의 열정이 모여<br className="hidden sm:block" /> 
            새로운 역사를 기록하는 명문 축구 클럽입니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-900/40"
            >
              경기 결과 보기 <ArrowRight size={20} />
            </button>
            <button 
              onClick={onAdminLogin}
              className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-black rounded-2xl border border-white/10 transition-all"
            >
              관리자 접속
            </button>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="relative z-10 px-8 pb-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { label: '활동 지역', value: '마포구', icon: MapPin, color: 'text-red-400' },
            { label: '창단 연도', value: '2015년', icon: Calendar, color: 'text-amber-400' },
            { label: '총 우승', value: '12회', icon: Trophy, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-black/20 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center">
              <stat.icon className={`${stat.color} mb-3`} size={24} />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col justify-center">
          <Activity className="text-emerald-600 mb-6" size={40} />
          <h2 className="text-3xl font-black text-zinc-900 mb-4">건강한 열정, 끝없는 도전</h2>
          <p className="text-zinc-500 leading-relaxed font-medium">
            축구는 나이를 가리지 않습니다. 우리는 매 순간 최선을 다하며 필드 위에서 
            젊음보다 더 뜨거운 열정을 증명하고 있습니다.
          </p>
        </div>
        <div className="bg-emerald-50 p-10 rounded-[2.5rem] border border-emerald-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-200/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <Star className="text-emerald-600 mb-6" size={40} />
          <h2 className="text-3xl font-black text-emerald-900 mb-4">정교한 데이터 관리</h2>
          <p className="text-emerald-700/80 leading-relaxed font-medium">
            우리의 모든 경기는 체계적으로 기록됩니다. 승패를 넘어 득점자, 경기장, 컨디션 분석까지 
            디지털 리포트로 관리하여 팀의 전술을 발전시킵니다.
          </p>
          <button 
            onClick={onStart}
            className="mt-8 flex items-center gap-2 text-emerald-700 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all"
          >
            기록실 바로가기 <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Mapo Pride Decoration */}
      <div className="text-center py-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
        <h3 className="text-zinc-900 font-black text-8xl sm:text-9xl uppercase tracking-tighter select-none">MAPO PRIDE</h3>
      </div>
    </div>
  );
};

export default Home;
