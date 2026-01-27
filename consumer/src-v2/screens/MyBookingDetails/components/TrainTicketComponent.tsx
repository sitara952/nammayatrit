import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { getIconFromType } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TransitIconWrapper';
import { getIconSecondaryBGFromType } from '@/src-v2/multimodal/screens/NewLiveJourney/utils/getTransitIconUtils';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getCategoryDisplayName } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/CategorySelector';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

type TrainTicketProps = {
    fare: string;
    sourceName: string;
    destinationName: string;
    via: string;
    categories: categoryInfoResponse[] | undefined;
    trainTypeCode: string;
    serviceTier: string;
    issueListComponent: React.ReactNode | undefined;
};

export const TrainTicketComponent: React.FC<TrainTicketProps> = ({
    fare,
    sourceName,
    destinationName,
    via,
    categories,
    trainTypeCode,
    serviceTier,
    issueListComponent,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const trainType = trainTypeCode === 'O' ? userLanguageStrings.OrdinaryO : trainTypeCode;
    const serviceTierType =
        serviceTier === 'Second Class'
            ? userLanguageStrings.SecondClassII
            : serviceTier === 'First Class'
              ? userLanguageStrings.FirstClassFC
              : serviceTier;
    const truncatedSourceName = sourceName.length > 15 ? sourceName.substring(0, 15) + '...' : sourceName;
    const truncatedDestinationName =
        destinationName.length > 15 ? destinationName.substring(0, 15) + '...' : destinationName;
    const truncatedVia = via.length > 15 ? via.substring(0, 15) + '...' : via;
    return (
        <Animated.View
            style={tailwind.style(
                'bg-white p-4 rounded-2xl shadow-md w-full mx-auto px-4 min-h-[260px] justify-between',
            )}>
            <Animated.View style={tailwind.style('flex-row items-center pb-2 gap-1.5')}>
                <Animated.View style={tailwind.style('h-6 w-6 items-center justify-center rounded-xl bg-[#A9DB91]')}>
                    {getIconFromType('Subway', 14, getIconSecondaryBGFromType('Subway'))}
                </Animated.View>
                <Animated.Text
                    style={tailwind.style('text-[#2F2F2F] font-areaNormal-semibold tracking-wide text-[10.5px]')}
                    numberOfLines={1}>
                    {userLanguageStrings.TrainTicket}
                </Animated.Text>
            </Animated.View>

            <Animated.View style={tailwind.style('border-b border-gray-200 my-2')} />

            <Animated.View style={tailwind.style('flex-row items-center mb-2')}>
                <Animated.Text
                    style={tailwind.style('font-areaNormal-semibold text-[#2F2F2F] tracking-wide text-[10.5px]')}
                    numberOfLines={1}>
                    {userLanguageStrings.Journey}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style(
                        'font-areaNormal-semibold text-[#2F2F2F] ml-auto tracking-wide text-[10.5px]',
                    )}
                    numberOfLines={1}>
                    {fare}
                </Animated.Text>
            </Animated.View>

            <Animated.View style={tailwind.style('border-b border-gray-200 my-2')} />

            <Animated.View style={tailwind.style('flex-row justify-between mb-3')}>
                <Animated.View style={tailwind.style('flex-1 pr-3')}>
                    <Animated.Text
                        style={tailwind.style(
                            'font-areaNormal-semibold text-[#81838B] mb-1.5 tracking-wide text-[10.5px]',
                        )}
                        numberOfLines={1}>
                        {userLanguageStrings.SourceStation}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style('font-areaNormal-semibold text-[#2F2F2F] tracking-wide text-[10.5px]')}
                        numberOfLines={1}>
                        {truncatedSourceName}
                    </Animated.Text>
                </Animated.View>

                <Animated.View style={tailwind.style('flex-1 pl-3')}>
                    <Animated.Text
                        style={tailwind.style(
                            'font-areaNormal-semibold text-[#81838B] mb-1.5 tracking-wide text-right text-[10.5px]',
                        )}
                        numberOfLines={1}>
                        {userLanguageStrings.Destination}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style(
                            'font-areaNormal-semibold text-[#2F2F2F] tracking-wide text-right text-[10.5px]',
                        )}
                        numberOfLines={1}>
                        {truncatedDestinationName}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>

            <Animated.View style={tailwind.style('border-b border-[#D9D9D9] my-2')} />

            <Animated.View style={tailwind.style('mb-3')}>
                <Animated.View style={tailwind.style('flex-row justify-between')}>
                    <Animated.Text
                        style={tailwind.style('text-[#2F2F2F] font-areaNormal-semibold tracking-tight text-[10.5px]')}
                        numberOfLines={1}>
                        {userLanguageStrings.Via} {truncatedVia}
                    </Animated.Text>
                    {categories?.map(category => {
                        const quantity = category.categorySelectedQuantity || 0;
                        if (quantity === 0) return null;
                        return (
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#2F2F2F] font-areaNormal-semibold text-right tracking-tight text-[10.5px]',
                                )}
                                numberOfLines={1}>
                                {getCategoryDisplayName(category.categoryName)}: {quantity}
                            </Animated.Text>
                        );
                    })}
                </Animated.View>
            </Animated.View>
            <Animated.View style={tailwind.style('border-b border-[#D9D9D9] my-2')} />

            <Animated.View style={tailwind.style('flex-row justify-between')}>
                <Animated.Text
                    style={tailwind.style('font-areaNormal-semibold text-[#2F2F2F] tracking-wide text-[10.5px]')}
                    numberOfLines={1}>
                    {serviceTierType}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style(
                        'font-areaNormal-semibold text-[#2F2F2F] tracking-wide text-right text-[10.5px]',
                    )}
                    numberOfLines={1}>
                    {trainType}
                </Animated.Text>
            </Animated.View>
            {issueListComponent && (
                <Animated.View style={tailwind.style('mt-2 -mx-4')}>
                    <Animated.View style={tailwind.style('border-b border-[#D9D9D9] mb-2')} />
                    {issueListComponent}
                </Animated.View>
            )}
        </Animated.View>
    );
};

export default TrainTicketComponent;
