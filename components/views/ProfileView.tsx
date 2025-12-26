import React from 'react';
import { Profile, VictoryLog } from '../../types';
import { ProfileCard } from '../ProfileCard';
import { Skull } from 'lucide-react';

interface ProfileViewProps {
  profile: Profile;
  onNameChange: (name: string, avatar: string) => void;
  victoryHistory: VictoryLog[];
}

export function ProfileView({ profile, onNameChange, victoryHistory }: ProfileViewProps) {
  return (
    <div className="animate-fade-in space-y-4">
      <ProfileCard 
        profile={profile} 
        onNameChange={onNameChange}
        victoryHistory={victoryHistory}
      />
      
      {profile.hp < profile.maxHp * 0.3 && (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-sm flex items-center gap-4 text-red-200 animate-pulse">
          <Skull size={32} />
          <div>
            <div className="font-bold font-mono text-lg">CRITICAL CONDITION</div>
            <div className="text-sm font-mono opacity-80">Энергия на исходе. Выполните задания для восстановления.</div>
          </div>
        </div>
      )}
    </div>
  );
}