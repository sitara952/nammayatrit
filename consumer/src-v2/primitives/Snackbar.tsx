import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    WithTimingConfig,
    SlideInUp,
    SlideOutUp,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { colors } from 'config-types/src/domain/default/themes/colors';
// Types
export interface SnackbarProps {
    message: string;
    action:
        | {
              label: string;
              onPress: () => void;
          }
        | undefined;
    backgroundColor: string | undefined;
    duration: number | undefined;
    persist: boolean | undefined;
    actionTextColor: string | undefined;
    headingTextColor: string | undefined;
}

// Interface for the show function with optional props
export interface SnackbarShowOptions {
    message: string;
    action:
        | {
              label: string;
              onPress: () => void;
          }
        | undefined;
    backgroundColor: string | undefined;
    duration: number | undefined;
    persist: boolean | undefined;
    actionTextColor: string | undefined;
    headingTextColor: string | undefined;
}

// Add type definition for global showSnackbar
declare global {
    interface Window {
        showSnackbar: (props: SnackbarShowOptions) => number;
        dismissSnackbar: (id: number) => void;
    }
}

// Default values
const DEFAULT_DURATION = 3000;
const DEFAULT_BACKGROUND = '#323232';
const DEFAULT_TEXT_COLOR = '#FFFFFF';
const ACTION_COLOR = '#4CAF50';

// Create a standalone Snackbar component
const Snackbar: React.FC<SnackbarProps & { onDismiss: (() => void) | undefined }> = ({
    message,
    action,
    backgroundColor = DEFAULT_BACKGROUND,
    duration,
    persist = false,
    onDismiss,
    actionTextColor,
    headingTextColor,
}) => {
    const height = useSharedValue(0);
    const opacity = useSharedValue(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Show animation
        const animConfig: WithTimingConfig = { duration: 100 };
        opacity.value = withTiming(1, animConfig);
        height.value = withTiming(50, animConfig);

        // Auto-hide after duration only if duration is defined and not persisted
        if (duration !== undefined && !persist) {
            timeoutRef.current = setTimeout(() => {
                hideSnackbar();
            }, duration);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const hideSnackbar = () => {
        const animConfig: WithTimingConfig = { duration: 200 };
        opacity.value = withTiming(0, animConfig);
        height.value = withTiming(0, animConfig);
        if (onDismiss) {
            runOnJS(onDismiss)();
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const snackbarStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        height: height.value,
    }));

    // For persistent snackbars (when persist is true or duration is undefined), we add a dismiss button if no action is defined , TODO : not required as of now
    // const shouldShowDismissButton = (persist || duration === undefined) && !action;

    return (
        <Animated.View
            style={[styles.snackbar, { backgroundColor: backgroundColor }, snackbarStyle]}
            entering={Platform.OS === 'ios' ? undefined : FadeIn.duration(200)}
            exiting={FadeOut}
            onTouchStart={() => {
                if (action) {
                    action.onPress();
                    hideSnackbar();
                }
            }}>
            <Animated.View
                entering={SlideInUp.springify().damping(50).stiffness(400)}
                exiting={SlideOutUp.duration(400)}
                style={styles.snackBarComponent}>
                <Typography
                    style={[styles.message, { color: headingTextColor }]}
                    numberOfLines={1}
                    type={'callout'}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {message}
                </Typography>
                {action && (
                    <TouchableOpacity accessibilityRole="button" style={styles.action} testID="snackbar-action-button">
                        <Typography
                            style={[styles.actionText, { color: actionTextColor, marginTop: 36 }]}
                            type={'callout'}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {action.label}
                        </Typography>
                    </TouchableOpacity>
                )}
                {/* removed for now might need later */}
                {/* {shouldShowDismissButton && (
                <TouchableOpacity
                    style={styles.action}
                    onPress={() => {
                        hideSnackbar();
                    }}
                    testID="snackbar-dismiss-button">
                    <Text style={styles.actionText}>DISMISS</Text>
                </TouchableOpacity>
            )} */}
            </Animated.View>
        </Animated.View>
    );
};

// Create a SnackbarRoot to manage snackbar instances
export const SnackbarRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Change to single snackbar instead of array
    const [currentSnackbar, setCurrentSnackbar] = useState<{ id: number; props: SnackbarProps } | null>(null);
    const nextIdRef = useRef(0);
    const offsetY = useSharedValue(0);

    // Animation style for the content
    const contentStyle = useAnimatedStyle(() => ({
        paddingTop: offsetY.value,
    }));

    // Keep showSnackbar function reference stable to avoid dependency issues
    const showSnackbarRef = useRef((props: SnackbarShowOptions) => {
        // Convert from SnackbarShowOptions to SnackbarProps with defaults
        const fullProps: SnackbarProps = {
            message: props.message,
            action: props.action || undefined,
            backgroundColor: props.backgroundColor || DEFAULT_BACKGROUND,
            duration: props.duration || DEFAULT_DURATION,
            persist: props.persist || false,
            actionTextColor: props.actionTextColor || ACTION_COLOR,
            headingTextColor: props.headingTextColor || DEFAULT_TEXT_COLOR,
        };

        // Handle persistence logic
        const snackbarProps = {
            ...fullProps,
            // If persist is true, we ignore duration
            // If persist is not specified but duration is undefined, make it persistent
            persist: fullProps.persist === true || (fullProps.persist !== false && fullProps.duration === undefined),
            // Only use duration if not persisted
            duration: fullProps.persist ? undefined : fullProps.duration || DEFAULT_DURATION,
        };

        const id = nextIdRef.current++;

        // Replace any existing snackbar with the new one
        setCurrentSnackbar({ id, props: snackbarProps });

        // Only animate if we weren't already showing a snackbar
        if (offsetY.value !== 50) {
            offsetY.value = withTiming(50, { duration: 100 });
        }

        return id;
    });

    // Function to hide the current snackbar
    const hideSnackbar = (id: number) => {
        setCurrentSnackbar(current => {
            if (current === null || current.id !== id) {
                return current;
            }

            // Animate back when hiding
            offsetY.value = withTiming(0, { duration: 100 });
            return null;
        });
    };

    // Create global snackbar object with stable function reference
    useEffect(() => {
        // Create functions in a more functional way
        const showFn = (props: SnackbarShowOptions) => showSnackbarRef.current(props);
        const dismissFn = hideSnackbar;

        // Use a type assertion to assign to global without directly modifying it
        window.showSnackbar = showFn;
        window.dismissSnackbar = dismissFn;

        return () => {
            // Use a safer cleanup approach with type assertion
            window.showSnackbar = () => -1;
            window.dismissSnackbar = () => {};
        };
    }, []);

    return (
        <View style={styles.container}>
            {currentSnackbar && (
                <Snackbar
                    key={currentSnackbar.id}
                    {...currentSnackbar.props}
                    onDismiss={() => hideSnackbar(currentSnackbar.id)}
                />
            )}
            <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>
        </View>
    );
};

// Create a hook for accessing snackbar functionality
export const useSnackbar = () => {
    const show = (props: SnackbarShowOptions) => {
        if (window.showSnackbar) {
            return window.showSnackbar(props);
        }
        return -1;
    };

    const dismiss = (id: number) => {
        if (window.dismissSnackbar) {
            window.dismissSnackbar(id);
        }
    };

    return { show, dismiss };
};

// Add a component that can be used to test the snackbar
export const SnackbarTester: React.FC = () => {
    const { show } = useSnackbar();

    useEffect(() => {
        // Wait a moment for everything to initialize
        const timer = setTimeout(() => {
            show({
                message: 'Snackbar test component mounted!',
                backgroundColor: '#4CAF50',
                duration: 3000,
                persist: false,
                action: {
                    label: 'TEST',
                    onPress: () => {},
                },
                actionTextColor: colors.white,
                headingTextColor: colors.white,
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // This component doesn't render anything
    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 10,
    },
    content: {
        flex: 1,
    },
    snackbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingTop: Platform.OS === 'ios' ? 12 : 8,
        minHeight: 90,
    },
    message: {
        flex: 1,
        fontSize: 14,
        marginTop: 40,
    },
    action: {
        marginLeft: 16,
        paddingVertical: 8,
        paddingHorizontal: 4,
        fontSize: 16,
    },
    actionText: {
        color: ACTION_COLOR,
        fontSize: 14,
    },
    snackBarComponent: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default SnackbarRoot;
