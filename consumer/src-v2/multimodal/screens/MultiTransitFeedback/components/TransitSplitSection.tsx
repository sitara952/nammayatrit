import { getIconFromType } from '@/src-v2/multimodal/components/PublicTransportCard/PublicTransportCardUtils';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { NarrowArrowRight } from '../../../components/svg/Arrows';
import { JourneySummary, TransitSplitSectionProps } from '../types';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';

export const TransitSplitSection = (props: TransitSplitSectionProps) => {
    const { handleOnPressFullDetails, journeySummary, singleTransit } = props;
    const shimmerContent = (
        <ContentLoader height={168} width={370} style={tailwind.style('my-3 rounded-md')}>
            {[0, 56, 112].map((y, idx) => (
                <React.Fragment key={idx}>
                    <Rect x="0" y={y} rx="12" ry="12" width="28" height="28" />
                    <Rect x="40" y={y + 4} rx="10" ry="10" width="22" height="22" />
                    <Rect x="70" y={y} rx="8" ry="8" width="200" height="28" />
                    <Rect x="290" y={y} rx="8" ry="8" width="60" height="28" />
                </React.Fragment>
            ))}
        </ContentLoader>
    );
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const getJourneyAccessibilityLabel = (item: {
        transitMode: string;
        destination: string;
        totalCost: number;
    }): string => {
        const destination = item.destination?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) ?? 'destination';

        switch (item.transitMode) {
            case 'metro':
                return `Took the metro to ${destination}, fare was ₹${item.totalCost}`;
            case 'bus':
                return `Took the bus to ${destination}, fare was ₹${item.totalCost}`;
            case 'train':
                return `Took the train to ${destination}, fare was ₹${item.totalCost}`;
            case 'auto':
                return `Took an auto to ${destination}, fare was ₹${item.totalCost}`;
            case 'walk':
                return `Walked to ${destination}`;
            default:
                return `Travelled to ${destination}`;
        }
    };

    const DottedLine = () => (
        <Animated.View style={tailwind.style('w-full justify-center my-4')}>
            <Divider
                direction="horizontal"
                type="dashed"
                style={tailwind.style('h-[2px]')}
                labelPosition={undefined}
                offset={undefined}
                offsetBackground={undefined}
                dividerColor="rgba(255, 255, 255, 0.5)"
                strokeDashArray="5, 7"
            />
        </Animated.View>
    );
    const destinationWidth = SCREEN_WIDTH - 160;
    const priceText = (item: JourneySummary): string => {
        if (item.totalCost !== 0 && item.totalCost !== -1) {
            return `₹${item.totalCost}`;
        } else if (item.totalCost === -1) {
            return userLanguageStrings.Cancelled;
        } else {
            return userLanguageStrings.Skipped;
        }
    };

    return (
        <Animated.View style={tailwind.style(`px-4`)}>
            {singleTransit && <DottedLine />}
            <Animated.View
                style={tailwind.style(
                    `flex-row items-center justify-between pb-[14px]`,
                    singleTransit ? 'mt-4' : 'mt-10',
                )}>
                <Animated.Text
                    style={tailwind.style(
                        `text-[#14171F] text-[14px] font-areaNormal-extrabold leading-[20px] tracking-[0.35px]`,
                    )}>
                    {singleTransit ? userLanguageStrings.Ridedetails : userLanguageStrings.Journeysummary}
                </Animated.Text>
                <Pressable
                    accessibilityRole="button"
                    testID={`6d31f91e-1dd9-428b-bc84-868cffa03f15`}
                    onPress={handleOnPressFullDetails}
                    accessibilityLabel="View full details button"
                    hitSlop={8}
                    style={tailwind.style(`flex-row items-center`)}>
                    <Animated.Text
                        style={tailwind.style(
                            `text-[#14171F] text-[14px] font-areaNormal-extrabold leading-[20px] tracking-[0.35px]`,
                        )}>
                        {singleTransit ? userLanguageStrings.View : userLanguageStrings.Fulldetails}
                    </Animated.Text>
                    <Icon
                        icon={<NarrowArrowRight fill={undefined} />}
                        size={16}
                        color="#14171F"
                        style={tailwind.style(`ml-2`)}
                    />
                </Pressable>
            </Animated.View>

            {!singleTransit && <DottedLine />}

            {!journeySummary || journeySummary.length === 0
                ? shimmerContent
                : !singleTransit &&
                  journeySummary.map(item => (
                      <Animated.View
                          key={item.destination}
                          style={tailwind.style(`flex-row items-center justify-between py-3`)}
                          accessible={true}
                          accessibilityLabel={getJourneyAccessibilityLabel(item)}>
                          <Animated.View style={tailwind.style(`flex-row items-center`)}>
                              {getIconFromType(
                                  item.transitMode === 'metro' ? 'metroNoleaf' : item.transitMode,
                                  20,
                                  '#5B6777',
                              )}
                              <Icon
                                  icon={<NarrowArrowRight fill={undefined} />}
                                  size={16}
                                  color="#7B8997"
                                  style={tailwind.style(`mx-2`)}
                              />
                              <Animated.Text
                                  style={tailwind.style(
                                      `text-[#14171F] text-[15px] font-areaNormal-extrabold leading-[20.4px] tracking-[0.21px] w-[${destinationWidth}px]`,
                                  )}
                                  numberOfLines={1}
                                  ellipsizeMode="tail">
                                  {item.destination}
                              </Animated.Text>
                          </Animated.View>
                          {item.transitMode === 'walk' ? null : (
                              <Animated.Text
                                  style={tailwind.style(
                                      `text-[#14171F] text-[15px] font-areaNormal-extrabold leading-[22px] tracking-[0.35px]`,
                                  )}>
                                  {priceText(item)}
                              </Animated.Text>
                          )}
                      </Animated.View>
                  ))}
        </Animated.View>
    );
};
