import { useCallback } from 'react';
import { ACTION_HANDLERS } from './handlers';
import { useActionContext } from './context';
import { ActionIdentifier, PayloadForAction } from './types';

export function useHomeActions() {
    const context = useActionContext();

    const triggerHomeAction = useCallback(
        <T extends ActionIdentifier>(actionIdentifier: T, payload: PayloadForAction<T>) => {
            const handler = ACTION_HANDLERS[actionIdentifier];

            if (!handler) {
                console.warn(`[useHomeActions] Unknown action: ${actionIdentifier}`);
                return;
            }

            try {
                handler(context, payload);
            } catch (error) {
                console.error(`[useHomeActions] Error executing action ${actionIdentifier}:`, error);
            }
        },
        [context],
    );

    return {
        triggerHomeAction,
    };
}
