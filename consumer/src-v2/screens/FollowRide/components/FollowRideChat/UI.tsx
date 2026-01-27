import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import CardChat from '@/typescript/designSystem/components/CardChat';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import React from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { RNPressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { FollowRideChatProps } from './Types';

const FollowRideChatUI = ({
    rideId,
    bookingId,
    currentFollowerName,
    sheetAnimatedPosition,
    rcsDispatch,
}: FollowRideChatProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const chatAnimatedIndex = useSharedValue(0);
    const { handlers } = useScaleAnimation();
    const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);
    const floatingHeaderStyle = useAnimatedStyle(() => {
        return { transform: [{ translateY: sheetAnimatedPosition.value - 70 }] };
    });

    return (
        <>
            <Animated.View style={[styles.headerContainer, floatingHeaderStyle, { zIndex: 9 }]}>
                <AnimatedPressable
                    testID="close-chat-button"
                    onPress={() => rcsDispatch({ type: 'CHAT_ON_BACK', payload: undefined })}
                    {...handlers}>
                    <Animated.View style={styles.closeButton}>
                        <CloseIcon color="white" height={24} width={24} />
                    </Animated.View>
                </AnimatedPressable>
            </Animated.View>
            <BottomSheet
                handleIndicatorStyle={tailwind.style(`hidden`)}
                handleStyle={tailwind.style(`h-[26px] bg-[${themeColors.Fill_neutralUltraLow}] rounded-t-[15px]`)}
                index={0}
                enableOverDrag={false}
                animatedIndex={chatAnimatedIndex}
                animatedPosition={sheetAnimatedPosition}
                enableDynamicSizing={true}
                keyboardBlurBehavior="restore"
                snapPoints={undefined}
                onClose={() => {
                    Keyboard.dismiss();
                }}>
                <BottomSheetView>
                    <CardChat
                        merchantExoPhone={undefined}
                        rideId={rideId}
                        isChatOpen={true}
                        bookingId={String(bookingId)}
                        isFollowRide={true}
                        rcsDispatch={undefined}
                        setHideAccessibility={undefined}
                        chatPartnerName={currentFollowerName}
                        driverPhoneNumber={undefined}
                    />
                </BottomSheetView>
            </BottomSheet>
        </>
    );
};

export default React.memo(FollowRideChatUI);

const styles = StyleSheet.create({
    View1: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 11,
        elevation: 5,
        padding: 20,
        margin: 10,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        width: 54,
        height: 48,
        backgroundColor: '#47454A',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
    },
});
