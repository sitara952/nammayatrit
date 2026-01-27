import React from 'react';
import { View, Text, Image } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Button from '@/src-v2/primitives/Button';
import { skipAndStartJourneyConfig } from '@/src-v2/systems/configs/types';
import { strings } from 'config-types';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

interface SkipAndStartJourneyModalProps {
    skipAndStartConfig: skipAndStartJourneyConfig | null;
    sheetRef: React.RefObject<BottomSheetModal | null>;
    onClose: () => void;
    userLanguageStrings: strings;
}

export const SkipAndStartJourneyModal: React.FC<SkipAndStartJourneyModalProps> = ({
    skipAndStartConfig,
    sheetRef,
    onClose,
    userLanguageStrings,
}) => {
    const { bottom } = useSafeAreaInsets();
    if (!skipAndStartConfig) {
        return null;
    }

    const FeatureItem = ({ iconUrl, text }: { iconUrl: string; text: string }) => (
        <View style={tailwind.style('flex-row items-center mb-4')}>
            <View style={tailwind.style('w-10 h-10 mr-3')}>
                <Image
                    accessible={true}
                    accessibilityLabel="feature item image"
                    source={{ uri: iconUrl }}
                    style={tailwind.style('w-full h-full')}
                    resizeMode="contain"
                />
            </View>
            <View style={tailwind.style('flex-1 justify-center')}>
                <Text style={tailwind.style('text-base text-[#37313E] font-areaNormal-semibold leading-6')}>
                    {text}
                </Text>
            </View>
        </View>
    );
    return (
        <PopUpModal
            sheetRef={sheetRef}
            enableDynamicSizing={true}
            showBackdrop={true}
            onHardwareBackPress={undefined}
            isScrollable={false}
            showHandle={true}
            snapPoints={['50%']}>
            <View
                style={[
                    tailwind.style('items-center'),
                    { paddingBottom: bottom, paddingHorizontal: 24, paddingTop: 18 },
                ]}>
                {/* Title */}
                <Text style={tailwind.style('text-2xl font-areaNormal-extrabold text-[#37313E]  mb-6')}>
                    {userLanguageStrings.StartYourJourneyWithoutATicket}
                </Text>

                {/* Illustration Area */}
                <View style={tailwind.style('w-full h-50   mb-6 items-center justify-center border-')}>
                    {skipAndStartConfig.illustration_url ? (
                        <Image
                            accessible={false}
                            source={{ uri: skipAndStartConfig.illustration_url }}
                            style={tailwind.style('w-full h-full rounded-[16px]')}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={tailwind.style('text-gray-400 text-sm')}>Illustration</Text>
                    )}
                </View>

                {/* Feature List */}
                <View style={tailwind.style('w-full mb-6')}>
                    {skipAndStartConfig.text.map((item, index) => (
                        <FeatureItem key={index} iconUrl={item.iconUrl} text={item.text} />
                    ))}
                </View>

                {/* Got it Button */}
                <View style={tailwind.style('w-full ')}>
                    <Button
                        type="primary"
                        text="Got it"
                        onPress={onClose}
                        style={tailwind.style('w-full items-center justify-center ')}
                        textStyle={tailwind.style('text-center')}
                        testID="skip_and_start_modal_got_it"
                    />
                </View>
            </View>
        </PopUpModal>
    );
};
