import React from 'react';
import colors from '../../designSystem/colorPalette';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { StyleType } from '../../types/CommonTypes';
import { Icon } from '../../components/Icon';
import HamburgerIcon from '../../components/svg/HamburgerIcon';
import { StyleSheet } from 'react-native';
import Button, { EntryOrExitLayoutType } from '@/src-v2/primitives/Button';
import token from '../tokens';

type HamburgerProps = {
    onPress: () => void;
    style: StyleType;
    entering: EntryOrExitLayoutType | undefined;
    exiting: EntryOrExitLayoutType | undefined;
};

const Hamburger = (props: HamburgerProps) => {
    const { onPress, entering, exiting } = props;
    const { top } = useSafeAreaInsets();
    return (
        <Animated.View
            entering={entering}
            exiting={exiting}
            style={[tailwind.style('absolute', `top-[${top + 12}px] left-[${token?.spacing[16]}]`), props.style]}>
            <Button
                testID="8dd44f76-8149-4b68-b0de-7b6bb03afa8b"
                type="secondary"
                size="md"
                onPress={onPress}
                accessible={true}
                accessibilityLabel={'Hamburger menu'}
                accessibilityHint={'Click to see side menus'}
                accessibilityRole={'imagebutton'}
                style={[
                    tailwind.style(
                        `bg-[${colors?.primitive.white[10]}] border-[1px] border-[${colors?.primitive.gray[14]}] h-[40px] w-[48px] justify-center`,
                    ),
                    styles.hamburgerShadow,
                ]}>
                <Icon icon={<HamburgerIcon height={15} />} />
            </Button>
        </Animated.View>
    );
};

export default Hamburger;

const styles = StyleSheet.create({
    hamburgerShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        backgroundColor: 'white',
        zIndex: 1,
    },
});
