import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type PlatformInfoProps = {
    platformNo: string;
    towards: string;
};

const formatPlatformNumber = (platformNo: string): string => {
    const num = parseInt(platformNo);
    return !isNaN(num) && num < 10 ? `0${num}` : platformNo;
};

export const PlatformInfo = (props: PlatformInfoProps) => {
    const { platformNo, towards } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('p-[18px] bg-[#3B3A3C] mx-5 rounded-[24px] flex-row')}>
            <Animated.View
                style={tailwind.style(
                    'w-[44px] h-[44px] bg-[#8432F7] rounded-full border-[1.5px] border-[#969696] justify-center items-center',
                )}>
                <Animated.Text
                    style={tailwind.style('text-[21px] leading-[27px] font-areaNormal-extrabold text-[#F4F4F4]')}>
                    {platformNo}
                </Animated.Text>
            </Animated.View>
            <Animated.View style={tailwind.style('flex-1 pl-4')}>
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style('text-base leading-[19px] font-areaNormal-extrabold text-[#E6E6E6]')}>
                    {userLanguageStrings.Towards} {towards}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style('text-[18px] leading-[21px] font-areaNormal-extrabold text-[#FFF] pt-2')}>
                    {userLanguageStrings.PlatformLabel} {formatPlatformNumber(platformNo)}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
};

export const SuburbanPlatformInfo = (props: PlatformInfoProps) => {
    const { towards } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            style={[
                tailwind.style('px-[18px] pb-[18px] bg-white mx-5 rounded-[24px] justify-center items-center'),
                {
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.065,
                    shadowRadius: 40,
                    elevation: 4,
                },
            ]}>
            <Animated.View style={tailwind.style('justify-center items-center')}>
                <Animated.Text
                    style={tailwind.style('text-base leading-[19px] font-areaNormal-extrabold text-[#7E7E7E] pt-3')}>
                    {userLanguageStrings.Towards} {towards}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
};
