import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '../../../../../src/typescript/components/Icon';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { NarrowArrowRight } from '../../../components/svg/Arrows';
import { TicketIcon } from '../../../components/svg/Ticket';
import { getIconFromType } from '../../JourneyInfoScreen/components/TransitIconWrapper';
import { PublicTransportList } from '../Types';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type PublicTransitDetailsCardProps = {
    details: PublicTransportList;
    index: number;
    handleOnPress: () => void;
};

type TransportCellProps = {
    type: MultimodalTravelMode_multimodalTravelMode;
    name: string | null;
    time: number | null;
};

export const TransportCell = ({ type, name }: TransportCellProps) => {
    return (
        <Animated.View
            accessible={true}
            accessibilityLabel={`${type} transit ${name ? `route ${name}` : ''}`}
            style={[
                tailwind.style('h-10 px-2.5 flex flex-row rounded-[24px] justify-center items-center', `bg-[#F0F0F0]`),
            ]}>
            {getIconFromType(type, 16, '#636164')}
            {name ? (
                <Animated.Text
                    accessible={false}
                    numberOfLines={1}
                    style={tailwind.style('pl-1.5 text-[15px] font-areaNormal-bold  text-[#636164]')}>
                    {name}
                </Animated.Text>
            ) : null}
            {/* {time && time !== 0 ? (
                <Animated.Text
                    style={tailwind.style(
                        'pl-1.5 text-[15px] font-areaNormal-bold',
                        `text-[#636164]`,
                        `${['Metro', 'Bus', 'Subway'].includes(type) ? 'opacity-50' : ''}`,
                    )}>
                    {time}
                    {type !== 'Walk' && type !== 'Taxi' ? 'm' : ''}
                </Animated.Text>
            ) : null} */}
        </Animated.View>
    );
};

export const PublicTransitDetailsCard = (props: PublicTransitDetailsCardProps) => {
    const { details, index: topTierIndex, handleOnPress } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('')}>
            <Pressable
                testID={`efad74ad-ce3a-4d30-a48b-5fa5b299982b`}
                accessible={true}
                accessibilityLabel={`Transit details. ${details.totalTime} minutes. From ${details.startTime} to ${details.endTime}. ${details.subtitle}`}
                accessibilityRole="button"
                onPress={handleOnPress}
                style={({ pressed }) => [tailwind.style('pt-6', pressed ? 'bg-[#F1F2F7]' : '')]}>
                <Animated.View style={tailwind.style('px-4')}>
                    <Animated.View style={tailwind.style('flex flex-row items-center')}>
                        <Animated.View
                            entering={FadeIn.delay(100)}
                            style={tailwind.style('h-12 w-12 justify-center items-center rounded-[14px] bg-[#212121]')}>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style('text-[16px] font-areaNormal-bold text-white')}>
                                {details.totalTime}
                            </Animated.Text>
                            <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-bold text-white')}>
                                {userLanguageStrings.Min}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View style={tailwind.style('pl-3')}>
                            <Animated.View style={tailwind.style('flex flex-row items-center')}>
                                <Animated.Text style={tailwind.style('text-base font-areaNormal-bold leading-[20px]')}>
                                    {details.startTime}
                                </Animated.Text>
                                <Icon
                                    style={tailwind.style('mx-1')}
                                    icon={<NarrowArrowRight fill={undefined} />}
                                    size={20}
                                />
                                <Animated.Text style={tailwind.style('text-base font-areaNormal-bold leading-[20px]')}>
                                    {details.endTime}
                                </Animated.Text>
                            </Animated.View>
                            <Animated.Text
                                style={tailwind.style('text-[14px] text-[#686868] font-areaNormal-semibold pt-1.5')}>
                                {details.subtitle}
                            </Animated.Text>
                        </Animated.View>
                        {/* Cost */}
                        <Animated.View style={tailwind.style('flex-1 items-end')}>
                            <Animated.View style={tailwind.style('flex-row items-center')}>
                                <Icon color="#E1E4E9" icon={<TicketIcon fill={undefined} />} size={20} />
                                <Animated.View style={tailwind.style('pl-1 flex flex-row items-center')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'font-inter-regular text-[17px] leading-[25px] text-[#2F2F2F]',
                                        )}>
                                        ₹
                                    </Animated.Text>
                                    <Animated.Text
                                        style={tailwind.style('font-areaNormal-bold text-base text-[#2F2F2F]')}>
                                        {Math.round(details.cost ?? 0)}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
                <Animated.ScrollView
                    accessible={true}
                    accessibilityLabel="Journey route details"
                    accessibilityRole="scrollbar"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tailwind.style('pl-4 pr-4')}
                    style={tailwind.style('mt-7 mb-6')}>
                    <Animated.View onStartShouldSetResponder={() => true} style={tailwind.style('flex-row')}>
                        {details.journeyData.map((journeyCell, index) => {
                            return (
                                <Animated.View key={index} style={tailwind.style(index !== 0 ? 'pl-1.5' : '')}>
                                    <TransportCell
                                        time={journeyCell.time}
                                        name={journeyCell.routeShortName}
                                        type={journeyCell.type}
                                    />
                                </Animated.View>
                            );
                        })}
                    </Animated.View>
                </Animated.ScrollView>
                {details.totalJourneys - 1 !== topTierIndex ? (
                    <Animated.View style={tailwind.style('h-[1px] mx-4 bg-[#F1F2F7]', `w-[${SCREEN_WIDTH - 32}px]`)} />
                ) : null}
            </Pressable>
        </Animated.View>
    );
};
