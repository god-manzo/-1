import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  ListTodo,
  Terminal
} from 'lucide-react';

// Views
import { ProfileView } from './components/views/ProfileView';
import { DashboardView } from './components/views/DashboardView';
import { QuestsView } from './components/views/QuestsView';

// Components
import { SystemLog } from './components/SystemLog';
import { AddTaskModal } from './components/AddTaskModal';
import { VictoryModal } from './components/VictoryModal';

// Hooks & Types
import { useGameState } from './hooks/useGameState';
import { TabView } from './types';

export default function App() {
  const { 
    gameState, 
    completeTask, 
    addTask,
    recordVictory, 
    deleteTask, 
    resetDay, 
    logs,
    updateProfile
  } = useGameState();
  
  const [activeTab, setActiveTab] = useState<TabView>(TabView.PROFILE);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  useEffect(() => {
    resetDay();
    const handleFocus = () => resetDay();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [resetDay]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f1a] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Desktop Navigation (System Style) */}
      <header className="hidden md:flex sticky top-0 z-40 bg-[#0a0f1c]/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 items-center justify-between shadow-[0_1px_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
             <Terminal className="text-blue-500" size={24} />
             <div className="text-blue-500 font-bold font-mono tracking-[0.2em] text-xl drop-shadow-[0_0_5px_rgba(59,130,246,0.5)] select-none">
               SYSTEM<span className="text-slate-100">.ID</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <DesktopNavButton 
               active={activeTab === TabView.PROFILE}
               onClick={() => setActiveTab(TabView.PROFILE)}
               icon={<User size={18} />}
               label="STATUS"
             />
             <DesktopNavButton 
               active={activeTab === TabView.QUESTS}
               onClick={() => setActiveTab(TabView.QUESTS)}
               icon={<ListTodo size={18} />}
               label="QUESTS"
             />
             <DesktopNavButton 
               active={activeTab === TabView.DASHBOARD}
               onClick={() => setActiveTab(TabView.DASHBOARD)}
               icon={<LayoutDashboard size={18} />}
               label="DIARY"
             />
          </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 pb-24 md:pb-8 md:pt-8 space-y-6 overflow-y-auto scroll-smooth">
        <SystemLog logs={logs} />

        {/* View Routing */}
        <div className="max-w-md mx-auto md:max-w-4xl lg:max-w-5xl transition-all duration-300">
            {activeTab === TabView.PROFILE && (
              <ProfileView 
                profile={gameState.profile} 
                onNameChange={updateProfile} 
                victoryHistory={gameState.victoryHistory}
              />
            )}

            {activeTab === TabView.QUESTS && (
              <QuestsView 
                tasks={gameState.tasks}
                completedToday={gameState.completedToday}
                onComplete={completeTask}
                onDelete={deleteTask}
                onOpenAddModal={() => setIsTaskModalOpen(true)}
              />
            )}

            {activeTab === TabView.DASHBOARD && (
              <DashboardView 
                gameState={gameState}
                onCompleteTask={completeTask}
                onOpenVictoryModal={() => setIsVictoryModalOpen(true)}
              />
            )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1c]/95 backdrop-blur-md border-t border-slate-800 p-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <MobileNavButton 
            active={activeTab === TabView.PROFILE} 
            onClick={() => setActiveTab(TabView.PROFILE)} 
            icon={<User size={20} />} 
            label="ПРОФИЛЬ" 
          />
          <MobileNavButton 
            active={activeTab === TabView.QUESTS} 
            onClick={() => setActiveTab(TabView.QUESTS)} 
            icon={<ListTodo size={20} />} 
            label="ЗАДАНИЯ" 
          />
          <MobileNavButton 
            active={activeTab === TabView.DASHBOARD} 
            onClick={() => setActiveTab(TabView.DASHBOARD)} 
            icon={<LayoutDashboard size={20} />} 
            label="ДНЕВНИК" 
          />
        </div>
      </nav>

      {/* Modals */}
      {isTaskModalOpen && (
        <AddTaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          onAdd={addTask} 
        />
      )}

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

// System Style Buttons

function DesktopNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-sm flex items-center gap-2 transition-all duration-300 font-mono text-sm tracking-widest border border-transparent ${
        active 
          ? 'bg-blue-600/10 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-lg w-20 transition-all duration-300 ${
        active 
          ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
          : 'text-slate-600 hover:text-slate-400'
      }`}
    >
      <div className={`mb-1 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
      <span className="text-[10px] uppercase font-bold tracking-widest font-mono">{label}</span>
    </button>
  );
}