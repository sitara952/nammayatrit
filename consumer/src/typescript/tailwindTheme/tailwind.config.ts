import { chatUtils } from './componentUtils/primitives/chat';
import { buttonUtils } from './componentUtils/primitives/button';
import { inputUtils } from './componentUtils/primitives/input';
import { tagUtils } from './componentUtils/primitives/tag';
import { typographyUtils } from './componentUtils/primitives/typography';
import { textArea } from './componentUtils/primitives/textArea';

import { PluginAPI } from 'tailwindcss/types/config';

const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

export const twConfig = {
    theme: {
        ...defaultTheme,
        extend: {
            fontFamily: {
                'areaNormal-black': ['AreaNormal-Black'],
                'areaNormal-bold': ['AreaNormal-Bold'],
                'areaNormal-extrabold': ['AreaNormal-Extrabold'],
                'areaNormal-medium': ['AreaNormal-Medium'],
                'areaNormal-semibold': ['AreaNormal-Semibold'],
                'areaNormal-regular': ['AreaNormal-Regular'],
                'departureMono-regular': ['DepartureMono-Regular'],
                'led-dot-matrix': ['LED Dot-Matrix'],
                'inter-bold': ['Inter-Bold'],
                'inter-semibold': ['Inter-Semibold'],
                'inter-regular': ['Inter-Regular'],
                'inter-extrabold': ['Inter-ExtraBold'],
                'geist-mono-semibold': ['GeistMono-SemiBold'],
                'anekTamil-regular': ['AnekTamil-Regular'],
                //Only for Odisha Yatri
                'azeretMono-regular': ['AzeretMono-Regular'],
                'azeretMono-bold': ['AzeretMono-Bold'],
            },
        },
    },
    plugins: [
        plugin(function ({ addUtilities }: PluginAPI) {
            addUtilities({
                ...buttonUtils,
                ...typographyUtils,
                ...tagUtils,
                ...inputUtils,
                ...textArea,
                ...chatUtils,
            });
        }),
    ],
};
