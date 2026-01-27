import React, { useCallback } from 'react';
import { View } from 'react-native';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { TouchableOpacity } from '../../../../primitives/TouchableOpacity';
import { Cross } from '../../../components/svg/Cross';
import Animated from 'react-native-reanimated';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';

const Header = ({ onClose, mode = 'BUS' }: { onClose: () => void; mode: 'BUS' | 'METRO' | 'SUBWAY' }) => {
    const appConfig = useAppSelector(selectAppConfig);
    const getHeaderTitles = useCallback(() => {
        switch (mode) {
            case 'METRO':
                return {
                    english: appConfig.screenConfig.ticketScreenConfig.metroTicketText.headerTitle,
                    regional: appConfig.screenConfig.ticketScreenConfig.metroTicketText.regionalTitle,
                };
            case 'SUBWAY':
                return {
                    english: appConfig.screenConfig.ticketScreenConfig.subwayTicketText.headerTitle,
                    regional: appConfig.screenConfig.ticketScreenConfig.subwayTicketText.regionalTitle,
                };
            case 'BUS':
            default:
                return {
                    english: appConfig.screenConfig.ticketScreenConfig.busTicketText.headerTitle,
                    regional: appConfig.screenConfig.ticketScreenConfig.busTicketText.regionalTitle,
                };
        }
    }, [mode, appConfig]);

    const titles = getHeaderTitles();

    return (
        <View style={tailwind`flex-row items-center p-4`}>
            <TouchableOpacity
                accessibilityRole="button"
                testID="close-button"
                onPress={onClose}
                style={tailwind`w-8 h-8 rounded-full bg-gray-200 items-center justify-center`}>
                <Cross fill="#000" />
            </TouchableOpacity>
            <View style={tailwind`flex-1 items-center`}>
                <Animated.Text style={tailwind`text-[12px] font-semibold font-departureMono-regular`}>
                    {titles.english}
                </Animated.Text>
                <Animated.Text style={tailwind`text-[12px] font-semibold font-departureMono-regular`}>
                    {titles.regional}
                </Animated.Text>
            </View>
        </View>
    );
};

export default Header;
