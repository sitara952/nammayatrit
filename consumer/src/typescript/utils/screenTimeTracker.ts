/* eslint-disable functional/immutable-data */
import { AppState, AppStateStatus } from 'react-native';
import AppMonitor from '@/src-v2/modules/AppMonitor/AppMonitor';
import { EventName } from './loggerEnums';
import { store } from '@/typescript/state/store';
import { selectAuth } from '@/typescript/state/client/auth';
import { selectUserId } from '@/typescript/state/client/user';

interface ScreenTimeState {
    currentScreen: string | null;
    screenStartTime: number | null;
    previousScreen: string | null;
    isTracking: boolean;
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    appStateSubscription: any;
}

class ScreenTimeTracker {
    private readonly state: ScreenTimeState = {
        currentScreen: null,
        screenStartTime: null,
        previousScreen: null,
        isTracking: false,
        appStateSubscription: null,
    };

    initialize(): void {
        if (this.state.isTracking) {
            return;
        }

        this.state.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
        this.state.isTracking = true;
    }

    startTracking(screenName: string): void {
        if (!this.state.isTracking) {
            return;
        }

        const now = Date.now();

        // Update state
        this.state.previousScreen = this.state.currentScreen;
        this.state.currentScreen = screenName;
        this.state.screenStartTime = now;
    }

    stopTrackingAndLog(nextScreen: string | null, exitReason: 'navigation' | 'app_background'): void {
        if (!this.state.isTracking) {
            return;
        }

        if (!this.state.currentScreen || !this.state.screenStartTime) {
            return;
        }

        const now = Date.now();
        const durationMs = now - this.state.screenStartTime;

        const state = store.getState();
        const auth = selectAuth(state);
        const userId = selectUserId(state);

        const payload = {
            screen: this.state.currentScreen,
            duration_ms: durationMs,
            previous_screen: this.state.previousScreen || 'unknown',
            next_screen: nextScreen,
            exit_reason: exitReason,
            session_id: auth.sessionId || 'unknown',
            user_id: userId || 'unknown',
            timestamp: now,
        };

        const eventType =
            exitReason === 'app_background' ? EventName.SCREEN_DURATION_APP_CLOSED : EventName.SCREEN_DURATION;

        try {
            AppMonitor.addEvent(eventType, eventType, payload);
        } catch (error) {
            console.error(`[ScreenTimeTracker] ❌ ERROR pushing event to AppMonitor:`, error);
        }

        if (exitReason === 'app_background') {
            this.state.screenStartTime = null;
        }
    }

    private readonly handleAppStateChange = (nextAppState: AppStateStatus): void => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
            this.stopTrackingAndLog(null, 'app_background');
        } else if (nextAppState === 'active') {
            if (this.state.currentScreen && !this.state.screenStartTime) {
                this.state.screenStartTime = Date.now();
            }
        }
    };

    cleanup(): void {
        if (this.state.appStateSubscription) {
            this.state.appStateSubscription.remove();
            this.state.appStateSubscription = null;
        }

        this.state.isTracking = false;
        this.state.currentScreen = null;
        this.state.screenStartTime = null;
        this.state.previousScreen = null;
    }

    getState(): Readonly<ScreenTimeState> {
        return { ...this.state };
    }
}

const screenTimeTracker = new ScreenTimeTracker();
export default screenTimeTracker;
