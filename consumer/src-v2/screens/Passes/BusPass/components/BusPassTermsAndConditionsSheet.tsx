import React, { useCallback, useMemo } from 'react';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import Animated from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Dimensions } from 'react-native';
import { useConfigContext } from '../../../../../src/typescript/context/ConfigContext';
import mtIcMtcMockTicket from '../../../../assets/mt_ic_bus_sheet_bg.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BusPassTermsAndConditionsSheetProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isGoldPass: boolean;
};

const BusPassTermsAndConditionsSheet: React.FC<BusPassTermsAndConditionsSheetProps> = ({
    visible,
    setVisible,
    isGoldPass,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const SHEET_MAX_HEIGHT = Math.round(Dimensions.get('window').height * 0.7);
    const handleClose = useCallback(() => {
        setVisible(false);
    }, [setVisible]);
    const { bottom } = useSafeAreaInsets();
    const defaultTerms = useMemo(() => {
        return isGoldPass
            ? [
                  'பயணச்சீட்டில் குறிப்பிடப்பட்டுள்ள காலத்திற்கு மட்டுமே இது செல்லுபடியாகும்.',
                  'சோதனை நடைபெறும் போது, டிக்கெட் பரிசோதகர் / அதிகாரி கேட்டால் இப் பயணச்சீட்டை காட்ட வேண்டும்.',
                  'இப்பயணச்சீட்டை பயன்படுத்தி மாநகரப் போக்குவரத்து கழகத்தின் டீலக்ஸ், எக்ஸ்பிரஸ் சாதாரண மற்றும் இரவு பேருந்துகளில் பயணம் செய்யலாம். ஆனால் ஒப்பந்த பேருந்துகள், விமான நிலைய ஒப்பந்த பேருந்துகள், பணியாளர் பேருந்துகள், மற்றும் குளிரூட்டிய (A/C) பேருந்துகளில் பயணம் செய்ய அனுமதி இல்லை.',
                  'பயணச்சீட்டில் பயணியின் புகைப்படம் இல்லாவிட்டால் இது செல்லுபடியாகாது.',
                  'பேருந்தில் இருக்கை கிடைக்கும் என்பதை கழகம் உறுதி செய்யவில்லை. மேலும், பேருந்து பழுதடைதல், சேவை மாற்றம் உள்ளிட்ட எந்த காரணத்திற்கும் கழகம் பொறுப்பேற்காது.',
                  'நகல் பயணச்சீட்டு வழங்கப்படாது. எக்காரணம் கொண்டும் செலுத்திய கட்டணம் திருப்பி அளிக்கப்படாது.',
                  'அரசு உத்தரவுகள் மற்றும் மாநகரப் போக்குவரத்து கழகத்தின் உள்கட்டளைப்படி கட்டணத்தில் மாற்றம் ஏற்படலாம். கட்டண மாற்றம் ஏற்பட்டால், வித்தியாசமான தொகை வசூலிக்கப்படும்.',
                  'பஸ் பாஸ் ஒரே கைப்பேசியில் மட்டுமே பயன்படுத்த முடியும். இருப்பினும், கைப்பேசி பயன்படாத நிலை ஏற்பட்டால், நீங்கள் பாஸை மற்றொரு கைப்பேசிக்கு மாற்றிக்கொள்ளலாம். ஆனால், கைப்பேசி மாற்றம் ஒரு மாதத்தில் ஒருமுறை மட்டுமே செய்ய முடியும்.',
              ]
            : [
                  'பயணச்சீட்டில் குறிப்பிடப்பட்டுள்ள காலத்திற்கு மட்டுமே இது செல்லுபடியாகும்.',
                  'சோதனை நடைபெறும் போது, டிக்கெட் பரிசோதகர் / அதிகாரி கேட்டால் இப் பயணச்சீட்டை காட்ட வேண்டும்.',
                  'இப்பயணச்சீட்டை பயன்படுத்தி மாநகரப் போக்குவரத்து கழகத்தின் குளிரூட்டிய (A/C) பேருந்து, டீலக்ஸ், எக்ஸ்பிரஸ் சாதாரண, மற்றும் இரவு பேருந்துகளில் பயணம் செய்யலாம். ஆனால் ஒப்பந்த பேருந்துகள், விமான நிலைய ஒப்பந்த பேருந்துகள், மற்றும் பணியாளர் பேருந்துகளில் பயணம் செய்ய அனுமதி இல்லை.',
                  'பயணச்சீட்டில் பயணியின் புகைப்படம் இல்லாவிட்டால் இது செல்லுபடியாகாது.',
                  'பேருந்தில் இருக்கை கிடைக்கும் என்பதை கழகம் உறுதி செய்யவில்லை. மேலும், பேருந்து பழுதடைதல், சேவை மாற்றம் உள்ளிட்ட எந்த காரணத்திற்கும் கழகம் பொறுப்பேற்காது.',
                  'நகல் பயணச்சீட்டு வழங்கப்படாது. எக்காரணம் கொண்டும் செலுத்திய கட்டணம் திருப்பி அளிக்கப்படாது.',
                  'அரசு உத்தரவுகள் மற்றும் மாநகரப் போக்குவரத்து கழகத்தின் உள்கட்டளைப்படி கட்டணத்தில் மாற்றம் ஏற்படலாம். கட்டண மாற்றம் ஏற்பட்டால், வித்தியாசமான தொகை வசூலிக்கப்படும்.',
                  'பஸ் பாஸ் ஒரே கைப்பேசியில் மட்டுமே பயன்படுத்த முடியும். இருப்பினும், கைப்பேசி பயன்படாத நிலை ஏற்பட்டால், நீங்கள் பாஸை மற்றொரு கைப்பேசிக்கு மாற்றிக்கொள்ளலாம். ஆனால், கைப்பேசி மாற்றம் ஒரு மாதத்தில் ஒருமுறை மட்டுமே செய்ய முடியும்.',
              ];
    }, []);

    const content = useMemo(() => {
        return (
            <View style={tailwind.style('px-5 py-2')}>
                {defaultTerms.map((term, index) => (
                    <Animated.View
                        key={`${index}-${term.slice(0, 10)}`}
                        style={tailwind.style('flex-row mb-3.5 items-start')}>
                        <Animated.Text
                            style={tailwind.style('text-[13px] text-[#5B6777] mr-2 font-areaNormal-extrabold')}>
                            •
                        </Animated.Text>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] leading-[22px] font-areaNormal-semibold text-[#3B3A3C] flex-1',
                            )}>
                            {term}
                        </Animated.Text>
                    </Animated.View>
                ))}
            </View>
        );
    }, [defaultTerms]);

    return (
        <AnimatedModal
            contentStyle={tailwind.style('rounded-t-[36px] overflow-hidden bg-white ', { paddingBottom: bottom })}
            animationDuration={300}
            allowCloseOnBackdropPress={true}
            visible={visible}
            setVisible={setVisible}>
            <Animated.View>
                <View style={{ maxHeight: SHEET_MAX_HEIGHT }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Animated.View style={tailwind.style('items-center')}>
                            <Animated.Image
                                accessible={false}
                                source={mtIcMtcMockTicket}
                                style={tailwind.style('w-[300px] h-[208px] mt-[-63px] mb-[-85px]')}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={tailwind.style('mb-1')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] font-areaNormal-extrabold text-center text-[#969696]',
                                )}>
                                {userLanguageStrings.TermsAndConditions}
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] font-areaNormal-extrabold text-center text-[#969696]',
                                )}>
                                {isGoldPass ? '(Golden Ticket - Rs. 1000 Pass)' : '(Diamond Ticket - Rs. 2000 Pass)'}
                            </Animated.Text>
                        </Animated.View>
                        {content}
                    </ScrollView>
                </View>
                <View style={tailwind.style('px-5 pb-3 pt-2')}>
                    <Pressable
                        testID="bus_pass_terms_and_conditions_close_button"
                        accessibilityRole="button"
                        accessibilityLabel="Close Terms and Conditions"
                        onPress={handleClose}>
                        <Animated.View
                            style={tailwind.style(
                                'min-h-[60px] items-center justify-center rounded-[18px] bg-[#3B3A3C]',
                            )}>
                            <Animated.Text style={tailwind.style('text-white text-[16px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Close}
                            </Animated.Text>
                        </Animated.View>
                    </Pressable>
                </View>
            </Animated.View>
        </AnimatedModal>
    );
};

export default BusPassTermsAndConditionsSheet;
