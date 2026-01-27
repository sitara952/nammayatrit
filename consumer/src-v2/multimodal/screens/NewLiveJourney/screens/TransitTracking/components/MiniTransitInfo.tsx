import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import BusList, { BusItem } from '@/src-v2/multimodal/screens/SingleModeSearch/Components/BusList';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle, LinearTransition } from 'react-native-reanimated';
import {
    getIconBGFromType,
    getIconFromType,
    getIconSecondaryBGFromType,
    TransitType,
} from '../../../utils/getTransitIconUtils';
import { AutoHomeIcon } from '../../../../../components/svg/transport/AutoHomeIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Button from '@/src-v2/primitives/Button';
import { getMultimodalTravelMode } from '@/typescript/utils/MultiModal';

type Orientation = 'horizontal' | 'vertical';

export interface MiniTransitInfoProps {
    mode: TransitType;
    info: string | undefined;
}

export const TransitActionButton = ({
    onPress,
    label,
    icon,
    isLoading,
}: {
    onPress: () => void;
    label: string;
    icon: 'auto' | 'arrow';
    isLoading: boolean;
}) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    return (
        <Button
            onPress={onPress}
            testID="transit-action-button"
            text={label}
            type="primary"
            style={tailwind.style('mx-6 mb-3 h-[60px] flex-row items-center justify-center rounded-[18px] mt-3')}
            prefix={icon === 'auto' ? <AutoHomeIcon fill={colors.Button_for_modes_text} /> : null}
            suffix={icon === 'arrow' ? <DoubleArrowsWhite fill={colors.Button_for_modes_text} /> : null}
            isLoading={isLoading}
            showLoader={true}
            textType="callout"
            textColor={colors.Button_for_modes_text}
            bgColor={colors.Button_for_modes_bg}
            textStyle={tailwind.style(
                `text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-center text-[${colors.Button_for_modes_text}] ml-2`,
            )}
        />
    );
};

export const MiniTransitInfo = ({ mode, info }: MiniTransitInfoProps) => {
    return (
        <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
            <Animated.Text
                numberOfLines={2}
                style={tailwind.style(
                    'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] pr-4 leading-[24px]',
                    `max-w-[${SCREEN_WIDTH - 48 - 16 - 36}px]`,
                )}>
                {info}
            </Animated.Text>
            <Animated.View
                style={tailwind.style(
                    'w-9 h-9 justify-center items-center rounded-[13px]',
                    `bg-[${getIconBGFromType(getMultimodalTravelMode(mode))}]`,
                )}>
                {getIconFromType(mode, 20, getIconSecondaryBGFromType(getMultimodalTravelMode(mode)), false)}
            </Animated.View>
        </Animated.View>
    );
};

/**
 * Props interface for the MiniTransitInfo component that displays transit tracking information
 * in a condensed format.
 */
export interface AdditionalBusInfoProps {
    /**
     * Array of bus items containing detailed information about each bus
     * in the transit system.
     */
    busList: BusItem[];

    /**
     * Optional animated style prop for the wrapper component.
     * Can be used to customize the container's appearance and animations.
     */
    wrapperStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;

    /**
     * Current orientation of the device.
     * Used to adjust the layout based on portrait or landscape mode.
     */
    orientation: Orientation;

    /**
     * Formatted string representing when the next bus will arrive.
     * Example: "5 mins" or "arriving"
     */
    nextBusArrivalTime: string;

    /**
     * Callback function triggered when user chooses to skip the current bus.
     * Used to update the transit tracking state.
     */
    handleSkipBus: () => void;

    /**
     * Indicates if the bus list is loading.
     * Used to show a loading state instead of the bus list.
     */
    isLoading: boolean;
}

export const AdditionalBusInfo = (props: AdditionalBusInfoProps) => {
    const { busList, wrapperStyle, orientation = 'horizontal', nextBusArrivalTime = '5 mins', isLoading } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.View
                layout={LinearTransition.springify().damping(28).stiffness(300)}
                style={[
                    tailwind.style(
                        '',
                        orientation === 'horizontal' ? 'flex-row items-center pl-6 pt-6' : 'flex-col pt-4',
                    ),
                    wrapperStyle,
                ]}>
                {orientation === 'horizontal' ? (
                    <Animated.Text
                        style={tailwind.style('text-[#969696] text-[11px] leading-[18px] font-areaNormal-extrabold')}>
                        {userLanguageStrings.TicketIsValidAlsoInWithNewLine}
                    </Animated.Text>
                ) : null}
                {orientation === 'vertical' ? (
                    <Animated.Text
                        layout={LinearTransition.springify().damping(28).stiffness(300)}
                        style={tailwind.style(
                            'text-[#3B3A3C] text-[14px] leading-[24px] font-areaNormal-extrabold px-6',
                        )}>
                        {userLanguageStrings.NextBusComesIn}{' '}
                        <Animated.Text style={tailwind.style('text-[#09941E]')}>
                            {isLoading ? `... ${userLanguageStrings.Minutes}` : nextBusArrivalTime}
                        </Animated.Text>{' '}
                        {userLanguageStrings.IfYouWantToSkipThisBus}
                    </Animated.Text>
                ) : null}
                <Animated.View style={tailwind.style('', orientation === 'horizontal' ? 'flex-1 pl-4' : 'pt-2')}>
                    <BusList
                        busList={busList}
                        isLoading={isLoading}
                        showIcon={false}
                        isTicket={false}
                        isFilled={false}
                        isLiveJourney={true}
                        flatlistContainerStyle={tailwind.style('pl-6 pr-6')}
                    />
                </Animated.View>
            </Animated.View>
            {/* @TODO -- implement this after skip bus functionality */}
            {/* <TransitActionButton
                onPress={handleSkipBus}
                icon="arrow"
                label="Skip and wait for the next bus"
                isLoading={false}
            /> */}
        </>
    );
};
