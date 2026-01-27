import { Pressable } from '@/src-v2/primitives/Pressable';
import React from 'react';
import Animated, { Easing, FadeIn, LinearTransition } from 'react-native-reanimated';

import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SearchSectionListItemProps } from './types';
// Import the SVG components
import { SearchInput, selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { BusIconSvg } from '../../../../../assets/svg/BusIconSvg';
import BusStopIconVersionTwo from '../../../../../assets/svg/BusStopIconVersionTwo';
import { LocationIconSvg } from '../../../../../assets/svg/LocationIconSvg';
import { TwoAndFromIconSvg } from '../../../../../assets/svg/TwoAndFromIconSvg';
import { getIconFromType } from '../SearchSectionAlternate';
import Shimmer, { TransitModesShimmer } from './Shimmer';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const SearchSectionListItemUI: React.FC<SearchSectionListItemProps> = ({
    item,
    index,
    // isLastItem,
    activeInput,
    onPress,
    onSingleModePress,
    isMultimodal,
    isLoading = true,
    isHorizontal,
}) => {
    const icon =
        item.searchType === 'open' ? (
            <LocationIconSvg width={undefined} height={undefined} fill={undefined} />
        ) : item.searchType === 'route' ? (
            <BusIconSvg width={undefined} height={undefined} fill={undefined} />
        ) : (
            <BusStopIconVersionTwo />
        );
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const appSystemConfig = useAppSelector(selectAppConfig);
    return (
        <Animated.View
            style={tailwind.style(
                '',
                isHorizontal ? `w-[${SCREEN_WIDTH - 32 - 48}px]` : '',
                isHorizontal ? (index === 0 ? 'mr-2' : 'mx-2') : 'my-2',
            )}
            entering={FadeIn}
            key={index}>
            <Pressable
                testID={`0f4cbab0-1183-47b6-8789-b0a8366fc13c`}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}${item.subtitle ? `, ${item.subtitle}` : ''}${item.duration ? `, ${item.duration}` : ''}`}
                onPress={() => {
                    if (item.location && onPress) {
                        onPress(item.location);
                    } else if (onSingleModePress) {
                        onSingleModePress(item);
                    }
                }}
                style={({ pressed }: { pressed: boolean }) => [
                    tailwind.style(
                        'bg-white justify-center px-4 rounded-[20px] min-h-[70px]',
                        pressed ? 'bg-[#F0F0F0]' : '',
                    ),
                ]}>
                <Animated.View style={tailwind.style('flex flex-row items-center overflow-hidden')}>
                    <Icon icon={icon} />
                    <Animated.View
                        style={tailwind.style(
                            'pl-2.5',
                            appSystemConfig?.uiConfig.hideAddressShimmer && (!item.subtitle || item.subtitle === '')
                                ? 'justify-center flex-1'
                                : '',
                        )}>
                        {isLoading ? (
                            <Shimmer width={SCREEN_WIDTH * 0.45} height={20} borderRadius={7} />
                        ) : (
                            <Animated.Text
                                accessibilityLabel={`Title: ${item.title}`}
                                numberOfLines={1}
                                style={tailwind.style(`font-areaNormal-black text-[14px] text-[#515151]`, `w-[95%]`)}>
                                {item.title}
                            </Animated.Text>
                        )}
                        {item.subtitle && item.subtitle !== '' && !isLoading ? (
                            <Animated.View
                                style={[
                                    tailwind.style('flex-row items-center gap-[8px]  overflow-hidden flex-shrink-0'),
                                ]}>
                                {/* Split the subtitle by '→' and map each part to a text element */}
                                {item.subtitle.split(' To ').map((text, idx) => (
                                    <React.Fragment key={idx}>
                                        <Animated.View
                                            style={tailwind.style(
                                                item.searchType === 'route'
                                                    ? isHorizontal
                                                        ? `max-w-[${(SCREEN_WIDTH - 48 - 64 - 38 - 32) / 2}px]`
                                                        : `max-w-[${(SCREEN_WIDTH - 64 - 38 - 32) / 2}px]`
                                                    : `w-[95%]`,
                                            )}>
                                            <Animated.Text
                                                accessibilityLabel={`${idx === 0 ? 'From' : 'To'}: ${text}`}
                                                numberOfLines={1}
                                                ellipsizeMode={'tail'}
                                                style={tailwind.style(
                                                    'font-areaNormal-extrabold text-[13px] leading-[20px] text-[#969696] pt-[0px] w-full',
                                                )}>
                                                {text}
                                            </Animated.Text>
                                        </Animated.View>
                                        {/* If it's the first part, add the TwoAndFromIcon */}
                                        {idx === 0 &&
                                            item.subtitle.split(' To ').length > 1 &&
                                            item.subtitle.split(' To ')[1] !== '' && (
                                                <TwoAndFromIconSvg
                                                    width={undefined}
                                                    height={undefined}
                                                    fill={undefined}
                                                />
                                            )}
                                    </React.Fragment>
                                ))}
                            </Animated.View>
                        ) : (
                            !appSystemConfig?.uiConfig.hideAddressShimmer && (
                                <Animated.View style={tailwind.style('pt-2.5')}>
                                    <Shimmer width={SCREEN_WIDTH - (32 + 32 + 24 + 10)} height={16} borderRadius={7} />
                                </Animated.View>
                            )
                        )}
                    </Animated.View>
                </Animated.View>
                <Animated.View>
                    {isLoading && item.searchType === 'open' && activeInput === SearchInput.Destination ? (
                        <TransitModesShimmer />
                    ) : (
                        <Animated.View
                            layout={LinearTransition.springify()}
                            entering={FadeIn.duration(400).easing(Easing.ease)}
                            style={tailwind.style('flex-row items-center justify-between py-[0px]')}>
                            {item.transitModes &&
                                item.transitModes.length > 0 &&
                                activeInput === SearchInput.Destination && (
                                    <Animated.View
                                        accessible={true}
                                        accessibilityLabel={`Available transit modes: ${item.transitModes.map(mode => mode.mode).join(', ')}`}
                                        style={tailwind.style(
                                            `flex flex-row gap-1 py-[2px] px-[3.5px] bg-[${colors.CrossButton_bg}] rounded-[7px]`,
                                        )}>
                                        {isMultimodal &&
                                            item.transitModes.map((mode, idx) => (
                                                <Animated.View
                                                    key={idx}
                                                    style={tailwind.style('flex flex-row items-center gap-1 ')}>
                                                    {getIconFromType(mode.mode, 16, '#5F5E61')}

                                                    {item.transitModes && idx < item.transitModes.length - 1 ? (
                                                        <Animated.Text
                                                            numberOfLines={1}
                                                            style={tailwind.style(
                                                                'text-[18px] font-areaNormal-extrabold text-[#655C6F] leading-[22px]',
                                                            )}>
                                                            +
                                                        </Animated.Text>
                                                    ) : null}
                                                </Animated.View>
                                            ))}
                                    </Animated.View>
                                )}

                            {item.searchType === 'open' && activeInput === SearchInput.Destination ? (
                                <Animated.Text
                                    accessibilityLabel={`Duration: ${item.duration}`}
                                    style={tailwind.style(
                                        'text-[11px] font-areaNormal-extrabold uppercase text-[#89898A]',
                                        !item.transitModes || item.transitModes.length === 0 ? 'ml-auto' : '',
                                    )}>
                                    {item.duration}
                                </Animated.Text>
                            ) : null}
                        </Animated.View>
                    )}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export default SearchSectionListItemUI;
