import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { Image } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';

export const ActivatedTicketBanner = ({
    busFleetID,
    size = 'md',
    isPass,
}: {
    busFleetID: string;
    size: 'sm' | 'md';
    isPass: boolean;
}) => {
    const configManager = useConfigContext();
    const appSystemConfig = useAppSelector(selectAppConfig);
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return busFleetID ? (
        <>
            <Animated.View style={tailwind.style('bg-[#025FE2] rounded-[20px] pt-[14px] px-5 pb-3 overflow-hidden')}>
                <Animated.View style={tailwind.style('flex-row items-center gap-2')}>
                    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <Rect width="14" height="14" rx="5.04667" fill="white" />
                        <Path
                            d="M3.33337 7.30945L5.41993 9.39601C5.68772 9.6638 6.12123 9.66378 6.38646 9.39345C7.38174 8.37903 8.72158 6.99414 11 5.00049"
                            stroke="#025FE2"
                            strokeWidth="1.33333"
                        />
                    </Svg>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[#FFFFFF] font-areaNormal-extrabold',
                            size === 'md' ? 'text-[15px]' : 'text-[9px]',
                        )}>
                        {userLanguageStrings.ActivatedTicket}
                    </Animated.Text>
                </Animated.View>
                <Animated.Text
                    style={tailwind.style(
                        'text-[#FFFFFF] font-geist-mono-semibold pt-2 tracking-[5px]',
                        size === 'md' ? 'text-[40px]' : 'text-[18px]',
                    )}>
                    {busFleetID}
                </Animated.Text>
                {appSystemConfig?.assets?.activatedTicketLayoutLogo ? (
                    <Animated.View style={[tailwind.style('absolute -top-6 -right-[90px]')]}>
                        <Image
                            source={{ uri: appSystemConfig.assets.activatedTicketLayoutLogo }}
                            style={{ width: 164, height: 152 }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                ) : (
                    <Animated.View style={[tailwind.style('absolute -top-6 -right-[78px]'), isPass && { zIndex: -1 }]}>
                        <Svg width="164" height="152" viewBox="0 0 164 152" fill="none">
                            <Path
                                d="M160.432 52.9174C150.503 22.3587 122.957 2.14398 88.5444 0.180986C86.4708 0.0556878 84.3012 0 82.104 0C21.8615 0 0 45.4552 0 76C0 106.545 21.8615 152 82.1178 152C83.5596 152 85.0839 151.958 86.8965 151.889C86.8965 151.889 89.3134 151.777 89.5468 151.749C91.1031 151.629 91.8813 151.513 91.8813 151.401V49.8267H80.4287C80.4287 49.8267 63.4971 63.0804 51.303 68.7884L56.4663 81.2764L72.8761 74.2319V133.47C55.6561 131.757 41.924 125.131 32.0644 113.742C29.318 110.554 26.8599 106.935 24.7589 102.981C16.6982 87.7641 15.8743 69.8743 22.4657 53.9058C28.2743 41.1673 39.7681 30.6701 54.8322 24.3774C63.1263 20.9108 72.5603 19.0731 82.1178 19.0731C104.144 19.0731 124.138 28.4147 135.59 44.0491C140.067 50.1608 143.294 57.442 144.915 65.0713C148.183 82.5294 143.404 100.725 132.157 113.729C128.052 118.476 123.19 122.458 117.711 125.548L117.588 125.618L125.47 141.809L125.607 141.726C156.408 124.783 171.376 86.6085 160.432 52.9174Z"
                                fill="#FAC950"
                            />
                        </Svg>
                    </Animated.View>
                )}
            </Animated.View>
        </>
    ) : null;
};
