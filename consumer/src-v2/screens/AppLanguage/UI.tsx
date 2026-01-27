import React, { useState } from 'react';
import { FlatList, Text } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { View } from 'react-native';
import type { Language_language as languages } from '@/readOnly/api/types/Enums.gen.tsx';
import { LanguageObj } from '../../systems/configs/types';

import { Header } from '../../primitives/Header';
import Button from '../../primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography.tsx';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '../../../src/typescript/hooks/safeAreaInsets';
import { createAction } from '@/typescript/utils/common.ts';
import { AppLanguageScreenProps } from './Types.tsx';
import { logEvent, EventName } from '@/typescript/utils/logger';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import { hapticEffect } from '@/typescript/utils/useHaptic.ts';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

export const AppLanguageView: React.FC<AppLanguageScreenProps> = ({
    alDispatch,
    currentLanguage,
    allowedLanguages,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const safeArea = useSafeAreaInsets();
    const [languageSelected, setLanguageSelection] = useState<languages | undefined>(undefined);
    React.useEffect(() => {
        if (allowedLanguages.some(language => language.name === currentLanguage)) {
            setLanguageSelection(currentLanguage);
        }
    }, []);

    const renderLanguageList = (
        allowedLanguages: LanguageObj[],
        languageSelected: languages | undefined,
        onSelectLanguage: (language: languages) => void,
    ) => (
        <FlatList
            data={allowedLanguages}
            keyExtractor={item => item.translatedName}
            contentContainerStyle={tailwind.style('pb-20 mt-4')}
            renderItem={({ item }) => (
                <TouchableOpacity
                    accessibilityRole="button"
                    testID={`app_language_select_item_${item.name}`}
                    onPress={() => onSelectLanguage(item.name)}
                    style={tailwind.style(
                        `mb-4 py-2 px-4 rounded-16px border ${
                            languageSelected === item.name
                                ? `bg-[${themeColors.Fill_primaryMin}] border-[${themeColors.Border_primraryHigh}]`
                                : 'bg-white border-gray-300'
                        } flex-row items-center`,
                    )}>
                    {/* Radio Button */}
                    <View
                        style={tailwind.style(
                            `w-4 h-4 border-2 rounded-full mr-4 flex items-center justify-center ${
                                languageSelected === item.name ? 'border-black' : 'border-gray-400'
                            }`,
                        )}>
                        {languageSelected === item.name && (
                            <View style={tailwind.style('w-2 h-2 bg-black rounded-full')} />
                        )}
                    </View>

                    {/* Language Name and Code Container */}
                    <View style={tailwind.style('flex-1')}>
                        {/* Language translated name */}
                        <Text
                            style={tailwind.style(
                                `text-base font-medium ${
                                    languageSelected === item.name ? 'text-black' : 'text-gray-800'
                                }`,
                            )}>
                            {item.translatedName}
                        </Text>

                        {/* Language Name */}
                        <Text
                            style={tailwind.style(
                                `text-sm mt-1 ${languageSelected === item.name ? 'text-black' : 'text-gray-600'}`,
                            )}>
                            {item.name?.[0]?.toUpperCase() + item.name?.substring(1)?.toLowerCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );

    const handleLanguageSelector = (languageSelected: languages) => {
        setLanguageSelection(languageSelected);
    };
    return (
        <HardwareBackpressHandler>
            <Animated.View style={[tailwind?.style('flex-col h-full flex-1'), { backgroundColor: colors.neutral200 }]}>
                <Header
                    title={userLanguageStrings.AppLanguage}
                    onBackPress={() => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        alDispatch(createAction('GO_BACK', undefined));
                    }}
                />
                <Animated.View style={tailwind?.style('flex mx-6 flex-1 pb-16')}>
                    <Typography
                        type="subhead-700"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={{ marginBottom: 16 }}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ChooseYourPreferredLanguageForAllTextAndVoiceContentOnTheApp}
                    </Typography>
                    {renderLanguageList(allowedLanguages, languageSelected, handleLanguageSelector)}
                    <Animated.View style={tailwind?.style(`absolute bottom-[${safeArea.bottom}px] w-full`)}>
                        <Button
                            testID="app_language_confirm"
                            type="primary"
                            text={userLanguageStrings.ConfirmAppLanguage}
                            onPress={() => {
                                const params = {
                                    key: 'language',
                                    value: languageSelected,
                                };
                                logEvent(EventName.NY_USER_LANG_SELEC, params);
                                alDispatch(
                                    createAction('CONFIRM_APP_LANGUAGE_CLICKED', {
                                        selectedLanguage: languageSelected,
                                    }),
                                );
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};
