/**
 * Quest Service
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Manages daily quest generation, progress tracking, and completion
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Quest,
  QuestType,
  QuestDifficulty,
  QuestProgressUpdate,
  QuestReward,
  QuestGenerationConfig,
  QuestStatus,
} from '@/types/quests';

/**
 * Quest templates for different difficulty levels
 */
const QUEST_TEMPLATES: Record<
  QuestDifficulty,
  Array<{
    type: QuestType;
    name: string;
    description: string;
    target: number;
    xpReward: number;
  }>
> = {
  beginner: [
    {
      type: 'practice_once',
      name: 'First Steps',
      description: 'Complete 1 practice session today',
      target: 1,
      xpReward: 10,
    },
    {
      type: 'practice_duration',
      name: 'Five Minutes of Peace',
      description: 'Practice for at least 5 minutes',
      target: 300, // 5 minutes in seconds
      xpReward: 15,
    },
  ],
  intermediate: [
    {
      type: 'practice_duration',
      name: 'Devotion Deepens',
      description: 'Practice for at least 10 minutes',
      target: 600, // 10 minutes
      xpReward: 20,
    },
    {
      type: 'practice_with_sankalp',
      name: 'Intentional Practice',
      description: 'Complete a practice with sankalp (intention)',
      target: 1,
      xpReward: 25,
    },
    {
      type: 'complete_mala',
      name: 'Mala Journey',
      description: 'Complete 1 full mala (108 beads)',
      target: 1,
      xpReward: 30,
    },
  ],
  advanced: [
    {
      type: 'complete_sessions',
      name: 'Twice the Devotion',
      description: 'Complete 2 practice sessions today',
      target: 2,
      xpReward: 30,
    },
    {
      type: 'practice_duration',
      name: 'Twenty Minutes Flow',
      description: 'Practice for at least 20 minutes',
      target: 1200, // 20 minutes
      xpReward: 35,
    },
    {
      type: 'complete_mala',
      name: 'Double Mala',
      description: 'Complete 2 malas today',
      target: 2,
      xpReward: 40,
    },
  ],
  expert: [
    {
      type: 'practice_duration',
      name: 'Deep Immersion',
      description: 'Practice for at least 30 minutes with sankalp',
      target: 1800, // 30 minutes
      xpReward: 50,
    },
    {
      type: 'complete_sessions',
      name: 'Triple Practice',
      description: 'Complete 3 practice sessions today',
      target: 3,
      xpReward: 50,
    },
  ],
};

/**
 * Quest Service Class
 */
class QuestService {
  /**
   * Generate a daily quest based on user's experience level
   */
  generateDailyQuest(config: QuestGenerationConfig): Quest {
    const { userLevel, totalPractices, currentStreak } = config;

    // Determine difficulty based on user experience
    let difficulty: QuestDifficulty = userLevel;

    // Beginners (first 7 days): Simple quests
    if (totalPractices < 7) {
      difficulty = 'beginner';
    }
    // Intermediate (7-30 days): Duration-based
    else if (totalPractices < 30) {
      difficulty = 'intermediate';
    }
    // Advanced (30-100 days): Multi-session or mala-based
    else if (totalPractices < 100) {
      difficulty = 'advanced';
    }
    // Expert (100+ days or 10+ streak): Challenging quests
    else if (totalPractices >= 100 || currentStreak >= 10) {
      difficulty = 'expert';
    }

    // Get quest templates for difficulty
    const templates = QUEST_TEMPLATES[difficulty];

    // Randomly select a quest (weighted by user behavior)
    const template = this.selectQuestTemplate(templates, config);

    // Create quest instance
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999); // Quest expires at midnight

    const quest: Quest = {
      id: uuidv4(),
      type: template.type,
      difficulty,
      name: template.name,
      description: template.description,
      target: template.target,
      progress: 0,
      xpReward: template.xpReward,
      status: 'active',
      startedAt: now.toISOString(),
      expiresAt: midnight.toISOString(),
    };

    return quest;
  }

  /**
   * Select quest template with weighted randomness
   */
  private selectQuestTemplate(
    templates: typeof QUEST_TEMPLATES[QuestDifficulty],
    config: QuestGenerationConfig
  ) {
    // For now, simple random selection
    // Future: Weight by user's practice patterns (e.g., if user practices with sankalp often, bias toward those quests)
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * Update quest progress based on practice completion
   */
  updateQuestProgress(
    quest: Quest,
    update: QuestProgressUpdate
  ): { quest: Quest; isCompleted: boolean; reward: QuestReward | null } {
    if (quest.status !== 'active') {
      return { quest, isCompleted: false, reward: null };
    }

    let progressIncrement = 0;

    // Calculate progress based on quest type
    switch (quest.type) {
      case 'practice_once':
        if (update.practiceCompleted) {
          progressIncrement = 1;
        }
        break;

      case 'practice_duration':
        progressIncrement = update.duration; // Seconds
        break;

      case 'complete_sessions':
        if (update.practiceCompleted) {
          progressIncrement = 1;
        }
        break;

      case 'practice_with_sankalp':
        if (update.practiceCompleted && update.hasSankalp) {
          progressIncrement = 1;
        }
        break;

      case 'complete_mala':
        progressIncrement = update.malaCount;
        break;

      case 'practice_specific_shloka':
        // Future: Check if specific shloka was practiced
        if (update.practiceCompleted && update.shlokaId === quest.target) {
          progressIncrement = 1;
        }
        break;
    }

    // Update progress
    const newProgress = Math.min(quest.progress + progressIncrement, quest.target);
    const updatedQuest: Quest = {
      ...quest,
      progress: newProgress,
    };

    // Check if quest completed
    const isCompleted = newProgress >= quest.target;

    if (isCompleted) {
      updatedQuest.status = 'completed';
      updatedQuest.completedAt = new Date().toISOString();
    }

    // Generate reward if completed
    const reward: QuestReward | null = isCompleted
      ? {
          xp: quest.xpReward,
          message: this.getCompletionMessage(quest),
        }
      : null;

    return { quest: updatedQuest, isCompleted, reward };
  }

  /**
   * Get completion message for quest
   */
  private getCompletionMessage(quest: Quest): string {
    const messages: Record<QuestDifficulty, string[]> = {
      beginner: [
        'Great start! Your spiritual journey begins 🙏',
        'Well done! First step toward a lasting practice ✨',
        'Wonderful! You completed your first quest 🌟',
      ],
      intermediate: [
        'Excellent progress! Your devotion grows stronger 🔥',
        'Keep going! You\'re building a beautiful habit 🌸',
        'Impressive dedication! Your practice deepens 🧘',
      ],
      advanced: [
        'Outstanding commitment! You\'re a true sadhak 🏆',
        'Remarkable discipline! Your path is clear 🛤️',
        'Exceptional devotion! You inspire others 💫',
      ],
      expert: [
        'Mastery in action! Your spiritual strength shines ⭐',
        'Legendary dedication! Few reach this level 🏅',
        'Divine commitment! Your practice is exemplary 🕉️',
      ],
    };

    const options = messages[quest.difficulty];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  /**
   * Check if quest has expired
   */
  isQuestExpired(quest: Quest): boolean {
    const now = new Date();
    const expiresAt = new Date(quest.expiresAt);
    return now > expiresAt;
  }

  /**
   * Mark quest as expired if past midnight
   */
  expireQuestIfNeeded(quest: Quest): Quest {
    if (this.isQuestExpired(quest) && quest.status === 'active') {
      return {
        ...quest,
        status: 'expired',
      };
    }
    return quest;
  }

  /**
   * Calculate quest completion rate
   */
  calculateCompletionRate(
    completedQuests: number,
    totalQuests: number
  ): number {
    if (totalQuests === 0) return 0;
    return Math.round((completedQuests / totalQuests) * 100);
  }

  /**
   * Get quest progress percentage
   */
  getProgressPercentage(quest: Quest): number {
    if (quest.target === 0) return 0;
    return Math.round((quest.progress / quest.target) * 100);
  }

  /**
   * Get quest difficulty display name
   */
  getDifficultyDisplayName(difficulty: QuestDifficulty): string {
    const names: Record<QuestDifficulty, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    return names[difficulty];
  }

  /**
   * Get quest type display name
   */
  getQuestTypeDisplayName(type: QuestType): string {
    const names: Record<QuestType, string> = {
      practice_once: 'Practice Session',
      practice_duration: 'Duration Goal',
      complete_sessions: 'Multiple Sessions',
      practice_with_sankalp: 'Intentional Practice',
      complete_mala: 'Mala Completion',
      practice_specific_shloka: 'Specific Shloka',
    };
    return names[type];
  }
}

// Export singleton instance
export const questService = new QuestService();

// Export class for testing
export { QuestService };
