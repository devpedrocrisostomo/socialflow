import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Import de Componentes
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Import de Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Families from './pages/Families';
import FamilyDetails from './pages/FamilyDetails';
import Appointments from './pages/Appointments';
import Visits from './pages/Visits';
import Referrals from './pages/Referrals';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Componente para Proteger Rotas Privadas e Injetar Layout Principal
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors duration-300">
      {/* Sidebar Fixo na Esquerda */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo Principal na Direita */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Corpo da Página com Rolagem */}
        <main className="flex-1 overflow-y-auto bg-primary-50/50 dark:bg-primary-950/20">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/families" element={
              <ProtectedRoute>
                <Families />
              </ProtectedRoute>
            } />
            <Route path="/families/:id" element={
              <ProtectedRoute>
                <FamilyDetails />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/visits" element={
              <ProtectedRoute>
                <Visits />
              </ProtectedRoute>
            } />
            <Route path="/referrals" element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Redirecionamento de Rotas não existentes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
