//  tailwind.config.js
const plugin = require('tailwindcss/plugin');

const bridgeColor = {
    Neutral_900: '#14171F',
    Neutral_800: '#454C55',
    Neutral_700: '#5B6777',
    Neutral_600: '#7B8997',
    Neutral_500: '#B2B9C7',
    Neutral_400: '#E0E3E8',
    Neutral_300: '#F1F2F7',
    Neutral_200: '#F8F9FB',
    Neutral_100: '#FFFFFF',
    Purple_700: '#7D4BFF',
    Purple_500: '#D5C4FF',
    Purple_400: '#F6F1FF',
    Green_700: '#14A255',
    Green_500: '#88E5B2',
    Green_400: '#DBFCEA',
    Red_700: '#EA4848',
    Red_500: '#FFC6C6',
    Red_400: '#FFEDED',
    Blue_700: '#1D74F6',
    Blue_500: '#B6D3FF',
    Blue_400: '#E8F1FF',
    Yellow_700: '#D88F00',
    Yellow_600: '#F5B63B',
    Orange_700: '#FF6C2D',
};

const bridgeColorClass = {
    borderNeutralBlack: bridgeColor.Neutral_900,
    borderNeutralHigh: bridgeColor.Neutral_800,
    borderNeutralMid: bridgeColor.Neutral_400,
    borderNeutralLow: bridgeColor.Neutral_300,
    borderNeutralWhite: bridgeColor.Neutral_100,
    borderPrimaryHigh: bridgeColor.Purple_700,
    borderPrimaryMid: bridgeColor.Purple_500,
    borderPrimaryLow: bridgeColor.Purple_400,
    borderPositiveHigh: bridgeColor.Green_700,
    borderPositiveMid: bridgeColor.Green_500,
    borderPositiveLow: bridgeColor.Green_400,
    borderNegativeHigh: bridgeColor.Red_700,
    borderNegativeMid: bridgeColor.Red_500,
    borderNegativeLow: bridgeColor.Red_400,
    borderInfoHigh: bridgeColor.Blue_700,
    borderInfoMid: bridgeColor.Blue_500,
    borderInfoLow: bridgeColor.Blue_400,
    fillNeutralBlack: bridgeColor.Neutral_900,
    fillNeutralHigh: bridgeColor.Neutral_800,
    fillNeutralMid: bridgeColor.Neutral_500,
    fillNeutralLow: bridgeColor.Neutral_300,
    fillNeutralWhite: bridgeColor.Neutral_100,
    fillPrimaryHigh: bridgeColor.Purple_700,
    fillPrimaryMid: bridgeColor.Purple_500,
    fillPrimaryLow: bridgeColor.Purple_400,
    fillPositiveHigh: bridgeColor.Green_700,
    fillPositiveLow: bridgeColor.Green_400,
    fillNegativeHigh: bridgeColor.Red_700,
    fillNegativeLow: bridgeColor.Red_400,
    fillInfoHigh: bridgeColor.Blue_700,
    fillInfoLow: bridgeColor.Blue_400,
    textBlack: bridgeColor.Neutral_900,
    textHigh: bridgeColor.Neutral_700,
    textMid: bridgeColor.Neutral_600,
    textLow: bridgeColor.Neutral_500,
    textWhite: bridgeColor.Neutral_100,
    textPrimary: bridgeColor.Purple_700,
    textPrimaryMid: bridgeColor.Purple_600,
    textInfo: bridgeColor.Blue_700,
    textPositive: bridgeColor.Green_700,
    textNegative: bridgeColor.Red_700,
    textProgress: bridgeColor.Yellow_700,
    textWarning: bridgeColor.Orange_700,
    iconBlack: bridgeColor.Neutral_900,
    iconWhite: bridgeColor.Neutral_100,
    iconPrimary: bridgeColor.Purple_700,
    iconInfo: bridgeColor.Blue_700,
    iconLow: bridgeColor.Neutral_500,
    iconPositive: bridgeColor.Green_700,
    iconNegative: bridgeColor.Red_700,
    iconProgress: bridgeColor.Yellow_600,
    iconWarning: bridgeColor.Orange_700,
    ctaPrimaryActive: bridgeColor.Neutral_900,
    ctaPrimaryPressed: bridgeColor.Neutral_800,
    ctaPrimaryDisabled: bridgeColor.Neutral_400,
    ctaSecondaryActive: bridgeColor.Neutral_300,
    ctaSecondaryPressed: bridgeColor.Neutral_400,
    ctaSecondaryDisabled: bridgeColor.Neutral_200,
    randomColor: '#980987',
    activeDotColor: '#3F3F3F',
    inActiveDotColor: '#D3D3D3',
    yellowPositive: '#FFD506',
};

const extensions = {
    colors: bridgeColorClass,
    fontFamily: {
        // Define any custom fonts you want to use
        sans: ['Roboto', 'Arial', 'sans-serif'],
        black: 'AreaNormal-black',
        bold: 'AreaNormal-Bold',
        extraBold: 'AreaNormal-Extrabold',
        medium: 'AreaNormal-Medium',
        regular: 'AreaNormal-Regular',
        semibold: 'AreaNormal-Semibold',
    },
};

module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx,res}'], // Specify where to find your React Native components
    theme: {
        extend: extensions,
    },
    plugins: [
        plugin(function ({ addUtilities, theme }) {
            const newUtilities = {
                '.Disp_800': {
                    fontFamily: extensions.fontFamily.extraBold,
                    fontSize: 32,
                    lineHeight: 40,
                },
                '.Title_900': {
                    fontFamily: extensions.fontFamily.extraBold,
                    fontSize: 20,
                    lineHeight: 28,
                },
                '.Title_800': {
                    fontFamily: extensions.fontFamily.extraBold,
                    fontSize: 20,
                    lineHeight: 26,
                },
                '.Head_900': {
                    fontFamily: extensions.fontFamily.black,
                    fontSize: 18,
                    lineHeight: 26,
                },
                '.Head_800': {
                    fontFamily: extensions.fontFamily.extraBold,
                    fontSize: 18,
                    lineHeight: 24,
                },
                '.Head_700': {
                    fontFamily: extensions.fontFamily.bold,
                    fontSize: 18,
                },
                '.sHead_800': {
                    fontFamily: extensions.fontFamily.extraBold,
                    fontSize: 16,
                    lineHeight: 24,
                },
                '.sHead_700': {
                    fontFamily: extensions.fontFamily.bold,
                    fontSize: 16,
                    lineHeight: 22,
                },
                '.sHead_600': {
                    fontFamily: extensions.fontFamily.semibold,
                    fontSize: 16,
                    lineHeight: 22,
                },
                '.Body_800': {
                    fontFamily: extensions.fontFamily.extraBold,
                    fontSize: 14,
                },
                '.Body_700': {
                    fontFamily: extensions.fontFamily.bold,
                    fontSize: 14,
                    lineHeight: 20,
                },
                '.Body_600': {
                    fontFamily: extensions.fontFamily.semibold,
                    fontSize: 14,
                    lineHeight: 20,
                },
                '.Body_400': {
                    fontFamily: extensions.fontFamily.regular,
                    fontSize: 14,
                    lineHeight: 20,
                },
                '.sBody_800': {
                    fontFamily: extensions.fontFamily.extraBold,
                    fontSize: 12,
                    lineHeight: 16,
                },
                '.sBody_700': {
                    fontFamily: extensions.fontFamily.bold,
                    fontSize: 12,
                    lineHeight: 16,
                },
                '.sBody_600': {
                    fontFamily: extensions.fontFamily.semibold,
                    fontSize: 12,
                    lineHeight: 16,
                },
                '.sBody_400': {
                    fontFamily: extensions.fontFamily.regular,
                    fontSize: 12,
                    lineHeight: 16,
                },
                '.Cap_700': {
                    fontFamily: extensions.fontFamily.bold,
                    fontSize: 10,
                    lineHeight: 12,
                },
            };

            addUtilities(newUtilities, {
                variants: ['responsive', 'hover'], // Adjust variants as necessary
            });
        }),
    ],
    bridgeColorClass,
};
