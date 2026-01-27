import { Cross } from '@/src-v2/multimodal/components/svg/Cross';
import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

const Heading = ({ heading, handleCrossClick }: { heading: string; handleCrossClick: () => {} }) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    return (
        <Animated.View style={tailwind.style('px-4 flex-row items-center gap-[15px]')}>
            <Pressable
                accessibilityRole="button"
                testID={`e23dde6c-6c6b-4e45-b121-0768defc07cb`}
                onPress={handleCrossClick}
                accessibilityLabel="Close button"
                style={tailwind.style(
                    `bg-[${colors.CrossButton_bg}] w-[37px] h-[36px] rounded-[24px] flex items-center justify-center`,
                )}>
                <Icon icon={<Cross fill={'#313131'} />} color={'#313131'} />
            </Pressable>
            <Animated.Text style={tailwind.style('font-areaNormal-black text-[#6F6F6F] text-[17px] ')}>
                {heading}
            </Animated.Text>
        </Animated.View>
    );
};
export default Heading;
