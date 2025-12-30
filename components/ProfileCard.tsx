
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Profile, StatKey } from '../types';
import { STAT_CONFIG } from '../constants';
import { Edit2, Check, X, Upload, User, Fingerprint, ShieldCheck, Activity } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onNameChange: (name: string, avatar: string) => void;
}

export function ProfileCard({ profile, onNameChange }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);

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

  const isImage = (str: string) => str && (str.startsWith('data:') || str.startsWith('http'));

  const currentAvatar = isEditing ? tempAvatar : profile.avatar;

  // Render a minimal segmented progress bar
  const SegmentedBar = ({ value }: { value: number }) => {
    const segments = 12;
    const filled = Math.floor((value / 100) * segments);
    return (
      <div className="flex gap-[2px]">
        {[...Array(segments)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1 h-2.5 rounded-[0.5px] transition-colors duration-700 ${
              i < filled ? 'bg-blue-500 shadow-[0_0_3px_rgba(59,130,246,0.6)]' : 'bg-blue-900/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#0a0f1c] border border-blue-900/40 shadow-[0_0_40px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden relative font-mono">
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l border-t border-blue-500/40"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-blue-500/40"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-blue-500/40"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-blue-500/40"></div>

      {/* Top Header Bar */}
      <div className="bg-blue-950/30 border-b border-blue-900/40 px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Activity size={12} className="text-blue-500 animate-pulse" />
            <span className="text-[9px] text-blue-500 font-bold tracking-[0.3em] uppercase">Tactical_Unit_Profile</span>
        </div>
        <div className="flex gap-4">
            <span className="text-[8px] text-blue-900 font-bold">NODE_ID: 0x77-A</span>
            <span className="text-[8px] text-blue-900 font-bold">SYNC_V2.5</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-6">
        
        {/* UPPER TIER: BIOMETRICS & ID (Avatar Left, Stats Right) */}
        <div className="flex flex-row items-start gap-8">
          
          {/* Visual ID Module (NOW LEFT) */}
          <div className="relative shrink-0">
             {/* Scanning effect overlay */}
             <div className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-blue-400 z-20"></div>
             <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-blue-400 z-20"></div>
             
             <div 
                className={`relative w-28 h-28 md:w-32 md:h-32 bg-slate-900 border border-blue-900 flex items-center justify-center overflow-hidden shadow-inner ${isEditing ? 'cursor-pointer hover:border-blue-500' : ''}`}
                onClick={isEditing ? triggerFileInput : undefined}
             >
                {/* Horizontal Scanline */}
                <motion.div 
                    className="absolute left-0 right-0 h-[1px] bg-blue-400/40 z-10 pointer-events-none"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {isImage(currentAvatar) ? (
                    <img src={currentAvatar} alt="ID" className="w-full h-full object-cover filter brightness-75 contrast-125 saturate-50" />
                ) : (
                    <User className="w-12 h-12 text-blue-900/40" />
                )}

                {isEditing && (
                    <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <Upload className="text-white" size={20} />
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                )}
             </div>
             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[7px] font-black px-1 leading-tight tracking-widest uppercase">
                Visual_Link
             </div>
          </div>

          {/* Stats Module (HUD Style) (NOW RIGHT) */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 py-1">
            {(Object.keys(STAT_CONFIG) as StatKey[]).map((key) => {
              const config = STAT_CONFIG[key];
              const value = profile.stats[key] || 0;
              return (
                <div key={key} className="flex flex-col gap-1 border-l border-blue-900/30 pl-4 py-1 hover:bg-blue-500/5 transition-colors">
                  <div className="flex justify-between items-center w-full max-w-[140px]">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{config.label}</span>
                    <span className="text-[9px] font-black text-blue-400 tabular-nums">{value.toFixed(1)}</span>
                  </div>
                  <SegmentedBar value={value} />
                </div>
              );
            })}
          </div>
        </div>

        {/* LOWER TIER: PERSONAL DATA & PROGRESS */}
        <div className="space-y-4 pt-4 border-t border-blue-900/20">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div className="flex-1 min-w-0">
                <div className="text-[8px] text-blue-500/60 uppercase tracking-[0.3em] mb-1 font-bold">Subject_Callsign</div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-blue-900/10 border border-blue-500/50 text-blue-100 px-3 py-1 w-full focus:outline-none font-bold text-xl uppercase tracking-widest"
                      autoFocus
                    />
                    <button onClick={saveProfile} className="text-green-500 hover:text-green-400 transition-colors"><Check size={20}/></button>
                    <button onClick={cancelEditing} className="text-red-500 hover:text-red-400 transition-colors"><X size={20}/></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group/name max-w-md">
                    <h1 className="text-3xl text-white font-black tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] truncate">
                      {profile.name}
                    </h1>
                    <button onClick={startEditing} className="text-blue-900 hover:text-blue-500 transition-colors ml-4">
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
             </div>

             <div className="flex gap-6 shrink-0">
                <div className="text-right">
                    <div className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Operator_Class</div>
                    <div className="text-xs text-slate-300 font-bold flex items-center justify-end gap-1">
                        <ShieldCheck size={12} className="text-blue-500" /> Awakened
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Rank_Status</div>
                    <div className="text-xs text-blue-500 font-bold uppercase italic tracking-tighter">Pioneer_Beta</div>
                </div>
             </div>
          </div>

          {/* Level & XP Module */}
          <div className="bg-blue-950/10 border border-blue-900/20 p-3 rounded-sm relative group/xp">
             <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                   <div className="text-2xl font-black text-blue-500 italic leading-none">LV.{profile.level}</div>
                   <div className="h-4 w-[1px] bg-blue-900"></div>
                   <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Core_Integration</div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 tabular-nums">
                   {Math.floor(profile.currentXp)} <span className="text-slate-600">/</span> {profile.xpToNextLevel} <span className="text-blue-900 ml-1">XP</span>
                </div>
             </div>
             
             <div className="h-1.5 bg-slate-900 border border-blue-900/20 relative p-[1px] rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-blue-700 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min((profile.currentXp / profile.xpToNextLevel) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                />
             </div>

             {/* Animated status indicators */}
             <div className="absolute -right-1 top-0 bottom-0 w-4 flex flex-col justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-blue-500/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.4}s` }}></div>
                ))}
             </div>
          </div>
        </div>

      </div>

      {/* Decorative Serial Text */}
      <div className="absolute bottom-1 right-3 text-[7px] text-blue-900 font-bold opacity-30 select-none pointer-events-none">
         OS.X-7_SYSTEM_LOG_CORE_DUMP_0010101
      </div>
    </div>
  );
}
