/**
 * @format
 */

// Fix React 19 + Hermes Error.stack compatibility issue
if (!Error.prototype.hasOwnProperty('stack')) {
    Object.defineProperty(Error.prototype, 'stack', {
        get: function () {
            return this._stack || '';
        },
        set: function (value) {
            this._stack = value;
        },
        configurable: true,
        enumerable: false,
    });
}

// Required polyfill for URL and fetch to work properly
import 'react-native-url-polyfill/auto';

import { AppRegistry, Text, TextInput, NativeModules } from 'react-native';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

import Splash from './src/Splash';
import { name as appName } from './app.json';

// AppRegistry.registerRunnable('Hyper', () => {
//     NativeModules.HyperSdkReact.createHyperServices('hyperKey');
// });

AppRegistry.registerComponent(appName, () => Splash);

// AppRegistry.runApplication(appName);
