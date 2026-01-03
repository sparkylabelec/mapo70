
import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      localStorage.setItem('isAdminAuthenticated', 'true');
      onLogin();
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-zinc-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-zinc-800 mb-8">관리자 인증</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="비밀번호를 입력하세요"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn size={20} />
            인증하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
