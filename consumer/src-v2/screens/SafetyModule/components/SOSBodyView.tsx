import React, { useCallback, useEffect } from 'react';
import { ContactViewProps } from '../Types';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { SOSInfoView } from './SOSInfoView';
import DashedLine from '../../../../src/typescript/components/DashedLine';
import { SOSToolsSection } from './SOSToolsView';
import { ToolCenterCard } from '../../../../src/typescript/designSystem/components/toolcenter/ToolCenterCard';
import { VolumeOff } from '../../../../src/typescript/components/svg/VolumeOff';
import { VolumeOn } from '../../../../src/typescript/components/svg/VolumeOn';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import { getInitials } from '../../../../src/typescript/utils/common';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectSosStage, setSirenPlaying } from '@/typescript/state/client/sos';
import { AudioRecorderView } from './AudioRecorderView';
import { stopAudio, playAudio } from '../../../helpers/audio/AudioModule';
import { selectActiveSafetyTool, setAutoCallDefaultContact } from '../../../../src/typescript/state/client/sos';
import { getRandomColor } from '../Flow';
import { Linking, View } from 'react-native';
import { BookingId } from '../../../../src/typescript/state/client/user';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch } from '../../../../src/typescript/state/hooks';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useProfileGetEmergencySettingsGetQuery } from '@/api/integrations/rtk/ProfileGetEmergencySettingsGet';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const ContactView = (props: ContactViewProps) => {
    const makeCall = () => {
        Linking.openURL(`tel:${props.contactNumber}`);
    };
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <Animated.View>
            <TouchableOpacity
                accessibilityRole="button"
                testID="safety_contact_call"
                onPress={makeCall}
                style={tailwind.style(`w-[${(SCREEN_WIDTH - 98) / 3}px] items-center gap-[10px]`)}>
                <Animated.View
                    style={tailwind.style(`rounded-[20px] bg-[${getRandomColor(themeColors)}] px-[12px] py-[8.5px]`)}>
                    <Typography
                        type="subhead-3"
                        style={tailwind.style('text-[white]')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {getInitials(props.name)}
                    </Typography>
                </Animated.View>
                <Typography
                    type="subhead-3"
                    style={tailwind.style('text-ellipsis overflow-hidden text-center')}
                    numberOfLines={2}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {props.name}
                </Typography>
            </TouchableOpacity>
        </Animated.View>
    );
};

const TapToCall = (props: { emergencyContacts: personDefaultEmergencyNumberAPIEntity[] }) => {
    const { emergencyContacts } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View style={tailwind.style('gap-[16px]')}>
            <Typography
                type="body-1"
                style={tailwind.style('pb-[12px] text-[#14171F]')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.TapToCallOtherEmergencyContacts}
            </Typography>
            <Animated.View style={tailwind.style('flex-row ')}>
                {emergencyContacts.map(item => {
                    return <ContactView name={item.name} contactNumber={item.mobileNumber} />;
                })}
            </Animated.View>
        </Animated.View>
    );
};

const ActiveSafetyToolView = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();
    return (
        <Animated.View>
            <ToolCenterCard
                initialActiveState={false}
                key={1}
                id={'PlaySiren'}
                label={userLanguageStrings.PlaySiren}
                imgSrc={<VolumeOff />}
                gap={45}
                activeImgSrc={<VolumeOn />}
                flexDirection="flex-col"
                style={tailwind.style('px-[16px] items-center border-[#F0F0F0] border-[1px]')}
                canToggle={true}
                onPress={() => {
                    dispatch(setSirenPlaying(true));
                    playAudio('ny_ic_sos_danger_full.mp3', true);
                }}
                onPressActive={() => {
                    dispatch(setSirenPlaying(false));
                    stopAudio();
                }}
                horizontalAlignment="items-center"
                numberOfElements={1}
                specialLocationTag={undefined}
                imgSize={undefined}
                imgFill={undefined}
                textStyle={undefined}
                disabled={undefined}
            />
        </Animated.View>
    );
};

export const SOSBodyView = (props: { bookingId: BookingId | null }) => {
    const { data: emergencySettings, refetch } = useProfileGetEmergencySettingsGetQuery({
        isPolling: false,
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, []),
    );
    const dispatch = useAppDispatch();
    const sosStage = useAppSelector(selectSosStage);
    const activeSafetyTool = useAppSelector(selectActiveSafetyTool);

    const defaultEmergencyNumbers = emergencySettings?.defaultEmergencyNumbers || [];

    useEffect(() => {
        dispatch(setAutoCallDefaultContact(emergencySettings?.autoCallDefaultContact ?? false));
    }, [emergencySettings?.autoCallDefaultContact]);

    return (
        <View
            style={[
                tailwind.style(
                    'border-[1px] border-[#F1F1F1] bg-[white] rounded-[20px] flex-col py-[20px] px-[22px] gap-[16px]',
                ),
                {
                    shadowColor: '#000000',
                    shadowOffset: { width: 1, height: 6 },
                    shadowOpacity: 0.07,
                    shadowRadius: 5,
                    elevation: 3,
                },
            ]}>
            {sosStage === 'Activated' ? (
                defaultEmergencyNumbers.length > 0 ? (
                    <TapToCall emergencyContacts={defaultEmergencyNumbers} />
                ) : (
                    <></>
                )
            ) : (
                <SOSInfoView
                    isEmergencyContactEditable={sosStage === 'DeActivated'}
                    emergencyContacts={defaultEmergencyNumbers}
                />
            )}
            {sosStage === 'Activated' ? (
                defaultEmergencyNumbers.length > 0 ? (
                    <DashedLine color="#E1E1E1" />
                ) : (
                    <></>
                )
            ) : (
                <></>
            )}
            {activeSafetyTool === undefined ? (
                <SOSToolsSection bookingId={props.bookingId} />
            ) : activeSafetyTool === 'RecordAudio' ? (
                <AudioRecorderView bookingId={props.bookingId} />
            ) : activeSafetyTool === 'PlaySiren' ? (
                <ActiveSafetyToolView />
            ) : (
                <></>
            )}
        </View>
    );
};
