import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useAppSelector } from '@/typescript/state/hooks';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '../../../../components/common/Icon';
import { getIconFromType } from '../../utils/getTransitIconUtils';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppConfig } from '@/typescript/state/client/session';

const ArrowIcon = () => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 14 14" fill="none">
            <Path
                d="M12.0703 7.34668L12.7578 7.99902L12.0703 8.65137L7.18262 13.2949L6.5625 12.6416L5.94336 11.9893L9.19727 8.89844H2.16406V7.09863H9.19629L5.94336 4.00781L6.5625 3.35547L7.18262 2.70312L12.0703 7.34668Z"
                fill="#3B3A3C"
            />
        </Svg>
    );
};

const DirectionArrow = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <Path d="M1 23L22 2" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" />
            <Path
                d="M22.0082 18.1656V2.76293C22.0082 2.34208 21.6673 2 21.2453 2H5.84375"
                stroke="white"
                strokeWidth="2.5"
                strokeMiterlimit="10"
            />
        </Svg>
    );
};

/**
 * Props for the GateInfo component.
 * @property gateNo - The gate number or identifier to display (e.g., "G", "Z8").
 * @property gateSide - The descriptive side or location of the gate (e.g., "Shakambari Nagar Side").
 * @property floating - If true, renders the gate info in a floating card style; otherwise, uses the default style.
 */
type GateInfoProps = {
    gateNo: string;
    gateSide: string;
    floating: boolean;
};

export const GateInfo = (props: GateInfoProps) => {
    const { gateNo, gateSide } = props;
    const isTwoDigits = gateNo.length === 2;
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            {props?.floating ? (
                <Animated.View
                    style={tailwind.style(
                        'absolute left-12.5 bg-[#E6E6E6] h-[200px] w-[3px]',
                        Platform.OS === 'ios' ? '-top-10' : '-top-[130px]',
                    )}
                />
            ) : null}
            {props?.floating ? (
                <Animated.View
                    style={tailwind.style(
                        'absolute right-12.5 bg-[#E6E6E6] h-[200px] w-[3px]',
                        Platform.OS === 'ios' ? '-top-10' : '-top-[130px]',
                    )}
                />
            ) : null}
            <Animated.View
                style={tailwind.style(
                    'bg-white  border-[1px] border-[#F1F2F2] shadow-sm',
                    props.floating ? 'bg-[#414043] p-4 rounded-[24px] mx-4' : 'bg-white p-3 rounded-[16px] mx-6',
                )}>
                <Animated.View style={tailwind.style('flex-row items-center gap-[14px]')}>
                    {props.floating && appConfig.appType !== 'multimodal' ? (
                        <Animated.View
                            style={tailwind.style(
                                'relative flex-row h-14.5 w-14.5 rounded-xl justify-center items-center bg-[#8432F7]',
                            )}>
                            {gateNo?.length > 0 ? (
                                <Animated.View
                                    style={tailwind.style(
                                        'absolute flex-row items-end justify-end',
                                        isTwoDigits
                                            ? `bottom-[${(58 - 26) / 2 - 5.5}px]`
                                            : `bottom-[${(58 - 33) / 2 - 4}px]`,
                                    )}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[#FFFFFF]',
                                            isTwoDigits ? 'text-[20px] leading-[26px]' : 'text-[27px] leading-[33px]',
                                        )}>
                                        {gateNo[0]}
                                    </Animated.Text>
                                    {isTwoDigits ? (
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] leading-[20px] font-areaNormal-extrabold text-[#FFFFFF]',
                                            )}>
                                            {gateNo[1]}
                                        </Animated.Text>
                                    ) : null}
                                </Animated.View>
                            ) : (
                                <Animated.View style={tailwind.style('absolute justify-center items-center pt-1')}>
                                    {getIconFromType('Walk', 24, '#FFFFFF', false)}
                                </Animated.View>
                            )}
                            <Svg width="35" height="30" viewBox="0 0 35 30" fill="none">
                                <Path
                                    d="M33.0957 0H30.5523H5.03074H1.65427H0V1.65427V3.72505V29.1314H3.5L3.24945 3.24945H31.5005V29.1314H34.75V3.39125V1.65427V0H33.0957Z"
                                    fill="white"
                                />
                            </Svg>
                        </Animated.View>
                    ) : null}
                    {appConfig.appType === 'multimodal' && props.floating ? (
                        <Animated.View
                            style={tailwind.style(
                                'h-14.5 w-14.5 border-[3px] border-[#FFCE4B] rounded-xl justify-center items-center',
                            )}>
                            {gateNo?.length > 0 ? (
                                <Animated.View
                                    style={tailwind.style(
                                        'absolute flex-row items-end justify-end',
                                        isTwoDigits
                                            ? `bottom-[${(58 - 33) / 2 - 5.5}px]`
                                            : `bottom-[${(58 - 33) / 2 - 4}px]`,
                                    )}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[#FFCE4B]',
                                            'text-[29px] leading-[29px]',
                                        )}>
                                        {gateNo[0]}
                                    </Animated.Text>
                                    {isTwoDigits ? (
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[14px] leading-[26px] font-areaNormal-extrabold text-[#FFCE4B]',
                                            )}>
                                            {' '}
                                            {gateNo[1]}
                                        </Animated.Text>
                                    ) : null}
                                </Animated.View>
                            ) : (
                                <Animated.View style={tailwind.style('absolute justify-center items-center')}>
                                    {getIconFromType('Walk', 24, '#FFCE4B', false)}
                                </Animated.View>
                            )}
                        </Animated.View>
                    ) : null}
                    <Animated.View style={tailwind.style('')}>
                        {props.gateSide?.length > 0 ? (
                            <Animated.View style={tailwind.style('flex-row items-center gap-1')}>
                                {!props.floating ? getIconFromType('Walk', 14, '#7E7E7E', false) : null}
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[13px] font-areaNormal-extrabold',
                                        props.floating ? 'text-[#969696]' : 'text-[#7E7E7E]',
                                        appConfig.appType === 'multimodal' ? 'text-[#FFF]' : '',
                                    )}>
                                    {userLanguageStrings.ExitThrough}
                                </Animated.Text>
                            </Animated.View>
                        ) : null}
                        <Animated.View
                            style={tailwind.style(
                                'flex-row items-center',
                                `max-w-[${SCREEN_WIDTH - 48 - 24 - 24}px]`,
                                props.floating ? 'pt-2' : props.gateNo?.length > 0 ? 'pt-2.5' : 'p-1',
                            )}>
                            {!props.floating ? (
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] tracking-[0.2px]',
                                    )}>
                                    {gateNo}
                                </Animated.Text>
                            ) : null}
                            {!props.floating && gateNo?.length > 0 ? (
                                <Icon style={tailwind.style('mx-1')} icon={<ArrowIcon />} size={14} color="#3B3A3C" />
                            ) : null}
                            {!props.floating && gateNo?.length === 0 ? (
                                <Animated.View style={tailwind.style('mx-1')}>
                                    {getIconFromType('Walk', 20, '#7E7E7E', false)}
                                </Animated.View>
                            ) : null}
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style(
                                    'text-[14px] font-areaNormal-extrabold tracking-[0.2px]',
                                    gateSide?.length > 0 ? 'leading-[17px]' : 'leading-[14px]',
                                    props.floating
                                        ? appConfig.appType === 'multimodal'
                                            ? 'text-[#FFCE4B]'
                                            : 'text-[#FFFFFF]'
                                        : gateNo?.length > 0
                                          ? 'text-[#3B3A3C]'
                                          : 'text-[#7E7E7E]',
                                )}>
                                {gateSide || userLanguageStrings.TakeAvailableExitGate}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </>
    );
};

type SuburbanExitInfoProps = {
    exitSide: string;
};

export const SuburbanExitInfo = (props: SuburbanExitInfoProps) => {
    const { exitSide } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.View
                style={tailwind.style(
                    'absolute left-12.5 bg-[#E6E6E6] h-[200px] w-[3px]',
                    Platform.OS === 'ios' ? '-top-10' : '-top-[130px]',
                )}
            />
            <Animated.View
                style={tailwind.style(
                    'absolute right-12.5 bg-[#E6E6E6] h-[200px] w-[3px]',
                    Platform.OS === 'ios' ? '-top-10' : '-top-[130px]',
                )}
            />
            <Animated.View style={tailwind.style('bg-[#14378B] shadow-sm rounded-[24px] mx-4 p-4')}>
                <Animated.View style={tailwind.style('flex-row items-center gap-[14px] p-5')}>
                    <Animated.View
                        style={tailwind.style(
                            'relative flex-row h-14.5 w-14.5 rounded-xl justify-center items-center',
                        )}>
                        <Icon icon={<DirectionArrow />} size={24} color="#FFFFFF" />
                    </Animated.View>
                    <Animated.View style={tailwind.style('')}>
                        <Animated.View style={tailwind.style('flex-row items-center gap-1')}>
                            {getIconFromType('Walk', 15, '#9FAED2', false)}
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[15px] leading-[20px] font-areaNormal-extrabold',
                                    'text-[#9FAED2]',
                                )}>
                                {userLanguageStrings.ExitThrough}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View
                            style={tailwind.style(
                                'flex-row items-center pt-1',
                                `max-w-[${SCREEN_WIDTH - 48 - 24 - 24}px]`,
                            )}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[16px] font-areaNormal-extrabold text-[#FFFFFF] tracking-[0.2px]',
                                )}>
                                {exitSide}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </>
    );
};
