

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Inbox, 
  Repeat,
  User,
  Terminal,
  Activity
} from 'lucide-react';

// Views
import { ProfileView } from './components/views/ProfileView';
import { DashboardView } from './components/views/DashboardView';
import { QuestsView } from './components/views/QuestsView'; // Handles Inbox, Today, Habits
import { PlanningView } from './components/views/PlanningView';

// Components
import { SystemLog } from './components/SystemLog';
import { Sidebar } from './components/Sidebar';
import { VictoryModal } from './components/VictoryModal';

// Hooks & Types
import { useGameState } from './hooks/useGameState';
import { TabView } from './types';

function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center gap-4 font-mono">
            <Terminal className="text-blue-500 animate-pulse" size={48} />
            <div className="text-blue-400/80 tracking-[0.5em] text-sm uppercase animate-text-focus-in">
                ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...
            </div>
        </div>
    );
}

export default function App() {
  const { 
    gameState, 
    completeTask, 
    addTask,
    recordVictory, 
    deleteTask, 
    resetDay, 
    logs,
    updateProfile,
    setDayName,
  } = useGameState();
  
  const [activeTab, setActiveTab] = useState<TabView>(TabView.TODAY);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    resetDay();
    const handleFocus = () => resetDay();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [resetDay]);

  // Calculate Counts for Sidebar
  const todayStr = new Date().toISOString().slice(0, 10);
  const counts = {
      inbox: gameState.tasks.filter(t => !t.isHabit && !t.dueDate && !gameState.completedToday[t.id]).length,
      today: gameState.tasks.filter(t => {
          if(gameState.completedToday[t.id]) return false;
          if(t.isHabit) return true;
          return t.dueDate && t.dueDate <= todayStr;
      }).length
  };

  const renderContent = () => {
    switch (activeTab) {
        case TabView.INBOX:
        case TabView.HABITS:
            return (
                <QuestsView 
                    mode={activeTab}
                    tasks={gameState.tasks}
                    completedToday={gameState.completedToday}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                    onAdd={addTask}
                />
            );
        case TabView.TODAY:
             return (
                <PlanningView
                    tasks={gameState.tasks}
                    completedToday={gameState.completedToday}
                    dayNames={gameState.dayNames}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                    onAdd={addTask}
                    onSetDayName={setDayName}
                />
             );
        case TabView.PROFILE:
            return (
                <ProfileView 
                    profile={gameState.profile} 
                    onNameChange={updateProfile} 
                    victoryHistory={gameState.victoryHistory}
                />
            );
        case TabView.DASHBOARD:
            return (
                <DashboardView 
                    gameState={gameState}
                    onOpenVictoryModal={() => setIsVictoryModalOpen(true)}
                    onRecordVictory={recordVictory}
                />
            );
        default:
            return null;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-[#0b0f1a] text-slate-200 font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shadow-xl z-20">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} tasksCount={counts} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
          
          {/* Mobile Header (Minimal) */}
          <div className="md:hidden flex items-center justify-center p-3 border-b border-slate-800 bg-[#0a0f1c]/95 backdrop-blur-md z-10 sticky top-0">
              <span className="font-mono font-bold text-blue-500 tracking-[0.2em] text-sm">SYSTEM.OS</span>
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 md:pb-8">
             <div className="max-w-4xl mx-auto h-full min-h-[500px]">
                {renderContent()}
             </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-[#0a0f1c]/95 backdrop-blur-md border-t border-slate-800 z-50 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                
                {/* 1. Planning */}
                <MobileNavButton 
                  isActive={activeTab === TabView.TODAY} 
                  onClick={() => setActiveTab(TabView.TODAY)} 
                  icon={Sun} 
                  label="План" 
                />

                {/* 2. Habits */}
                <MobileNavButton 
                  isActive={activeTab === TabView.HABITS} 
                  onClick={() => setActiveTab(TabView.HABITS)} 
                  icon={Repeat} 
                  label="Протоколы" 
                />

                {/* 3. Inbox (Center Highlight) */}
                <div className="relative -top-5">
                   <button 
                      onClick={() => setActiveTab(TabView.INBOX)}
                      className={`
                        w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#0b0f1a] shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform active:scale-95 animate-subtle-pulse
                        ${activeTab === TabView.INBOX ? 'bg-blue-500 text-white scale-110' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                      `}
                   >
                      <Inbox size={24} />
                      {counts.inbox > 0 && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-[#0b0f1a]"></span>
                      )}
                   </button>
                </div>

                {/* 4. Dashboard */}
                <MobileNavButton 
                  isActive={activeTab === TabView.DASHBOARD} 
                  onClick={() => setActiveTab(TabView.DASHBOARD)} 
                  icon={Activity} 
                  label="Сводка" 
                />

                {/* 5. Profile */}
                <MobileNavButton 
                  isActive={activeTab === TabView.PROFILE} 
                  onClick={() => setActiveTab(TabView.PROFILE)} 
                  icon={User} 
                  label="Профиль" 
                />
            </div>
          </div>
      </div>

      <SystemLog logs={logs} />

      {isVictoryModalOpen && (
        <VictoryModal 
          isOpen={isVictoryModalOpen}
          onClose={() => setIsVictoryModalOpen(false)}
          onRecord={recordVictory}
        />
      )}
    </div>
  );
}

// Helper for Mobile Nav Buttons
function MobileNavButton({ isActive, onClick, icon: Icon, label }: any) {
    return (
        <button 
          onClick={onClick}
          className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
            isActive ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className={`relative ${isActive ? 'mb-1' : ''}`}>
             <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''} />
             {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>}
          </div>
          {!isActive && <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-wider">{label}</span>}
        </button>
    );
}
