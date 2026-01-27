import colors from '../colorPalette';
import { tokenTypes } from './tokenTypes';

export const nammaYatriTokensAndroid: tokenTypes = {
    app: {
        alt: colors?.primitive?.white?.[10],
        default: colors?.primitive?.gray?.[11],
    },
    margin: {
        margin: {
            default: '16px',
        },
    },
    alternate: {
        secondary: {
            outline: {
                default: colors?.primitive?.gray?.[1],
            },
        },
    },
    default: {
        primary: {
            default: colors?.primitive?.accent?.[3],
            pressed: colors?.primitive?.gray?.[9],
            active: colors?.primitive?.gray?.[9],
            disabled: colors?.primitive?.gray?.[2],
            loading: colors?.primitive?.gray?.[9],
        },
        secondary: {
            default: colors?.primitive?.white?.[10],
            pressed: colors?.primitive?.gray?.[3],
            active: colors?.primitive?.gray?.[2],
            disabled: colors?.primitive?.gray?.[2],
            loading: colors?.primitive?.white?.[10],
            selected: colors?.primitive?.gray?.[10],
            'selected-alt': colors?.primitive?.white?.[10],
            outline: {
                default: colors?.primitive?.gray?.[1],
                selected: colors?.primitive?.purple?.[10],
            },
        },
        others: {
            divider: colors?.primitive?.gray?.[2],
            accent: {
                default: colors?.primitive?.gray?.[9],
                primary: colors.primitive.purple[10],
                widget: colors?.primitive?.gray[9],
                favorite: '#E1405D',
                danger: '#DC3E42',
                ride: {
                    complete: colors?.primitive?.green?.[1],
                    charge: colors?.primitive?.green?.[2],
                },
                chat: {
                    receive: '#47454A',
                    send: '#FFFFFF',
                },
            },
        },
    },
    spacing: {
        default: '16px',
        alt: '20px',
        3: '16px',
        2: '2px',
        6: '6px',
        10: '10px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '8': '8px',
        '52': '52px',
        '66': '66px',
        '24': '24px',
        '26': '26px',
    },
    gap: {
        spacing: {
            '2': '2px',
            '4': '4px',
            '6': '6px',
            '8': '8px',
            '10': '10px',
            '12': '12px',
            '16': '16px',
            '20': '20px',
        },
    },
    height: {
        xxs: '20px',
        xs: '26px',
        sm: '40px',
        md: '48px',
        lg: '55px',
        xl: '80px',
    },
    corner: {
        md: '16px',
        lg: '20px',
        sm: '14px',
    },
    text: {
        'text-inverse-highContrast': colors?.primitive?.white?.[10],
        'text-inverse-error': colors?.primitive?.red?.[10],
        'text-inverse-bold': colors?.primitive?.white?.[9],
        'text-highContrast': colors?.primitive?.gray?.[10],
        'text-weak': colors?.primitive?.gray?.[7],
        'text-bold': colors?.primitive?.gray?.[9],
        'text-lowContrast': colors?.primitive?.gray?.[6],
        'text-base': colors.primitive.gray[8],
    },

    callout: {
        'callout-fontSize': '13.5px',
        'callout-weight': 'areaNormal-bold',
        'callout-lineHeight': '19.8px',
        'callout-characterSpacing': '0.3px',
    },
    'callout-1': {
        'callout-fontSize': '13.5px',
        'callout-weight': 'areaNormal-extrabold',
        'callout-lineHeight': '19.8px',
        'callout-characterSpacing': '0.3px',
    },
    'callout-2': {
        'callout-fontSize': '13.5px',
        'callout-weight': 'areaNormal-black',
        'callout-lineHeight': '19.8px',
        'callout-characterSpacing': '0.3px',
    },
    subhead: {
        'subhead-characterSpacing': '0.3px',
        'subhead-fontSize': '13.5px',
        'subhead-lineHeight': '19.8px',
        'subhead-weight': 'areaNormal-bold',
    },
    'subhead-1': {
        'subhead-characterSpacing': '0.3px',
        'subhead-fontSize': '13.5px',
        'subhead-lineHeight': '19.8px',
        'subhead-weight': 'areaNormal-extrabold',
    },
    'subhead-600': {
        'subhead-characterSpacing': '0px',
        'subhead-fontSize': '14.4px',
        'subhead-lineHeight': '19.8px',
        'subhead-weight': 'areaNormal-semibold',
    },
    'subhead-700': {
        'subhead-characterSpacing': '0px',
        'subhead-fontSize': '14.4px',
        'subhead-lineHeight': '19.8px',
        'subhead-weight': 'areaNormal-bold',
    },
    'subhead-800': {
        'subhead-characterSpacing': '0px',
        'subhead-fontSize': '14.4px',
        'subhead-lineHeight': '21.6px',
        'subhead-weight': 'areaNormal-bold',
    },
    'subhead-2': {
        'subhead-characterSpacing': '0.2px',
        'subhead-fontSize': '11.7px',
        'subhead-lineHeight': '18px',
        'subhead-weight': 'areaNormal-extrabold',
    },
    'subhead-3': {
        'subhead-characterSpacing': '0.2px',
        'subhead-fontSize': '10.8px',
        'subhead-lineHeight': '12.744px',
        'subhead-weight': 'areaNormal-semibold',
    },
    'subhead-4': {
        'subhead-characterSpacing': '0.2px',
        'subhead-fontSize': '14.4px',
        'subhead-lineHeight': '21.6px',
        'subhead-weight': 'areaNormal-extrabold',
    },
    body: {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '12.6px',
        'body-lineHeight': '18px',
        'body-weight': 'areaNormal-semibold',
    },
    'body-subtext': {
        'body-characterSpacing': '0px',
        'body-fontSize': '12.6px',
        'body-lineHeight': '18px',
        'body-weight': 'areaNormal-regular',
    },
    'body-1': {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '12.6px',
        'body-lineHeight': '18px',
        'body-weight': 'areaNormal-bold',
    },
    'body-4': {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '36px',
        'body-lineHeight': '37.8px',
        'body-weight': 'areaNormal-bold',
    },
    'body-5': {
        'body-characterSpacing': '0.5px',
        'body-fontSize': '9px',
        'body-lineHeight': '10.8px',
        'body-weight': 'areaNormal-extrabold',
    },
    'body-6': {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '12.6px',
        'body-lineHeight': '18px',
        'body-weight': 'areaNormal-bold',
    },
    // 'body-6': {// ios
    //     'body-characterSpacing': '0.2px',
    //     'body-fontSize': '14px',
    //     'body-lineHeight': '20px',
    //     'body-weight': 'areaNormal-bold',
    // },
    'body-7': {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '10.8px',
        'body-lineHeight': '14.4px',
        'body-weight': 'areaNormal-bold',
    },
    'body-8': {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '16px',
        'body-lineHeight': '20px',
        'body-weight': 'areaNormal-bold',
    },
    micro: {
        'micro-fontSize': '9px',
        'micro-weight': 'areaNormal-semibold',
        'micro-lineHeight': '9px',
        'micro-characterSpacing': '0.5px',
    },
    'body-3': {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '11.7px',
        'body-lineHeight': '11.7px',
        'body-weight': 'areaNormal-bold',
    },
    'body-2': {
        'body-characterSpacing': '0.2px',
        'body-fontSize': '13.5px',
        'body-lineHeight': '18px',
        'body-weight': 'areaNormal-bold',
    },
    'title-2': {
        'title-characterSpacing': '0.2px',
        'title-fontSize': '19.8px',
        'title-lineHeight': '25.2px',
        'title-weight': 'areaNormal-bold',
    },
    'title-3': {
        'title-characterSpacing': '0.2px',
        'title-fontSize': '14.4px',
        'title-lineHeight': '21.6px',
        'title-weight': 'areaNormal-bold',
    },
    'title-4': {
        'title-characterSpacing': '-0.1px',
        'title-fontSize': '21px',
        'title-lineHeight': '24px',
        'title-weight': 'areaNormal-extrabold',
    },
    'title-800': {
        'title-fontSize': '18px',
        'title-weight': 'areaNormal-bold',
        'title-lineHeight': '23.4px',
        'title-characterSpacing': '0px',
    },
    'title-800-rupee': {
        'title-fontSize': '19.8px',
        'title-weight': 'inter-bold',
        'title-lineHeight': '23.4px',
        'title-characterSpacing': '0px',
    },
    'subhead-900': {
        'subhead-characterSpacing': '0px',
        'subhead-fontSize': '18px',
        'subhead-lineHeight': '24px',
        'subhead-weight': 'areaNormal-bold',
    },
    'subhead-1-rupee': {
        'subhead-characterSpacing': '0.3px',
        'subhead-fontSize': '14.4px',
        'subhead-lineHeight': '26.1px',
        'subhead-weight': 'inter-extrabold',
    },
    'sub-body-700': {
        'sub-body-characterSpacing': '0px',
        'sub-body-fontSize': '10.8px',
        'sub-body-lineHeight': '14.4px',
        'sub-body-weight': 'areaNormal-bold',
    },
    'sub-body-800': {
        'sub-body-characterSpacing': '0px',
        'sub-body-fontSize': '10.8px',
        'sub-body-lineHeight': '14.4px',
        'sub-body-weight': 'areaNormal-extrabold',
    },
    'sub-body-500': {
        'sub-body-characterSpacing': '0px',
        'sub-body-fontSize': '10.8px',
        'sub-body-lineHeight': '14.4px',
        'sub-body-weight': 'areaNormal-regular',
    },
    icon: {
        sizer: {
            '12': 12,
            '16': 16,
            '20': 20,
        },
    },
    global: {
        'bg-standard': colors?.primitive?.gray?.[11],
    },
    standard: {
        others: {
            divider: '#E5E5E5',
            accent: {
                chat: {
                    send: '#F5F5F5',
                    receive: colors?.primitive?.purple?.[10],
                },
            },
        },
    },
};
