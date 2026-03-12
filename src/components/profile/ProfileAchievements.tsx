import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, ChevronRight, Sparkles } from 'lucide-react';
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

interface BadgeProgress {
  current: number;
  target: number;
  percent: number;
}

const computeBadgeProgress = (
  badge: Achievement,
  streakCurrent: number,
  tasksCompleted: number,
  dailyMax: number,
  freezeCount: number,
  specialFlags: Record<string, boolean>
): BadgeProgress => {
  const target = badge.requirement;
  let current = 0;

  switch (badge.category) {
    case 'streak':
      current = Math.min(streakCurrent, target);
      break;
    case 'tasks':
      current = Math.min(tasksCompleted, target);
      break;
    case 'consistency':
      current = Math.min(dailyMax, target);
      break;
    case 'special':
      if (badge.id === 'freeze_collector') current = Math.min(freezeCount, target);
      else current = specialFlags[badge.id] ? 1 : 0;
      break;
  }

  return { current, target, percent: Math.min(100, (current / target) * 100) };
};

export const ProfileAchievements = ({ onViewCertificate }: { onViewCertificate?: () => void }) => {
  const { t } = useTranslation();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [milestones, setMilestones] = useState<CertMilestone[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, BadgeProgress>>({});

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

      // Compute per-badge progress
      const pMap: Record<string, BadgeProgress> = {};
      ALL_ACHIEVEMENTS.forEach(badge => {
        pMap[badge.id] = computeBadgeProgress(
          badge,
          streak.currentStreak,
          completed,
          0, // dailyMax - simplified
          0, // freezeCount - simplified
          {} // specialFlags
        );
      });
      setProgressMap(pMap);

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

      {/* Badges - horizontal scroll */}
      <div className="overflow-x-auto -mx-5 px-5 pb-2 scrollbar-hide">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {displayBadges.map((badge, i) => {
            const isUnlocked = unlockedIds.includes(badge.id);
            const progress = progressMap[badge.id];
            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-2xl border transition-all relative overflow-hidden w-[90px] shrink-0",
                  isUnlocked
                    ? "bg-card border-warning/30"
                    : "bg-muted/20 border-border/30 opacity-60"
                )}
              >
                {isUnlocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-warning/10 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  />
                )}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl relative",
                  isUnlocked
                    ? "bg-gradient-to-br from-warning/25 to-warning/10"
                    : "bg-muted/50"
                )}>
                  {isUnlocked ? (
                    <>
                      {badge.icon}
                      <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-warning" />
                    </>
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className={cn("text-[10px] font-semibold mt-1.5 text-center leading-tight line-clamp-2", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                  {badge.name}
                </p>
                {/* Progress bar */}
                <div className="w-full mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${isUnlocked ? 100 : (progress?.percent || 0)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className={cn(
                      "h-full rounded-full",
                      isUnlocked
                        ? "bg-gradient-to-r from-success to-success/70"
                        : "bg-gradient-to-r from-warning to-warning/70"
                    )}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
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
              "flex items-center gap-4 p-4 rounded-2xl border relative overflow-hidden",
              cert.unlocked
                ? "bg-card border-primary/20"
                : "bg-muted/20 border-border/30"
            )}
          >
            {cert.unlocked && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/8 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2.5, delay: i * 0.2, repeat: Infinity, repeatDelay: 6 }}
              />
            )}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0",
              cert.unlocked ? "bg-primary/10" : "bg-muted/50"
            )}>
              {cert.unlocked ? cert.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0 relative z-10">
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
              {cert.unlocked && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="mt-2 h-2 rounded-full bg-gradient-to-r from-success via-success/80 to-success/60"
                />
              )}
            </div>
            {cert.unlocked && (
              <button
                onClick={onViewCertificate}
                className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors relative z-10"
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

              {/* Badge icon with celebration */}
              <motion.div
                className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 relative",
                  unlockedIds.includes(selectedBadge.id)
                    ? "bg-gradient-to-br from-warning/25 to-warning/10 shadow-lg"
                    : "bg-muted"
                )}
              >
                {unlockedIds.includes(selectedBadge.id) ? (
                  <>
                    <motion.span
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                    >
                      {selectedBadge.icon}
                    </motion.span>
                    {/* Celebration particles */}
                    {[...Array(6)].map((_, pi) => (
                      <motion.div
                        key={pi}
                        className="absolute w-2 h-2 rounded-full bg-warning"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{
                          opacity: 0,
                          scale: 0,
                          x: Math.cos((pi * 60 * Math.PI) / 180) * 50,
                          y: Math.sin((pi * 60 * Math.PI) / 180) * 50,
                        }}
                        transition={{ duration: 0.8, delay: 0.3 + pi * 0.05 }}
                      />
                    ))}
                  </>
                ) : (
                  <Lock className="h-10 w-10 text-muted-foreground" />
                )}
              </motion.div>

              <h3 className="text-xl font-bold text-foreground">{selectedBadge.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{selectedBadge.description}</p>

              {/* Progress in modal */}
              {progressMap[selectedBadge.id] && (
                <div className="mt-4 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{t('profile.progress', 'Progress')}</span>
                    <span>{progressMap[selectedBadge.id].current}/{progressMap[selectedBadge.id].target}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${unlockedIds.includes(selectedBadge.id) ? 100 : progressMap[selectedBadge.id].percent}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn(
                        "h-full rounded-full",
                        unlockedIds.includes(selectedBadge.id)
                          ? "bg-gradient-to-r from-success to-success/70"
                          : "bg-gradient-to-r from-warning to-warning/70"
                      )}
                    />
                  </div>
                </div>
              )}

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
