import React from 'react';
import App, { InitialPayload } from './App';

const Splash = (props: InitialPayload) => {
    return <App {...props} />;
};

export default Splash;
