import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Button from '@/src-v2/primitives/Button';
import Typography from '../designSystem/components/primitives/Typography';
import token from '../designSystem/tokens';
import { selectTripDistance } from '../state/client/search';
import { useCancelBookingMutation } from '../state/server/bookingApi';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
    BottomSheetStage,
    clearSession,
    SearchWarningType,
    selectGoBackToRental,
    selectSearchWarning,
    selectSystemError,
    setBottomSheetStage,
    setSearchFailed,
    setSearchWarning,
} from '../state/client/session';
import { BookingId } from '../state/client/user';
import { resetIds } from '../state/sharedReducer';
import { selectToken } from '../state/client/auth';
import { AccessibilityInfo } from 'react-native';
import { englishStrings } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import { AnimatedModal } from '../components/common/AnimatedModal';

type errorStateItem = {
    title: string;
    subtitle: string;
    primaryBtnText: string;
    secondaryBtnText: string;
    primaryOnPress: () => void;
    secondaryOnPress: () => void;
};

export type ErrorStatesProps = {
    bookingId: BookingId | null;
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ErrorStates: React.FC<ErrorStatesProps> = ({ bookingId, visible, setVisible }) => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();

    const searchWarning = useAppSelector(selectSearchWarning);
    const systemError = useAppSelector(selectSystemError);
    const tripDistance = useAppSelector(state => selectTripDistance(state, null));
    const userToken = useAppSelector(selectToken);
    const goBackToRental = useAppSelector(selectGoBackToRental);
    const dispatch = useAppDispatch();
    const [cancelBooking] = useCancelBookingMutation();

    const resetSearchStageData = () => {
        dispatch(clearSession());
        resetIds(userToken, null, dispatch);
    };

    const onBackPress = () => {
        mainData.secondaryOnPress();
        return true;
    };

    const navigateToRental = () => {
        resetSearchStageData();
        navigation.navigate(
            'ServicesTab',
            {
                screen: 'extendedBookingNavigator',
                params: {
                    screen: 'rentalsScreen',
                },
            },
            { pop: true },
        );
    };

    const mainData: errorStateItem = (() => {
        switch (searchWarning) {
            case SearchWarningType.TripDistanceTooShort:
                AccessibilityInfo.announceForAccessibilityWithOptions(englishStrings.Tripdistancetooshort + ' Popup', {
                    queue: true,
                });
                return {
                    title: userLanguageStrings.Tripdistancetooshort,
                    subtitle:
                        userLanguageStrings.YourtripseemstobeonlymlongYoucouldconsidertakingawalkorcontinuewithbooking(
                            tripDistance ?? 0,
                        ),
                    primaryBtnText: userLanguageStrings.BookRide,
                    secondaryBtnText: userLanguageStrings.GoBack,
                    primaryOnPress: () => {
                        setVisible(false);
                        dispatch(setSearchWarning(SearchWarningType.Acknowledged));
                        dispatch(
                            setBottomSheetStage({
                                stage: BottomSheetStage.ChooseRide,
                                src: 'primary_tripDistanceTooShort',
                            }),
                        );
                    },
                    secondaryOnPress: () => {
                        resetSearchStageData();
                        dispatch(setSearchWarning(SearchWarningType.None));
                        setVisible(false);
                        dispatch(
                            setBottomSheetStage({
                                stage: BottomSheetStage.Search,
                                src: 'secondary_tripDistanceTooShort',
                            }),
                        );
                    },
                };

            case SearchWarningType.EstimatesNotAvailable:
                AccessibilityInfo.announceForAccessibilityWithOptions(englishStrings.NoRidesFound + ' Popup', {
                    queue: true,
                });
                return {
                    title: userLanguageStrings.NoRidesFound,
                    subtitle: userLanguageStrings.SeemsLikeOurDriversMightBeBusyAtTheMomentWouldYouLikeToTryOnceMore,
                    primaryBtnText: userLanguageStrings.TryAgain,
                    secondaryBtnText: userLanguageStrings.CancelSearch,
                    primaryOnPress: () => {
                        dispatch(setSearchFailed(false));
                        dispatch(setSearchWarning(SearchWarningType.Acknowledged));
                        setVisible(false);
                        dispatch(
                            setBottomSheetStage({
                                stage: BottomSheetStage.ChooseRide,
                                src: 'primary_estimatesNotAvailable',
                            }),
                        );
                    },
                    secondaryOnPress: () => {
                        dispatch(setSearchFailed(false));
                        dispatch(setSearchWarning(SearchWarningType.None));
                        setVisible(false);
                        goBackToRental
                            ? navigateToRental()
                            : dispatch(
                                  setBottomSheetStage({
                                      stage: BottomSheetStage.Search,
                                      src: 'secondary_estimatesNotAvailable',
                                  }),
                              );
                    },
                };

            case SearchWarningType.DriversNotAvailable:
                AccessibilityInfo.announceForAccessibilityWithOptions(englishStrings.NoRidesFound + ' Popup', {
                    queue: true,
                });
                return {
                    title: userLanguageStrings.NoRidesFound,
                    subtitle: userLanguageStrings.SeemsLikeOurDriversMightBeBusyAtTheMomentWouldYouLikeToTryOnceMore,
                    primaryBtnText: userLanguageStrings.TryAgain,
                    secondaryBtnText: userLanguageStrings.Gotohome,
                    primaryOnPress: () => {
                        dispatch(setSearchFailed(false));
                        dispatch(setSearchWarning(SearchWarningType.Acknowledged));
                        const cancelBookingReq = {
                            bookingId: bookingId,
                            data: {
                                additionalInfo: 'User try again',
                                reallocate: false,
                                reasonCode: 'OTHER',
                                reasonStage: 'OnSearch',
                            },
                        };
                        if (bookingId) {
                            cancelBooking(cancelBookingReq).finally(() => {
                                setVisible(false);
                                dispatch(
                                    setBottomSheetStage({
                                        stage: BottomSheetStage.ChooseRide,
                                        src: 'primary_driversNotAvailable',
                                    }),
                                );
                                resetIds(userToken, bookingId, dispatch);
                            });
                        }
                    },
                    secondaryOnPress: () => {
                        dispatch(setSearchFailed(false));
                        const cancelBookingReq = {
                            bookingId: bookingId,
                            data: {
                                additionalInfo: 'User Cancel',
                                reallocate: false,
                                reasonCode: 'OTHER',
                                reasonStage: 'OnSearch',
                            },
                        };
                        if (bookingId) {
                            cancelBooking(cancelBookingReq);
                        }
                        dispatch(setSearchWarning(SearchWarningType.None));
                        setVisible(false);
                        dispatch(
                            setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'secondary_driversNotAvailable' }),
                        );
                    },
                };

            case SearchWarningType.ApiError:
                AccessibilityInfo.announceForAccessibilityWithOptions(
                    englishStrings.Wecouldntgetyourestimates + ' PopUp',
                    { queue: true },
                );
                return {
                    title: systemError
                        ? userLanguageStrings.IncorrectDeviceTime
                        : userLanguageStrings.Wecouldntgetyourestimates,
                    subtitle: systemError
                        ? userLanguageStrings.PleaseCorrectYourTimeAndTryAgain
                        : userLanguageStrings.SeemslikesomethingwentwrongatourendPleaseretryafterafewseconds,
                    primaryBtnText: userLanguageStrings.Retry,
                    secondaryBtnText: userLanguageStrings.GoBack,
                    primaryOnPress: () => {
                        dispatch(setSearchFailed(false));
                        if (systemError) {
                            dispatch(setSearchWarning(SearchWarningType.None));
                        } else {
                            dispatch(setSearchWarning(SearchWarningType.Acknowledged));
                        }
                        setVisible(false);
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'primary_apiError' }));
                    },
                    secondaryOnPress: () => {
                        dispatch(setSearchFailed(false));
                        dispatch(setSearchWarning(SearchWarningType.Acknowledged));
                        setVisible(false);
                        goBackToRental
                            ? navigateToRental()
                            : dispatch(
                                  setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'secondary_apiError' }),
                              );
                    },
                };
            default:
                return {
                    title: '',
                    subtitle: '',
                    primaryBtnText: '',
                    secondaryBtnText: '',
                    primaryOnPress: () => {},
                    secondaryOnPress: () => {},
                };
        }
    })();
    return (
        <AnimatedModal
            visible={visible}
            setVisible={setVisible}
            onHardwareBackPress={onBackPress}
            contentStyle={{
                backgroundColor: themeColors.Fill_neutralUltraLow,
            }}
            allowCloseOnBackdropPress={false}
            animationDuration={300}>
            <Animated.View
                style={tailwind.style(
                    `bg-[${themeColors.Fill_neutralUltraLow}] px-[${token?.spacing?.[20]}] pt-[29px] pb-[${bottom - 10}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
                )}
                accessible={false}>
                <Animated.View
                    style={tailwind.style(`pb-${token?.spacing?.[20]} flex-col items-center`)}
                    accessible={true}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                        <Typography
                            type="subhead-800"
                            accessible
                            style={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {mainData.title}
                        </Typography>
                    </Animated.View>
                    <Typography
                        type="body-1"
                        style={tailwind.style(
                            `pt-[${token?.spacing?.[10]}] text-[${themeColors.Text_neutralHigh}] text-center text-[14px]`,
                        )}
                        accessible
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {mainData.subtitle}
                    </Typography>
                </Animated.View>
                <Animated.View style={tailwind.style(``)}>
                    <Button
                        testID={`error_state_popup_primary_${searchWarning}`}
                        type="primary"
                        text={mainData.primaryBtnText}
                        onPress={mainData.primaryOnPress}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[2]}]`)}>
                    <Button
                        testID={`error_state_popup_secondary_${searchWarning}`}
                        type="link"
                        text={mainData.secondaryBtnText}
                        onPress={mainData.secondaryOnPress}
                    />
                </Animated.View>
            </Animated.View>
        </AnimatedModal>
    );
};

export default ErrorStates;
