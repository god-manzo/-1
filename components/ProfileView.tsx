
import React, { useState } from 'react';
import { Profile, StatKey, VictoryLog } from '../../types';
import { ProfileCard } from '../ProfileCard';
import { BalanceAnalysisCard } from '../BalanceAnalysisCard';
import { RecentAchievementsCard } from '../RecentAchievementsCard';
import { StatsGridModal } from '../StatsGridModal';
import { StatHistoryModal } from '../StatHistoryModal';

interface ProfileViewProps {
  profile: Profile;
  onNameChange: (name: string, avatar: string) => void;
  victoryHistory: VictoryLog[];
}

export function ProfileView({ profile, onNameChange, victoryHistory }: ProfileViewProps) {
  const [isStatsGridOpen, setIsStatsGridOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<StatKey | null>(null);
  
  const handleSelectStat = (stat: StatKey) => {
      setIsStatsGridOpen(false);
      setSelectedStat(stat);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2">
          <ProfileCard 
            profile={profile} 
            onNameChange={onNameChange}
          />
        </div>
        
        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          <BalanceAnalysisCard stats={profile.stats} onClick={() => setIsStatsGridOpen(true)} />
          <RecentAchievementsCard history={victoryHistory} />
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-600 mt-8 tracking-[0.5em] opacity-50">
          СИСТЕМА ОНЛАЙН
      </div>

      <StatsGridModal 
        isOpen={isStatsGridOpen}
        onClose={() => setIsStatsGridOpen(false)}
        onSelectStat={handleSelectStat}
        profile={profile}
      />
      
      <StatHistoryModal 
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        stat={selectedStat}
        history={victoryHistory}
      />
    </div>
  );
}
