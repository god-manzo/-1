import React, { useState, useRef } from 'react';
import { Profile, StatKey, VictoryLog } from '../types';
import { STAT_CONFIG } from '../constants';
import { Edit2, Check, X, Upload, Activity, ScanLine, ChevronRight, Hexagon } from 'lucide-react';
import { StatHistoryModal } from './StatHistoryModal';
import { StatsRadar } from './StatsRadar';

interface ProfileCardProps {
  profile: Profile;
  onNameChange: (name: string, avatar: string) => void;
  victoryHistory: VictoryLog[];
}

export function ProfileCard({ profile, onNameChange, victoryHistory }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);
  
  // State for the "Stats Grid" modal (Level 1 depth)
  const [isStatsGridOpen, setIsStatsGridOpen] = useState(false);
  
  // State for the "History" modal (Level 2 depth)
  const [selectedStat, setSelectedStat] = useState<StatKey | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setTempName(profile.name);
    setTempAvatar(profile.avatar);
    setIsEditing(true);
  };

  const saveProfile = () => {
    if (tempName.trim()) {
      onNameChange(tempName, tempAvatar);
      setIsEditing(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isImage = (str: string) => str.startsWith('data:') || str.startsWith('http');

  // Helper to calculate Rank based on stat value
  const getRank = (value: number) => {
    if (value >= 100) return { rank: 'S', color: 'text-amber-400', shadow: 'shadow-amber-500/50' };
    if (value >= 75) return { rank: 'A', color: 'text-red-500', shadow: 'shadow-red-500/50' };
    if (value >= 50) return { rank: 'B', color: 'text-blue-400', shadow: 'shadow-blue-500/50' };
    if (value >= 30) return { rank: 'C', color: 'text-green-400', shadow: 'shadow-green-500/50' };
    if (value >= 15) return { rank: 'D', color: 'text-slate-300', shadow: 'shadow-slate-500/50' };
    return { rank: 'E', color: 'text-slate-500', shadow: 'shadow-slate-500/20' };
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* SYSTEM WINDOW: Player Info */}
      <div className="bg-[#0a0f1c] border-2 border-[#1e293b] shadow-[0_0_30px_rgba(59,130,246,0.15)] rounded-sm overflow-hidden relative">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-blue-500"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-blue-500"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-blue-500"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-blue-500"></div>

        {/* Header */}
        <div className="bg-[#111827] border-b border-[#1e293b] p-2 text-center">
            <h2 className="text-blue-500 font-bold tracking-[0.3em] text-lg drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">
                PLAYER STATUS
            </h2>
        </div>

        <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Avatar Column */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    <div 
                        className={`relative w-32 h-32 md:w-40 md:h-40 bg-slate-900 border-2 border-blue-900/50 flex items-center justify-center overflow-hidden shadow-inner ${isEditing ? 'cursor-pointer hover:border-blue-400 transition-colors group' : ''}`}
                        onClick={isEditing ? triggerFileInput : undefined}
                    >
                        {isImage(isEditing ? tempAvatar : profile.avatar) ? (
                            <img 
                                src={isEditing ? tempAvatar : profile.avatar} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-6xl">{isEditing ? tempAvatar : profile.avatar}</span>
                        )}

                        {isEditing && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-blue-400" />
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Column */}
                <div className="flex-1 w-full space-y-4">
                    {/* Name Field */}
                    <div className="border-b border-dashed border-slate-800 pb-2">
                        <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">Name</div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input 
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="bg-slate-900/50 border border-blue-900 text-blue-100 px-2 py-1 w-full focus:outline-none focus:border-blue-500 font-bold"
                                        autoFocus
                                    />
                                    <button onClick={saveProfile} className="text-green-500 hover:text-green-400"><Check size={20}/></button>
                                    <button onClick={cancelEditing} className="text-red-500 hover:text-red-400"><X size={20}/></button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-2xl text-white font-bold tracking-wide">{profile.name}</span>
                                    <button onClick={startEditing} className="text-slate-600 hover:text-blue-400 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Class & Title */}
                    <div className="grid grid-cols-2 gap-4 border-b border-dashed border-slate-800 pb-4">
                        <div>
                            <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">Job</div>
                            <div className="text-slate-300">Awakened</div> 
                        </div>
                        <div>
                            <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">Title</div>
                            <div className="text-slate-300">Pathfinder</div>
                        </div>
                    </div>

                    {/* Level Display */}
                    <div>
                        <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">Level</div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl text-blue-500 font-bold leading-none drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                                {profile.level}
                            </span>
                            <div className="flex-1 pb-1">
                                <div className="h-2 bg-slate-900 border border-slate-800 relative">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                                        style={{ width: `${Math.min((profile.currentXp / profile.xpToNextLevel) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-right text-slate-500 mt-1">
                                    {Math.floor(profile.currentXp)} / {profile.xpToNextLevel} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* BALANCE ANALYSIS (Clickable Module) */}
      <div 
         className="w-full bg-[#0a0f1c] border border-slate-800 p-4 rounded-sm relative overflow-hidden group h-[400px] flex flex-col cursor-pointer hover:border-blue-500 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
         onClick={() => setIsStatsGridOpen(true)}
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-r-[20px] border-b-blue-500/20 border-r-transparent group-hover:border-b-blue-500 transition-colors"></div>
        
        <div className="flex justify-between items-center mb-2 z-10 shrink-0">
            <span className="text-xs text-blue-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <ScanLine size={16} className="animate-pulse" />
                Balance Analysis
            </span>
            <div className="flex items-center gap-1 text-slate-500 group-hover:text-blue-400 transition-colors text-[10px] uppercase tracking-widest">
                <span>View Attributes</span>
                <ChevronRight size={14} />
            </div>
        </div>
        
        {/* Chart Container */}
        <div className="flex-1 relative w-full min-h-0 pointer-events-none">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                 <StatsRadar stats={profile.stats} />
             </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-slate-800 text-center z-10 shrink-0">
             <div className="text-[10px] text-slate-500 uppercase flex justify-between px-2">
                 <span>Sync Rate: 98%</span>
                 <span className="animate-pulse text-blue-500"> TAP FOR DETAILS </span>
                 <span>Class: Balanced</span>
             </div>
        </div>
      </div>
      
      <div className="text-center text-[10px] text-slate-600 mt-8 tracking-[0.5em] opacity-50">
          SYSTEM ONLINE
      </div>

      {/* STATS SYSTEM WINDOW (Replaces the inline grid) */}
      {isStatsGridOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div 
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsStatsGridOpen(false)}
             />
             
             {/* Main Window Frame */}
             <div className="relative w-full max-w-xl animate-scale-up">
                {/* Outer Glow */}
                <div className="absolute -inset-1 bg-blue-600/20 blur-md rounded-sm"></div>
                
                <div className="relative bg-[#0b101b] border-2 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.2)] rounded-sm overflow-hidden flex flex-col max-h-[80vh]">
                    
                    {/* Window Header */}
                    <div className="bg-slate-900 border-b border-blue-800 p-3 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <Activity className="text-blue-500" size={18} />
                            <h3 className="text-lg font-bold text-white font-mono tracking-[0.2em] drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">
                                ATTRIBUTES
                            </h3>
                        </div>
                        <button onClick={() => setIsStatsGridOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Window Content */}
                    <div className="p-1 overflow-y-auto custom-scrollbar bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:20px_20px]">
                        <div className="flex flex-col gap-1 p-2">
                            {/* Available Points Mockup (Visual Only) */}
                            <div className="flex justify-between items-center p-3 mb-2 bg-blue-900/10 border border-blue-900/30 rounded-sm">
                                <span className="text-xs text-blue-400 font-mono tracking-widest uppercase">Available Points</span>
                                <span className="text-xl font-mono text-slate-500 font-bold">0</span>
                            </div>

                            {Object.entries(profile.stats).map(([key, value]) => {
                                const k = key as StatKey;
                                const config = STAT_CONFIG[k];
                                const rankInfo = getRank(value);
                                
                                return (
                                    <button 
                                        key={key} 
                                        onClick={() => setSelectedStat(k)}
                                        className="group relative flex items-center justify-between p-3 border border-slate-800 bg-[#0f1525] hover:bg-blue-900/10 hover:border-blue-500/50 transition-all duration-200"
                                    >
                                        {/* Hover Indicator */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-500 transition-colors"></div>

                                        <div className="flex items-center gap-4">
                                            {/* Icon Box */}
                                            <div className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-sm text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                                                <config.icon size={18} />
                                            </div>

                                            <div className="text-left">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold group-hover:text-blue-300 transition-colors">
                                                    {config.label}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                     {/* Simple Bar Visualization */}
                                                     <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                         <div 
                                                            className="h-full bg-slate-500 group-hover:bg-blue-500 transition-colors"
                                                            style={{ width: `${Math.min(value, 100)}%` }}
                                                         ></div>
                                                     </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-2xl text-white font-bold font-mono leading-none group-hover:text-shadow-glow">
                                                    {value.toFixed(0)}
                                                </div>
                                            </div>
                                            
                                            {/* Rank Badge */}
                                            <div className={`w-10 h-10 flex items-center justify-center border border-slate-800 bg-slate-900 rounded-sm font-mono font-bold text-lg ${rankInfo.color} ${rankInfo.shadow} drop-shadow-md`}>
                                                {rankInfo.rank}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-slate-900 border-t border-slate-800 p-2 text-center">
                        <span className="text-[9px] text-slate-600 font-mono tracking-[0.3em] uppercase">
                            Select attribute for history logs
                        </span>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* HISTORY MODAL (Level 2 Detail) */}
      <StatHistoryModal 
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        stat={selectedStat}
        history={victoryHistory}
      />
    </div>
  );
}