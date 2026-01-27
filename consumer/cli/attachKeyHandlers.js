'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.default = attachKeyHandlers;
var _KeyPressHandler = require('../../utils/KeyPressHandler');
var _cliTools = require('@react-native-community/cli-tools');
var _chalk = _interopRequireDefault(require('chalk'));
var _execa = _interopRequireDefault(require('execa'));
var _nodeFetch = _interopRequireDefault(require('node-fetch'));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

const CTRL_C = '\u0003';
const CTRL_D = '\u0004';
function attachKeyHandlers({ cliConfig, devServerUrl, messageSocket, experimentalDebuggerFrontend = true }) {
    if (process.stdin.isTTY !== true) {
        _cliTools.logger.debug('Interactive mode is not supported in this environment');
        return;
    }
    const execaOptions = {
        env: {
            FORCE_COLOR: _chalk.default.supportsColor ? 'true' : 'false',
        },
    };

    // Safe access to config params
    const androidParams = cliConfig?.project?.android?.watchModeCommandParams ?? [];
    const iosParams = cliConfig?.project?.ios?.watchModeCommandParams ?? [];
    const keyPressHandler = new _KeyPressHandler.KeyPressHandler(async key => {
        switch (key) {
            case 'r':
                _cliTools.logger.info('Reloading connected app(s)...');
                messageSocket.broadcast('reload', null);
                break;
            case 'd':
                _cliTools.logger.info('Opening Dev Menu...');
                messageSocket.broadcast('devMenu', null);
                break;
            case 'B':
                _cliTools.logger.info('Opening Bridge on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'BridgeDevDebug',
                        '--appId',
                        'com.mobility.movingtech.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'N':
                _cliTools.logger.info('Opening Nammayatri on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'NammaYatriDevDebug',
                        '--appId',
                        'in.juspay.nammayatri.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'C':
                _cliTools.logger.info('Opening Cumta on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'CumtaDevDebug',
                        '--appId',
                        'in.mobility.cumta.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'K':
                _cliTools.logger.info('Opening KeralaSavaari on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'KeralaSavaariDevDebug',
                        '--appId',
                        'in.juspay.nammayatri.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'S':
                _cliTools.logger.info('Opening Yatrisathi on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'YatriSathiDevDebug',
                        '--appId',
                        'in.juspay.jatrisaathi.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'Y':
                _cliTools.logger.info('Opening Yatri on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'YatriDevDebug',
                        '--appId',
                        'net.openkochi.yatri.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'M':
                _cliTools.logger.info('Opening Manayatri on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'ManaYatriDevDebug',
                        '--appId',
                        'in.mobility.manayatri.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'O':
                _cliTools.logger.info('Opening OdishaYatri on Android...');
                (0, _execa.default)(
                    'npx',
                    [
                        'react-native',
                        'run-android',
                        '--mode',
                        'OdishaYatriDevDebug',
                        '--appId',
                        'in.mobility.odishayatri.debug',
                        ...androidParams,
                    ],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'b':
                _cliTools.logger.info('Opening Bridge on IOS...');
                (0, _execa.default)(
                    'npx',
                    ['react-native', 'run-ios', '--scheme', 'Bridge-Debug', ...iosParams],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'n':
                _cliTools.logger.info('Opening Nammayatri app on iOS...');
                (0, _execa.default)(
                    'npx',
                    ['react-native', 'run-ios', '--scheme', 'NammaYatri-Debug', ...iosParams],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 's':
                _cliTools.logger.info('Opening Yatrisathi on IOS...');
                (0, _execa.default)(
                    'npx',
                    ['react-native', 'run-ios', '--scheme', 'YatriSathi-Debug', ...iosParams],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'y':
                _cliTools.logger.info('Opening Yatri on IOS...');
                (0, _execa.default)(
                    'npx',
                    ['react-native', 'run-ios', '--scheme', 'Yatri-Debug', ...iosParams],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'm':
                _cliTools.logger.info('Opening Manayatri on IOS...');
                (0, _execa.default)(
                    'npx',
                    ['react-native', 'run-ios', '--scheme', 'ManaYatri-Debug', ...iosParams],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'o':
                _cliTools.logger.info('Opening OdishaYatri on IOS...');
                (0, _execa.default)(
                    'npx',
                    ['react-native', 'run-ios', '--scheme', 'OdishaYatri-Debug', ...iosParams],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'c':
                _cliTools.logger.info('Opening Cumta on IOS...');
                (0, _execa.default)(
                    'npx',
                    ['react-native', 'run-ios', '--scheme', 'Cumta-Debug', ...iosParams],
                    execaOptions,
                ).stdout?.pipe(process.stdout);
                break;
            case 'j':
                if (!experimentalDebuggerFrontend) {
                    return;
                }
                await (0, _nodeFetch.default)(devServerUrl + '/open-debugger', {
                    method: 'POST',
                });
                break;
            case CTRL_C:
            case CTRL_D:
                _cliTools.logger.info('Stopping server');
                keyPressHandler.stopInterceptingKeyStrokes();
                process.emit('SIGINT');
                process.exit();
        }
    });
    keyPressHandler.createInteractionListener();
    keyPressHandler.startInterceptingKeyStrokes();
    _cliTools.logger.log(
        [
            '',
            _chalk.default.bold.underline.blue('Multi-Platform App Launcher - Debug Menu'),
            '',
            `${_chalk.default.bold('B')} - Android Bridge`,
            `${_chalk.default.bold('N')} - Android Nammayatri`,
            `${_chalk.default.bold('S')} - Android Yatrisathi`,
            `${_chalk.default.bold('Y')} - Android Yatri`,
            `${_chalk.default.bold('M')} - Android Manayatri`,
            `${_chalk.default.bold('K')} - Android KeralaSavaari`,
            `${_chalk.default.bold('C')} - Android Cumta😶‍🌫️`,
            `${_chalk.default.bold('O')} - Android OdishaYatri`,
            `${_chalk.default.bold('b')} - IOS Bridge`,
            `${_chalk.default.bold('n')} - IOS Nammayatri`,
            `${_chalk.default.bold('s')} - IOS Yatrisathi`,
            `${_chalk.default.bold('y')} - IOS Yatri`,
            `${_chalk.default.bold('m')} - IOS Manayatri`,
            `${_chalk.default.bold('o')} - IOS OdishaYatri`,
            `${_chalk.default.bold('c')} - IOS Cumta🎃`,
            ...(experimentalDebuggerFrontend
                ? [`${_chalk.default.bold('j')} - open debugger (experimental, Hermes only)`]
                : []),
            `${_chalk.default.bold('r')} - Reload app`,
            `${_chalk.default.bold('d')} - Open Dev Menu`,
            '',
        ].join('\n'),
    );
}
