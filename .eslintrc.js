module.exports = {
    parser: "babel-eslint",
    extends: "airbnb-base",
    rules: {
        "no-console": "off",
        "no-plusplus": "off",
        "no-continue": "off",
        "no-await-in-loop": "off",
        "no-loop-func": "off",
        "no-underscore-dangle": "off",
        "consistent-return": "off",
        "class-methods-use-this": "off",
        "max-len": "off",
        "no-restricted-syntax": "off",
        "no-restricted-globals": "off",
        "no-unused-vars": [
            "error",
            { "argsIgnorePattern": "^_" }
        ],
        "object-curly-newline": [
            "error",
            { "ImportDeclaration": "never" }
        ],
    }
};
