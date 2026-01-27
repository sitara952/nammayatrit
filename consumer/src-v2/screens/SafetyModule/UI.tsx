import Button from '../../primitives/Button';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '../../../src/typescript/hooks/safeAreaInsets';
import CloseIcon from '../../../src/typescript/components/svg/CloseIcon';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import { InitialSOSViewProps } from './Types';
import { SOSButtonView } from './components/SOSButtonView';
import { SOSBodyView } from './components/SOSBodyView';
import { ScrollView } from 'react-native-gesture-handler';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { SOSActivatedView } from './components/SOSActivatedView';
import DiallingPolice from './components/DialingPolice';
import { useAppDispatch, useAppSelector } from '../../../src/typescript/state/hooks';
import { selectSosStage, setsosStage, setSosId, activateSafetyTool } from '@/typescript/state/client/sos';
import { View } from 'react-native';
import Tag from '../../../src/typescript/designSystem/components/primitives/Tag';
import { Icon } from '../../../src/typescript/components/Icon';
import Doc from '../../../src/typescript/assets/svg/symbols/Doc';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createRideId, selectBookingDetailsWithId, selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { strings } from 'config-types';
import { useSosGetDetailsRideIdGetQuery } from '../../../src/api/integrations/rtk/SosGetDetailsRideIdGet';
import ContentLoader, { Rect } from '../../../src/typescript/designSystem/components/ContentLoader';
import colors from '../../../src/typescript/designSystem/colorPalette';
import { setIsRideEnded } from '../../../src/typescript/state/client/sos';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { stopAudio } from '@/src-v2/helpers/audio/AudioModule';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { BookingId } from '@/typescript/state/client/user';
import { useHelpAndSupportHandler } from '@/typescript/hooks/kaptureLoginHandler';
import { useLazyGetAllActiveTicketsGetQuery } from '@/api/integrations/rtk/GetAllActiveTicketsGet';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { selectRideDetailsWithId } from '@/typescript/state/client/ride';

const SafetyToolsHeader = (props: {
    rideId: string | null;
    userLanguageStrings: strings;
    bookingId: BookingId | null;
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const currentScreen = useRef<'Safety' | 'HelpAndSupport'>('Safety');
    const { userLanguageStrings } = props;
    const sosStage = useAppSelector(selectSosStage);
    const dispatch = useAppDispatch();
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, props.bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, createRideId(props.rideId ?? '')));
    const shortRideId = rideDetails?.shortRideId;

    const [getAllActiveTickets] = useLazyGetAllActiveTicketsGetQuery({});
    const [currentActiveTicket, setCurrentActiveTicket] = useState<string | undefined>(undefined);

    const onHelpAndSupportPress = useHelpAndSupportHandler();
    useEffect(() => {
        getAllActiveTickets({}).then(res => {
            setCurrentActiveTicket(res.data?.activeTickets.find(ticket => ticket.rideId === shortRideId)?.ticketId);
        });
    }, []);

    const onActiveTicketsClicked = useCallback(
        (rideId: string | undefined) => {
            onHelpAndSupportPress(rideId, currentActiveTicket);
        },
        [onHelpAndSupportPress],
    );
    const { enableKaptureHelpSupport } = useAppSelector(selectNewFeatureFlags);
    const handleBackPress = () => {
        if (sosStage === 'CallingPolice') {
            if (!bookingDetails?.sosStatus || bookingDetails?.sosStatus === 'Resolved')
                dispatch(setsosStage('DeActivated'));
            else if (bookingDetails?.sosStatus === 'Pending') dispatch(setsosStage('Activated'));
        } else {
            navigation.goBack();
        }
        if (currentScreen.current === 'HelpAndSupport') {
            currentScreen.current = 'Safety';
        } else {
            stopAudio();
        }
        return true;
    };

    return (
        <HardwareBackpressHandler onHardwareBackPress={handleBackPress}>
            <Animated.View style={tailwind.style('flex-row justify-between px-[16px] items-center')}>
                <Button
                    testID="safety_back"
                    size="md"
                    type={'secondary'}
                    onPress={handleBackPress}
                    style={tailwind.style(
                        'w-[52px] h-[40px] justify-center border-[#E0E3E8] bg-[#FFFFFF] items-center',
                    )}
                    prefix={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                />
                <Tag
                    testID="safety_report_issue"
                    size="md"
                    key={'tag'}
                    type="secondary"
                    style={tailwind.style('justify-center border-[#E0E3E8] bg-[#FFFFFF] items-center')}
                    onPress={() => {
                        logEvent(EventName.NY_USER_REPORT_SAFETY_ISSUE_ACTIVATED);
                        currentScreen.current = 'HelpAndSupport';
                        if (enableKaptureHelpSupport) {
                            onActiveTicketsClicked(props.rideId ?? undefined);
                        } else {
                            navigation.navigate('ProfileTab', {
                                screen: 'helpAndSupportNavigator',
                                params: {
                                    screen: 'reportIssueChatScreen',
                                    params: {
                                        category: {
                                            issueCategoryId: 'f01lail9-0hrg-elpj-skkm-2omgyhk3c2h0',
                                            label: '',
                                            category: 'Safety Related Issue',
                                        },
                                        rideId: props.rideId ?? undefined,
                                        issueReportId: undefined,
                                        ticketId: undefined,
                                        driverNumber: undefined,
                                    },
                                },
                            });
                        }
                    }}
                    icon={<Icon icon={<Doc color="black" />} size={20} />}
                    text={userLanguageStrings.ReportSafetyIssues}
                />
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const WarningView = (props: { userLanguageStrings: strings }) => {
    const { userLanguageStrings } = props;
    return (
        <Animated.View
            style={tailwind.style(
                'bg-[#FFFFFF] flex-row py-[17px] px-[16px] justify-center gap-[8px] border-[#F0F0F0] items-center rounded-[16px] border-[1px]',
            )}>
            <Animated.Image
                accessible={true}
                accessibilityLabel="warning triangle image"
                source={{ uri: 'mt_ic_warning_triangle_red', height: 16, width: 16 }}
            />
            <Typography
                type="subhead-3"
                style={tailwind.style('text-center flex text-[#14171F]')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.SOSfeaturewillbedisabledifmisusedthrice}
            </Typography>
        </Animated.View>
    );
};

const InitialSOSView = (props: InitialSOSViewProps) => {
    const sosStage = useAppSelector(selectSosStage);
    const dispatch = useAppDispatch();
    const { userLanguageStrings } = props;
    return (
        <Animated.View style={tailwind.style('h-[full] flex-1 gap-[20px]')}>
            <ScrollView style={tailwind.style('mb-[30px]')} showsVerticalScrollIndicator={false}>
                <SOSButtonView />
                <Animated.View style={tailwind.style('gap-[10px] px-[16px] py-[16px]')}>
                    <SOSBodyView bookingId={props.bookingId} />
                    {sosStage === 'Activating' ? <WarningView userLanguageStrings={userLanguageStrings} /> : <></>}
                </Animated.View>
            </ScrollView>
            {sosStage === 'Activating' ? (
                <Animated.View style={tailwind.style('flex absolute w-full bottom-[0px] px-[16px]')}>
                    <Button
                        testID="safety_cancel_sos"
                        type="primary"
                        text={userLanguageStrings.CancelSOS}
                        numberOfLines={0}
                        onPress={() => {
                            dispatch(activateSafetyTool(undefined));
                            stopAudio();
                            dispatch(setsosStage('DeActivated'));
                        }}
                    />
                </Animated.View>
            ) : (
                <></>
            )}
        </Animated.View>
    );
};

type SafetyToolsRouteProp = RouteProp<MainNavigationParamList, 'safetyTools'>;

export const SafetyTools: React.FC = () => {
    const route = useRoute<SafetyToolsRouteProp>();
    const { bookingId, isRideEnded } = route.params;
    const { top, bottom } = useSafeAreaInsets();
    const sosStage = useAppSelector(selectSosStage);
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { data, isFetching } = useSosGetDetailsRideIdGetQuery({
        rideId: rideId ?? '',
    });
    const [showShimmer, setShowShimmer] = useState<boolean>(true);

    useEffect(() => {
        if (isRideEnded) dispatch(setIsRideEnded(isRideEnded));
    }, [isRideEnded]);

    useEffect(() => {
        if (!isFetching) setShowShimmer(false);
    }, [isFetching]);

    useEffect(() => {
        if (data?.sos?.id !== undefined) {
            dispatch(setSosId(data?.sos.id));
        }
        if (data?.sos?.status === 'Pending') {
            dispatch(setsosStage('Activated'));
        }
    }, [data?.sos]);

    return (
        <Animated.View
            style={tailwind.style(
                `align-middle bg-[#F8F9FB] flex h-full pt-[${top}] pb-[${bottom}] gap-[20px] w-full`,
            )}>
            {showShimmer ? (
                <ContentLoader height={'100%'} width={'100%'} foregroundColor={`${colors?.recovered?.greyMid}`}>
                    <Rect x="15" y="10%" rx="6" ry="6" width="94%" height="60%" />
                    <Rect x="15" y="73%" rx="6" ry="6" width="94%" height="10%" />
                </ContentLoader>
            ) : (
                <View style={tailwind.style(`flex h-full gap-[30px]`)}>
                    <SafetyToolsHeader
                        rideId={rideId}
                        userLanguageStrings={userLanguageStrings}
                        bookingId={bookingId}
                    />
                    {(sosStage === 'DeActivated' || sosStage === 'Activating') && (
                        <InitialSOSView bookingId={bookingId} userLanguageStrings={userLanguageStrings} />
                    )}
                    {sosStage === 'Activated' && <SOSActivatedView bookingId={bookingId} />}
                    {sosStage === 'CallingPolice' && <DiallingPolice bookingId={bookingId} />}
                </View>
            )}
            {/* <View style={[tailwind.style(`pt-[${top}] pb-[${bottom}]`), { position: 'absolute', flex: 1, right: 0, width : `90%`}]}>
        <Dropdown
          placeHolder={'userLanguageStrings.SelectYourGender'}
          showSelectedItem={false}
          dropDownItems={[
            {text: 'Report Safety Issue'},
            {text: 'Start Test Drill'},
            {text: 'Learn About Safety'},
          ]}
          onSelect={handleDropDownItem}
          style={{marginEnd: 16}}
          itemTextStyle={{marginLeft: 10}}
          touchableContainerStyle={{
            marginTop: 0,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 30,
            margin: 0,
          }}
          dropdownContainerStyle={{left: 'auto', right: 0}}
        />
      </View> */}
        </Animated.View>
    );
};
