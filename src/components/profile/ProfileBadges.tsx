import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_ACHIEVEMENTS, Achievement, loadAchievementsData } from '@/utils/gamificationStorage';

export const ProfileBadges = () => {
  const { t } = useTranslation();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  useEffect(() => {
    loadAchievementsData().then(d => setUnlockedIds(d.unlockedAchievements));
  }, []);

  const earnedBadges = ALL_ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
  const lockedBadges = ALL_ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
  const displayBadges = [...earnedBadges, ...lockedBadges];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">
              {t('profile.achievementsTitle', 'Achievements & Badges')}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {earnedBadges.length}/{ALL_ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {displayBadges.map((badge) => {
              const isUnlocked = unlockedIds.includes(badge.id);
              return (
                <motion.button
                  key={badge.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBadge(badge)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl min-w-[64px] transition-all",
                    isUnlocked
                      ? "bg-gradient-to-br from-warning/15 to-warning/5 border border-warning/20"
                      : "bg-muted/30 opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center text-lg",
                    isUnlocked
                      ? "bg-gradient-to-br from-warning to-orange-500 shadow-md"
                      : "bg-muted"
                  )}>
                    {isUnlocked ? badge.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <span className="text-[9px] font-medium text-center leading-tight line-clamp-2 w-14">
                    {badge.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-card rounded-2xl border p-6 w-full max-w-xs text-center shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-3 right-3 p-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4",
                unlockedIds.includes(selectedBadge.id)
                  ? "bg-gradient-to-br from-warning to-orange-500 shadow-lg"
                  : "bg-muted"
              )}>
                {unlockedIds.includes(selectedBadge.id)
                  ? selectedBadge.icon
                  : <Lock className="h-8 w-8 text-muted-foreground" />
                }
              </div>
              <h3 className="text-lg font-bold text-foreground">{selectedBadge.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedBadge.description}</p>
              <div className={cn(
                "mt-4 inline-block px-3 py-1 rounded-full text-xs font-medium",
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
