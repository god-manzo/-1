

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
    </div>
  );
}