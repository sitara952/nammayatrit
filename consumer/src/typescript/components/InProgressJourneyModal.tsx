import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedModal } from './common/AnimatedModal';
import Button from '../../../src-v2/primitives/Button';
import Typography from '../designSystem/components/primitives/Typography';
import { useConfigContext } from '../context/ConfigContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import { JourneyId } from '../state/client/user';
import colors from '../designSystem/colorPalette';
import { tailwind } from '../tailwindTheme/tailwind';
import { useJourneyActions } from '../../../src-v2/multimodal/hooks/useJourneyActions';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import {
    frontendNotifyEventPostWithParams,
    useFrontendNotifyEventPostMutation,
} from '@/api/integrations/rtk/FrontendNotifyEventPost';

interface InProgressJourneyModalProps {
    visible: boolean;
    onClose: () => void;
    journeyId: JourneyId;
    onCompleteRide: () => void;
}

export const InProgressJourneyModal: React.FC<InProgressJourneyModalProps> = ({
    visible,
    onClose,
    journeyId,
    onCompleteRide,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { completeJourney } = useJourneyActions(journeyId);
    const [isGoingToLiveTab, setIsGoingToLiveTab] = React.useState(false);
    const [isCompletingJourney, setIsCompletingJourney] = React.useState(false);

    const handleGoToLiveTab = () => {
        setIsGoingToLiveTab(true);
        onClose();
        navigation.navigate(
            'mainTabNavigation',
            {
                screen: 'liveTab_homeScreen',
                params: {
                    multimodalProps: {
                        journeyId: journeyId,
                        isLastMile: false,
                        currentLegOrder: '0',
                        previousLegOrderTravelMode: undefined,
                        previousLegOrderTravelModeStatusConfirmed: undefined,
                    },
                    journeyId: null,
                },
            },
            { pop: true },
        );
        // Reset loading state after navigation
        setTimeout(() => setIsGoingToLiveTab(false), 1000);
    };

    const [updateFrontendNotifyEvent] = useFrontendNotifyEventPostMutation();
    const skipFeedback = async () => {
        const ratingSkipEventReq: frontendNotifyEventPostWithParams = {
            body: { event: 'RATE_DRIVER_SKIPPED' },
        };
        try {
            await updateFrontendNotifyEvent(ratingSkipEventReq).unwrap();
        } catch (err) {
            console.error('Profile Update Error:', err);
        }
    };

    const handleCompleteJourney = useCallback(async () => {
        setIsCompletingJourney(true);
        try {
            await completeJourney();
            skipFeedback();
            onClose();
            onCompleteRide();
        } catch (error) {
            console.error('Error completing journey:', error);
        } finally {
            setIsCompletingJourney(false);
        }
    }, [completeJourney, onClose, onCompleteRide]);

    const handleClose = () => {
        // Reset loading states when modal is closed/dismissed
        setIsGoingToLiveTab(false);
        setIsCompletingJourney(false);
        onClose();
    };

    // Reset loading states when modal becomes invisible
    React.useEffect(() => {
        if (!visible) {
            setIsGoingToLiveTab(false);
            setIsCompletingJourney(false);
        }
    }, [visible]);

    const { bottom } = useSafeAreaInsets();

    return (
        <AnimatedModal
            visible={visible}
            setVisible={handleClose}
            onClose={handleClose}
            contentStyle={{
                ...styles.modalContent,
                backgroundColor: themeColors.Fill_neutralUltraLow,
                paddingBottom: bottom,
            }}
            animationDuration={300}>
            <Animated.View style={tailwind.style('p-6')}>
                {/* Title */}
                <Typography
                    type="subhead-700"
                    style={tailwind.style('text-center mb-2')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.JourneyInProgress}
                </Typography>

                {/* Description */}
                <Typography
                    type="body-1"
                    style={[tailwind.style('text-center mb-6'), { color: colors.primitive.gray[13] }]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.JourneyInProgressDescription}
                </Typography>

                {/* Action Buttons */}
                <Animated.View style={tailwind.style('gap-3')}>
                    <Button
                        testID="go_to_live_tab_button"
                        type="primary"
                        text={userLanguageStrings.GoToLiveTab}
                        onPress={handleGoToLiveTab}
                        style={tailwind.style('justify-center')}
                        disabled={isGoingToLiveTab || isCompletingJourney}
                        isLoading={isGoingToLiveTab}
                    />

                    <Button
                        testID="complete_journey_button"
                        type="secondary"
                        text={userLanguageStrings.CompleteJourney}
                        onPress={handleCompleteJourney}
                        style={tailwind.style('justify-center')}
                        disabled={isGoingToLiveTab || isCompletingJourney}
                        isLoading={isCompletingJourney}
                    />
                </Animated.View>
            </Animated.View>
        </AnimatedModal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 20,
    },
});
