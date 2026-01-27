import Config from 'react-native-config';
import { createMMKV } from '@/utils/mmkvUtils';
import 'react-native-get-random-values';
import uuid from 'react-native-uuid';
import AppMonitor from '@/src-v2/modules/AppMonitor/AppMonitor';

const LOGGER_ENVIRONMENT_NAME = 'LOGGER_ENVIRONEMT_NAME';

declare global {
    interface Window {
        localEnvironment: string | undefined;
    }
}

const setMasterEnvToWindow = (uniqName: string) => {
    try {
        // dont use the below variable any where in code,
        // it is just for debugging purose in master env.
        window.localEnvironment = uniqName;
    } catch {
        /* empty */
    }
};

export const getEnvironmentName = () => {
    const env = Config['SDK_ENV'];
    const storage = createMMKV();
    const uniqName = storage.getString(LOGGER_ENVIRONMENT_NAME);
    if (uniqName) {
        setMasterEnvToWindow(uniqName);
        return uniqName;
    } else {
        const uniqName = uuid.v4() + (env === 'production' ? '-p' : '');
        setMasterEnvToWindow(uniqName);
        storage.set(LOGGER_ENVIRONMENT_NAME, uniqName);
        return uniqName;
    }
};

class logger {
    static logApiError(message: string, error: { [key: string]: string }) {
        logger.addLog('error', message, 'api_error', error, false);
    }

    static logApiRequest(message: string) {
        logger.addLog('info', message, 'api_request', {}, false);
    }

    static logApiResponse(message: string) {
        logger.addLog('info', message, 'api_response', {}, false);
    }

    static logDebug(message: string, tag: string) {
        logger.addLog('debug', message, tag, {}, true);
    }

    static logDebugWithPayload(message: string, tag: string, labels: { [key: string]: string }) {
        logger.addLog('debug', message, tag, labels, true);
    }

    static logError(message: string, tag: string) {
        logger.addLog('error', message, tag, {}, true);
    }

    static logErrorWithPayload(message: string, tag: string, labels: { [key: string]: string }) {
        logger.addLog('error', message, tag, labels, true);
    }

    static logInfo(message: string, tag: string) {
        logger.addLog('info', message, tag, {}, true);
    }

    static logInfoWithPayload(message: string, tag: string, labels: { [key: string]: string }) {
        logger.addLog('info', message, tag, labels, true);
    }

    static logWarn(message: string, tag: string) {
        logger.addLog('warn', message, tag, {}, true);
    }

    static logWarnWithPayload(message: string, tag: string, labels: { [key: string]: string }) {
        logger.addLog('warn', message, tag, labels, true);
    }

    private static addConsoleLog(logLevel: string, message: string, tag: string, labels: { [key: string]: string }) {
        if (__DEV__) {
            console.info(logLevel, message, tag, labels);
        }
    }

    // Private helper method to handle both AppMonitor and console logging
    private static addLog(
        logLevel: string,
        message: string,
        tag: string,
        labels: { [key: string]: string },
        consoleLog: boolean,
    ) {
        AppMonitor.addLog(logLevel, message, tag, labels);
        if (consoleLog) {
            logger.addConsoleLog(logLevel, message, tag, labels);
        }
    }
}

export { logger };
