import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import SubjectManager from './components/SubjectManager';
import ScheduleGrid from './components/ScheduleGrid';
import TodoList from './components/TodoList';
import { supabase, Subject } from './lib/supabase';
import { Calendar, ListTodo, LogOut, BookOpen } from 'lucide-react';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'todos'>('schedule');

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('created_at');
    if (data) setSubjects(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Mon E-Champo
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Emploi du temps</span>
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
              activeTab === 'todos'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            <span>To-Do List</span>
          </button>
        </div>

        {activeTab === 'schedule' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <SubjectManager subjects={subjects} onRefresh={loadSubjects} />

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Guide rapide</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Créez vos matières avec des couleurs personnalisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Cliquez sur une case de l'emploi du temps pour ajouter un cours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Choisissez la durée (1h, 2h ou 3h)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Survolez un cours pour le supprimer</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <ScheduleGrid subjects={subjects} onRefresh={loadSubjects} />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <TodoList />
          </div>
        )}
      </main>

      <footer className="mt-16 pb-8 text-center text-slate-500 text-sm">
        <p>Organisez votre vie avec style ✨</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
