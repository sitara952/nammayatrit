/**
 * Queue manager to ensure sequential execution of async operations.
 * Prevents race conditions when operations can be triggered multiple times
 * across component lifecycles.
 */
export class AsyncQueue {
    private currentPromise: Promise<void> = Promise.resolve();

    /**
     * Enqueues an async function to execute sequentially.
     * If another operation is in progress, waits for it to complete first.
     * @param fn The async function to execute
     */
    async enqueue(fn: () => Promise<void>): Promise<void> {
        const previousPromise = this.currentPromise;

        this.currentPromise = previousPromise
            .then(async () => {
                await fn();
            })
            .catch(error => {
                console.error('[AsyncQueue] Error in queued operation:', error);
            });

        await this.currentPromise;
    }
}

export const journeyConfirmationQueue = new AsyncQueue();
