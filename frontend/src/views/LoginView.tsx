import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';
import { startDailySession } from '../store/authStore';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const userLower = username.toLowerCase();
      // Verificamos administrador o diseñador
      if (
        (userLower === 'admin' && password === 'admin123') ||
        ((userLower === 'diseñador' || userLower === 'disenador') && password === 'diseño123')
      ) {
        // Guardamos el rol para condicionales en el dashboard
        localStorage.setItem('userRole', userLower === 'admin' ? 'admin' : 'designer');
        startDailySession();
        navigate('/admin');
      } else {
        setError('Usuario o contraseña incorrectos');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#071930] via-[#0b2545] to-[#0e305d] p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-cb-yellow-main overflow-hidden animate-fadeIn">
        
        <div className="flex flex-col items-center py-8 bg-slate-50 border-b border-slate-200">
          <img src="/correos2.png" alt="Correos de Bolivia" className="h-16 mb-4 drop-shadow-sm" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cb-blue-navy text-cb-yellow-bright text-[10px] font-black uppercase tracking-widest shadow-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sistema de Gestión AGBC</span>
          </div>
          <h2 className="text-xl font-black text-cb-blue-navy mt-4 uppercase">Ingreso de Personal</h2>
        </div>

        <form onSubmit={handleLogin} className="p-8 flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-cb-blue-navy uppercase mb-1.5 ml-1">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-cb-blue-navy focus:ring-2 focus:ring-cb-yellow-main focus:border-cb-yellow-main transition-all outline-none"
                placeholder="Ej. admin"
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-cb-blue-navy uppercase mb-1.5 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-cb-blue-navy focus:ring-2 focus:ring-cb-yellow-main focus:border-cb-yellow-main transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-cb-blue-navy text-cb-yellow-bright font-black uppercase tracking-wider hover:bg-cb-blue-royal transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:scale-100"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-cb-yellow-bright border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="py-4 bg-slate-50 border-t border-slate-200 text-center flex flex-col gap-1">
          <p className="text-[10px] font-bold text-slate-500">
            Acceso restringido únicamente a personal autorizado.
          </p>
          <div className="text-[9px] text-slate-400 mt-2">
            Credenciales de prueba:<br/>
            Admin: <b>admin</b> / <b>admin123</b><br/>
            Diseñador: <b>diseñador</b> / <b>diseño123</b>
          </div>
        </div>
      </div>
    </div>
  );
};
