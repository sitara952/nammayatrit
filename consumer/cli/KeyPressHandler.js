'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.KeyPressHandler = void 0;

class KeyPressHandler {
    constructor(onKeyPress) {
        this._onKeyPress = onKeyPress;
        this._isInterceptingKeyStrokes = false;
        this._stdin = process.stdin;
    }

    createInteractionListener() {
        // Set up stdin to emit keypress events
        if (this._stdin.isTTY && typeof this._stdin.setRawMode === 'function') {
            this._stdin.setRawMode(true);
        }
        this._stdin.resume();
        this._stdin.setEncoding('utf8');
    }

    startInterceptingKeyStrokes() {
        if (this._isInterceptingKeyStrokes) {
            return;
        }
        this._isInterceptingKeyStrokes = true;
        this._stdin.on('data', this._handleKeyPress);
    }

    stopInterceptingKeyStrokes() {
        if (!this._isInterceptingKeyStrokes) {
            return;
        }
        this._isInterceptingKeyStrokes = false;
        this._stdin.removeListener('data', this._handleKeyPress);
        if (this._stdin.isTTY && typeof this._stdin.setRawMode === 'function') {
            this._stdin.setRawMode(false);
        }
        this._stdin.pause();
    }

    _handleKeyPress = data => {
        const key = data.toString();
        if (this._onKeyPress) {
            this._onKeyPress(key);
        }
    };
}

exports.KeyPressHandler = KeyPressHandler;
