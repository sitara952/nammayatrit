/**
 * Ad Impression Tracker
 *
 * Lightweight in-memory tracker to prevent duplicate ad impressions within a session.
 * Tracks which ads have been shown per screen per session to avoid logging duplicates.
 *
 * Rules:
 * - Same screen + same session = Skip impression (already logged)
 * - Same screen + new session = Log impression (new app session)
 * - Different screen + same session = Log impression (different context)
 *
 * Storage: In-memory Map (resets on app restart)
 * Performance: O(1) lookups, minimal memory footprint
 */

/**
 * Simple session tracker for ad impressions
 * Maps screen names to their last logged session ID
 */
class AdImpressionTracker {
    /**
     * Map structure: { screenName: lastLoggedSessionId }
     * Example: {
     *   "homeTab_homeScreen": "session_abc123",
     *   "profileTab_homeScreen": "session_abc123"
     * }
     */
    private readonly lastLoggedSessions: Map<string, string> = new Map();

    /**
     * Check if an impression should be logged for this screen
     * @param screen - Current screen name (e.g., "homeTab_homeScreen")
     * @param currentSessionId - Current session ID from Redux auth state
     * @returns true if impression should be logged, false if it should be skipped
     */
    shouldLogImpression(screen: string, currentSessionId: string | null): boolean {
        console.info(`[AdImpressionTracker] === Checking impression for screen: ${screen} ===`);
        console.info(`[AdImpressionTracker] Current session ID: ${currentSessionId ?? 'NULL'}`);
        console.info(`[AdImpressionTracker] Current tracker state:`, JSON.stringify(this.getState()));

        // Treat null as a valid session ID (temporary session until real session is created)
        const effectiveSessionId = currentSessionId ?? 'null_session';
        console.info(`[AdImpressionTracker] Effective session ID: ${effectiveSessionId}`);

        // Get the last session ID that logged an impression for this screen
        const lastSessionId = this.lastLoggedSessions.get(screen);
        console.info(`[AdImpressionTracker] Last logged session for this screen: ${lastSessionId ?? 'NONE'}`);

        // Log impression if:
        // 1. No previous impression for this screen (first time)
        // 2. Session has changed (app restart or new session)
        if (!lastSessionId) {
            console.info(`[AdImpressionTracker] ✅ RESULT: First time seeing this screen - WILL LOG`);
            this.lastLoggedSessions.set(screen, effectiveSessionId);
            console.info(`[AdImpressionTracker] Updated tracker state:`, JSON.stringify(this.getState()));
            return true;
        }

        if (lastSessionId !== effectiveSessionId) {
            console.info(
                `[AdImpressionTracker] ✅ RESULT: Session changed (${lastSessionId} → ${effectiveSessionId}) - WILL LOG`,
            );
            this.lastLoggedSessions.set(screen, effectiveSessionId);
            console.info(`[AdImpressionTracker] Updated tracker state:`, JSON.stringify(this.getState()));
            return true;
        }

        // Skip - already logged in this session for this screen
        console.info(`[AdImpressionTracker] ❌ RESULT: Already logged in session ${effectiveSessionId} - WILL SKIP`);
        return false;
    }

    /**
     * Reset all tracked impressions
     * Useful for testing or manual session resets
     */
    reset(): void {
        this.lastLoggedSessions.clear();
        console.info('[AdImpressionTracker] Reset - All tracked impressions cleared');
    }

    /**
     * Get current state (for debugging)
     * @returns Object with all tracked screen-session pairs
     */
    getState(): Record<string, string> {
        return Object.fromEntries(this.lastLoggedSessions);
    }
}

/**
 * Singleton instance - shared across entire app
 * Export as singleton to maintain state across all components
 */
export const adImpressionTracker = new AdImpressionTracker();
