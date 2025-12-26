import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  ListTodo, 
  Trophy, 
  Plus, 
  ScrollText,
  Clock,
  Skull
} from 'lucide-react';
import { StatsRadar } from './components/StatsRadar';
import { TaskList } from './components/TaskList';
import { ProfileCard } from './components/ProfileCard';
import { SystemLog } from './components/SystemLog';
import { AddTaskModal } from './components/AddTaskModal';
import { VictoryModal } from './components/VictoryModal';
import { Header } from './components/Header';
import { useGameState } from './hooks/useGameState';
import { TabView } from './types';
import { STAT_CONFIG } from './constants';

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
  
  const [activeTab, setActiveTab] = useState<TabView>(TabView.DASHBOARD);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  useEffect(() => {
    resetDay();
    const handleFocus = () => resetDay();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [resetDay]);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto md:max-w-2xl lg:max-w-4xl bg-background text-slate-200 font-sans selection:bg-primary/30">
      <Header 
        level={gameState.profile.level} 
        currentXp={gameState.profile.currentXp} 
        xpToNext={gameState.profile.xpToNextLevel}
        hp={gameState.profile.hp}
        maxHp={gameState.profile.maxHp}
        avatar={gameState.profile.avatar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 p-4 pb-24 space-y-6 overflow-y-auto">
        <SystemLog logs={logs} />

        {activeTab === TabView.DASHBOARD && (
          <div className="space-y-6 animate-fade-in">
             
             {/* Quick Actions */}
             <div className="bg-surface border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
                 <h2 className="text-xl font-bold text-white z-10">Случилось что-то хорошее?</h2>
                 <p className="text-slate-400 text-sm max-w-xs z-10">Запиши даже маленькую победу, чтобы восстановить силы и получить опыт.</p>
                 <button 
                   onClick={() => setIsVictoryModalOpen(true)}
                   className="mt-2 bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 transform hover:-translate-y-1 active:translate-y-0 z-10"
                 >
                    <Trophy size={20} /> ЗАПИСАТЬ ПОБЕДУ
                 </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
               {/* Daily Quests Widget */}
               <div className="bg-surface border border-slate-800 rounded-xl p-4 shadow-lg">
                 <h3 className="text-hud font-mono text-sm tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                   <Clock size={14} /> АКТИВНЫЕ ЗАДАНИЯ
                 </h3>
                 <div className="space-y-2">
                    <TaskList 
                        tasks={gameState.tasks} 
                        completedToday={gameState.completedToday}
                        onComplete={completeTask}
                        filter="today"
                    />
                    {gameState.tasks.filter(t => !gameState.completedToday[t.id]).length === 0 && (
                        <div className="text-center py-4 text-slate-500 text-sm italic">
                            Все цели на сегодня выполнены. Отдыхай, герой.
                        </div>
                    )}
                 </div>
               </div>

               {/* Stats Radar */}
               <div className="bg-surface border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px]">
                  <h3 className="text-primary font-mono text-sm tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <User size={14} /> БАЛАНС ХАРАКТЕРИСТИК
                  </h3>
                  <div className="h-[250px] w-full flex items-center justify-center">
                    <StatsRadar stats={gameState.profile.stats} />
                  </div>
               </div>
             </div>

             {/* Recent History Feed */}
             <div className="bg-surface border border-slate-800 rounded-xl p-4 shadow-lg">
                <h3 className="text-slate-400 font-mono text-sm tracking-wider mb-4 flex items-center gap-2">
                   <ScrollText size={14} /> ЛЕНТА СОБЫТИЙ
                </h3>
                <div className="space-y-4">
                   {gameState.victoryHistory.length === 0 && (
                       <div className="text-center py-8 text-slate-600">
                           Лента пуста. Соверши свой первый подвиг!
                       </div>
                   )}
                   {gameState.victoryHistory.map((log) => {
                       const config = STAT_CONFIG[log.stat];
                       const Icon = config.icon;
                       return (
                           <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                               <div className="mt-1 p-2 rounded-lg bg-slate-800 text-slate-400 h-fit">
                                   <Icon size={18} style={{ color: config.color }} />
                               </div>
                               <div>
                                   <div className="font-bold text-slate-200">{log.title}</div>
                                   {log.description && <div className="text-sm text-slate-400 mt-1">{log.description}</div>}
                                   <div className="flex gap-3 mt-2 text-xs font-mono">
                                       <span style={{ color: config.color }}>{config.label}</span>
                                       <span className="text-secondary">+{log.xpGained} XP</span>
                                       <span className="text-slate-600">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   </div>
                               </div>
                           </div>
                       )
                   })}
                </div>
             </div>
          </div>
        )}

        {activeTab === TabView.QUESTS && (
          <div className="space-y-4 animate-fade-in">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ListTodo className="text-accent" /> Журнал Квестов
                </h2>
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  <Plus size={16} /> Добавить
                </button>
             </div>
             
             <div className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <TaskList 
                  tasks={gameState.tasks} 
                  completedToday={gameState.completedToday}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  filter="all"
                />
             </div>
          </div>
        )}

        {activeTab === TabView.PROFILE && (
          <div className="animate-fade-in">
             <ProfileCard 
               profile={gameState.profile} 
               onNameChange={updateProfile}
             />
             
             {gameState.profile.hp < gameState.profile.maxHp * 0.3 && (
                 <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-4 text-red-200">
                    <Skull size={32} />
                    <div>
                        <div className="font-bold">КРИТИЧЕСКОЕ СОСТОЯНИЕ</div>
                        <div className="text-sm">Твоя энергия на исходе. Выполни задания или запиши победы, чтобы восстановиться.</div>
                    </div>
                 </div>
             )}
          </div>
        )}

      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-slate-800 p-2 md:hidden z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavButton 
            active={activeTab === TabView.DASHBOARD} 
            onClick={() => setActiveTab(TabView.DASHBOARD)} 
            icon={<LayoutDashboard size={20} />} 
            label="Дневник" 
          />
          <NavButton 
            active={activeTab === TabView.QUESTS} 
            onClick={() => setActiveTab(TabView.QUESTS)} 
            icon={<ListTodo size={20} />} 
            label="Задания" 
          />
          <NavButton 
            active={activeTab === TabView.PROFILE} 
            onClick={() => setActiveTab(TabView.PROFILE)} 
            icon={<User size={20} />} 
            label="Герой" 
          />
        </div>
      </nav>

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

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-all ${active ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] uppercase font-bold tracking-wide">{label}</span>
    </button>
  );
}