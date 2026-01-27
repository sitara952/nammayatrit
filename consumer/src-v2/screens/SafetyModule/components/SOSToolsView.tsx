import {
    getSirenPlaying,
    selectSosId,
    setSirenPlaying,
    setSosId,
    SOSTool,
} from '../../../../src/typescript/state/client/sos';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import React from 'react';
import Animated from 'react-native-reanimated';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import { ToolCenterCard } from '../../../../src/typescript/designSystem/components/toolcenter/ToolCenterCard';
import { AudioIcon } from '../../../../src/typescript/components/svg/AudioIcon';
import { AlertIcon } from '../../../../src/typescript/components/svg/AlertIcon';
import { Headphone } from '../../../../src/typescript/components/svg/HeadPhone';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectSosStage } from '@/typescript/state/client/sos';
import { useAppDispatch } from '../../../../src/typescript/state/hooks';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { setsosStage, activateSafetyTool, resetActiveSafetyTool } from '../../../../src/typescript/state/client/sos';
import { playAudio, pauseAudio, stopRecording } from '../../../helpers/audio/AudioModule';
import { Linking, TextStyle } from 'react-native';
import { getSafetyCreatePostBody, safetyToolsList, safetyToolsListActive } from '../Flow';
import { selectSafetyHelplineNo } from '@/typescript/state/client/session';
import { VolumeOff } from '../../../../src/typescript/components/svg/VolumeOff';
import { VolumeOn } from '../../../../src/typescript/components/svg/VolumeOn';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BookingId } from '@/typescript/state/client/user';
import { selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { useSosCreatePostMutation } from '@/api/integrations/rtk/SosCreatePost';

const getImgById = (id: string, active: boolean): React.JSX.Element => {
    switch (id) {
        case 'RecordAudio':
            return <AudioIcon fill={undefined} />;
        case 'CallPolice':
            return <AlertIcon fill={undefined} />;
        case 'CallSafetyTeam':
            return <Headphone fill={undefined} />;
        case 'PlaySiren':
            return active ? <VolumeOn /> : <VolumeOff />;
        default:
            return <></>;
    }
};

const RenderSafetyToolCard = (props: {
    safetyToolList: Array<{
        label: string;
        imgFill: string;
        id: SOSTool;
    }>;
    safetyHelpLineNumber: string;
    horizontalAlignment: string | undefined;
    textStyle: TextStyle | undefined;
    bookingId: BookingId | null;
}) => {
    const { horizontalAlignment, textStyle, safetyToolList, safetyHelpLineNumber } = props;
    const dispatch = useAppDispatch();
    const isSirenPlaying = useAppSelector(getSirenPlaying);
    const sosId = useAppSelector(selectSosId);
    const rideId: string | null = useAppSelector(state => selectRideIdWithBookingId(state, props.bookingId));

    const [sosCreatePost] = useSosCreatePostMutation();

    const handleToolCardClick = (id: SOSTool, isActive: boolean) => {
        const evalAction: Record<SOSTool, () => void> = {
            CallPolice: () => {
                logEvent(EventName.NY_USER_CALL_POLICE_ACTIVATED);
                if (!isActive) dispatch(setsosStage('CallingPolice'));
            },
            CallSafetyTeam: async () => {
                if (!isActive) {
                    if (sosId === undefined) {
                        const sosRequestBody = await getSafetyCreatePostBody(rideId, 'CustomerCare');
                        sosCreatePost({ body: sosRequestBody }).then(data => {
                            if (data.data?.sosId !== undefined) {
                                dispatch(setSosId(data?.data?.sosId));
                            }
                        });
                    }
                    Linking.openURL(`tel:${safetyHelpLineNumber}`);
                }
            },
            RecordAudio: () => {
                if (isActive) {
                    dispatch(resetActiveSafetyTool());
                    stopRecording();
                } else {
                    dispatch(activateSafetyTool('RecordAudio'));
                }
            },
            PlaySiren: () => {
                isActive ? pauseAudio() : playAudio('ny_ic_sos_danger_full.mp3', true);
            },
        };
        if (id in evalAction) {
            evalAction[id]();
        }
    };

    return (
        <Animated.View style={tailwind.style('flex-row flex justify-between')}>
            {safetyToolList.map((tool, index) => {
                return (
                    <ToolCenterCard
                        initialActiveState={tool.id === 'PlaySiren' ? isSirenPlaying : false}
                        key={index + tool.label}
                        label={tool.label}
                        imgSrc={getImgById(tool.id, false)}
                        activeImgSrc={getImgById(tool.id, true)}
                        imgSize={16}
                        imgFill={tool.imgFill}
                        id={tool.id}
                        gap={18}
                        flexDirection="flex-col"
                        horizontalAlignment={horizontalAlignment}
                        textStyle={textStyle}
                        onPress={() => {
                            dispatch(setSirenPlaying(true));
                            handleToolCardClick(tool.id, false);
                        }}
                        onPressActive={() => {
                            dispatch(setSirenPlaying(false));
                            handleToolCardClick(tool.id, true);
                        }}
                        canToggle={tool.id === 'RecordAudio' || tool.id === 'PlaySiren'}
                        numberOfElements={safetyToolList.length}
                        style={tailwind.style(
                            `px-[10px] py-[5px] ${horizontalAlignment} border-[#F0F0F0] border-[1px]`,
                        )}
                        specialLocationTag={undefined}
                        disabled={undefined}
                    />
                );
            })}
        </Animated.View>
    );
};

export const SOSToolsSection = ({ bookingId }: { bookingId: BookingId | null }) => {
    const { safetyNumber, enableSafetyCall } = useAppSelector(selectSafetyHelplineNo);
    const sosStage = useAppSelector(selectSosStage);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const safetyListActiveData = safetyToolsListActive(userLanguageStrings, themeColors, enableSafetyCall);
    const safetyListData = safetyToolsList(userLanguageStrings, themeColors, enableSafetyCall);

    return (
        <Animated.View style={tailwind.style('gap-[10px]')}>
            <Typography
                type="body-1"
                style={tailwind.style('pb-[12px] text-[#14171F]')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                Safety Tools
            </Typography>
            {sosStage === 'Activated' ? (
                <>
                    <RenderSafetyToolCard
                        safetyToolList={safetyListActiveData.slice(0, 2)}
                        horizontalAlignment="items-center"
                        textStyle={tailwind.style('text-[#5B6777]')}
                        safetyHelpLineNumber={safetyNumber}
                        bookingId={bookingId}
                    />
                    <RenderSafetyToolCard
                        safetyToolList={safetyListActiveData.slice(2, 4)}
                        horizontalAlignment="items-center"
                        textStyle={tailwind.style('text-[#5B6777]')}
                        safetyHelpLineNumber={safetyNumber}
                        bookingId={bookingId}
                    />
                </>
            ) : (
                <RenderSafetyToolCard
                    safetyToolList={safetyListData}
                    safetyHelpLineNumber={safetyNumber}
                    horizontalAlignment={undefined}
                    textStyle={undefined}
                    bookingId={bookingId}
                />
            )}
        </Animated.View>
    );
};
