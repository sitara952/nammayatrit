import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';
import functionalPlugin from 'eslint-plugin-functional';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import reactNativeA11y from 'eslint-plugin-react-native-a11y';
import {
    noHookDep,
    enforceOptionalParams,
    noAnyInModifiedFiles,
    noDuplicateTestId,
    noLazyPngImports,
    noDirectJsonParse,
    noAsInModifiedFiles,
    enforceRole,
    // ensureAllParams,
    // ensureAllParamsJSX,
    // noAnyNavigations,
    // noTailwindUsage,
} from 'custom-linters';
import path from 'path';

const __dirname = path.resolve();

const restrictedImportPaths = [
    {
        name: 'react-native',
        importNames: ['ScrollView'],
        message: "For 'ScrollView', please use 'ScrollView' from 'react-native-gesture-handler'",
    },
    {
        name: 'react-native',
        importNames: ['Animated'],
        message: "For 'Animated', please use 'Animated' from 'react-native-reanimated' instead.",
    },
    {
        name: 'react-native',
        importNames: ['Button'],
        message: "For 'Button', please use 'Button' from '@/src-v2/primitives/Button' instead.",
    },
    {
        name: 'react-native',
        importNames: ['Pressable'],
        message: "Please use 'Pressable' from '@/src-v2/primitives/Pressable' instead.",
    },
    {
        name: 'react-native-gesture-handler',
        importNames: ['Pressable'],
        message: "Please use 'Pressable' from '@/src-v2/primitives/Pressable' instead.",
    },
    {
        name: 'react-native',
        importNames: ['TouchableOpacity'],
        message: "Please use 'TouchableOpacity' from '@/src-v2/primitives/TouchableOpacity' instead.",
    },
    {
        name: 'react-native-gesture-handler',
        importNames: ['TouchableOpacity'],
        message: "Please use 'TouchableOpacity' from '@/src-v2/primitives/TouchableOpacity' instead.",
    },
    {
        name: 'react-native',
        importNames: ['TouchableWithoutFeedback'],
        message: "Please use 'TouchableWithoutFeedback' from '@/src-v2/primitives/TouchableWithoutFeedback' instead.",
    },
    {
        name: 'react-native-gesture-handler',
        importNames: ['TouchableWithoutFeedback'],
        message: "Please use 'TouchableWithoutFeedback' from '@/src-v2/primitives/TouchableWithoutFeedback' instead.",
    },
    {
        name: 'twrnc',
        importNames: ['default'],
        message: "Please use { tailwind } from '@/src-v2/tailwind-theme/tailwind' instead.",
    },
    {
        name: 'lottie-react-native',
        importNames: ['LottieView'],
        message: "Please use { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback' instead.",
    },
    {
        name: 'react-native',
        importNames: ['KeyboardAvoidingView'],
        message: "Please use { KeyboardAvoidingView } from 'react-native-keyboard-controller' instead.",
    },
];

const restrictedImportPatterns = [
    // Example
    // {
    //   group: ['**/hooks/**/*.tsx', ....other patterns],
    //   message: "Do not import.......",
    // },
];

export default tseslint.config(eslint.configs.recommended, {
    ignores: ['**/*.bs.js', '**/*.gen.tsx'],
    files: ['**/*.ts', '**/*.tsx'],
    linterOptions: {
        reportUnusedDisableDirectives: false,
    },
    plugins: {
        '@typescript-eslint': tsPlugin,
        'unused-imports': unusedImports,
        functional: functionalPlugin,
        'react-hooks': reactHooks,
        'react-native-a11y': reactNativeA11y,
        myCustomPlugin: {
            rules: {
                'no-hook-dep': noHookDep,
                'enforce-optional-params': enforceOptionalParams,
                'no-any-in-modified-files': noAnyInModifiedFiles,
                'no-duplicate-test-id': noDuplicateTestId,
                'no-lazy-png-imports': noLazyPngImports,
                'no-direct-json-parse': noDirectJsonParse,
                'no-as-in-modified-files': noAsInModifiedFiles,
                'enforce-role': enforceRole,
                // 'ensure-all-params': ensureAllParams,
                // 'ensure-all-params-jsx': ensureAllParamsJSX,
                // 'no-any-navigations': noAnyNavigations,
                // 'no-tailwind-usage': noTailwindUsage,
            },
        },
    },
    rules: {
        'myCustomPlugin/no-hook-dep': 'error',
        'myCustomPlugin/enforce-optional-params': 'error',
        'myCustomPlugin/no-any-in-modified-files': 'error',
        'myCustomPlugin/no-duplicate-test-id': 'error',
        'myCustomPlugin/no-lazy-png-imports': 'error',
        'myCustomPlugin/no-direct-json-parse': 'error',
        'myCustomPlugin/no-as-in-modified-files': 'error',
        'myCustomPlugin/enforce-role': 'error',
        'react-hooks/rules-of-hooks': 'error',
        // 'myCustomPlugin/no-any-navigations': 'error',
        // 'myCustomPlugin/ensure-all-params': 'error',
        // 'myCustomPlugin/ensure-all-params-jsx': 'error',
        // 'myCustomPlugin/no-tailwind-usage': 'warn',

        ...reactNativeA11y.configs.basic.rules,
        'react-native-a11y/has-accessibility-hint': 'off',

        // Typescript plugin checks
        '@typescript-eslint/no-unused-expressions': [
            'error',
            {
                allowShortCircuit: true,
                allowTernary: true,
            },
        ],
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-wrapper-object-types': 'error',
        '@typescript-eslint/ban-ts-comment': 'error',

        // Preference
        'prefer-const': 'error',

        // Unused imports
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'error',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],

        // Functional Programming related checks
        'no-var': 'error',
        'functional/no-let': ['error', { ignoreIdentifierPattern: '^mutable' }],
        'functional/immutable-data': [
            'error',
            {
                ignoreAccessorPattern: ['*.current.**', '**.value', 'this.*', 'window.*', 'state.**', 'action.**'], // Allows mutations for these patterns like useRef, redux state, classes etc .
            },
        ],

        // Restriction related checks
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'no-empty-pattern': 'error',
        'no-case-declarations': 'error',
        'no-console': [
            'error',
            {
                allow: ['warn', 'error', 'info', 'groupCollapsed', 'groupEnd', 'table'],
            },
        ],
        'no-restricted-imports': [
            'error',
            {
                paths: restrictedImportPaths,
                patterns: restrictedImportPatterns,
            },
        ],
    },
    languageOptions: {
        parser: parser,
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            project: path.resolve(__dirname, './tsconfig.json'),
            tsconfigRootDir: __dirname,
            projectService: true,
        },
        globals: {
            ...globals.browser,
            ...globals.node,
        },
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
        },
    },
});
