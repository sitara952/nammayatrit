import React from 'react';

import { useAppDispatch } from '../state/hooks';
import Animated from 'react-native-reanimated';
import { tailwind } from '../tailwindTheme/tailwind';
import token from '../designSystem/tokens';
import Typography from '../designSystem/components/primitives/Typography';
import colors from '../designSystem/colorPalette';
import Button from '@/src-v2/primitives/Button';
import { BottomSheetStage, setBottomSheetStage } from '../state/client/session';

import { useConfigContext } from '@/typescript/context/ConfigContext';

const NoCarsAvailable = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();

    return (
        <Animated.View style={tailwind.style(`h-full bg-[${themeColors.Fill_neutralUltraLow}]`)}>
            <Animated.View style={tailwind.style('flex-col justify-center w-full items-center pt-[40px] gap-[8px]')}>
                <Typography
                    type="subhead-1"
                    style={tailwind.style(`text-[${token?.text['text-highContrast']}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Nocarsavailable}
                </Typography>
                <Typography
                    type="body-1"
                    style={tailwind.style(`text-[${token?.text?.['text-weak']}] text-center`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Itappearsyoureinahighdemandareaandnodriversarecurrently}
                    available.
                </Typography>
            </Animated.View>

            <Animated.View style={tailwind.style(`pt-[18px] px-[${token?.spacing?.[16]}]`)}>
                <Animated.View
                    style={tailwind.style(
                        `bg-[${themeColors.Fill_neutralMin}] border border-[${colors?.primitive?.gray?.[3]}] rounded-[${token?.corner?.md}] px-[${token?.spacing?.[16]}] py-[16.5px]`,
                    )}>
                    <Typography
                        type="callout"
                        style={tailwind.style('font-areaNormal-semibold leading-[15px]')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.RemindMeInFive_mins}
                    </Typography>
                </Animated.View>
            </Animated.View>

            <Animated.View style={tailwind.style(`pt-[${token?.spacing?.[20]}] px-[${token?.spacing?.[16]}]`)}>
                <Button
                    testID="no_cars_goto_home"
                    type="primary"
                    text={userLanguageStrings.Gotohome}
                    onPress={() => dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'nca_gotoHome' }))}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default NoCarsAvailable;
