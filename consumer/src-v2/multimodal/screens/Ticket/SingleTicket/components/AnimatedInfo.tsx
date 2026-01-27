import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import AnimatedLinearGradient from '../../Components/AnimatedLinearGradient';

const AnimatedInfo = ({ subInfo = 'NA', mainInfo = 'NA' }: { subInfo: string; mainInfo: string }) => {
    return (
        <AnimatedLinearGradient
            points={{ start: { x: 1, y: 1 }, end: { x: -1, y: -1 } }}
            customColors={['#DFEDE2', '#CFE8D0', '#A5DBA3', '#8ED18B', '#A5DBA3', '#CFE8D0', '#DFEDE2']}
            speed={320}
            style={tailwind.style('rounded-[24px] items-center flex-row w-[20px]')}>
            <Animated.Text
                style={tailwind.style(
                    `text-[#43745A] text-[12px] leading-[12px] text-center pt-4 font-areaNormal-extrabold`,
                )}>
                {subInfo}
            </Animated.Text>
            <Animated.Text
                style={tailwind.style(
                    `text-[40px] text-[#02361C] text-center pt-4 leading-[40px] font-departureMono-regular`,
                )}>
                {mainInfo}
            </Animated.Text>
        </AnimatedLinearGradient>
    );
};

export default AnimatedInfo;
