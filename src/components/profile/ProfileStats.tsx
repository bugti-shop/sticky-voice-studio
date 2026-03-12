import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { m as motion } from 'framer-motion';
import { FileText, CheckCircle2, Trophy, Flame, Palette, CalendarDays } from 'lucide-react';
import { loadNotesFromDB } from '@/utils/noteStorage';
import { loadTodoItems } from '@/utils/todoItemsStorage';
import { loadAchievementsData, ALL_ACHIEVEMENTS } from '@/utils/gamificationStorage';
import { loadStreakData } from '@/utils/streakStorage';

interface StatsData {
  notesCreated: number;
  tasksCompleted: number;
  badgesEarned: number;
  currentStreak: number;
  daysActive: number;
  totalTasks: number;
}

export const useProfileStats = () => {
  const [stats, setStats] = useState<StatsData>({
    notesCreated: 0,
    tasksCompleted: 0,
    badgesEarned: 0,
    currentStreak: 0,
    daysActive: 0,
    totalTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [notes, tasks, achievements, streak] = await Promise.all([
          loadNotesFromDB(),
          loadTodoItems(),
          loadAchievementsData(),
          loadStreakData('npd_streak'),
        ]);

        const completed = tasks.filter(t => t.completed).length;
        setStats({
          notesCreated: notes.length,
          tasksCompleted: completed,
          badgesEarned: achievements.unlockedAchievements.length,
          currentStreak: streak.currentStreak,
          daysActive: streak.totalCompletions,
          totalTasks: tasks.length,
        });
      } catch (e) {
        console.error('Failed to load profile stats:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { stats, isLoading };
};

interface QuickStatsProps {
  stats: StatsData;
}

export const QuickStats = ({ stats }: QuickStatsProps) => {
  const { t } = useTranslation();

  const items = [
    { icon: FileText, value: stats.notesCreated, label: t('profile.statNotes', 'Notes') },
    { icon: CheckCircle2, value: stats.tasksCompleted, label: t('profile.statTasks', 'Completed') },
    { icon: Trophy, value: stats.badgesEarned, label: t('profile.statBadges', 'Badges') },
  ];

  return (
    <div className="flex gap-3 w-full">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex-1 bg-card/80 backdrop-blur-sm rounded-xl p-3 text-center border border-border/50"
        >
          <item.icon className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{item.value}</p>
          <p className="text-[10px] text-muted-foreground">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

interface DetailedStatsProps {
  stats: StatsData;
}

export const DetailedStats = ({ stats }: DetailedStatsProps) => {
  const { t } = useTranslation();

  const metrics = [
    { icon: FileText, label: t('profile.notesCreated', 'Notes Created'), value: stats.notesCreated, color: 'text-primary' },
    { icon: CheckCircle2, label: t('profile.tasksCompleted', 'Tasks Completed'), value: stats.tasksCompleted, color: 'text-success' },
    { icon: Flame, label: t('profile.currentStreak', 'Current Streak'), value: `${stats.currentStreak} days`, color: 'text-warning' },
    { icon: CalendarDays, label: t('profile.daysActive', 'Days Active'), value: stats.daysActive, color: 'text-accent-foreground' },
    { icon: Trophy, label: t('profile.badgesEarned', 'Badges Earned'), value: `${stats.badgesEarned}/${ALL_ACHIEVEMENTS.length}`, color: 'text-warning' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">{t('profile.statsTitle', 'Your Activity')}</h3>
      </div>
      <div className="divide-y divide-border/30">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-sm text-foreground">{m.label}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{m.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
