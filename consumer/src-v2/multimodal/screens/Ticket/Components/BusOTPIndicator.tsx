import BusOtpCard from '@/src-v2/assets/mt_ic_bus_otp_card.webp';
import SaintImg from '@/src-v2/assets/mt_ic_saint.webp';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Animated, { LinearTransition } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

export const BusOTPIndicator = ({ isMultiModal }: { isMultiModal: boolean }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('')}>
            <Animated.View
                layout={LinearTransition.springify().damping(28).stiffness(340)}
                style={tailwind.style('relative flex-row items-center gap-[10px]')}>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bus otp card image"
                    source={BusOtpCard}
                    style={tailwind.style('w-[67px] h-[40px]')}
                />

                <Animated.View
                    layout={LinearTransition.springify().damping(28).stiffness(340)}
                    style={tailwind.style(
                        'flex-row w-[120px] h-[40px] items-center gap-[10px] border p-2 rounded-md border-[#C9C9C9]',
                    )}>
                    <Animated.Image accessible={false} source={SaintImg} style={tailwind.style('w-[22px] h-[25px]')} />

                    <Animated.View style={tailwind.style('flex-1')}>
                        <Animated.View style={tailwind.style('h-[5px] w-[43px] bg-[#D9D9D9] rounded-[5px]')} />
                        <Animated.View style={tailwind.style('h-[5px] w-[17px] bg-[#D9D9D9] rounded-[5px] mt-[7px]')} />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
            <Animated.View style={tailwind.style('flex-row gap-8', isMultiModal ? 'justify-center' : '')}>
                {isMultiModal && (
                    <Animated.View style={tailwind.style('pt-[14px] pl-4')}>
                        <Svg width="29" height="27" viewBox="0 0 29 27" fill="none">
                            <Path
                                d="M6.50285 0.270869C6.10016 -0.00684726 5.54858 0.0944627 5.27087 0.497151L0.745226 7.05933C0.46751 7.46202 0.56882 8.0136 0.971508 8.29131C1.3742 8.56903 1.92577 8.46772 2.20349 8.06503L6.22628 2.23198L12.0593 6.25477C12.462 6.53249 13.0136 6.43118 13.2913 6.02849C13.569 5.6258 13.4677 5.07423 13.065 4.79651L6.50285 0.270869ZM9.00711 17.3721L8.13597 17.5321L9.00711 17.3721ZM10.5422 22.7926L11.2741 22.2936L10.5422 22.7926ZM13.1553 24.9694L13.5138 24.1594L13.1553 24.9694ZM6 1L5.12886 1.16001L8.13597 17.5321L9.00711 17.3721L9.87826 17.2121L6.87114 0.839994L6 1ZM18.7639 25.5V26.3857L28.3608 26.3857V25.5V24.6143L18.7639 24.6143V25.5ZM9.00711 17.3721L8.13597 17.5321C8.39914 18.9649 8.60472 20.0873 8.84017 20.9851C9.07845 21.8937 9.36185 22.6336 9.81042 23.2915L10.5422 22.7926L11.2741 22.2936C10.9842 21.8684 10.7655 21.3438 10.5537 20.5358C10.3389 19.717 10.1462 18.6708 9.87826 17.2121L9.00711 17.3721ZM18.7639 25.5V24.6143C17.2808 24.6143 16.2169 24.6137 15.3728 24.5504C14.5399 24.488 13.9844 24.3678 13.5138 24.1594L13.1553 24.9694L12.7967 25.7793C13.5249 26.1016 14.3037 26.2467 15.2404 26.3169C16.166 26.3863 17.3071 26.3857 18.7639 26.3857V25.5ZM10.5422 22.7926L9.81042 23.2915C10.5545 24.3829 11.5889 25.2446 12.7967 25.7793L13.1553 24.9694L13.5138 24.1594C12.6079 23.7584 11.8321 23.1122 11.2741 22.2936L10.5422 22.7926Z"
                                fill="#7E7E7E"
                            />
                        </Svg>
                    </Animated.View>
                )}
                {isMultiModal && (
                    <Animated.View style={tailwind.style('mt-3 max-w-[200px] -ml-3')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] leading-[23px] font-areaNormal-extrabold text-[#666666]',
                            )}>
                            {userLanguageStrings.YouCanLookForTheBusOTPInsideTheBusOrAskConductor}
                        </Animated.Text>
                    </Animated.View>
                )}
                {!isMultiModal && (
                    <Animated.View style={tailwind.style('flex-col mt-2')}>
                        <Animated.View style={tailwind.style('ml-2')}>
                            <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                                <Path
                                    d="M10 5.00262L8.85913 6.19091L5.83829 3.26618L5.83829 11.28L4.16171 11.3342L4.16171 3.3204L1.14583 6.44033L-2.68509e-07 5.32599L5 0.161694L10 5.00262Z"
                                    fill="#7E7E7E"
                                />
                            </Svg>
                        </Animated.View>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] leading-[20px] font-areaNormal-extrabold text-[#3B3A3C] tracking-[0.2px] pt-01',
                            )}>
                            {userLanguageStrings.YouCanLookForTheBusOTPInsideTheBusOrAskConductor}
                        </Animated.Text>
                    </Animated.View>
                )}
            </Animated.View>
        </Animated.View>
    );
};
