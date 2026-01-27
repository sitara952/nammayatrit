import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import BusImage from '../../../../assets/mt_ic_multimodal_bus.webp';
import TrainImage from '../../../../assets/mt_ic_multimodal_train.webp';
import MetroImage from '../../../../assets/mt_ic_multimodal_metro.webp';

import { ChevronRight } from '@/src-v2/multimodal/components/svg/ChevronRight';
import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { TransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';
import { capitalize } from 'lodash';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type BookingDetailsProps = {
    number: string | undefined;
    description: string | undefined;
    moreOptionsPress: (() => void) | undefined;
    customDescription: React.JSX.Element | undefined;
    type: TransitType;
};

const BookingDetails: React.FC<BookingDetailsProps> = ({
    number = '119D',
    description = 'Ticket works for 5 more buses in ordinary tier.',
    moreOptionsPress = () => {},
    customDescription = undefined,
    type = 'bus',
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const imageLogic = () => {
        switch (type) {
            case 'bus':
                return BusImage;
            case 'train':
                return TrainImage;
            case 'metro':
                return MetroImage;
            default:
                return BusImage;
        }
    };
    return (
        <Animated.View style={tailwind.style('pt-[32px] pb-[22px] flex-row items-center justify-between')}>
            <Animated.View style={tailwind.style('w-3/5 pl-[31px]')}>
                <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-semibold  text-[#5A5A5A]')}>
                    {capitalize(type)} {userLanguageStrings.Route}
                </Animated.Text>
                <Animated.Text style={tailwind.style('text-[34px] font-areaNormal-black  text-[#2D2D2D] pt-[5px]')}>
                    {number}
                </Animated.Text>
                {!customDescription ? (
                    <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-bold  text-[#89898A] pt-[10px]')}>
                        {description}
                    </Animated.Text>
                ) : (
                    customDescription
                )}

                {type === 'bus' || type === 'train' ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${capitalize(type)} Options button`}
                        testID={`cb53cf14-da9e-4b37-91ff-75beb7aaa429`}
                        style={tailwind.style('flex-row items-center pt-[20] gap-1')}
                        onPress={() => moreOptionsPress()}>
                        <Animated.Text
                            style={tailwind.style('text-[#5A5A5A] text-[14px] font-areaNormal-semibold capitalize')}>
                            {type} {userLanguageStrings.Options}
                        </Animated.Text>
                        <Icon icon={<ChevronRight />} size={10} color="#5A5A5A" />
                    </Pressable>
                ) : null}
            </Animated.View>

            <Animated.Image
                accessible={true}
                accessibilityLabel="booking details image"
                source={imageLogic()}
                style={tailwind.style('w-[200px] h-[172px]')}
            />
        </Animated.View>
    );
};

export default BookingDetails;
