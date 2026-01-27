import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import React, { useMemo } from 'react';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import mtIcAcService from '../../../../assets/3D-assets/bus-tier/mt_ic_ac_service.webp';
import mtIcDeluxeService from '../../../../assets/3D-assets/bus-tier/mt_ic_deluxe_service.webp';
import mtIcExpressService from '../../../../assets/3D-assets/bus-tier/mt_ic_express_service.webp';
import mtIcOrdinaryBusService from '../../../../assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import type {
    FRFSServiceTierType_fRFSServiceTierType as Enums_FRFSServiceTierType_fRFSServiceTierType,
    SourceType_sourceType,
} from '@/readOnly/api/types/Enums.gen.tsx';
import { TransitCost } from './TransitCost';
import { ScrollView } from 'react-native-gesture-handler';
import mtIcTrainTransit from '../../../../assets/3D-assets/transits/mt_ic_train_transit.webp';
import { TransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
// import { BUS_SERVICE_TIER_MAPPING } from '../../SingleModeTicketBooking/Types';
/**
 * TransportServiceTierCardProps interface defines the properties required for the TransportServiceTierCard component.
 *
 * @property {TransportServiceTier} serviceTier - The tier of the bus service (e.g., 'O' for Ordinary, 'X' for Express).
 * @property {number} frequency - The frequency of the bus service in minutes.
 * @property {number} price - The price of the bus service.
 * @property {string[]} busList - A list of bus numbers that belong to this service tier.
 */

/**
 * TransportServiceTierCard component displays information about a specific bus service tier.
 *
 * @param {TransportServiceTierCardProps} props - The properties required to render the TransportServiceTierCard component.
 * @returns {JSX.Element} The rendered TransportServiceTierCard component.
 *
 * Note: This component does not contain any UI logic or state management. All necessary data and logic should be handled
 * in the parent component and passed down as props. This ensures that the component remains purely presentational.
 *
 * The component uses the following assets based on the service tier:
 * - 'Z': mtIcAcService (A/C service)
 * - 'XS': mtIcExpressService (Small Bus Express service)
 * - 'OS': mtIcOrdinaryBusService (Small Bus Ordinary service)
 * - 'S': mtIcDeluxeService (Deluxe service)
 * - 'X': mtIcExpressService (Express service)
 * - 'O': mtIcOrdinaryBusService (Ordinary service)
 *
 * The frequencyColorCode is determined based on the frequency of the bus service:
 * - <= 10 minutes: '#097B42' (Green)
 * - <= 20 minutes: '#A39820' (Yellow)
 * - <= 25 minutes: '#E28B00' (Orange)
 * - > 25 minutes: '#F43E31' (Red)
 */

interface TransportServiceTierCardProps {
    serviceTier: Enums_FRFSServiceTierType_fRFSServiceTierType;
    frequency: number;
    price: number;
    busList: string[];
    serviceTierName: string | undefined;
    type: TransitType | undefined;
    isFetchingTierOptions: boolean;
    busDataSource: SourceType_sourceType;
    // Train specific props
    trainNumber?: string;
    routeName?: string;
    trainArrivalOrDepartureTimeText?: string;
}

// const serviceTierImage = useMemo(() => {
//         switch (serviceTier) {
//             // | NON_AC
//             // | SPECIAL
//             // |
//             // | FIRST_CLASS
//             // | SECOND_CLASS
//             // | THIRD_CLASS
//             case 'AC':
//                 // A/C
//                 return mtIcAcService;
//             // case 'XS':
//             //     // Small Bus Express
//             //     return mtIcExpressService;
//             // case 'OS':
//             //     // Small Bus Ordinary
//             //     return mtIcOrdinaryBusService;
//             case 'EXECUTIVE':
//             case 'SPECIAL':
//                 // Deluxe
//                 return mtIcDeluxeService;
//             case 'EXPRESS':
//                 // Express
//                 return mtIcExpressService;
//             case 'ORDINARY':
//                 // Ordinary
//                 return mtIcOrdinaryBusService;
//             default:
//                 // Default to Ordinary
//                 return mtIcOrdinaryBusService;
//         }
//     }, [upcomingBusInfo]);

export const TransportServiceTierCard = (props: TransportServiceTierCardProps) => {
    const {
        serviceTier,
        frequency,
        price,
        busList,
        busDataSource,
        serviceTierName,
        type = 'bus',
        isFetchingTierOptions,
        trainNumber,
        routeName,
        trainArrivalOrDepartureTimeText,
    } = props;
    const frequencyColorCode = useMemo(() => {
        if (frequency <= 10) return '#097B42';
        if (frequency <= 20) return '#A39820';
        if (frequency <= 25) return '#E28B00';
        return '#F43E31';
    }, [frequency]);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const tenHoursInMinutes = 10 * 60;
    const colors = configManager.get('themeColors');

    const serviceTierImage = useMemo(() => {
        if (type === 'train') {
            return mtIcTrainTransit;
        }

        switch (serviceTier) {
            // | NON_AC
            // | SPECIAL
            // |
            // | FIRST_CLASS
            // | SECOND_CLASS
            // | THIRD_CLASS
            case 'AC':
                // A/C
                return mtIcAcService;
            // case 'XS':
            //     // Small Bus Express
            //     return mtIcExpressService;
            // case 'OS':
            //     // Small Bus Ordinary
            //     return mtIcOrdinaryBusService;
            case 'EXECUTIVE':
            case 'SPECIAL':
                // Deluxe
                return mtIcDeluxeService;
            case 'EXPRESS':
                // Express
                return mtIcExpressService;
            case 'ORDINARY':
                // Ordinary
                return mtIcOrdinaryBusService;
            default:
                // Default to Ordinary
                return mtIcOrdinaryBusService;
        }
    }, [serviceTier]);

    function getAccessibilityLabel(): string {
        if (type === 'train') {
            const parts = [
                serviceTierName ? `Train service tier ${serviceTierName}` : null,
                trainNumber ? `Train number ${trainNumber}` : null,
                routeName ? `Route: ${routeName}` : null,
                trainArrivalOrDepartureTimeText ? `Arrival time: ${trainArrivalOrDepartureTimeText}` : null,
                price ? `Fare: ₹${price}` : null,
            ];
            return parts.filter(Boolean).join(', ');
        } else {
            const parts = [
                serviceTierName ? `Bus service tier ${serviceTierName}` : null,
                busDataSource === 'LIVE'
                    ? `Next bus in ${isFetchingTierOptions ? 'loading' : `${frequency} minutes`}`
                    : 'Live tracking not available',
                price ? `Fare: ₹${price}` : null,
                busList?.length ? `Buses: ${busList.join(', ')}` : 'No buses listed',
            ];
            return parts.filter(Boolean).join(', ');
        }
    }

    return (
        <Animated.View style={tailwind.style('bg-white rounded-[20px] pr-5 pt-[13px]')}>
            <Animated.View
                style={tailwind.style('flex-row items-center overflow-hidden')}
                accessibilityLabel={getAccessibilityLabel()}>
                {type !== 'train' && (
                    <Animated.Image
                        accessible={false}
                        importantForAccessibility="no-hide-descendants"
                        entering={SlideInLeft.delay(150).springify().damping(35).stiffness(350)}
                        resizeMode="cover"
                        source={serviceTierImage}
                        style={tailwind.style(
                            type === 'bus'
                                ? 'w-[64px] h-[101px]'
                                : 'w-[110px] h-[85px] absolute bottom-[20px] left-[-5px]',
                        )}
                    />
                )}
                <Animated.View
                    style={[
                        tailwind.style('flex-1 '),
                        tailwind.style(type === 'bus' ? 'pl-0.5' : type === 'train' ? 'pl-5' : 'pl-[75px]'),
                    ]}>
                    <Animated.View
                        style={tailwind.style(
                            ' flex-row items-end justify-between pb-[8px] flex-1',
                            type !== 'train' ? `border-b border-[${colors.CrossButton_bg}]` : '',
                        )}>
                        <Animated.View style={tailwind.style('max-w-2/3')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] leading-[15px] text-[#3B3A3C] font-areaNormal-extrabold tracking-[0.16px] capitalize',
                                )}>
                                {serviceTierName}
                            </Animated.Text>
                            {type !== 'train' && busDataSource === 'LIVE' && frequency <= tenHoursInMinutes && (
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[13px] leading-[14px] text-[#7E7E7E] font-areaNormal-extrabold tracking-[0.16px] pt-2',
                                    )}>
                                    {userLanguageStrings.NextTransitIn(type)}{' '}
                                    <Animated.Text
                                        style={tailwind.style(
                                            `text-[${frequencyColorCode}] font-areaNormal-extrabold`,
                                        )}>
                                        {isFetchingTierOptions ? '  ...' : `${frequency} ${userLanguageStrings.Mins}`}
                                    </Animated.Text>
                                </Animated.Text>
                            )}
                            {type !== 'train' && busDataSource === 'GTFS' && (
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[13px] leading-[14px] text-[#7E7E7E] font-areaNormal-extrabold tracking-[0.16px] pt-2',
                                    )}>
                                    {userLanguageStrings.LiveTrackingNotAvailable}
                                </Animated.Text>
                            )}
                        </Animated.View>
                        <TransitCost cost={price} numberColor="#313131" rupeeColor="#313131" />
                    </Animated.View>
                    {type !== 'train' && (
                        <AnimatedScrollView
                            showsHorizontalScrollIndicator={false}
                            hitSlop={10}
                            horizontal
                            contentContainerStyle={tailwind.style('flex-row items-center py-3 truncate')}
                            accessible={false}
                            importantForAccessibility="no-hide-descendants">
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[13px] leading-[14px] font-areaNormal-extrabold text-[#969696]',
                                )}>
                                {userLanguageStrings.Buses} :{' '}
                            </Animated.Text>
                            {busList?.map((bus, index) => (
                                <Animated.Text
                                    key={index}
                                    style={tailwind.style(
                                        'text-[13px] leading-[14px] font-areaNormal-extrabold text-[#969696]',
                                    )}>
                                    {bus}
                                    {index !== busList.length - 1 && (
                                        <Animated.Text style={tailwind.style('text-[#969696]')}>, </Animated.Text>
                                    )}
                                </Animated.Text>
                            ))}
                        </AnimatedScrollView>
                    )}

                    {type === 'train' && (
                        <Animated.Text
                            style={tailwind.style('text-[#656565] font-areaNormal-extrabold text-[12px] pb-[10px]')}>
                            {userLanguageStrings.Arrival}: {trainArrivalOrDepartureTimeText}
                        </Animated.Text>
                    )}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
