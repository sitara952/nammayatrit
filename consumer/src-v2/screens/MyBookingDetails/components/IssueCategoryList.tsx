import React, { useState } from 'react';
import { View, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Pressable } from '@/src-v2/primitives/Pressable.tsx';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity.tsx';
import ChevronRight from '@/typescript/assets/svg/symbols/ChevronRight';
import { SupportIcon } from '@/typescript/components/svg/SupportIcon.tsx';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import helpSupportIcon from '../../../../src/resources/assets/png/help-support-icon.webp';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen';

interface Props {
    issueCategoryList: issueCategoryRes[];
    onCategoryClick: (category: issueCategoryRes) => void;
}

export const IssueCategoryList: React.FC<Props> = ({ issueCategoryList, onCategoryClick }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [showIssueCategory, setShowIssueCategory] = useState(false);
    const chevronRotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${chevronRotation.value}deg` }],
    }));

    const handleHelpAndSupportPress = () => {
        setShowIssueCategory(v => {
            chevronRotation.value = withTiming(!v ? 90 : 0, { duration: 200 });
            return !v;
        });
    };

    if (!issueCategoryList || issueCategoryList.length === 0) {
        return null;
    }

    return (
        <View>
            <Pressable
                style={{ padding: 15 }}
                testID="booking_details_help_and_support"
                onPress={handleHelpAndSupportPress}
                accessibilityRole="button">
                <View style={tailwind.style('flex-row gap-2 items-center justify-between')}>
                    <Image
                        accessible={true}
                        accessibilityLabel="help support icon image"
                        source={helpSupportIcon}
                        style={tailwind.style('rounded-2xl h-20px w-20px')}
                    />
                    <Typography
                        type="body"
                        style={tailwind.style(`text-[${themeColors.Text_neutralMax}] mr-auto ml-2`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={'Help and Support'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.HelpandSupport}
                    </Typography>
                    <Animated.View style={animatedStyle}>
                        <ChevronRight />
                    </Animated.View>
                </View>
            </Pressable>
            {showIssueCategory && (
                <Animated.View style={tailwind.style('px-4 pb-3')} entering={undefined} exiting={undefined}>
                    <View style={tailwind.style('ml-7 gap-3')}>
                        {issueCategoryList.map(category => {
                            const imgUrl = category.logoUrl.split(',')[1];
                            return (
                                <TouchableOpacity
                                    key={category.label}
                                    testID={`help_support_report_issue_${category.label}`}
                                    onPress={() => onCategoryClick(category)}
                                    style={tailwind.style('py-2')}
                                    accessibilityRole="button">
                                    <View style={{ flexDirection: 'row', gap: 4 }}>
                                        {imgUrl ? (
                                            <Image source={{ uri: imgUrl }} style={{ height: 20, width: 20 }} />
                                        ) : (
                                            <SupportIcon fill={undefined} />
                                        )}
                                        <Typography
                                            type="body"
                                            style={tailwind.style(`text-[${themeColors.Text_neutralMax}]`)}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={true}
                                            accessibilityLabel={'Report an Issue'}
                                            accessibilityRole={undefined}>
                                            {category.category}
                                        </Typography>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            )}
        </View>
    );
};
