// import mtIcMultimodalLogo from '../../../assets/mt_ic_multimodal_logo.webp';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
// import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
// import { default as FallbackQRCode } from 'react-native-qrcode-svg';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { TransitType } from '../PublicTransportCard/types';
import { TicketSrcDest } from './components/TicketSrcDest';
// import { View } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const Close = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <Path
                d="M6.53033 5.46967C6.23744 5.17678 5.76256 5.17678 5.46967 5.46967C5.17678 5.76256 5.17678 6.23744 5.46967 6.53033L10.9393 12L5.46967 17.4697C5.17678 17.7626 5.17678 18.2374 5.46967 18.5303C5.76256 18.8232 6.23744 18.8232 6.53033 18.5303L12 13.0607L17.4697 18.5303C17.7626 18.8232 18.2374 18.8232 18.5303 18.5303C18.8232 18.2374 18.8232 17.7626 18.5303 17.4697L13.0607 12L18.5303 6.53033C18.8232 6.23744 18.8232 5.76256 18.5303 5.46967C18.2374 5.17678 17.7626 5.17678 17.4697 5.46967L12 10.9393L6.53033 5.46967Z"
                fill="black"
            />
        </Svg>
    );
};

interface JourneySummary {
    type: TransitType;
}

interface QRTicketProps {
    journeySummary: JourneySummary[];
    source: string;
    destination: string;
    price: number;
    unifiedQR: string;
}

export const QRTicket = (props: QRTicketProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { source, destination, price } = props;
    // const jsonString = JSON.stringify(unifiedQR || {});
    // const qrCodeLength = jsonString.length;
    // const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            style={tailwind.style(`h-[${SCREEN_HEIGHT}px] w-[${SCREEN_WIDTH}px] justify-center rounded-2xl`)}>
            <Animated.View style={tailwind.style('flex-1 rounded-2xl justify-center overflow-hidden')}>
                <Animated.View style={tailwind.style('relative', `h-[${SCREEN_HEIGHT * 0.7}px]`)}>
                    <Animated.View style={tailwind.style(`absolute inset-0 justify-center items-center`)}>
                        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.65} viewBox="0 0 311 535" fill="none">
                            <Path
                                d="M188.225 534.875H301.477C306.769 534.875 311 531.409 311 527.076V7.92069C311 3.58751 306.618 0 301.326 0H188.073C188.073 0 187.77 -6.7422e-08 187.618 0.124811C187.618 0.124811 187.315 0.249622 187.015 0.496044L168.728 12.226C168.728 12.226 161.246 16.8056 155.426 16.8056C149.606 16.8056 142.124 12.226 142.124 12.226C142.124 12.226 129.012 5.25795 122.772 0.121611H9.52263C4.23055 0.124811 0 3.59071 0 7.92069V527.076C0 531.409 4.3822 535 9.67428 535H122.927C122.927 535 123.23 535 123.382 534.875C123.382 534.875 123.685 534.75 123.989 534.504L142.276 525.21C142.276 525.21 150.589 520.63 155.578 520.63C160.567 520.63 168.88 525.21 168.88 525.21C168.88 525.21 180.434 531.347 188.225 534.875Z"
                                fill={themeColors.APP_THEME_COLOR}
                            />
                        </Svg>
                    </Animated.View>
                    <Animated.View style={tailwind.style('pt-5')}>
                        <TicketSrcDest source={source} destination={destination} cost={price} />
                        <Animated.View style={tailwind.style('justify-center items-center pt-5')}>
                            <Animated.View style={tailwind.style('bg-white rounded-2xl p-10')}>
                                {/* {unifiedQR ? (
                                    qrCodeLength < 1200 ? (
                                        <QRCode
                                            value={jsonString}
                                            size={200}
                                            shapeOptions={{
                                                shape: 'circle',
                                                eyePatternShape: 'rounded',
                                                eyePatternGap: 0,
                                                gap: 0,
                                            }}
                                            logoAreaSize={70}
                                            logo={
                                                <View
                                                    style={{
                                                        height: 50,
                                                        aspectRatio: 1,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                    <Animated.Image
                                                        source={mtIcMultimodalLogo}
                                                        style={tailwind.style('h-[80px] w-[80px]')}
                                                    />
                                                </View>
                                            }>
                                            <RadialGradient
                                                c={{ x: 100, y: 100 }}
                                                r={100}
                                                colors={['#eeca3b', '#ee3b83']}
                                            />
                                        </QRCode>
                                    ) : (
                                        <FallbackQRCode
                                            value={jsonString}
                                            size={200}
                                            logo={mtIcMultimodalLogo}
                                            logoSize={50}
                                            logoMargin={1}
                                            logoBackgroundColor={'white'}
                                            logoBorderRadius={16}
                                        />
                                    )
                                ) : (
                                    <View
                                        style={{
                                            height: 200,
                                            width: 200,
                                            backgroundColor: '#B2B9C7',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-center text-[12px] font-medium text-[#F1F2F7] pt-5',
                                            )}>
                                            {userLanguageStrings.QRnotavailable}
                                        </Animated.Text>
                                    </View>
                                )} */}
                                {/* <Animated.Text
                                    style={tailwind.style('text-center text-[12px] font-medium text-[#7B8997] pt-5')}>
                                    Valid on Below Transits
                                </Animated.Text>
                                <Svg height={1} style={tailwind.style('mt-2')}>
                                    <Line x1={0} x2={SCREEN_WIDTH} y1={1} y2={1} stroke={'#F1F2F7'} strokeWidth={'2'} />
                                </Svg>
                                <Animated.View style={tailwind.style('flex-row gap-1.5 justify-center pt-5')}>
                                    {journeySummary.map((journey, index) => {
                                        return (
                                            <Animated.View style={tailwind.style('flex-row items-center')}>
                                                {getIconFromType(journey.type, 16, '#5B6777')}
                                                <Animated.Text
                                                    style={tailwind.style(
                                                        'text-[12px] max-h-[12px] font-areaNormal-extrabold text-[#14171F] pl-1 capitalize',
                                                    )}>
                                                    {journey.type}
                                                    <Animated.Text style={tailwind.style('text-[#B2B9C7]')}>
                                                        {index !== journeySummary.length - 1 ? '  •' : ''}
                                                    </Animated.Text>
                                                </Animated.Text>
                                            </Animated.View>
                                        );
                                    })}
                                </Animated.View> */}
                            </Animated.View>
                        </Animated.View>
                        {/* <Animated.View style={tailwind.style('flex-row justify-center items-center pt-5')}>
                            <Animated.Text
                                style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#FFF] opacity-80')}>
                                See full ticket
                            </Animated.Text>
                        </Animated.View> */}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
