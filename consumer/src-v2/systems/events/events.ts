import { NativeModules } from 'react-native';
import AppMonitor from '@/src-v2/modules/AppMonitor/AppMonitor';

export enum EventType {
    ON_CREATE_TO_APP = 'onCreateToApp',
    ON_CREATE_TO_HOME = 'onCreateToHome',
    ON_CREATE_TO_ONBOARDING = 'onCreateToOnboarding',
    ON_CREATE_TO_REVIEW = 'onCreateToReview',
    ON_CREATE_TO_RIDE = 'onCreateToRide',
    ON_CREATE_TO_DELIVERY_SCREEN = 'onCreateToDeliveryScreen',
    ON_CREATE_TO_AMBULANCE_SCREEN = 'onCreateToAmbulanceScreen',
    ON_CREATE_TO_LOOKING_FOR_RIDES = 'onCreateToLookingForRides',
    ON_CREATE_TO_HIDE_SPLASH = 'onCreateToHideSplash',
}

class Events {
    private markedFirstScreenRender = false;
    private markedHideSplash = false;
    private startUpTime: number | undefined = undefined;

    constructor() {
        this.getStartUpTime();
    }

    private async getStartUpTime() {
        const { MainAppUtils } = NativeModules;
        const appStartTime = await MainAppUtils.getAppStartTime();
        this.startUpTime = appStartTime;
        return appStartTime;
    }

    private async ensureStartUpTime(): Promise<number | undefined> {
        if (this.startUpTime === undefined) {
            this.startUpTime = await this.getStartUpTime();
        }
        return this.startUpTime;
    }

    private computeLoadTime(startTime: number): number {
        return Date.now() - startTime;
    }

    public async markFirstScreenRender(eventType: EventType): Promise<void> {
        const startTime = await this.ensureStartUpTime();
        if (startTime) {
            if (!this.markedFirstScreenRender) {
                this.markedFirstScreenRender = true;
                const loadTime = this.computeLoadTime(startTime);
                this.markPerformance(eventType, loadTime);
            }
        }
    }

    public async markHideSplash(): Promise<void> {
        const startTime = await this.ensureStartUpTime();
        if (startTime) {
            if (!this.markedHideSplash) {
                this.markedHideSplash = true;
                const loadTime = this.computeLoadTime(startTime);
                this.markPerformance(EventType.ON_CREATE_TO_HIDE_SPLASH, loadTime);
            }
        }
    }

    public async markOnCreateToApp() {
        const startTime = await this.ensureStartUpTime();
        if (startTime) {
            const loadTime = this.computeLoadTime(startTime);
            this.markPerformance(EventType.ON_CREATE_TO_APP, loadTime);
        }
    }

    private markPerformance(key: EventType, duration: number) {
        AppMonitor.addMetric(key, duration);
    }

    public markScreenRender(component: string, duration: number) {
        AppMonitor.addMetric(`Screen.${component}`, duration);
    }
}

export const events = new Events();
