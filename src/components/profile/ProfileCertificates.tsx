import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { m as motion } from 'framer-motion';
import { Award, ChevronRight, Lock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadTodoItems } from '@/utils/todoItemsStorage';
import { loadNotesFromDB } from '@/utils/noteStorage';
import { loadStreakData } from '@/utils/streakStorage';
import { loadFolders } from '@/utils/folderStorage';

interface CertMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirements: { tasks: number; streak: number; notes: number };
  unlocked: boolean;
  progress: number; // 0-100
}

export const ProfileCertificates = ({ onViewCertificate }: { onViewCertificate?: () => void }) => {
  const { t } = useTranslation();
  const [milestones, setMilestones] = useState<CertMilestone[]>([]);

  useEffect(() => {
    const load = async () => {
      const [tasks, notes, streak] = await Promise.all([
        loadTodoItems(),
        loadNotesFromDB(),
        loadStreakData('npd_streak'),
      ]);
      const completed = tasks.filter(t => t.completed).length;

      const certs: CertMilestone[] = [
        {
          id: 'beginner',
          title: t('cert.beginner', 'Beginner'),
          description: t('cert.beginnerDesc', 'Complete 10 tasks & create 5 notes'),
          icon: '🌱',
          requirements: { tasks: 10, streak: 0, notes: 5 },
          unlocked: completed >= 10 && notes.length >= 5,
          progress: Math.min(100, ((Math.min(completed, 10) + Math.min(notes.length, 5)) / 15) * 100),
        },
        {
          id: 'intermediate',
          title: t('cert.intermediate', 'Intermediate'),
          description: t('cert.intermediateDesc', 'Complete 50 tasks & 7-day streak'),
          icon: '⭐',
          requirements: { tasks: 50, streak: 7, notes: 0 },
          unlocked: completed >= 50 && streak.longestStreak >= 7,
          progress: Math.min(100, ((Math.min(completed, 50) / 50 + Math.min(streak.longestStreak, 7) / 7) / 2) * 100),
        },
        {
          id: 'advanced',
          title: t('cert.advanced', 'Advanced'),
          description: t('cert.advancedDesc', 'Complete 200 tasks & 30-day streak'),
          icon: '🏆',
          requirements: { tasks: 200, streak: 30, notes: 0 },
          unlocked: completed >= 200 && streak.longestStreak >= 30,
          progress: Math.min(100, ((Math.min(completed, 200) / 200 + Math.min(streak.longestStreak, 30) / 30) / 2) * 100),
        },
        {
          id: 'master',
          title: t('cert.master', 'Master'),
          description: t('cert.masterDesc', 'Complete 500 tasks & 100-day streak'),
          icon: '👑',
          requirements: { tasks: 500, streak: 100, notes: 0 },
          unlocked: completed >= 500 && streak.longestStreak >= 100,
          progress: Math.min(100, ((Math.min(completed, 500) / 500 + Math.min(streak.longestStreak, 100) / 100) / 2) * 100),
        },
      ];
      setMilestones(certs);
    };
    load();
  }, []);

  if (milestones.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {t('profile.certificatesTitle', 'Certificates')}
          </h3>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {milestones.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              cert.unlocked
                ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/20"
                : "bg-muted/20 border-border/30"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0",
              cert.unlocked ? "bg-primary/10" : "bg-muted/50"
            )}>
              {cert.unlocked ? cert.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                cert.unlocked ? "text-foreground" : "text-muted-foreground"
              )}>
                {cert.title}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{cert.description}</p>
              {/* Progress bar */}
              {!cert.unlocked && (
                <div className="mt-1.5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all"
                    style={{ width: `${cert.progress}%` }}
                  />
                </div>
              )}
            </div>
            {cert.unlocked && (
              <button
                onClick={onViewCertificate}
                className="shrink-0 p-1.5 rounded-lg bg-primary/10 text-primary"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
