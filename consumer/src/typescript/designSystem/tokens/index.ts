import { bridgeTokens } from './bridgeTokens';
import { BRIDGE_APP, NAMMA_YATRI_APP } from '../../constants/common';
import { PROJECT_ENUMS } from '../../types/CommonTypes';
import { nammaYatriTokens } from './nammaYatriTokens';
import { nammaYatriTokensAndroid } from './nammaYatriTokensAndroid';
import { Platform } from 'react-native';

const project: PROJECT_ENUMS = NAMMA_YATRI_APP as PROJECT_ENUMS;

const getProjectTokens = () => {
    switch (project) {
        case BRIDGE_APP:
            return bridgeTokens;
        case NAMMA_YATRI_APP:
            return Platform.OS === 'android' ? nammaYatriTokensAndroid : nammaYatriTokens;
        default:
            return null;
    }
};

const token = getProjectTokens();

export default token;
