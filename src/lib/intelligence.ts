import { Task } from '@/store/useTaskStore';
import { UserLocation } from '@/store/useContextStore';

/**
 * Calculates a relevance score for a task based on the environment.
 * Higher score = Higher priority to show.
 */
export function calculateTaskScore(
    task: Task,
    currentContext: UserLocation | null,
    availableTimeMinutes: number = 60 // Default assumption if not user-specified
): number {
    let score = 0;

    // 1. Context Specificity Match (Biggest Factor)
    // If task is specifically for this location, boost it significantly.
    if (currentContext && task.context === currentContext.name) {
        score += 50;
    } else if (task.context === 'Anywhere') {
        // Anywhere tasks are good fallback, but specific ones take precedence
        score += 20;
    } else if (currentContext && task.context !== currentContext.name) {
        // Wrong context! (e.g. @Work task while @Home)
        // In strict mode we hide these, but if showing all, they get strictly penalized.
        return -100;
    }

    // 2. Duration / "Quick Win" Bonus
    // If task fits comfortably in available time, boost it.
    if (task.duration <= availableTimeMinutes) {
        score += 10;

        // Perfect fit bonus (e.g. 15m task for 20m window)
        if (task.duration >= availableTimeMinutes * 0.5) {
            score += 5;
        }
    } else {
        // Too long for right now
        score -= 20;
    }

    // 3. Status Priority (TODO vs DONE)
    // We naturally filter DONE, but in case mixed:
    if (task.status === 'DONE') score = -999;

    // 4. Age Bonus (Prevent rot)
    // Add 1 point per day old, max 10 points.
    const daysOld = (Date.now() - task.createdAt) / (1000 * 60 * 60 * 24);
    score += Math.min(daysOld, 10);

    return score;
}

/**
 * Sorts tasks by the calculated score.
 */
export function sortTasksByRelevance(
    tasks: Task[],
    currentContext: UserLocation | null
): Task[] {
    return [...tasks].sort((a, b) => {
        const scoreA = calculateTaskScore(a, currentContext);
        const scoreB = calculateTaskScore(b, currentContext);
        return scoreB - scoreA; // Descending
    });
}
