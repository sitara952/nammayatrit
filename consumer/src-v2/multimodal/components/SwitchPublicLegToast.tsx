import { View, StyleSheet } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Image } from 'react-native';
import { Rect, Path, Svg } from 'react-native-svg';
import metro_card from '@/src-v2/assets/metro_card.webp';
import { isUndefined } from 'lodash';
import { useConfigContext } from '@/typescript/context/ConfigContext';
interface IconSwitchProps {
    color?: string;
}

export const IconSwitch: React.FC<IconSwitchProps> = ({ color }: IconSwitchProps) => (
    <Svg width="16" height="14" viewBox="0 0 16 14" fill="none">
        <Rect x="0.96875" width="15" height="14" rx="4" fill={color?.toLowerCase() || '#7E3878'} />
        <Path
            d="M4.71875 4L7.45147 7.45185C8.72569 9.06139 10.6659 10 12.7188 10V10"
            stroke="white"
            strokeWidth={1.5}
        />
        <Path d="M4.71875 10L7.45147 6.54815C8.72569 4.93861 10.6659 4 12.7188 4V4" stroke="white" strokeWidth={1.5} />
    </Svg>
);

export type SwitchPublicLegProps = {
    platformNo: string | undefined;
    towards: string | undefined;
    lineColor: string | undefined;
};

export const SwitchPublicLegToast: React.FC<SwitchPublicLegProps> = ({
    platformNo,
    towards,
    lineColor,
}: SwitchPublicLegProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    // Determine badge color
    const badgeColor = lineColor?.toLowerCase();
    return (
        <>
            <View style={[styles.cardContainer, tailwind.style('bg-[#F7F7F7]')]}>
                <View style={tailwind.style('relative')}>
                    <Image
                        source={metro_card}
                        style={[styles.iconPlaceholder]}
                        accessible={true}
                        accessibilityLabel="metro card image"
                    />
                    <View style={tailwind.style('absolute top-3 right-5')}>
                        <IconSwitch color={badgeColor} />
                    </View>
                </View>

                <View style={tailwind.style('flex mt-1 flex-1 pr-4')}>
                    <Typography
                        type="body-1"
                        style={[styles.mainText, tailwind.style('font-areaNormal-extrabold')]}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.PlatformTowards(platformNo ?? '', towards ?? '')}
                    </Typography>
                    <View style={[styles.switchRow, tailwind.style('flex-1')]}>
                        <Typography
                            type="body-2"
                            style={[styles.secondaryText, tailwind.style('font-areaNormal-bold')]}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.SwitchTo}
                        </Typography>
                        {!isUndefined(lineColor) ? (
                            <View
                                style={tailwind.style(
                                    'px-1 rounded-md flex items-center justify-center',
                                    badgeColor ? `bg-[${badgeColor}]` : 'bg-green-700',
                                )}>
                                <Typography
                                    type="body-3"
                                    style={tailwind.style('font-areaNormal-regular text-white pb-[1px]')}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.LineName(lineColor)}
                                </Typography>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
            <View style={tailwind.style('flex-row items-center justify-center my-6')}>
                <View>
                    <Typography
                        type="body-1"
                        style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#8B8B8B]', 'text-center')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.GetReadyToSwitchMetro}
                    </Typography>
                    <Typography
                        type="body-1"
                        style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#8B8B8B]', 'text-center')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.YouCanSeePlatformDetails}
                    </Typography>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        marginTop: 16,
        alignItems: 'center',
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
    },
    iconPlaceholder: {
        width: 64,
        height: 64,
    },
    mainText: {
        color: '#222',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 0,
        flexShrink: 1, // Added to ensure numberOfLines works correctly on iOS
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 1,
    },
    secondaryText: {
        color: '#6B6B6B',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 2,
    },
});

export default SwitchPublicLegToast;
