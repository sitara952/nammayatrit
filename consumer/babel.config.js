module.exports = function (api) {
    // api.cache(true); // Caches the result for better performance

    const isDev = api.env('development'); // Check if the environment is development

    return {
        presets: ['module:@react-native/babel-preset'],
        plugins: [
            ...(isDev ? [] : [['transform-remove-console', { exclude: ['error'] }]]),
            [
                '@babel/plugin-transform-runtime',
                {
                    helpers: true,
                    regenerator: true,
                },
            ],
            [
                'module-resolver',
                {
                    extensions: [
                        '.ios.js',
                        '.android.js',
                        '.ios.jsx',
                        '.android.jsx',
                        '.js',
                        '.jsx',
                        '.json',
                        '.ts',
                        '.tsx',
                    ],
                    root: ['./src-v2', './src'],
                    alias: { '@/src-v2': './src-v2', '@': './src' },
                },
            ],
            'react-native-reanimated/plugin',
        ],
    };
};
