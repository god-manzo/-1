
import { useState, useEffect, useCallback } from 'react';
import { GameState, SystemAnalysis, DailyRecord, SystemReport, SeasonalReport, SeasonalArchetype } from '../types';

const ANALYSIS_STORAGE_KEY = 'rpg-diary-analysis-v1';
const ANALYSIS_VERSION = 1;
const SEASON_LENGTH_DAYS = 90;

const todayKey = () => new Date().toISOString().slice(0, 10);

const initialAnalysisState: SystemAnalysis = {
    version: ANALYSIS_VERSION,
    dailyRecords: {},
    lastAnalysisDate: new Date(0).toISOString().slice(0, 10), // Start from epoch
};

// --- Persistence ---
function loadAnalysis(): SystemAnalysis {
    try {
        const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
        if (!raw) return initialAnalysisState;
        const parsed = JSON.parse(raw);
        return parsed.version === ANALYSIS_VERSION ? parsed : initialAnalysisState;
    } catch {
        return initialAnalysisState;
    }
}

function saveAnalysis(analysis: SystemAnalysis) {
    localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
}

// --- Date Helpers ---
const getDateKey = (date: Date) => date.toISOString().slice(0, 10);
const getDayOfWeek = (date: Date) => { const day = date.getDay(); return day === 0 ? 6 : day - 1; }; // Mon=0, Sun=6
const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = (date.getTime() - start.getTime() + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay / 7) + 1;
};

// --- Analysis Logic ---
const generateWeeklyReport = (records: DailyRecord[]): SystemReport | null => {
    if (records.length < 7) return null;
    const completed = records.reduce((sum, r) => sum + r.completed, 0);
    const created = records.reduce((sum, r) => sum + r.created, 0);
    const missed = records.reduce((sum, r) => sum + r.missed, 0);
    const total = completed + missed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let trend = "Стабильность.";
    if (completionRate > 80) trend = "Высокая производительность.";
    else if (completionRate < 50 && missed > completed) trend = "Обнаружено избегание директив.";
    else if (created > completed * 2) trend = "Фиксируется перегрузка входящих.";

    return {
        period: `Неделя ${getWeekNumber(new Date(records[records.length - 1].date))}`,
        fact: `Завершено ${completed} из ${total} директив (${completionRate}%).`,
        trend,
        generatedAt: todayKey(),
    };
};

const determineSeasonalArchetype = (records: DailyRecord[]): SeasonalArchetype => {
    if (records.length < SEASON_LENGTH_DAYS * 0.8) return SeasonalArchetype.VOID;
    
    const completed = records.reduce((sum, r) => sum + r.completed, 0);
    const total = completed + records.reduce((sum, r) => sum + r.missed, 0);
    const rate = total > 0 ? completed / total : 0;
    
    const firstHalf = records.slice(0, Math.floor(records.length / 2));
    const secondHalf = records.slice(Math.floor(records.length / 2));
    const firstHalfRate = firstHalf.reduce((s,r)=>s+r.completed,0) / (firstHalf.reduce((s,r)=>s+r.completed,0) + firstHalf.reduce((s,r)=>s+r.missed,0) || 1);
    const secondHalfRate = secondHalf.reduce((s,r)=>s+r.completed,0) / (secondHalf.reduce((s,r)=>s+r.completed,0) + secondHalf.reduce((s,r)=>s+r.missed,0) || 1);

    if (rate > 0.75) return SeasonalArchetype.STABLE_GROWTH;
    if (rate > 0.5 && secondHalfRate > firstHalfRate) return SeasonalArchetype.RECOVERY;
    if (rate > 0.5) return SeasonalArchetype.UNSTABLE_GROWTH;
    if (rate > 0.3) return SeasonalArchetype.STAGNATION;
    if (secondHalfRate < firstHalfRate * 0.5) return SeasonalArchetype.CRASH;
    return SeasonalArchetype.REGRESSION;
};

const generateSeasonalReport = (records: DailyRecord[], seasonStartDate: Date): SeasonalReport | null => {
    if (records.length === 0) return null;
    const archetype = determineSeasonalArchetype(records);
    const totalCompleted = records.reduce((s,r)=>s+r.completed,0);

    return {
        period: `Сезон (Начало ${getDateKey(seasonStartDate)})`,
        fact: `Выполнено директив: ${totalCompleted}.`,
        trend: `Траектория соответствует архетипу.`,
        archetype,
        generatedAt: todayKey(),
    };
}


export function useSystemAnalysis(gameState: GameState) {
    const [analysis, setAnalysis] = useState<SystemAnalysis>(loadAnalysis);

    useEffect(() => {
        saveAnalysis(analysis);
    }, [analysis]);

    const runAnalysis = useCallback(() => {
        const today = new Date();
        const lastDate = new Date(analysis.lastAnalysisDate);
        
        let newRecords = { ...analysis.dailyRecords };
        let hasNewData = false;
        
        // Backfill daily records from last analysis date to yesterday
        for (let d = new Date(lastDate); d < today; d.setDate(d.getDate() + 1)) {
            const dateKey = getDateKey(d);
            if (!newRecords[dateKey]) {
                const missedTasks = gameState.tasks.filter(t => t.dueDate === dateKey && !gameState.completedToday[t.id]).length;
                newRecords[dateKey] = {
                    date: dateKey,
                    completed: 0, // This is a simplification; a more robust system would log completions by date
                    created: gameState.tasks.filter(t => t.createdAt.startsWith(dateKey)).length,
                    missed: missedTasks,
                };
                hasNewData = true;
            }
        }

        // Update today's record
        const todayDateKey = getDateKey(today);
        const completedTodayCount = Object.keys(gameState.completedToday).length;
        if (!newRecords[todayDateKey] || newRecords[todayDateKey].completed !== completedTodayCount) {
             newRecords[todayDateKey] = {
                ...newRecords[todayDateKey],
                date: todayDateKey,
                completed: completedTodayCount,
                created: gameState.tasks.filter(t => t.createdAt.startsWith(todayDateKey)).length,
             };
             hasNewData = true;
        }

        if (!hasNewData && analysis.lastAnalysisDate === getDateKey(new Date(today.setDate(today.getDate()-1)))) return; // No need to re-run for today if no new data

        let newState: SystemAnalysis = { ...analysis, dailyRecords: newRecords, lastAnalysisDate: todayKey() };

        // --- Generate Reports ---
        const todayObj = new Date();
        const isSunday = getDayOfWeek(todayObj) === 6;
        if(isSunday) {
            const weekRecords = Object.values(newRecords).slice(-7);
            newState.weeklyReport = generateWeeklyReport(weekRecords) ?? newState.weeklyReport;
        }

        const isEndOfMonth = todayObj.getDate() === new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0).getDate();
        if(isEndOfMonth) {
            const monthRecords = Object.values(newRecords).filter(r => r.date.startsWith(todayObj.toISOString().slice(0, 7)));
             newState.monthlyReport = { // Simplified monthly report
                period: `Месяц ${todayObj.getMonth() + 1}`,
                fact: `Всего выполнено: ${monthRecords.reduce((s,r) => s + r.completed, 0)} директив.`,
                trend: "Анализ месячной динамики в разработке.",
                generatedAt: todayKey(),
            }
        }

        const daysSinceJoin = (new Date().getTime() - new Date(gameState.profile.joinedAt).getTime()) / (1000 * 3600 * 24);
        const seasonIndex = Math.floor(daysSinceJoin / SEASON_LENGTH_DAYS);
        const lastSeasonIndex = Math.floor((daysSinceJoin - 1) / SEASON_LENGTH_DAYS);

        if (seasonIndex > lastSeasonIndex) { // New season just started
            const seasonStartDate = new Date(gameState.profile.joinedAt);
            seasonStartDate.setDate(seasonStartDate.getDate() + (lastSeasonIndex * SEASON_LENGTH_DAYS));
            
            const seasonRecords = Object.values(newRecords).filter(r => r.date >= getDateKey(seasonStartDate) && r.date < todayKey());
            newState.seasonalReport = generateSeasonalReport(seasonRecords, seasonStartDate) ?? newState.seasonalReport;
        }

        setAnalysis(newState);

    }, [analysis, gameState]);

    return { systemAnalysis: analysis, runAnalysis };
}
