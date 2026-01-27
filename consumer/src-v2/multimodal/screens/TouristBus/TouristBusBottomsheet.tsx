import React, { forwardRef, useCallback } from 'react';
import { View, Text, Image, ViewStyle, ActivityIndicator, Linking } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, { interpolate, useAnimatedStyle, FadeIn, AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import CrossIcon from '@/src-v2/assets/svg/CrossIcon';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import mtIcBusSideView from '@/src-v2/assets/3D-assets/mt_ic_bus_side_view.webp';
import ticketIcon from '@/src-v2/assets/tourist_bus.webp';

export interface TouristBusBottomsheetProps {
    busName?: string;
    ticketName?: string;
    ticketPrice?: number;
    ticketValidity?: string;
    ticketDescription?: string;
    pdfUrl: string | undefined;
    onClose?: () => void;
    onBuyTicket?: () => void;
    onSearchDestination?: () => void;
    isLoading?: boolean;
}

// Backdrop component with close button
const BackdropWithCloseButton: React.FC<
    BottomSheetBackdropProps & {
        onClose: () => void;
        closeHandlers: { onPressIn: () => void; onPressOut: () => void };
        closeAnimatedStyle: AnimatedStyle<ViewStyle>;
        top: number;
    }
> = ({ onClose, closeHandlers, closeAnimatedStyle, top, ...props }) => {
    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(props.animatedIndex.value, [-1, 0], [0, 0.9]),
    }));

    return (
        <>
            <Pressable
                accessibilityRole="button"
                testID="tourist-bus-backdrop-pressable"
                style={props.style}
                onPress={onClose}>
                <Animated.View style={[tailwind.style('flex-1 bg-black'), backdropAnimatedStyle]} />
            </Pressable>
            {/* Close button positioned at top left of entire screen */}
            <Pressable
                testID="tourist-bus-close-button"
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                {...closeHandlers}
                style={[
                    tailwind.style('absolute z-50'),
                    {
                        top: top + 16,
                        left: 16,
                    },
                ]}>
                <Animated.View
                    style={[
                        tailwind.style(
                            'w-[36px] h-[36px] rounded-full bg-white border border-[rgba(0,0,0,0.09)] items-center justify-center',
                        ),
                        closeAnimatedStyle,
                    ]}>
                    <Icon icon={<CrossIcon fill="#313131" />} color="#313131" size={16} />
                </Animated.View>
            </Pressable>
        </>
    );
};

export const TouristBusBottomsheet = forwardRef<BottomSheetModal, TouristBusBottomsheetProps>(
    (
        {
            busName = 'Chennai Ula Bus',
            ticketName = 'Chennai Ula Ticket',
            ticketPrice = 100,
            ticketValidity = 'One Day Validity',
            ticketDescription = 'Valid in all tourist buses',
            pdfUrl,
            onClose,
            onBuyTicket,
            onSearchDestination,
            isLoading = false,
        },
        ref,
    ) => {
        const { top, bottom } = useSafeAreaInsets();
        const { handlers: closeHandlers, animatedStyle: closeAnimatedStyle } = useScaleAnimation();
        const { handlers: buyHandlers, animatedStyle: buyAnimatedStyle } = useScaleAnimation();
        const { handlers: searchHandlers, animatedStyle: searchAnimatedStyle } = useScaleAnimation();
        const { handlers: ticketHandlers, animatedStyle: ticketAnimatedStyle } = useScaleAnimation();
        const { handlers: exploreHandlers, animatedStyle: exploreAnimatedStyle } = useScaleAnimation();

        // const snapPoints = useMemo(() => ['65%'], []);

        const handleClose = useCallback(() => {
            if (ref && 'current' in ref) {
                ref.current?.dismiss();
            }
            onClose?.();
        }, [ref, onClose]);

        // Create backdrop component with props
        const backdropComponent = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BackdropWithCloseButton
                    {...props}
                    onClose={handleClose}
                    closeHandlers={closeHandlers}
                    closeAnimatedStyle={closeAnimatedStyle}
                    top={top}
                />
            ),
            [handleClose, closeHandlers, closeAnimatedStyle, top],
        );

        const handleBuyTicket = useCallback(() => {
            onBuyTicket?.();
        }, [onBuyTicket]);

        const handleSearchDestination = useCallback(() => {
            onSearchDestination?.();
        }, [onSearchDestination]);

        const handleExplorePdf = useCallback(() => {
            if (pdfUrl) {
                Linking.openURL(pdfUrl);
            }
        }, [pdfUrl]);

        return (
            <BottomSheetModal
                ref={ref}
                enableDynamicSizing={true}
                enablePanDownToClose={true}
                handleComponent={null}
                backdropComponent={backdropComponent}
                backgroundStyle={tailwind.style('bg-white rounded-t-[36px]')}>
                <BottomSheetView style={tailwind.style('flex-1 bg-white rounded-t-[36px]')}>
                    <View style={tailwind.style('px-4 pt-4')}>
                        {/* Yellow Bus Card */}
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            style={tailwind.style('bg-[#FFEDB0] rounded-[24px] h-[204px] overflow-hidden relative')}>
                            {/* You are in label */}
                            <Text
                                style={tailwind.style(
                                    'font-areaNormal-extrabold text-[12px] text-[#7E7E7E] tracking-[0.2px] mt-6 ml-6',
                                )}>
                                You are in
                            </Text>

                            {/* Bus Name */}
                            <Text
                                style={tailwind.style(
                                    'font-areaNormal-extrabold text-[28px] text-[#3B3A3C] tracking-[0.018em] leading-[34px] ml-6 mt-2',
                                )}>
                                {busName}
                            </Text>

                            {pdfUrl && (
                                <Pressable
                                    testID="tourist-bus-explore-pdf"
                                    accessibilityRole="button"
                                    accessibilityLabel="Click to Explore"
                                    onPress={handleExplorePdf}
                                    {...exploreHandlers}
                                    style={tailwind.style('ml-6 mt-1')}>
                                    <Animated.View style={exploreAnimatedStyle}>
                                        <Text
                                            style={tailwind.style(
                                                'font-areaNormal-extrabold text-[12px] text-[#3B3A3C] tracking-[0.2px] underline',
                                            )}>
                                            Click to Explore
                                        </Text>
                                    </Animated.View>
                                </Pressable>
                            )}

                            {/* Bus Image */}
                            <Image
                                source={mtIcBusSideView}
                                style={[
                                    tailwind.style('absolute -bottom-5 right-7 w-[298px] h-[113px]'),
                                    { resizeMode: 'contain' },
                                ]}
                                accessible={true}
                                accessibilityLabel="Tourist bus image"
                            />
                        </Animated.View>

                        {/* Destination Search Section */}
                        <Pressable
                            testID="tourist-bus-search-destination"
                            accessibilityRole="button"
                            accessibilityLabel="Search or Enter Destination Stop"
                            onPress={handleSearchDestination}
                            {...searchHandlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'bg-white border border-[#EFEFEF] rounded-[24px] h-[85px] mt-4 items-center justify-center',
                                    ),
                                    searchAnimatedStyle,
                                ]}>
                                <Text
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[13px] text-[#656565] tracking-[0.2px]',
                                    )}>
                                    Destination
                                </Text>
                                <Text
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[14px] text-[#3B3A3C] tracking-[0.1px] mt-2 underline',
                                    )}>
                                    Search or Enter Destination Stop
                                </Text>
                            </Animated.View>
                        </Pressable>

                        {/* Ticket Card */}
                        <Pressable
                            testID="tourist-bus-ticket-card"
                            accessibilityRole="button"
                            accessibilityLabel={`${ticketName}, ${ticketValidity}, ${ticketDescription}, Price ${ticketPrice} rupees`}
                            {...ticketHandlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'bg-white border-[3px] border-[#047AEA] rounded-[20px] h-[97px] mt-4 flex-row items-center pl-3 pr-[20px]',
                                    ),
                                    ticketAnimatedStyle,
                                ]}>
                                {/* Ticket Icon */}
                                <Image source={ticketIcon} style={tailwind.style('w-[43px] h-[64px] mr-3')} />

                                {/* Ticket Info */}
                                <View style={tailwind.style('flex-1')}>
                                    <Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[14px] text-[#3B3A3C] tracking-[0.01em] leading-[21px]',
                                        )}>
                                        {ticketName}
                                    </Text>

                                    {/* Validity and Price Row */}
                                    <View style={tailwind.style('flex-row justify-between items-center mt-[1px]')}>
                                        <Text
                                            style={tailwind.style(
                                                'font-areaNormal-extrabold text-[12px] text-[#7E7E7E] tracking-[0.2px] leading-[14px]',
                                            )}>
                                            {ticketValidity}
                                        </Text>

                                        {/* Price */}
                                        <Text style={tailwind.style('text-[12px] text-[#313131] tracking-[0.01em]')}>
                                            <Text style={tailwind.style('text-[10px] font-areaNormal-regular')}>₹</Text>
                                            <Text style={tailwind.style('text-[21px] font-areaNormal-extrabold')}>
                                                {ticketPrice}
                                            </Text>
                                        </Text>
                                    </View>

                                    {/* Divider - extends to right edge (accounting for padding) */}
                                    <View style={tailwind.style('h-[1px] bg-[#ECEDEF] my-0.6')} />

                                    <Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[12px] text-[#969696] tracking-[0.2px]',
                                        )}>
                                        {ticketDescription}
                                    </Text>
                                </View>
                            </Animated.View>
                        </Pressable>

                        {/* Buy Ticket Button */}
                        <Pressable
                            testID="tourist-bus-buy-ticket-button"
                            accessibilityRole="button"
                            accessibilityLabel="Buy Ticket"
                            onPress={handleBuyTicket}
                            disabled={isLoading}
                            {...buyHandlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'bg-[#3B3A3C] rounded-[18px] h-[58px] mt-4 items-center justify-center',
                                        isLoading && 'opacity-80',
                                    ),
                                    buyAnimatedStyle,
                                ]}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[16px] text-white leading-[21px]',
                                        )}>
                                        {`Buy Ticket @ ₹${ticketPrice}`}
                                    </Text>
                                )}
                            </Animated.View>
                        </Pressable>
                    </View>
                    <View style={{ height: bottom + 16 }} />
                </BottomSheetView>
            </BottomSheetModal>
        );
    },
);

export default TouristBusBottomsheet;
