export type tokenTypes = {
    app: {
        alt: string;
        default: string;
    };
    alternate: {
        secondary: {
            outline: {
                default: string;
            };
        };
    };
    margin: {
        margin: {
            default: string;
        };
    };
    default: {
        primary: {
            default: string;
            pressed: string;
            active: string;
            disabled: string;
            loading: string;
        };
        secondary: {
            default: string;
            pressed: string;
            active: string;
            disabled: string;
            loading: string;
            selected: string;
            'selected-alt': string;
            outline: {
                default: string;
                selected: string;
            };
        };
        others: {
            divider: string;
            accent: {
                default: string;
                primary: string;
                widget: string;
                favorite: string;
                danger: string;
                ride: {
                    complete: string;
                    charge: string;
                };
                chat: {
                    receive: string;
                    send: string;
                };
            };
        };
    };
    gap: {
        spacing: {
            2: string;
            4: string;
            6: string;
            8: string;
            10: string;
            12: string;
            16: string;
            20: string;
        };
    };
    spacing: {
        default: string;
        alt: string;
        2: string;
        3: string;
        6: string;
        8: string;
        10: string;
        12: string;
        16: string;
        20: string;
        24: string;
        26: string;
        52: string;
        66: string;
    };
    corner: {
        md: string;
        lg: string;
        sm: string;
    };
    height: {
        xxs: string;
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    text: {
        'text-inverse-highContrast': string;
        'text-inverse-error': string;
        'text-inverse-bold': string;
        'text-highContrast': string;
        'text-lowContrast': string;
        'text-weak': string;
        'text-bold': string;
        'text-base': string;
    };
    callout: {
        'callout-fontSize': string;
        'callout-weight': string;
        'callout-lineHeight': string;
        'callout-characterSpacing': string;
    };
    'callout-1': {
        'callout-fontSize': string;
        'callout-weight': string;
        'callout-lineHeight': string;
        'callout-characterSpacing': string;
    };
    'callout-2': {
        'callout-fontSize': string;
        'callout-weight': string;
        'callout-lineHeight': string;
        'callout-characterSpacing': string;
    };
    subhead: {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-1': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-600': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-700': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-800': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-2': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-3': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-4': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    'subhead-900': {
        'subhead-fontSize': string;
        'subhead-weight': string;
        'subhead-lineHeight': string;
        'subhead-characterSpacing': string;
    };
    body: {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-subtext': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-1': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-3': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-2': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-4': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    micro: {
        'micro-fontSize': string;
        'micro-weight': string;
        'micro-lineHeight': string;
        'micro-characterSpacing': string;
    };
    'body-5': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-6': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-7': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'body-8': {
        'body-fontSize': string;
        'body-weight': string;
        'body-lineHeight': string;
        'body-characterSpacing': string;
    };
    'title-2': {
        'title-fontSize': string;
        'title-weight': string;
        'title-lineHeight': string;
        'title-characterSpacing': string;
    };
    'title-3': {
        'title-fontSize': string;
        'title-weight': string;
        'title-lineHeight': string;
        'title-characterSpacing': string;
    };
    'title-4': {
        'title-characterSpacing': string;
        'title-fontSize': string;
        'title-lineHeight': string;
        'title-weight': string;
    };
    'title-800': {
        'title-fontSize': string;
        'title-weight': string;
        'title-lineHeight': string;
        'title-characterSpacing': string;
    };
    'title-800-rupee': {
        'title-fontSize': string;
        'title-weight': string;
        'title-lineHeight': string;
        'title-characterSpacing': string;
    };
    'subhead-1-rupee': {
        'subhead-characterSpacing': string;
        'subhead-fontSize': string;
        'subhead-lineHeight': string;
        'subhead-weight': string;
    };
    'sub-body-700': {
        'sub-body-characterSpacing': string;
        'sub-body-fontSize': string;
        'sub-body-lineHeight': string;
        'sub-body-weight': string;
    };
    'sub-body-800': {
        'sub-body-characterSpacing': string;
        'sub-body-fontSize': string;
        'sub-body-lineHeight': string;
        'sub-body-weight': string;
    };
    'sub-body-500': {
        'sub-body-characterSpacing': string;
        'sub-body-fontSize': string;
        'sub-body-lineHeight': string;
        'sub-body-weight': string;
    };
    icon: {
        sizer: {
            '12': number;
            '16': number;
            '20': number;
        };
    };
    global: {
        'bg-standard': string;
    };
    standard: {
        others: {
            divider: string;
            accent: {
                chat: {
                    send: string;
                    receive: string;
                };
            };
        };
    };
};
