import RNFS from 'react-native-fs';
import * as Sentry from '@sentry/react-native';
import { getStringItem, MMKVKey, setStringItem } from './MMKV';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { createMMKV } from '@/utils/mmkvUtils';

const storage = createMMKV();

type storedAssets = {
    [storedPath: string]: string;
};

type storeAction = 'add' | 'remove';

// TODO: use the below map to periodically clear out cache
// addOrRemove: true means add, false means remove
const updateStoredAssets = async (path: string, action: storeAction) => {
    try {
        const allAssetsPath = getStringItem(MMKVKey.ALL_LOCAL_ASSETS);
        const allAssets: storedAssets = safeJsonParse<storedAssets>(allAssetsPath, {}, 'assetCache') || {};

        const updatedAssets =
            action === 'remove'
                ? Object.fromEntries(Object.entries(allAssets).filter(([key]) => key !== path))
                : { ...allAssets, [path]: new Date().toUTCString() };

        setStringItem(MMKVKey.ALL_LOCAL_ASSETS, JSON.stringify(updatedAssets));
    } catch (e) {
        Sentry.captureMessage('Failed to update assets map: ' + e, {
            level: 'error',
            tags: { module: 'assetCache', action: 'updateStoredAssets' },
            extra: { path, action, error: String(e) },
        });
    }
};

export const getRemoteAssetPathWithCache = async (
    cacheKey: string,
    url: string,
    cb: (path: string, success: boolean) => void,
) => {
    const filename = url.split('/').filter(Boolean).slice(-1)[0];
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    const cachedPath = storage.getString(cacheKey);

    const filePath = await (async () => {
        if (cachedPath?.length && cachedPath && cachedPath === path && (await RNFS.exists(cachedPath))) {
            return cachedPath;
        }

        try {
            // Only unlink if we have a different valid cached path
            if (cachedPath?.length && cachedPath !== path) {
                RNFS.unlink(path).then(() => {
                    console.info('cleared old cache');
                });
                updateStoredAssets(path, 'remove');
            }
        } catch (e) {
            console.error('file cleanup error:', e);
        }

        await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
        storage.set(cacheKey, path);
        return path;
    })();

    if (filePath) {
        updateStoredAssets(filePath, 'add');
        cb(filePath, true);
    } else {
        Sentry.captureMessage('not able to download and give filePath, falling back to url: ' + url, {
            level: 'warning',
            tags: { module: 'assetCache', action: 'getRemoteAssetPathWithCache' },
            extra: { url, cacheKey, cachedPath },
        });
        cb(url, false);
    }
};
