import { useCallback, useRef, useState } from 'react';

export const useAsyncAction = (action: () => Promise<void>) => {
    const [isLoading, setIsLoading] = useState(false);
    const isLoadingRef = useRef(false);

    const execute = useCallback(async () => {
        if (isLoadingRef.current) return;
        setIsLoading(true);
        isLoadingRef.current = true;
        try {
            await action();
        } catch (error) {
            console.error(action.name, 'action failed:', error);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [action, isLoading]);

    return { execute, isLoading };
};
