// import { TransitCost } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TransitCost';
import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../common/Icon';
import { TransitArrowRight } from '../../svg/Arrows';

interface TicketSrcDestProps {
    source: string;
    destination: string;
    cost: number;
}

export const TicketSrcDest = (props: TicketSrcDestProps) => {
    const { source, destination, cost: _cost } = props;
    return (
        <Animated.View style={tailwind.style('pt-14 px-14')}>
            <Animated.View style={tailwind.style('flex-row justify-between items-center')}>
                <Animated.View style={tailwind.style('max-w-[65%]')}>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#FFF]')}>
                        {source}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('flex-row items-center pt-2.5')}>
                        <Icon color="#FFF" icon={<TransitArrowRight fill={undefined} />} size={16} />
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#FFF]')}>
                            {destination}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
                {/* <TransitCost cost={cost} numberColor="#FFFFFF" rupeeColor="#ffffff99" /> */}
            </Animated.View>
        </Animated.View>
    );
};
