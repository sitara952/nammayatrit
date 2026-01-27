import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { memo, useEffect, useState } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { FullScreenModal } from '../../components/FullScreenModal';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { default as FallbackQRCode } from 'react-native-qrcode-svg';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig, selectNewFeatureFlags, selectOperatingCity } from '@/typescript/state/client/session';
import { setBrightnessLevel, resetBrightness, getBrightnessLevel } from '@reeq/react-native-device-brightness';
import { Platform } from 'react-native';

const generateDynamicSuffix = (): string => {
    const now = new Date();
    const unixTimestamp = now.getTime(); // Milliseconds since epoch
    const hexTimestamp = Math.floor(unixTimestamp / 1000).toString(16); // Convert to seconds and then to hex
    return `#{${hexTimestamp}||0.0|0.0|}`;
};

export interface QrCodeViewProps {
    jsonString: string | undefined;
    size?: number;
    progress?: SharedValue<number>;
    isInModal?: boolean;
}

export const QrCodeView = memo(({ jsonString, size = 171 }: QrCodeViewProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [brightnessLevel, setBrightnessLevelState] = useState<number | null>(null);
    const QR_MODAL_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.6; // 70% of the smaller dimension
    const city = useAppSelector(selectOperatingCity);

    useEffect(() => {
        if (isModalVisible) {
            const brightness = getBrightnessLevel();
            setBrightnessLevelState(brightness);
            setBrightnessLevel(1);
        } else {
            if (brightnessLevel !== null) {
                if (Platform.OS == 'ios') setBrightnessLevel(brightnessLevel);
                else resetBrightness();
            }
        }
    }, [isModalVisible]);

    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const appConfig = useAppSelector(selectAppConfig);

    const [qrValue, setQrValue] = useState(jsonString);

    useEffect(() => {
        if (!jsonString) {
            setQrValue(undefined);
            return;
        }

        if (!newFeatureFlags.multimodalTicketConfig.dynamicRefresh && city !== 'bangalore') {
            setQrValue(jsonString);
            return;
        }

        const updateQrValue = () => {
            const suffix = generateDynamicSuffix();
            setQrValue(`${jsonString}${suffix}`);
        };

        // Initial update
        updateQrValue();

        const intervalId = setInterval(updateQrValue, newFeatureFlags.multimodalTicketConfig.refreshTime);

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [jsonString]); // Re-run effect if original jsonString changes

    return (
        <>
            <Pressable
                accessibilityRole="button"
                testID="qr-code-pressable"
                accessibilityLabel="QR Code button"
                onPress={() => setIsModalVisible(true)}>
                <Animated.View
                    style={[
                        tailwind.style(`flex-row flex-wrap justify-center align-center w-[${size}px] h-[${size}px] `),
                    ]}>
                    <FallbackQRCode
                        value={qrValue}
                        size={size}
                        logoSize={30}
                        logoMargin={1}
                        logoBackgroundColor={'white'}
                        logoBorderRadius={8}
                        logo={appConfig.assets.fallbackQrImageUri ? appConfig.assets.fallbackQrImageUri : ''}
                    />
                    {/* {!isInModal && (
                        <Animated.View
                            style={[tailwind.style('mt-3 self-center flex-row items-center gap-1.5'), { opacity }]}
                            accessible={false}
                            importantForAccessibility={'no-hide-descendants'}>
                            <Typography
                                type="subhead-2"
                                style={tailwind.style('text-[12px] opacity-60 text-[#646464]')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined} accessibilityRole={undefined}>
                                Swipe for Bus OTP
                            </Typography>
                            <Icon icon={<DoubleArrows />} style={tailwind.style('pt-0.2')} />
                        </Animated.View>
                    )} */}
                </Animated.View>
            </Pressable>

            <FullScreenModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                contentStyle={tailwind.style(`w-[${QR_MODAL_SIZE}px] h-[${QR_MODAL_SIZE}px] p-5`)}>
                <FallbackQRCode
                    value={qrValue}
                    size={QR_MODAL_SIZE - 20}
                    logoSize={QR_MODAL_SIZE * 0.15} // Adjust logo size proportionally
                    logoMargin={1}
                    logoBackgroundColor={'white'}
                    logoBorderRadius={8}
                    logo={appConfig.assets.fallbackQrImageUri ? '' : appConfig.assets.fallbackQrImageUri}
                />
            </FullScreenModal>
        </>
    );
});
