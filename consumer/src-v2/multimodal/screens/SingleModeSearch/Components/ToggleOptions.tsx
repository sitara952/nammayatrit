import Animated from 'react-native-reanimated';
import SegmentedControl from './SegmentedControl';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { FC } from 'react';

interface ToggleOptionsProps {
    onChange?: (index: number) => void;
}

export const ToggleOptions: FC<ToggleOptionsProps> = ({ onChange = () => {} }) => {
    return (
        <Animated.View style={tailwind.style('justify-end')}>
            <SegmentedControl segments={['All', 'Routes', 'Stops']} defaultIndex={0} onChange={onChange} />
        </Animated.View>
    );
};
