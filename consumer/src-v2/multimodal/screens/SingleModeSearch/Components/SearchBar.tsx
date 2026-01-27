import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import SearchIcon from '@/src-v2/multimodal/components/svg/Search';
import { TransportationTypes } from '../Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface SearchBarProps {
    onPress: () => void;
    mode: TransportationTypes;
}

export const SearchBar = ({ onPress, mode }: SearchBarProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Pressable
            accessibilityRole="button"
            testID={`2084a9fa-11af-4f6f-bf53-4bbbbe87a6ae`}
            onPress={onPress}
            accessibilityLabel="Search button"
            style={tailwind.style('absolute bottom-3   w-full px-4 ')}>
            <Animated.View
                style={tailwind.style(
                    ' bg-[#313131] p-4 min-h-12 rounded-[14px] border border-[#ECEEF0] w-full flex-row items-center',
                )}>
                <Icon icon={<SearchIcon />} size={18} />
                <Animated.Text
                    style={tailwind.style(
                        'pl-2 text-center text-white font-areaNormal-bold text-[15px] leading-[22px]',
                    )}>
                    {userLanguageStrings.Searchforany} {mode.toLocaleLowerCase()}{' '}
                    {mode === 'Bus' ? userLanguageStrings.stopornumber : userLanguageStrings.station}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};
