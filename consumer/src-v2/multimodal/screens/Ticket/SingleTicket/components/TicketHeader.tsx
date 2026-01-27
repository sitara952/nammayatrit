import React from 'react';
import { Alert, Platform, Text, ToastAndroid, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '../../../../components/common/Icon';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { TicketHeaderProps } from '../types';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
import CopyContent from '@/typescript/components/svg/CopyContent';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Clipboard from '@react-native-clipboard/clipboard';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const UsersIcon = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <Path
                d="M8.00879 9.21777C8.8635 9.21779 9.70127 9.29364 10.5137 9.4375C11.817 9.666 12.8495 10.6645 13.1797 11.9424H13.1709C13.3825 12.7294 12.7821 13.4998 11.9697 13.5H4.04785C3.22686 13.5 2.63378 12.7295 2.83691 11.9424C3.17553 10.6646 4.19971 9.66608 5.50293 9.4375C6.32392 9.29362 7.15394 9.21777 8.00879 9.21777ZM7.99121 2.5C9.41301 2.50014 10.5635 3.65141 10.5635 5.07324C10.5633 6.49496 9.41293 7.64536 7.99121 7.64551C6.56937 7.64551 5.4181 6.49505 5.41797 5.07324C5.41797 3.65132 6.56929 2.5 7.99121 2.5Z"
                fill="#656565"
            />
        </Svg>
    );
};

export const TicketHeader = (props: TicketHeaderProps) => {
    const appConfig = useAppSelector(selectAppConfig);
    const { title, regionalTitle, date, id, ticketCount, leg } = props;

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleCopyToClipBoard = () => {
        Clipboard.setString(id ?? '');
        if (Platform.OS == 'android') {
            ToastAndroid.show('Copied', ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied');
        }
    };
    const showHeader = appConfig.screenConfig.ticketScreenConfig.showTicketHeader && leg === 'BUS';
    return (
        <View style={tailwind.style('items-center justify-center  z-20 relative')}>
            {!showHeader && (
                <Text
                    style={tailwind.style(
                        'font-departureMono-regular text-[12px] tracking-[0.2px] leading-[18px] text-center text-[#2D2D2E] uppercase',
                    )}>
                    {title}
                </Text>
            )}
            {regionalTitle && (
                <Text
                    style={tailwind.style(
                        `max-w-[270px] text-[15px] font-inter-semibold tracking-[0.2px] leading-[18px] text-center text-[#2D2D2E] pt-1 z-40 relative`,
                    )}>
                    {` ${regionalTitle} `}
                </Text>
            )}
            <View style={tailwind.style('flex-row items-center justify-center gap-3 pt-2  px-[50px]')}>
                <View style={tailwind.style(id ? 'flex-1 items-end' : '')}>
                    <Text
                        style={tailwind.style(
                            'font-areaNormal-extrabold text-[12px] tracking-[0.2px] leading-[18px] text-center text-[#7E7E7E]',
                        )}>
                        {date}
                    </Text>
                </View>
                <Text style={tailwind.style('text-[#E0E0E0]')} accessible={false}>
                    |
                </Text>
                <View style={tailwind.style('flex-row justify-center items-center gap-2')}>
                    <Icon icon={<UsersIcon />} size={14} color="#656565" />
                    <Text
                        style={tailwind.style(
                            'font-areaNormal-extrabold text-[12px] tracking-[0.2px] text-center text-[#7E7E7E]',
                        )}>
                        <Text style={tailwind.style('text-[11px]')}>X</Text> {ticketCount}
                    </Text>
                </View>
                {id ? (
                    <>
                        <Text style={tailwind.style('text-[#E0E0E0]')} accessible={false}>
                            |
                        </Text>
                        <Pressable
                            accessibilityLabel="Copy Ticket ID button"
                            onPress={handleCopyToClipBoard}
                            accessibilityRole="button"
                            style={tailwind.style('flex-1 items-start flex-row gap-2px')}
                            testID={'copy_ticket_id'}>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={tailwind.style(
                                    'font-areaNormal-extrabold text-[12px] tracking-[0.2px] leading-[18px] text-center text-[#7E7E7E] max-w-[74px]',
                                )}>
                                {userLanguageStrings.ID}: {id}
                            </Text>
                            <Icon color="#FFF" icon={<CopyContent />} size={12} />
                        </Pressable>
                    </>
                ) : null}
            </View>
        </View>
    );
};
