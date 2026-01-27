import React, { useEffect } from 'react';
import { hideSplash } from '../utils/common';

const AppSplashScreen: React.FC = () => {
    useEffect(() => {
        hideSplash();
    }, []);

    return null;
};

export default AppSplashScreen;
