import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { cumulativeOfferResp } from '@/readOnly/api/types/CumulativeOfferResp.gen';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';

type OfferCardVariant = 'outline' | 'ghost';

export const OfferCard = ({
    offer,
    onPress,
    variant = 'outline',
}: {
    offer: cumulativeOfferResp;
    onPress: () => void;
    variant: OfferCardVariant | undefined;
}) => {
    const { animatedStyle, handlers } = useScaleAnimation();

    return (
        <Pressable
            testID="offer-card"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Offer Card"
            accessibilityHint="Tap to view offer details"
            {...handlers}>
            <Animated.View
                style={[
                    animatedStyle,
                    tailwind.style(
                        variant === 'outline' ? 'border-[1px] border-[#F2EFFF]' : 'mb-4',
                        'justify-center bg-[#F9F8FD] h-[56px] rounded-[16px] px-4 mx-1',
                    ),
                ]}>
                <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                    <Animated.View style={tailwind.style('flex-row items-center')}>
                        <Svg width="26" height="24" viewBox="0 0 26 24" fill="none">
                            <Path
                                d="M16.5273 0.0201841C20.2935 -0.311636 23.0422 3.50896 21.5303 6.97428L20.8203 8.60029L18.0703 7.40104L18.7803 5.77408C19.3814 4.39602 18.2887 2.8768 16.791 3.00846C15.8779 3.08891 15.139 3.78535 15.0049 4.69205L14.4844 8.21839L11.5156 7.78092L12.0371 4.25455C12.3739 1.97418 14.2311 0.222504 16.5273 0.0201841Z"
                                fill="#8519FC"
                            />
                            <Path
                                d="M9.47348 0.0201841C5.70728 -0.311636 2.95858 3.50896 4.47048 6.97428L5.18048 8.60029L7.93048 7.40104L7.22048 5.77408C6.61938 4.39602 7.71208 2.8768 9.20978 3.00846C10.1229 3.08891 10.8618 3.78535 10.9959 4.69205L11.5164 8.21839L14.4852 7.78092L13.9637 4.25455C13.6269 1.97418 11.7697 0.222504 9.47348 0.0201841Z"
                                fill="#8519FC"
                            />
                            <Path d="M26 7V11H0V7H26Z" fill="#8519FC" />
                            <Path d="M11.5 24H2V14H11.5V24Z" fill="#8519FC" />
                            <Path d="M24 24H14.5V14H24V24Z" fill="#8519FC" />
                        </Svg>
                        <Animated.View style={tailwind.style('pl-[14px]')}>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#313131]')}>
                                {offer.offerTitle}
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[11px] font-areaNormal-extrabold text-[#656565] leading-[16px]',
                                )}>
                                {offer.offerDescription}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                    {variant === 'outline' && (
                        <Svg width="8" height="15" viewBox="0 0 8 15" fill="none">
                            <Path
                                d="M0.94141 13.1973L6.11337 7.73115C6.47819 7.34557 6.47819 6.74214 6.11337 6.35657L0.941411 0.890449"
                                stroke="#8519FC"
                                strokeWidth="2.59091"
                                strokeMiterlimit="10"
                            />
                        </Svg>
                    )}
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
