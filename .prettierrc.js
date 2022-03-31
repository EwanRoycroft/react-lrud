module.exports = {
    semi: true,
    tabWidth: 4,
    trailingComma: 'es5',
    singleQuote: true,
    proseWrap: 'never',

    overrides: [
        {
            files: ['*.yaml', '*.yml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
