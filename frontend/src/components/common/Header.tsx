import React from 'react';
import { 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  LogOut
} from 'lucide-react';

interface HeaderProps {
  currentMode: 'kiosk' | 'admin' | 'queue';
  title?: string;
  onOpenHelp?: () => void;
  onLogout?: () => void;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  title = 'KIOSCO DIGITAL',
  onOpenHelp,
  onLogout,
  onHomeClick
}) => {
  const [timeStr, setTimeStr] = React.useState<string>('--:--:--');
  const [dateStr, setDateStr] = React.useState<string>('Cargando fecha...');
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-BO', { hour12: false }));
      const dateFormatted = now.toLocaleDateString('es-BO', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });
      setDateStr(dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <header className="relative z-50 w-full px-6 py-3 flex items-center justify-between gap-4 bg-gradient-to-r from-[#071930] via-[#0b2545] to-[#0e305d] border-b-4 border-cb-yellow-main shadow-xl select-none">
      
      {/* 1. Logotipo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <img
          src="/correos2.png"
          alt="Correos de Bolivia"
          className="h-12 w-auto object-contain drop-shadow-md cursor-pointer transition-transform hover:scale-105"
          onClick={onHomeClick}
        />
        <div className="flex flex-col border-l-2 border-cb-yellow-main/40 pl-3">
          <span className="text-sm font-black tracking-widest text-cb-yellow-bright">AGBC</span>
          <span className="text-xs font-semibold text-white/80">Agencia Boliviana de Correos</span>
        </div>
      </div>

      {/* 2. Título Central */}
      <div className="flex flex-col items-center justify-center text-center flex-1 max-w-lg">
        <h1 className="text-xl font-black uppercase tracking-wider text-cb-yellow-bright drop-shadow-[0_2px_8px_rgba(255,204,0,0.3)]">
          {title}
        </h1>
      </div>

      {/* 3. Reloj y Controles */}
      <div className="flex items-center gap-4 flex-shrink-0">
        
        {/* Reloj */}
        <div className="flex items-center gap-3 px-3.5 py-1 bg-white/10 border border-cb-yellow-main/30 rounded-full">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black tracking-wider text-cb-yellow-bright tabular-nums">
              {timeStr}
            </span>
            <span className="text-[10px] font-semibold text-white/80 capitalize">
              {dateStr}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-[10px] font-extrabold tracking-wider text-emerald-300">ONLINE</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2">
          {/* Botón de Ayuda (Solo en Kiosco) */}
          {currentMode === 'kiosk' && onOpenHelp && (
            <button
              onClick={onOpenHelp}
              title="Ayuda de Uso"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-cb-yellow-main/40 bg-white/10 text-white hover:bg-cb-yellow-main hover:text-cb-blue-deep transition-all shadow-md active:scale-95"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          {/* Botón Salir (Solo en Admin) */}
          {currentMode === 'admin' && onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="flex items-center gap-2 px-4 h-10 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold uppercase hidden sm:block">Salir</span>
            </button>
          )}

          {/* Fullscreen (Ambos) */}
          <button
            onClick={toggleFullscreen}
            title="Pantalla Completa"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-cb-yellow-main/40 bg-white/10 text-white hover:bg-cb-yellow-main hover:text-cb-blue-deep transition-all shadow-md active:scale-95"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
