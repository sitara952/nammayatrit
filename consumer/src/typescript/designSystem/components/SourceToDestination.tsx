import React, { FC } from 'react';
import Animated from 'react-native-reanimated';
import { InputBridge } from '../../components/svg/InputBridge';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import Divider from './primitives/Divider';
import Typography from './primitives/Typography';
import { View } from 'react-native';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const SVG_WIDTH = 34;

type SourceToDestinationProps = {
    stops: { area: string | undefined; address: string | undefined; editable: boolean }[];
    originEditable: boolean;
    originTitle: string | undefined;
    originAddress: string | undefined;
    onEditPickupClick: (() => void) | undefined;
    onEditDestinationClick: (() => void) | undefined;
};

export const SourceToDestination: FC<SourceToDestinationProps> = ({
    stops,
    originEditable,
    originTitle,
    originAddress,
    onEditPickupClick,
    onEditDestinationClick,
}) => {
    return (
        <Animated.View style={tailwind.style('pb-8 w-full pr-2')}>
            <Animated.View style={tailwind.style('absolute left-0')}>
                <InputBridge />
            </Animated.View>
            <Animated.View style={tailwind.style(`pl-[${SVG_WIDTH + 12}]`)}>
                <StopInfo
                    title={originTitle}
                    address={originAddress}
                    editable={originEditable}
                    onEditClick={onEditPickupClick}
                />
                {stops.map((stop, index) => {
                    const isDestination = index === stops.length - 1;
                    return (
                        <View key={index}>
                            <Animated.View style={tailwind.style('w-full justify-center my-4')}>
                                <Divider
                                    direction="horizontal"
                                    type={undefined}
                                    style={undefined}
                                    labelPosition={undefined}
                                    offset={undefined}
                                    offsetBackground={undefined}
                                    dividerColor={undefined}
                                    strokeDashArray={undefined}
                                />
                            </Animated.View>
                            <StopInfo
                                key={index}
                                title={stop.area}
                                address={stop.address}
                                editable={stop.editable}
                                onEditClick={isDestination ? onEditDestinationClick : () => {}}
                            />
                        </View>
                    );
                })}
            </Animated.View>
        </Animated.View>
    );
};
type StopInfoProps = {
    title: string | undefined;
    address: string | undefined;
    editable: boolean;
    onEditClick: (() => void) | undefined;
};
const StopInfo: FC<StopInfoProps> = ({ title, address, editable, onEditClick }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('flex flex-row justify-between w-full items-center')}>
            <Animated.View style={tailwind.style('flex-1')}>
                {title ? (
                    <Typography
                        type="subhead-1"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                ) : null}
                {address ? (
                    <Typography
                        numberOfLines={1}
                        style={tailwind.style('pt-1.5', `text-[${token?.text?.['text-weak']}]`)}
                        type="body-1"
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {address}
                    </Typography>
                ) : null}
            </Animated.View>
            {editable ? (
                <Animated.View>
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="8e05abad-7a1d-40db-8048-595de63ee689"
                        onPress={onEditClick}
                        style={tailwind.style('pl-4')}>
                        <Typography
                            type="callout"
                            style={tailwind.style('text-[' + `${themeColors.APP_THEME_COLOR}` + ']')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Edit}
                        </Typography>
                    </TouchableOpacity>
                </Animated.View>
            ) : null}
        </Animated.View>
    );
};

export default SourceToDestination;
