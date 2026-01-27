import { journeyBookingStatus } from '@/readOnly/api/types/JourneyBookingStatus.gen';
import { TrackingStatus_trackingStatus } from '@/readOnly/api/types/Enums.gen';
import { VehicleState, UserState } from '../types/journeyTracking';
import RNFS from 'react-native-fs';

interface FieldTestingData {
    journeyId: string;
    lat: number;
    lng: number;
    accuracy: number;
    locTimestamp: number;
    isManual: boolean;
    timestamp: string;
    strategyResult: object;
    trackingStatus: TrackingStatus_trackingStatus;
    bookingStatus: journeyBookingStatus;
    vehicleStatus: VehicleState;
    userStatus: UserState;
    currentLegInfo: object;
}

// Field testing directory in public Documents
const getFieldTestingDirectory = (): string => {
    // Use Downloads directory as it's most accessible via file manager
    return `${RNFS.DownloadDirectoryPath}/MultimodalFieldTesting`;
};

// Ensure field testing directory exists
const ensureFieldTestingDirectory = async (): Promise<string> => {
    const dirPath = getFieldTestingDirectory();
    try {
        const dirExists = await RNFS.exists(dirPath);
        if (!dirExists) {
            await RNFS.mkdir(dirPath);
            console.info(`[FieldTesting] Created directory: ${dirPath}`);
        }
        return dirPath;
    } catch (error) {
        console.error('[FieldTesting] Error creating directory:', error);
        // Fallback to app documents directory if external storage fails
        console.warn('[FieldTesting] Falling back to app documents directory');
        return RNFS.DocumentDirectoryPath;
    }
};

// CSV file path helper
const getCSVFilePath = async (journeyId: string): Promise<string> => {
    const dirPath = await ensureFieldTestingDirectory();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const fileName = `${journeyId}_${date}.csv`;
    return `${dirPath}/${fileName}`;
};

// CSV header
const CSV_HEADER =
    'journeyId,lat,lng,accuracy,locTimestamp,isManual,timestamp,strategyResult,trackingStatus,bookingStatus,vehicleStatus,userStatus,currentLegInfo\n';

// Escape CSV value
const escapeCsvValue = (value: object | string | number | boolean): string => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    // If the value contains comma, newline, or quotes, wrap it in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

// Convert data to CSV row
const formatCSVRow = (data: FieldTestingData): string => {
    const values = [
        data.journeyId,
        data.lat,
        data.lng,
        data.accuracy,
        data.locTimestamp,
        data.isManual,
        data.timestamp,
        data.strategyResult,
        data.trackingStatus,
        data.bookingStatus,
        data.vehicleStatus,
        data.userStatus,
        data.currentLegInfo,
    ];

    return values.map(escapeCsvValue).join(',') + '\n';
};

// Initialize CSV file for journey (create with header if doesn't exist)
export const initializeFieldTestingForJourney = async (journeyId: string): Promise<string | null> => {
    try {
        const filePath = await getCSVFilePath(journeyId);
        const fileExists = await RNFS.exists(filePath);

        if (!fileExists) {
            await RNFS.writeFile(filePath, CSV_HEADER, 'utf8');
            console.info(`[FieldTesting] Initialized CSV file for journey: ${journeyId}`);
            console.info(`[FieldTesting] File location: ${filePath}`);
        }
        return filePath;
    } catch (error) {
        console.error('[FieldTesting] Error initializing CSV file:', error);
        return null;
    }
};

// Simple cache for initialized journeys to avoid duplicate initialization
const initializedJourneys = new Set<string>();

// Log strategy result to CSV
export const logStrategyResult = async (data: FieldTestingData): Promise<void> => {
    try {
        // Initialize file if not already done for this journey
        if (!initializedJourneys.has(data.journeyId)) {
            const filePath = await initializeFieldTestingForJourney(data.journeyId);
            if (!filePath) {
                console.error('[FieldTesting] Failed to initialize CSV file');
                return;
            }
            // Create new set with the journey added
            const newInitialized = new Set(initializedJourneys);
            // eslint-disable-next-line functional/immutable-data
            newInitialized.add(data.journeyId);
            // Clear and repopulate the original set
            // eslint-disable-next-line functional/immutable-data
            initializedJourneys.clear();
            // eslint-disable-next-line functional/immutable-data
            newInitialized.forEach(journey => initializedJourneys.add(journey));
            console.info(`[FieldTesting] CSV file ready at: ${filePath}`);
        }

        // Get current file path and append data
        const filePath = await getCSVFilePath(data.journeyId);
        const csvRow = formatCSVRow(data);
        await RNFS.appendFile(filePath, csvRow, 'utf8');

        console.info(`[FieldTesting] Logged strategy result for journey: ${data.journeyId}`);
    } catch (error) {
        console.error('[FieldTesting] Error logging strategy result:', error);
    }
};

// Finalize field testing for journey (optional cleanup/summary)
export const finalizeFieldTestingForJourney = async (journeyId: string): Promise<void> => {
    try {
        if (!initializedJourneys.has(journeyId)) {
            console.warn(`[FieldTesting] Journey ${journeyId} was not initialized`);
            return;
        }

        const filePath = await getCSVFilePath(journeyId);
        const fileExists = await RNFS.exists(filePath);

        if (fileExists) {
            const stats = await RNFS.stat(filePath);
            console.info(`[FieldTesting] Journey ${journeyId} CSV file completed. Size: ${stats.size} bytes`);
            console.info(`[FieldTesting] File location: ${filePath}`);
            console.info(`[FieldTesting] Access via: Downloads/FieldTesting/ folder in your file manager`);
        }

        // Remove from initialized journeys
        const newInitialized = new Set(initializedJourneys);
        // eslint-disable-next-line functional/immutable-data
        newInitialized.delete(journeyId);
        // eslint-disable-next-line functional/immutable-data
        initializedJourneys.clear();
        // eslint-disable-next-line functional/immutable-data
        newInitialized.forEach(journey => initializedJourneys.add(journey));
    } catch (error) {
        console.error('[FieldTesting] Error finalizing field testing:', error);
    }
};

// Utility to get all field testing files
export const getFieldTestingFiles = async (): Promise<string[]> => {
    try {
        const dirPath = getFieldTestingDirectory();
        const dirExists = await RNFS.exists(dirPath);

        if (!dirExists) {
            console.info('[FieldTesting] No field testing directory found');
            return [];
        }

        const files = await RNFS.readDir(dirPath);
        const csvFiles = files
            .filter(file => file.name.startsWith('multimodal_field_testing_') && file.name.endsWith('.csv'))
            .map(file => file.path);

        console.info(`[FieldTesting] Found ${csvFiles.length} field testing files in ${dirPath}`);
        return csvFiles;
    } catch (error) {
        console.error('[FieldTesting] Error getting field testing files:', error);
        return [];
    }
};

// Utility to clean up old field testing files (older than X days)
export const cleanupOldFieldTestingFiles = async (daysToKeep: number = 7): Promise<void> => {
    try {
        const dirPath = getFieldTestingDirectory();
        const dirExists = await RNFS.exists(dirPath);

        if (!dirExists) {
            console.info('[FieldTesting] No field testing directory found for cleanup');
            return;
        }

        const files = await RNFS.readDir(dirPath);
        const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
        const cleanedCount = { count: 0 }; // Use object to avoid let

        for (const file of files) {
            if (file.name.startsWith('multimodal_field_testing_') && file.name.endsWith('.csv')) {
                const stats = await RNFS.stat(file.path);
                if (new Date(stats.mtime).getTime() < cutoffTime) {
                    await RNFS.unlink(file.path);
                    console.info(`[FieldTesting] Cleaned up old file: ${file.name}`);
                    // eslint-disable-next-line functional/immutable-data
                    cleanedCount.count++;
                }
            }
        }

        console.info(
            `[FieldTesting] Cleanup completed: ${cleanedCount.count} files removed, keeping files newer than ${daysToKeep} days`,
        );
    } catch (error) {
        console.error('[FieldTesting] Error cleaning up old files:', error);
    }
};

// Utility to get storage info and help user locate files
export const getFieldTestingStorageInfo = async (): Promise<{
    directory: string;
    accessible: boolean;
    fileCount: number;
    totalSize: number;
}> => {
    try {
        const dirPath = getFieldTestingDirectory();
        const dirExists = await RNFS.exists(dirPath);

        if (!dirExists) {
            return {
                directory: dirPath,
                accessible: false,
                fileCount: 0,
                totalSize: 0,
            };
        }

        const files = await RNFS.readDir(dirPath);
        const csvFiles = files.filter(
            file => file.name.startsWith('multimodal_field_testing_') && file.name.endsWith('.csv'),
        );

        const fileSizes = await Promise.all(
            csvFiles.map(async file => {
                const stats = await RNFS.stat(file.path);
                return stats.size;
            }),
        );
        const totalSize = fileSizes.reduce((sum, size) => sum + size, 0);

        return {
            directory: dirPath,
            accessible: true,
            fileCount: csvFiles.length,
            totalSize,
        };
    } catch (error) {
        console.error('[FieldTesting] Error getting storage info:', error);
        return {
            directory: getFieldTestingDirectory(),
            accessible: false,
            fileCount: 0,
            totalSize: 0,
        };
    }
};
