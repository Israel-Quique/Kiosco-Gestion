import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from './views/LoginView';
import { KioskView } from './views/KioskView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { QueueDisplayView } from './views/QueueDisplayView';

export function App() {
  return (
    <Router>
      <div className="w-screen h-screen overflow-hidden bg-cb-yellow-main font-montserrat">
        <Routes>
          {/* Rutas principales del sistema */}
          <Route path="/kiosco" element={<KioskView />} />
          <Route path="/login" element={<LoginView />} />
          
          {/* Rutas administrativas y de TV */}
          <Route path="/admin" element={<AdminDashboardView />} />
          <Route path="/queue" element={<QueueDisplayView />} />
          
          {/* Redirección por defecto si la ruta no existe */}
          <Route path="*" element={<Navigate to="/kiosco" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
