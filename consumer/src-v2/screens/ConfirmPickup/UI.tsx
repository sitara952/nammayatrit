import { SCREEN_HEIGHT, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';

import CardDefault from '@/typescript/designSystem/components/CardDefault';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import colors from '@/typescript/designSystem/colorPalette';

import { ConfirmPickupViewProps } from './Types';
import { englishStrings } from 'config-types';
import { AccessibilityInfo } from 'react-native';
import { useRefsContext } from '@/typescript/context/RefsContext';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import { useAppSelector } from '@/typescript/state/hooks';
import { PickupInstructionsModalFlow } from '@/src-v2/components/PickupInstructionsModal/Flow';
import { useBase64AudioPlayer } from '@/src-v2/components/PickupInstructionsModal/useBase64AudioPlayer';
import { formatTime } from '@/src-v2/utils/common';
import { PlayIcon } from '@/typescript/components/svg/PlayIcon';
import { PauseIcon } from '@/typescript/components/svg/PauseIcon';
import LottieView from 'lottie-react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { Icon } from '@/typescript/components/Icon';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { selectAppConfig } from '@/typescript/state/client/session';

// Audio instruction display component
interface PickupInstructionDisplayProps {
    displayedNote: string;
    closestInstructionData: { instruction: string | null; audioBase64: string | null | undefined } | undefined;
    canEdit: boolean;
    onEditPress: () => void;
}

const PickupInstructionDisplay: React.FC<PickupInstructionDisplayProps> = ({
    displayedNote,
    closestInstructionData,
    canEdit,
    onEditPress,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');

    const componentStyles = createPickupInstructionDisplayStyles(themeColors);
    const animationRef = React.useRef<LottieView>(null);
    const [hasStartedPlaying, setHasStartedPlaying] = React.useState(false);

    // Check if we have audio data
    const hasAudio = closestInstructionData?.audioBase64;
    const audioBase64 = closestInstructionData?.audioBase64;
    const { isPlaying, time, playAudio, pauseAudio } = useBase64AudioPlayer(audioBase64);

    // Control animation based on playing state
    React.useEffect(() => {
        if (animationRef.current) {
            if (isPlaying) {
                animationRef.current.play();
            } else {
                animationRef.current.pause();
            }
        }
    }, [isPlaying]);

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
            // Once user starts playing, switch to audio interface
            if (!hasStartedPlaying) {
                setHasStartedPlaying(true);
            }
        }
    };

    if (hasAudio) {
        // Show text initially, then audio interface after user hits play
        if (!hasStartedPlaying) {
            // Show text with play button initially
            return (
                <Animated.View style={componentStyles.pickupInstructionSection}>
                    <Typography
                        type="body-2"
                        style={componentStyles.pickupInstructionLabel}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.PickupInstruction}
                    </Typography>
                    <View style={componentStyles.instructionRow}>
                        <View style={componentStyles.textWithPlayContainer}>
                            <TouchableOpacity
                                accessibilityRole="button"
                                onPress={handlePlayPause}
                                style={componentStyles.playButton}
                                testID="audio-instruction-play-button">
                                <Icon
                                    icon={<PlayIcon fill={themeColors.PickupInstructions_link_text_color} />}
                                    size={16}
                                />
                            </TouchableOpacity>
                            <Typography
                                type="body-2"
                                style={componentStyles.instructionTextWithAudio}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {displayedNote}
                            </Typography>
                        </View>
                        {canEdit && (
                            <TouchableOpacity
                                accessibilityRole="button"
                                onPress={onEditPress}
                                style={componentStyles.editButton}
                                testID="pickup-instructions-edit-button-text-audio">
                                <Typography
                                    type="body-2"
                                    style={componentStyles.editButtonText}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Edit}
                                </Typography>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            );
        }

        // Show audio playback UI after user has started playing
        return (
            <Animated.View style={componentStyles.pickupInstructionSection}>
                <Typography
                    type="body-2"
                    style={componentStyles.pickupInstructionLabel}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.PickupInstruction}
                </Typography>
                <View style={componentStyles.instructionRow}>
                    <View style={componentStyles.audioPlaybackContainer}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={handlePlayPause}
                            style={componentStyles.playPauseButton}
                            testID="audio-playback-toggle-main">
                            <Icon
                                icon={
                                    isPlaying ? (
                                        <PauseIcon fill={themeColors.Modal_title_text_color} />
                                    ) : (
                                        <PlayIcon fill={themeColors.Modal_title_text_color} />
                                    )
                                }
                                size={16}
                            />
                        </TouchableOpacity>
                        <View style={componentStyles.waveformContainer}>
                            <LottieWithFallback
                                style={componentStyles.waveform}
                                lottieRef={animationRef}
                                source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                                autoPlay={false}
                                loop={true}
                                fallback={undefined}
                            />
                        </View>
                        <Typography
                            type="body-2"
                            style={componentStyles.timerText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {formatTime(time)}
                        </Typography>
                    </View>
                    {canEdit && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={onEditPress}
                            style={componentStyles.editButton}
                            testID="pickup-instructions-edit-button-audio">
                            <Typography
                                type="body-2"
                                style={componentStyles.editButtonText}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Edit}
                            </Typography>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        );
    }

    // Show text instruction UI
    return (
        <Animated.View style={componentStyles.pickupInstructionSection}>
            <Typography
                type="body-2"
                style={componentStyles.pickupInstructionLabel}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.PickupInstruction}
            </Typography>
            <View style={componentStyles.instructionRow}>
                <Typography
                    type="body-2"
                    style={componentStyles.instructionText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {displayedNote}
                </Typography>
                {canEdit && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={onEditPress}
                        style={componentStyles.editButton}
                        testID="pickup-instructions-edit-button">
                        <Typography
                            type="body-2"
                            style={componentStyles.editButtonText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Edit}
                        </Typography>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

const ConfirmPickupView_: React.FC<ConfirmPickupViewProps> = ({
    isPickup,
    selectedStopIndex,
    destinationIndex,
    scrollViewRef,
    locationList,
    isSpecialLocation,
    selectedGateId,
    setCustomPickupZoneGate,
    customPickupZoneGate,
    cpDispatch,
    isPickupTooFar,
    reduxDispatch: _reduxDispatch,
    // Pickup Instructions props
    displayedNote,
    modalVisible,
    userLocation,
    closestInstructionData,
    canEdit,
    enablePickupInstructions,
    pickupInstructionsCharLimit,
    onModalVisibilityChange,
    onAddNote,
    onSaveToBackend,
    onAudioRecordingComplete,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);
    const isAnna = appConfig.appType === 'multimodal';

    console.info('SAM_DEBUG: ConfirmPickup component rendering with props:', {
        displayedNote,
        enablePickupInstructions,
        canEdit,
        userLocation,
    });

    const accessibleTitle = isPickup
        ? englishStrings.ConfirmPickup
        : selectedStopIndex === destinationIndex
          ? englishStrings.ConfirmDrop
          : `${englishStrings.ConfirmStop} ${selectedStopIndex + 1}`;

    const { bottomSheetTopBannerRef } = useRefsContext();

    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions(`${accessibleTitle} popup`, { queue: true });
        return () => {
            bottomSheetTopBannerRef.current = false;
            setCustomPickupZoneGate(undefined);
        };
    }, []);
    const { bottom } = useSafeAreaInsets();

    const bottomPadding = 120 + bottom;

    const styles = createConfirmPickupStyles(themeColors);

    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(400)}
            style={[
                tailwind?.style(`bg-[${themeColors.Fill_neutralUltraLow}] px-[${token?.spacing?.[16]}]`),
                { minHeight: 300 },
            ]}
            accessible={false}>
            <Animated.View style={tailwind?.style(`flex-row justify-start`)}>
                <Typography
                    type="subhead-800"
                    style={tailwind.style(`text-lg pb-[12px]`)}
                    accessible={true}
                    accessibilityLabel={accessibleTitle}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessibilityRole={undefined}>
                    {isPickup
                        ? isAnna
                            ? userLanguageStrings.ConfirmStartLocation
                            : userLanguageStrings.ConfirmPickup
                        : selectedStopIndex === destinationIndex
                          ? userLanguageStrings.ConfirmDrop
                          : `${userLanguageStrings.ConfirmStop} ${selectedStopIndex + 1}`}
                </Typography>
            </Animated.View>
            <BottomSheetScrollView
                nestedScrollEnabled={true}
                accessible={false}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                scrollEnabled={locationList.length > 1}
                style={tailwind.style(`max-h-[${SCREEN_HEIGHT * 0.5 - 96 - 16}px] pt-[${token?.spacing?.[12]}]`)}
                contentContainerStyle={tailwind.style(`pb-[${bottomPadding}px]`)}>
                <>
                    <>
                        {locationList.map((item, index) => {
                            return item ? (
                                <CardDefault
                                    accessible={false}
                                    key={index}
                                    style={tailwind.style(`${index !== 0 ? `mt-${token?.spacing?.[16]}` : ''}`)}
                                    showTime={false}
                                    onPress={() => {
                                        cpDispatch({
                                            type: 'LOCATION_CARD_CLICKED',
                                            payload: { placeId: item.placeId },
                                        });
                                        // if (isSpecialLocation) {
                                        //   handleSpecialLocClick(item.placeId);
                                        //   setSelectedGateId(item.placeId);
                                        // } else {
                                        //   handleLocationClick();
                                        // }
                                    }}
                                    isSelected={locationList.length != 1 && item.placeId === selectedGateId}
                                    title={item?.title}
                                    description={
                                        item.formattedAddress ??
                                        `${
                                            item?.addressComponents?.building
                                                ? item.addressComponents.building + ','
                                                : ''
                                        } ${item?.addressComponents?.area ?? ''}`.trim()
                                    }
                                    suffixView={
                                        !isSpecialLocation && (
                                            <TouchableOpacity
                                                testID={`confirm_pickup_location_edit_${item?.title?.toLowerCase().replace(/\s+/g, '_')}`}
                                                accessible={true}
                                                accessibilityLabel="Edit"
                                                accessibilityHint={
                                                    'click to edit ' + (isPickup ? 'Pickup' : 'Drop') + ' location'
                                                }
                                                accessibilityRole="button"
                                                onPress={
                                                    () =>
                                                        cpDispatch({
                                                            type: 'LOCATION_CARD_CLICKED',
                                                            payload: { placeId: item.placeId },
                                                        })
                                                    // handleLocationClick
                                                }>
                                                <Typography
                                                    type="body-2"
                                                    style={tailwind.style(
                                                        `text-primary text-[${colors?.recovered?.linkBlue}] `,
                                                    )}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {userLanguageStrings.Edit}
                                                </Typography>
                                            </TouchableOpacity>
                                        )
                                    }
                                />
                            ) : null;
                        })}
                        {customPickupZoneGate && (
                            <CardDefault
                                accessible={false}
                                key={'Custom_Pick_Up_Zone_Gate'}
                                style={tailwind.style('mt-[16px]')}
                                showTime={false}
                                onPress={() => {
                                    cpDispatch({
                                        type: 'LOCATION_CARD_CLICKED',
                                        payload: { placeId: customPickupZoneGate?.placeId },
                                    });
                                }}
                                isSelected={customPickupZoneGate?.placeId === selectedGateId}
                                title={customPickupZoneGate?.title}
                                description={
                                    customPickupZoneGate.formattedAddress ??
                                    `${
                                        customPickupZoneGate?.addressComponents?.building
                                            ? customPickupZoneGate.addressComponents.building + ','
                                            : ''
                                    } ${customPickupZoneGate?.addressComponents?.area ?? ''}`.trim()
                                }
                                suffixView={
                                    !isSpecialLocation && (
                                        <TouchableOpacity
                                            testID="confirm_pickup_custom_zone_edit"
                                            accessible={true}
                                            accessibilityLabel="Edit"
                                            accessibilityHint={
                                                'click to edit ' + (isPickup ? 'Pickup' : 'Drop') + ' location'
                                            }
                                            accessibilityRole="button"
                                            onPress={() =>
                                                cpDispatch({
                                                    type: 'LOCATION_CARD_CLICKED',
                                                    payload: { placeId: customPickupZoneGate?.placeId },
                                                })
                                            }>
                                            <Typography
                                                type="body-2"
                                                style={tailwind.style(
                                                    `text-primary text-[${colors?.recovered?.linkBlue}]`,
                                                )}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {userLanguageStrings.Edit}
                                            </Typography>
                                        </TouchableOpacity>
                                    )
                                }
                            />
                        )}
                        {isPickup && isPickupTooFar && !isSpecialLocation && (
                            <Animated.View entering={FadeIn} style={styles.warningContainer}>
                                <View style={styles.warningNotch} />
                                <Typography
                                    type="body-2"
                                    style={styles.warningText}
                                    accessible={true}
                                    accessibilityLabel="This location is far away from your current location"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Pickuptoofarfromcurrentlocation}
                                </Typography>
                            </Animated.View>
                        )}
                    </>
                    {enablePickupInstructions && displayedNote ? (
                        <PickupInstructionDisplay
                            displayedNote={displayedNote}
                            closestInstructionData={closestInstructionData}
                            canEdit={canEdit}
                            onEditPress={() => {
                                console.info('SAM_DEBUG: Edit button clicked, opening modal. hasEdited =', canEdit);
                                onModalVisibilityChange(true);
                            }}
                        />
                    ) : (
                        enablePickupInstructions &&
                        isPickup && (
                            <TouchableOpacity
                                testID="confirm_pickup_add_instructions"
                                accessible={true}
                                accessibilityLabel="Add pickup instructions for driver"
                                accessibilityRole="link"
                                style={styles.addInstructionsButton}
                                onPress={() => {
                                    console.info(
                                        'SAM_DEBUG: Add instructions button clicked, displayedNote =',
                                        displayedNote,
                                    );
                                    onModalVisibilityChange(true);
                                }}>
                                <Typography
                                    type="body-2"
                                    style={styles.addInstructionsText}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    + {userLanguageStrings.AddPickupInstructionsForDriver}
                                </Typography>
                            </TouchableOpacity>
                        )
                    )}
                </>
            </BottomSheetScrollView>

            <PickupInstructionsModalFlow
                isVisible={modalVisible}
                onClose={() => {
                    console.info('SAM_DEBUG: Modal closed, hasEdited =', canEdit);
                    onModalVisibilityChange(false);
                }}
                onAddNote={onAddNote}
                backendInstructions={closestInstructionData?.instruction ? [closestInstructionData.instruction] : []}
                onSaveToBackend={onSaveToBackend}
                canEdit={canEdit}
                maxLength={pickupInstructionsCharLimit}
                onAudioRecordingComplete={onAudioRecordingComplete}
                currentLocation={userLocation}
                currentLocationObject={locationList.length > 0 ? locationList[0] : undefined}
                fromConfirmPickup={true}
            />
        </Animated.View>
    );
};

export const ConfirmPickupView = ConfirmPickupView_;

const createPickupInstructionDisplayStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        pickupInstructionSection: {
            marginTop: 16,
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 8,
        },
        pickupInstructionLabel: {
            fontFamily: 'Area Normal',
            fontWeight: '700',
            fontStyle: 'normal',
            fontSize: 14,
            lineHeight: 14,
            letterSpacing: 0,
            color: themeColors.PickupInstructions_header_text_color,
            marginBottom: 4,
        },
        instructionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        instructionText: {
            color: themeColors.Modal_title_text_color,
            fontSize: 14,
            fontWeight: '800',
            flex: 1,
            lineHeight: 20,
            marginRight: 12,
        },
        editButton: {
            paddingHorizontal: 4,
            paddingVertical: 2,
        },
        editButtonText: {
            color: themeColors.PickupInstructions_link_text_color,
            fontSize: 14,
            fontWeight: '800',
            textAlign: 'right',
        },
        audioPlaybackContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            maxWidth: '85%',
        },
        playPauseButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: themeColors.PickupInstructions_pill_bg_color,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
        },
        waveformContainer: {
            flex: 1,
            marginHorizontal: 8,
        },
        waveform: {
            height: 20,
            width: '100%',
        },
        timerText: {
            color: themeColors.Modal_title_text_color,
            fontSize: 14,
            fontWeight: '600',
            minWidth: 35,
            textAlign: 'right',
        },
        textWithPlayContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            maxWidth: '85%',
        },
        playButton: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -4,
            marginRight: 8,
        },
        instructionTextWithAudio: {
            color: themeColors.Modal_title_text_color,
            fontSize: 14,
            fontWeight: '800',
            flex: 1,
            lineHeight: 20,
            marginRight: 12,
        },
    });

const createConfirmPickupStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        warningContainer: {
            marginTop: 14,
            marginBottom: 8,
            padding: 8,
            borderRadius: 8,
            backgroundColor: themeColors.Warning_bg_color,
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        warningNotch: {
            position: 'absolute',
            top: -10,
            left: 24,
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderBottomWidth: 10,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: themeColors.Warning_bg_color,
            zIndex: 1,
        },
        warningText: {
            color: themeColors.Warning_text_color,
            lineHeight: 16,
            fontSize: 12,
            fontWeight: '700',
        },
        addInstructionsButton: {
            marginTop: 8,
            paddingVertical: 6,
            justifyContent: 'center',
        },
        addInstructionsText: {
            color: themeColors.PickupInstructions_link_text_color,
            fontSize: 14,
        },
    });
