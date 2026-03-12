import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, X, Award, Eye, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_ACHIEVEMENTS, Achievement, loadAchievementsData } from '@/utils/gamificationStorage';
import { loadTodoItems } from '@/utils/todoItemsStorage';
import { loadNotesFromDB } from '@/utils/noteStorage';
import { loadStreakData } from '@/utils/streakStorage';

interface CertMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export const ProfileAchievements = ({ onViewCertificate }: { onViewCertificate?: () => void }) => {
  const { t } = useTranslation();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [milestones, setMilestones] = useState<CertMilestone[]>([]);

  useEffect(() => {
    const load = async () => {
      const [achievements, tasks, notes, streak] = await Promise.all([
        loadAchievementsData(),
        loadTodoItems(),
        loadNotesFromDB(),
        loadStreakData('npd_streak'),
      ]);
      setUnlockedIds(achievements.unlockedAchievements);

      const completed = tasks.filter(t => t.completed).length;
      setMilestones([
        {
          id: 'beginner', title: t('cert.beginner', 'Beginner'),
          description: t('cert.beginnerDesc', 'Complete 10 tasks & create 5 notes'),
          icon: '🌱', unlocked: completed >= 10 && notes.length >= 5,
          progress: Math.min(100, ((Math.min(completed, 10) + Math.min(notes.length, 5)) / 15) * 100),
        },
        {
          id: 'intermediate', title: t('cert.intermediate', 'Intermediate'),
          description: t('cert.intermediateDesc', 'Complete 50 tasks & 7-day streak'),
          icon: '⭐', unlocked: completed >= 50 && streak.longestStreak >= 7,
          progress: Math.min(100, ((Math.min(completed, 50) / 50 + Math.min(streak.longestStreak, 7) / 7) / 2) * 100),
        },
        {
          id: 'advanced', title: t('cert.advanced', 'Advanced'),
          description: t('cert.advancedDesc', 'Complete 200 tasks & 30-day streak'),
          icon: '🏆', unlocked: completed >= 200 && streak.longestStreak >= 30,
          progress: Math.min(100, ((Math.min(completed, 200) / 200 + Math.min(streak.longestStreak, 30) / 30) / 2) * 100),
        },
        {
          id: 'master', title: t('cert.master', 'Master'),
          description: t('cert.masterDesc', 'Complete 500 tasks & 100-day streak'),
          icon: '👑', unlocked: completed >= 500 && streak.longestStreak >= 100,
          progress: Math.min(100, ((Math.min(completed, 500) / 500 + Math.min(streak.longestStreak, 100) / 100) / 2) * 100),
        },
      ]);
    };
    load();
  }, []);

  const earnedBadges = ALL_ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
  const lockedBadges = ALL_ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
  const displayBadges = [...earnedBadges, ...lockedBadges];

  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-3">{t('profile.achievementsTitle', 'Achievements')}</h3>

      {/* Badges - Duolingo-style cards */}
      <div className="space-y-3">
        {displayBadges.slice(0, 6).map((badge, i) => {
          const isUnlocked = unlockedIds.includes(badge.id);
          return (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedBadge(badge)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                isUnlocked
                  ? "bg-card border-border/50 hover:border-primary/30"
                  : "bg-muted/20 border-border/30 opacity-60"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0",
                isUnlocked
                  ? "bg-gradient-to-br from-warning/20 to-warning/5 shadow-sm"
                  : "bg-muted/50"
              )}>
                {isUnlocked ? badge.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                  {badge.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{badge.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </motion.button>
          );
        })}

        {displayBadges.length > 6 && (
          <button
            onClick={() => setSelectedBadge(displayBadges[0])}
            className="w-full text-center text-sm font-semibold text-primary py-2"
          >
            {t('profile.viewAll', 'VIEW ALL')}
          </button>
        )}
      </div>

      {/* Certificates Section */}
      <h3 className="text-lg font-bold text-foreground mt-6 mb-3">{t('profile.certificatesTitle', 'Certificates')}</h3>
      <div className="space-y-3">
        {milestones.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border",
              cert.unlocked
                ? "bg-card border-primary/20"
                : "bg-muted/20 border-border/30"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0",
              cert.unlocked ? "bg-primary/10" : "bg-muted/50"
            )}>
              {cert.unlocked ? cert.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold", cert.unlocked ? "text-foreground" : "text-muted-foreground")}>
                {cert.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{cert.description}</p>
              {!cert.unlocked && (
                <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cert.progress}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-warning rounded-full"
                  />
                </div>
              )}
            </div>
            {cert.unlocked && (
              <button
                onClick={onViewCertificate}
                className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-t-3xl border-t border-border w-full max-w-md p-6 pb-10 text-center shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4",
                unlockedIds.includes(selectedBadge.id)
                  ? "bg-gradient-to-br from-warning/20 to-warning/5 shadow-lg"
                  : "bg-muted"
              )}>
                {unlockedIds.includes(selectedBadge.id)
                  ? selectedBadge.icon
                  : <Lock className="h-8 w-8 text-muted-foreground" />
                }
              </div>
              <h3 className="text-xl font-bold text-foreground">{selectedBadge.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{selectedBadge.description}</p>
              <div className={cn(
                "mt-5 inline-block px-4 py-1.5 rounded-full text-xs font-semibold",
                unlockedIds.includes(selectedBadge.id)
                  ? "bg-success/20 text-success"
                  : "bg-muted text-muted-foreground"
              )}>
                {unlockedIds.includes(selectedBadge.id)
                  ? t('profile.badgeUnlocked', '✅ Unlocked')
                  : t('profile.badgeLocked', '🔒 Locked')
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
