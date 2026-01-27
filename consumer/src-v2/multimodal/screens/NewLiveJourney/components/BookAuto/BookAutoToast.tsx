import LoadingSpinner from '@/src-v2/multimodal/screens/NewLiveJourney/assets/svg/LoadingSpinner';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { colors } from 'config-types/dist/domain/default/themes/colors';
import { useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import autoFront from '../../../../../assets/3D-assets/live-journey/auto-front.webp';
import cabFront from '../../../../../assets/3D-assets/live-journey/car-front.png';
import autoSideViewPng from '../../../../../assets/3D-assets/live-journey/auto-side-view.webp';
import cabSideViewPng from '../../../../../assets/3D-assets/live-journey/car-side-view.webp';
import Button from '@/src-v2/primitives/Button';
import { TransitMode } from '@/src-v2/multimodal/types/journeyTracking';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

/**
 * Base props shared across all BookAutoToast states
 */
type BaseBookAutoToastProps = {
    /** Destination for the ride */
    destination: string;
    /** Description of the ride */
    description: string | undefined;
};

/**
 * Props for 'searching' or 'Inplan' state
 */

export type BookAutoToastProps = BaseBookAutoToastProps & {
    /** Indicates the current state is assigned */
    autoState: 'searching' | 'Inplan' | 'assigned';
    /** Vehicle number assigned */
    vehicleNo: string;
    vehicleIdentifier: string;
    transitMode: TransitMode;
    handleOnBookPress: () => void;
    handleOnTrackRidePress: () => void;
    /** Handler for call button press */
    handleOnBoostRidePress: () => void;
    price: number | undefined;
};

const BookAutoToast: React.FC<BookAutoToastProps> = (props: BookAutoToastProps) => {
    const { autoState, destination, description, vehicleIdentifier, transitMode } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (isLoading && autoState && autoState !== 'Inplan') {
            setIsLoading(false);
        }
    }, [autoState, isLoading]);

    const handleBook = () => {
        if (!props.handleOnBookPress) return;
        setIsLoading(true);
        props.handleOnBookPress();
    };

    const handlePress = () => {
        switch (autoState) {
            case 'Inplan':
                handleBook();
                break;
            case 'searching':
                props.handleOnBoostRidePress();
                break;
            case 'assigned':
                props.handleOnTrackRidePress();
                break;
        }
    };

    const renderContent = () => {
        switch (autoState) {
            case 'Inplan': {
                const { price, transitMode } = props;
                return (
                    <Animated.View style={tailwind.style('flex-row items-center pr-4')}>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="auto side view image"
                            source={transitMode === 'AUTO' ? autoSideViewPng : cabSideViewPng}
                            style={tailwind.style('w-[60px] h-[60px] -ml-[20px]')}
                            resizeMode="contain"
                        />
                        <Animated.Text
                            style={tailwind.style(
                                `text-[13px] leading-[19.5px] font-areaNormal-extrabold pl-2 text-[${colors.gray900}] flex-1 tracking-[0.2px]`,
                            )}
                            numberOfLines={2}>
                            {vehicleIdentifier} {userLanguageStrings.To} {destination}
                        </Animated.Text>
                        <Button
                            testID="book-button"
                            type="primary"
                            text={`${userLanguageStrings.Book} ${price ? `₹${price}` : ''}`}
                            onPress={handleBook}
                            isLoading={isLoading}
                            size="md"
                            style={tailwind.style(
                                `ml-[10px] min-w-[125px] h-[32px] mr-[16px] rounded-[20px] items-center justify-center`,
                            )}
                            textStyle={tailwind.style(
                                `text-[13px] leading-[16px] font-areaNormal-extrabold pr-[12px] pl-[12px]`,
                            )}
                        />

                        {/* <Animated.View
                            style={tailwind.style(
                                `ml-[10px] p-[5px] bg-[${colors.gray240}] rounded-[20px] w-[33px] h-[32px]`,
                            )}>
                            <Icon icon={<Clock />} size={22} />
                        </Animated.View> */}
                    </Animated.View>
                );
            }
            case 'searching': {
                const { handleOnBoostRidePress, transitMode } = props;
                return (
                    <>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="auto side view image"
                            source={transitMode === 'AUTO' ? autoSideViewPng : cabSideViewPng}
                            style={tailwind.style('w-[60px] h-[60px] -ml-[20px]')}
                            resizeMode="contain"
                        />
                        <Animated.Text
                            style={tailwind.style(
                                `text-[13px] leading-[19.5px] font-areaNormal-extrabold text-[${colors.gray900}] mr-[10px] flex-1 tracking-[0.2px] pr-[15px]`,
                            )}
                            numberOfLines={2}>
                            {userLanguageStrings.SearchingRideTo(destination)}
                        </Animated.Text>
                        <Pressable
                            accessibilityLabel="Boost button"
                            accessibilityRole="button"
                            testID="next-leg-auto-boost-button"
                            onPress={handleOnBoostRidePress}>
                            <Animated.Text
                                style={tailwind.style(
                                    `text-[13px] font-areaNormal-extrabold text-[${colors.blue200}] pr-[35px]`,
                                )}>
                                {userLanguageStrings.Boost}
                            </Animated.Text>
                        </Pressable>
                        <Animated.View style={tailwind.style('pr-[16px]')}>
                            <Icon icon={<LoadingSpinner />} size={22} />
                        </Animated.View>
                    </>
                );
            }
            case 'assigned': {
                const { handleOnTrackRidePress } = props;
                return (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Call driver button"
                        testID="call-driver-button"
                        onPress={handleOnTrackRidePress}>
                        <Animated.View style={tailwind.style('px-4')}>
                            <Animated.Text
                                style={tailwind.style(
                                    `text-[13px] font-areaNormal-extrabold text-[${colors.gray900}]`,
                                )}>
                                {userLanguageStrings.DriverAssigned}!
                            </Animated.Text>
                            <Animated.View style={tailwind.style('flex-row pt-2')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        `text-[12px] font-areaNormal-extrabold text-[${colors.blue200}]`,
                                    )}>
                                    {userLanguageStrings.ViewDetails}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                    </Pressable>
                );
            }
            default:
                return null;
        }
    };

    return (
        <>
            {description && (
                <Animated.Text
                    style={tailwind.style(
                        `text-[13px] leading-[22.5px] font-areaNormal-extrabold text-[${colors.gray620}] px-10 text-center tracking-[0.2px] pb-[14px] pt-[18px]`,
                    )}>
                    {description}
                </Animated.Text>
            )}
            <Button
                testID="book-auto-toast"
                type="clear"
                onPress={handlePress}
                style={tailwind.style('bg-transparent')}>
                <Animated.View
                    style={tailwind.style(
                        `flex-row items-center bg-[#F7F7F7] border border-[${colors.white200}] h-[64px] rounded-[15px] overflow-hidden mx-6`,
                    )}>
                    <Animated.View style={tailwind.style('flex-1 flex-row items-center')}>
                        {renderContent()}
                    </Animated.View>
                    {autoState === 'assigned' && (
                        <Animated.View style={tailwind.style('relative overflow-visible')}>
                            <Animated.Image
                                accessible={false}
                                source={transitMode === 'AUTO' ? autoFront : cabFront}
                                resizeMode={'contain'}
                                style={tailwind.style('h-full w-[66px] overflow-visible right-[34px] bottom-1')}
                            />
                            <Animated.View
                                style={tailwind.style(
                                    `absolute bottom-2 right-4 w-[100px] ${transitMode === 'AUTO' ? 'bg-[#FFCE4B]' : 'bg-[#ffffff]'} border-[1.2px] border-[#454545] h-[23px] justify-center items-center`,
                                )}>
                                <Animated.Text
                                    style={[
                                        tailwind.style(`text-[11.06px] text-[${colors.gray910}]`),
                                        { fontFamily: 'FE-Font' },
                                    ]}>
                                    {props.vehicleNo}
                                </Animated.Text>
                            </Animated.View>
                        </Animated.View>
                    )}
                </Animated.View>
            </Button>
        </>
    );
};

export default BookAutoToast;
