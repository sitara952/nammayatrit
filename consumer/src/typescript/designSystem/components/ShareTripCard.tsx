import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

import Typography from './primitives/Typography';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors.ts';
import { useConfigContext } from '../../context/ConfigContext';
import Button from '@/src-v2/primitives/Button';
import ShareIcon from '../../assets/svg/symbols/ShareIcon';

export const ShareTripCard: React.FC<{ onShare: () => void }> = ({ onShare }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    return (
        <Animated.View
            style={tailwind.style(
                'flex-row items-end justify-between bg-white mx-5 mt-4 py-4 px-4 border-[1px] border-[#F5F5F5] rounded-[16px]',
            )}
            accessibilityRole="button"
            accessibilityLabel={'Share tour ride for Temporary Live Tracking'}>
            <Animated.View>
                <Typography
                    type={'callout-1'}
                    style={tailwind.style(`text-[${defaultColors.gray200}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.shareYourTrip}
                </Typography>
                <Typography
                    type={'body-1'}
                    style={tailwind.style(`pt-[7px] text-[${defaultColors.gray300}] max-w-[163px]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={true}
                    accessibilityLabel={'Share live tracking link with anyone.'}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Sharealivetrackinglinkwithanyone}
                </Typography>
            </Animated.View>
            <Animated.View>
                <Button
                    testID="fb9cd397-cad0-4bba-b549-d81e2e41d130"
                    onPress={onShare}
                    type={'secondary-inverse'}
                    accessibilityRole="button"
                    text="Share"
                    style={tailwind.style(
                        `bg-[${themeColors.TrackingModal_Button_Color}] flex-row items-center justify-center`,
                    )}>
                    <Typography
                        type={'callout-1'}
                        style={tailwind.style(`text-[${defaultColors.neutral100}] font-extrabold mr-2`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={'Share'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.share}
                    </Typography>
                    <ShareIcon fillColor={defaultColors.neutral100} />
                </Button>
            </Animated.View>
        </Animated.View>
    );
};
