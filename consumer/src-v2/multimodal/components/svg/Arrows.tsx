import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const NarrowArrowRight = ({ fill = '#656565' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 17 16" fill="none">
            <Path d="M3.16797 8H13.8346" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <Path
                d="M9.83594 4L13.8359 8L9.83594 12"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export const TransitArrowRight = ({ fill = '#656565' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 17" fill="none">
            <Path
                d="M3.50034 13.7276L3.49026 11.4001L9.62639 11.4001L1.49157 3.26526L3.19437 1.56246L11.3292 9.69728L11.3241 3.56619L13.6567 3.57123V13.7276L3.50034 13.7276Z"
                fill={fill}
            />
        </Svg>
    );
};

export const LeftArrow = ({ fill = '#8C1AFD' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.35083 15.6195L5.99089 17L1.00017 11.947V8.05302L5.99089 3L7.35083 4.38047L2.92461 8.86047V9.01961H19V10.9731H2.92461V11.1265L7.35083 15.6195Z"
                fill={fill}
            />
        </Svg>
    );
};

export const RightArrow = ({ fill = '#8C1AFD' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.6492 15.6195L14.0091 17L18.9998 11.947V8.05302L14.0091 3L12.6492 4.38047L17.0754 8.86047V9.01961H1V10.9731H17.0754V11.1265L12.6492 15.6195Z"
                fill={fill}
            />
        </Svg>
    );
};

export const DownArrow = ({ fill = '#8C1AFD' }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 12 12" fill="none">
            <Path
                d="M.333 4.227l1.329-1.329 4.323 4.324h.043l4.31-4.324 1.329 1.329L6.805 9.1h-1.61L.334 4.227z"
                fill={fill}
            />
        </Svg>
    );
};

export const UpArrow = ({ fill = '#8C1AFD' }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 12 12" fill="none">
            <Path
                d="M11.667 7.773l-1.329 1.329-4.323-4.324h-.043l-4.31 4.324L.332 7.773 5.195 2.9h1.61l4.862 4.874z"
                fill={fill}
            />
        </Svg>
    );
};

export const UpArrowVersionTwo = ({ fill = '#3B3A3C' }: { fill: string | undefined }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 10 6" fill="none">
            <Path
                d="M1.504 4.926l3.642-3.764a.295.295 0 01.431 0L9.22 4.926"
                stroke={fill}
                strokeWidth={1.5}
                strokeMiterlimit={10}
            />
        </Svg>
    );
};

export const UpArrowDown = ({ fill = '#3B3A3C' }: { fill: string | undefined }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 10 6" fill="none">
            <Path
                d="M1.504 1.07l3.642 3.764c.12.125.31.125.431 0L9.22 1.07"
                stroke={fill}
                strokeWidth={1.5}
                strokeMiterlimit={10}
            />
        </Svg>
    );
};

export const UpArrowVersionThree = ({ fill = '#838185' }: { fill: string | undefined }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 11 12" fill="none">
            <Path
                d="M10.566 5.285L9.361 6.54 6.169 3.45v8.468l-1.772.057V3.507L1.211 6.804 0 5.626 5.283.17l5.283 5.115z"
                fill={fill}
            />
        </Svg>
    );
};

export const LeftArrowVersionTwo = ({ fill = '#3D3C3E' }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
            <Path d="M14 8H2m0 0l6 6M2 8l6-6" stroke={fill} strokeWidth={2} strokeLinecap="square" />
        </Svg>
    );
};

export const RefundArrow = ({ fill = '#3B3A3C' }: { fill: string | undefined }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 12 14" fill="none">
            <Path
                d="M9.282.33A1.35 1.35 0 008.228.133h0c-1.104.251-3.88.836-5.943.78L2.182.912v.148L2.13 2.535l-.004.102.101.002c1.526.041 3.367-.227 4.762-.49L.135 12.285l1.432.97 6.865-10.15c.276 1.39.71 3.209 1.32 4.624l.04.091.092-.039 1.407-.607.092-.04-.04-.092c-.819-1.893-1.31-4.688-1.487-5.806h0a1.35 1.35 0 00-.574-.906z"
                fill={fill}
                stroke={fill}
                strokeWidth={0.2}
            />
        </Svg>
    );
};
