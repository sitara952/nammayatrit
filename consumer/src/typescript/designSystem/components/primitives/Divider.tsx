import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { tailwind } from '../../../tailwindTheme/tailwind';
import { styleAdapter } from '../../../utils/styleAdapter';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export type DividerDirection = 'horizontal' | 'vertical';
export type DividerLabelPosition = 'start' | 'center' | 'end';
export type DividerType = 'default' | 'dashed';

type DividerProps = {
    type: DividerType | undefined;
    direction: DividerDirection | undefined;
    style: ViewStyle | undefined;
    labelPosition: DividerLabelPosition | undefined;
    offset: number | undefined;
    offsetBackground: string | undefined;
    dividerColor: string | undefined;
    strokeDashArray: string | undefined;
};

export const dividerTheme = {
    horizontal: {
        orientation: 'w-full items-center justify-center',
        type: { default: 'border-[0.5px] w-full', dashed: 'w-full' },
        label: {
            start: 'z-1 absolute left-4',
            center: 'z-1 absolute',
            end: 'z-1 absolute right-4',
        },
        svg: {
            height: '2',
            width: '100%',
            line: {
                x1: '0',
                x2: '100%',
                y1: '2',
                y2: '2',
            },
        },
    },
    vertical: {
        orientation: 'h-full items-center justify-center',
        type: { default: 'border-[0.5px] h-full', dashed: 'h-full' },
        label: {
            start: 'z-1 absolute top-4',
            center: 'z-1 absolute',
            end: 'z-1 absolute bottom-4',
        },
        svg: {
            height: '100%',
            width: '2',
            line: {
                x1: '2',
                x2: '2',
                y1: '0',
                y2: '100%',
            },
        },
    },
};

const Divider = (props: PropsWithChildren<DividerProps>) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const {
        style = {},
        type = 'default',
        direction = 'horizontal',
        dividerColor = `${themeColors.Border_neutralMidLow}`,
        labelPosition = 'start',
        offset = 0,
        offsetBackground = '#FFF',
        strokeDashArray = '4 3',
    } = props;

    return (
        <Animated.View
            style={tailwind.style(
                classNames(dividerTheme[direction]?.orientation),
                direction === 'vertical' ? 'overflow-hidden' : {},
            )}>
            {type === 'default' ? (
                <Animated.View
                    style={[
                        tailwind.style(classNames(dividerTheme[direction]?.type[type], `border-[${dividerColor}]`)),
                        styleAdapter(style, undefined),
                    ]}
                />
            ) : (
                <Animated.View
                    style={[
                        tailwind.style(classNames(dividerTheme[direction]?.type[type])),
                        styleAdapter(style, undefined),
                    ]}>
                    <Svg height={dividerTheme[direction].svg.height} width={dividerTheme[direction].svg.width}>
                        <Line
                            strokeDasharray={strokeDashArray}
                            x1={dividerTheme[direction].svg.line.x1}
                            x2={dividerTheme[direction].svg.line.x2}
                            y1={dividerTheme[direction].svg.line.y1}
                            y2={dividerTheme[direction].svg.line.y2}
                            stroke={dividerColor}
                            strokeWidth="2"
                        />
                    </Svg>
                </Animated.View>
            )}

            <Animated.View
                style={tailwind.style(
                    'justify-center items-center',
                    `p-[${offset}px] bg-[${offsetBackground}]`,
                    classNames(dividerTheme[direction]?.label[labelPosition]),
                )}>
                {props.children}
            </Animated.View>
        </Animated.View>
    );
};

export default Divider;
