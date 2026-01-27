import Animated from 'react-native-reanimated';
import { PopUpModalConfig } from '../StatusPopUpModal/PopUpModalConfig';
import { useRefsContext } from '@/typescript/context/RefsContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import token from '@/typescript/designSystem/tokens';
import Button from '@/src-v2/primitives/Button';
import { Platform } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

export const BetaDetailPopUp = () => {
    const { betaDetailRef } = useRefsContext();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <PopUpModalConfig
            onClosePress={() => {}}
            sheetRef={betaDetailRef}
            // containerStyle={tailwind.style('')}
            style="bg-transparent"
            snapPoints={[Platform.OS === 'ios' ? '28%' : '28%']}
            isScrollable={false}
            enableDynamicSizing={false}>
            <Animated.View
                style={tailwind.style(
                    `bg-[${themeColors.Fill_neutralUltraLow}] pt-[20px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
                )}>
                <Animated.View style={tailwind.style(`pb-${token?.spacing?.[16]}`)}>
                    <Animated.View style={tailwind.style(`flex-row justify-between`)}>
                        <Animated.View style={tailwind.style(`flex-col justify-between max-w-85%`)}>
                            <Typography
                                style={tailwind.style('pb-[4px]')}
                                type="title-3"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.WhatdoesBETAmean}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                    <Typography
                        type="callout"
                        style={tailwind.style(`pt-[${token?.spacing?.[10]}] text-[#5B6777] text-[14px]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ThisfeatureiscurrentlyinBETAwhichmeans}
                    </Typography>
                    <Button
                        testID="beta_detail_got_clicked"
                        type="primary"
                        style={{ justifyContent: 'center', marginTop: 20, backgroundColor: '#000000' }}
                        text={userLanguageStrings.GotIt}
                        isLoading={false}
                        onPress={() => {
                            betaDetailRef.current?.dismiss();
                        }}
                    />
                </Animated.View>
            </Animated.View>
        </PopUpModalConfig>
    );
};
