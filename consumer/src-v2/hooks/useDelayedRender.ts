import { useState, useEffect } from 'react';

/**
 * Hook that delays rendering of a component by a specified time
 * @param delayMs - Delay in milliseconds before the component should render (default: 100ms)
 * @returns boolean indicating whether the component should render
 */
const useDelayedRender = (delayMs = 100): boolean => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [delayMs]);

    return shouldRender;
};

export default useDelayedRender;
