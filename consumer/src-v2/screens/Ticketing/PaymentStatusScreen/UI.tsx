import Typography from '@/typescript/designSystem/components/primitives/Typography';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { EventTicketUIProps } from './Types';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import TicketContent from '../utils/TicketContent';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { createAction } from '@/typescript/utils/common';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const EventTicketUI: React.FC<EventTicketUIProps> = ({ ticketDetails, mpDispatch }: EventTicketUIProps) => {
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const TopBar = () => {
        return (
            <Animated.View style={styles.topBar}>
                <TouchableOpacity
                    testID="901ead7d-af8c-4a17-8e6a-0b0d2c328317"
                    accessible={true}
                    accessibilityHint="Go Back"
                    accessibilityRole="button"
                    onPress={() => {
                        mpDispatch(createAction('PRESSED_BACK', undefined));
                    }}
                    style={{ marginRight: 16 }}>
                    <ChevronLeftIcon />
                </TouchableOpacity>
                <Animated.View style={styles.eventInfo}>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.eventTitle}>
                        {userLanguageStrings.TicketGenerated}
                    </Typography>
                </Animated.View>
            </Animated.View>
        );
    };

    return (
        <Animated.View
            style={[
                {
                    paddingTop: top,
                    paddingBottom: bottom,
                    flex: 1,
                    backgroundColor: '#F8F8F8',
                    paddingHorizontal: 16,
                },
            ]}>
            <TopBar />
            <ScrollView showsVerticalScrollIndicator={false}>
                {ticketDetails ? <TicketContent ticketDetails={ticketDetails} /> : <></>}
            </ScrollView>
        </Animated.View>
    );
};

export default React.memo(EventTicketUI);

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 20,
    },
    eventInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 60,
    },
    eventTitle: {
        fontSize: 16,
        color: '#14171F',
    },
});
