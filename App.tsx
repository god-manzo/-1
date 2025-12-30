
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Inbox, 
  Repeat,
  User,
  Terminal,
  Activity,
  Award
} from 'lucide-react';

// Views
import { ProfileView } from './components/views/ProfileView';
import { DashboardView } from './components/views/DashboardView';
import { QuestsView } from './components/views/QuestsView'; 
import { PlanningView } from './components/views/PlanningView';

// Components
import { SystemLog } from './components/SystemLog';
import { Sidebar } from './components/Sidebar';
import { VictoryModal } from './components/VictoryModal';
import { AIAssistantModal } from './components/AIAssistantModal';

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

function LevelUpOverlay({ level, onClose }: { level: number, onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.5, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.2 } }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center font-mono p-8"
            >
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
                    className="text-2xl text-slate-400 tracking-[0.5em] uppercase"
                >
                    Уровень повышен
                </motion.div>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 15, delay: 0.8 } }}
                    className="text-8xl md:text-9xl font-bold my-4 text-amber-400 text-shadow-gold"
                    style={{ WebkitTextStroke: '2px #1e293b' }}
                >
                    {level}
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 1.1 } }}
                    className="flex items-center justify-center gap-2 text-blue-300"
                >
                    <Award /> Новые возможности разблокированы
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

export default function App() {
  const [uiEffect, setUiEffect] = useState<'none' | 'levelUp'>('none');
  
  const { 
    gameState, 
    systemAnalysis,
    completeTask, 
    addTask,
    recordVictory, 
    deleteTask, 
    resetDay, 
    logs,
    updateProfile,
    setDayName,
    undo,
    hasHistory
  } = useGameState(() => setUiEffect('levelUp'));
  
  const [activeTab, setActiveTab] = useState<TabView>(TabView.TODAY);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Alt + C to open assistant
        if (e.altKey && e.key.toLowerCase() === 'c') {
            setIsAssistantOpen(prev => !prev);
        }
        // / to open if no input is focused
        if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            setIsAssistantOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    resetDay();
    const handleFocus = () => resetDay();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [resetDay]);

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
                    systemAnalysis={systemAnalysis}
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
      
      <AnimatePresence>
        {uiEffect === 'levelUp' && (
            <LevelUpOverlay level={gameState.profile.level} onClose={() => setUiEffect('none')} />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shadow-xl z-20">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            tasksCount={counts} 
            onUndo={undo} 
            canUndo={hasHistory}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
          
          <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-800 bg-[#0a0f1c]/95 backdrop-blur-md z-10 sticky top-0 px-4">
              <span className="font-mono font-bold text-blue-500 tracking-[0.2em] text-xs">SYSTEM.OS</span>
              <button 
                onClick={() => setIsAssistantOpen(true)}
                className="text-blue-500 animate-pulse"
              >
                <Terminal size={18} />
              </button>
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 md:pb-8">
             <div className="max-w-4xl mx-auto h-full min-h-[500px]">
                {renderContent()}
             </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-[#0a0f1c]/95 backdrop-blur-md border-t border-slate-800 z-50 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                
                <MobileNavButton 
                  isActive={activeTab === TabView.TODAY} 
                  onClick={() => setActiveTab(TabView.TODAY)} 
                  icon={Sun} 
                  label="План" 
                />

                <MobileNavButton 
                  isActive={activeTab === TabView.HABITS} 
                  onClick={() => setActiveTab(TabView.HABITS)} 
                  icon={Repeat} 
                  label="Протоколы" 
                />

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

                <MobileNavButton 
                  isActive={activeTab === TabView.DASHBOARD} 
                  onClick={() => setActiveTab(TabView.DASHBOARD)} 
                  icon={Activity} 
                  label="Сводка" 
                />

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

      <AIAssistantModal 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onAddTask={addTask}
      />
    </div>
  );
}

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
