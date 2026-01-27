import React, { useCallback, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, View as RNView } from 'react-native';

export interface FocusStackItem {
    ref: React.RefObject<RNView | null>;
    componentName: string;
}

export interface AccessibilityFocusConfig {
    /** The main content ref that should receive focus when no modal/popup is active */
    mainContentRef: React.RefObject<RNView | null>;
    /** Delay before setting focus (default: 100ms) */
    focusDelay: number | undefined;
    /** Delay before hiding/showing accessibility elements (default: 50ms) */
    accessibilityDelay: number | undefined;
    maxStackSize: number | undefined; // cap stack size
}

export interface AccessibilityFocusManager {
    /** Push a component to the focus stack */
    pushToFocusStack: (ref: React.RefObject<RNView | null>, componentName: string) => void;
    /** Pop the last component from the focus stack */
    popFromFocusStack: () => void;
    /** Get the current focus ref */
    getCurrentFocusRef: () => React.RefObject<RNView | null>;
    /** Set focus to a specific ref */
    setFocus: (ref: React.RefObject<RNView | null>) => void;
    /** Restore focus to the current top of the stack */
    restoreFocus: () => void;
    /** Hide accessibility elements for a ref */
    hideAccessibility: (ref: React.RefObject<RNView | null>) => void;
    /** Show accessibility elements for a ref */
    showAccessibility: (ref: React.RefObject<RNView | null>) => void;
    /** Get the current focus stack */
    focusStack: FocusStackItem[];
    /** Check if a component is currently active */
    isActive: (componentName: string) => boolean;
}

export const useAccessibilityFocus = (config: AccessibilityFocusConfig): AccessibilityFocusManager => {
    const [focusStack, setFocusStack] = useState<FocusStackItem[]>([]);
    const { mainContentRef, focusDelay = 100, accessibilityDelay = 50, maxStackSize = 20 } = config;

    const pushToFocusStack = useCallback(
        (ref: React.RefObject<RNView | null>, componentName: string) => {
            setFocusStack(prev => {
                const newStack = [...prev, { ref, componentName }];
                return newStack.length > maxStackSize ? newStack.slice(-maxStackSize) : newStack;
            });
        },
        [maxStackSize],
    );

    const popFromFocusStack = useCallback(() => {
        setFocusStack(prev => prev.slice(0, -1));
    }, []);

    const getCurrentFocusRef = useCallback(() => {
        // 🔑 Auto-clean stale refs
        const validStack = focusStack.filter(item => item.ref.current);
        if (validStack.length !== focusStack.length) {
            setFocusStack(validStack);
        }

        const lastItem = validStack[validStack.length - 1];
        return lastItem ? lastItem.ref : mainContentRef;
    }, [focusStack, mainContentRef]);

    const setFocus = useCallback(
        (ref: React.RefObject<RNView | null>) => {
            if (ref.current) {
                const node = findNodeHandle(ref.current);
                if (node) {
                    setTimeout(() => {
                        AccessibilityInfo.setAccessibilityFocus(node);
                    }, focusDelay);
                }
            }
        },
        [focusDelay],
    );

    const restoreFocus = useCallback(() => {
        const currentFocusRef = getCurrentFocusRef();
        setFocus(currentFocusRef);
    }, [getCurrentFocusRef, setFocus]);

    const hideAccessibility = useCallback(
        (ref: React.RefObject<RNView | null>) => {
            setTimeout(() => {
                if (ref.current) {
                    ref.current.setNativeProps({
                        accessibilityElementsHidden: true,
                        importantForAccessibility: 'no-hide-descendants',
                    });
                }
            }, accessibilityDelay);
        },
        [accessibilityDelay],
    );

    const showAccessibility = useCallback(
        (ref: React.RefObject<RNView | null>) => {
            setTimeout(() => {
                if (ref.current) {
                    ref.current.setNativeProps({
                        accessibilityElementsHidden: false,
                        importantForAccessibility: 'yes',
                    });
                }
            }, accessibilityDelay);
        },
        [accessibilityDelay],
    );

    const isActive = useCallback(
        (componentName: string) => {
            return focusStack.some(item => item.componentName === componentName);
        },
        [focusStack],
    );

    return {
        pushToFocusStack,
        popFromFocusStack,
        getCurrentFocusRef,
        setFocus,
        restoreFocus,
        hideAccessibility,
        showAccessibility,
        focusStack,
        isActive,
    };
};
