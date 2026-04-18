module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    alias: {
                        'rn-smart-sheet': '../src',
                    },
                },
            ],
            'react-native-reanimated/plugin',
        ],
    };
};
