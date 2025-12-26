import React, { useState } from 'react';
import { Profile, StatKey } from '../types';
import { STAT_CONFIG, AVATARS } from '../constants';
import { Edit2, Check, X, Heart, Zap } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onNameChange: (name: string, avatar: string) => void;
}

export function ProfileCard({ profile, onNameChange }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);

  const saveProfile = () => {
    onNameChange(tempName, tempAvatar);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-surface border border-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-hud opacity-50"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
           {/* Avatar Section */}
           <div className="relative group">
              <div className="text-8xl filter drop-shadow-2xl transition-transform group-hover:scale-105 cursor-pointer" onClick={() => setIsEditing(true)}>
                {isEditing ? tempAvatar : profile.avatar}
              </div>
              {isEditing && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 z-50 shadow-2xl grid grid-cols-5 gap-2">
                  {AVATARS.map(av => (
                    <button 
                      key={av} 
                      onClick={() => setTempAvatar(av)}
                      className={`p-1 rounded hover:bg-white/10 text-xl ${tempAvatar === av ? 'bg-primary/30 ring-1 ring-primary' : ''}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              )}
           </div>

           {/* Info Section */}
           <div className="flex-1 w-full text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-white focus:outline-none focus:border-primary w-full"
                      autoFocus
                    />
                    <button onClick={saveProfile} className="p-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30"><Check size={18}/></button>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"><X size={18}/></button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{profile.name}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors p-1">
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex gap-4 justify-center md:justify-start text-sm text-slate-400 mb-4">
                 <span className="flex items-center gap-1"><Zap size={14} className="text-amber-400"/> Уровень {profile.level}</span>
                 <span className="flex items-center gap-1"><Heart size={14} className="text-red-500"/> {Math.floor(profile.hp)} HP</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center md:text-left">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Всего опыта</div>
                  <div className="text-lg text-primary font-mono">{Math.floor(profile.currentXp)} XP</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center md:text-left">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Побед</div>
                  <div className="text-lg text-secondary font-mono">{profile.totalTasksCompleted}</div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3">
        {Object.entries(profile.stats).map(([key, value]) => {
          const k = key as StatKey;
          const config = STAT_CONFIG[k];
          const Icon = config.icon;
          const barWidth = Math.min((value / (profile.level * 10)) * 100, 100); 

          return (
            <div key={key} className="bg-surface border border-slate-800 p-4 rounded-xl flex items-center gap-4 group hover:border-slate-700 transition-colors">
               <div className="p-3 rounded-lg bg-slate-900" style={{ color: config.color }}>
                 <Icon size={24} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-end mb-1">
                   <div>
                     <div className="font-bold text-slate-200">{config.label}</div>
                     <div className="text-xs text-slate-500">{config.description}</div>
                   </div>
                   <div className="font-mono text-xl font-bold" style={{ color: config.color }}>{value.toFixed(1)}</div>
                 </div>
                 <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                   <div 
                      className="h-full rounded-full"
                      style={{ width: `${barWidth}%`, backgroundColor: config.color }}
                   />
                 </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
