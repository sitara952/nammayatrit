import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    selectCustomerTip,
    selectEscalatedTime,
    selectIsSearchBoosted,
    selectSelectedPricingItems,
} from '@/typescript/state/client/search';
import { selectUserProfile } from '@/typescript/state/client/user.ts';
import { selectAppConfig } from '@/typescript/state/client/session.ts';
import { Language_language } from '@/readOnly/api/types/Enums.gen.tsx';
import { rotatingTexts } from '../systems/configs/types.ts';
import {
    defaultRotatingTextConfig,
    getFemaleRotatingTextConfig,
} from '../systems/configs/defaults/defaultRotatingText.ts';
import { defaultBoostedRotatingTextConfig } from '../systems/configs/defaults/defaultBoostedRotatingText.ts';

type rotatingTextCumulative = {
    rotatingData: rotatingTexts;
    cumulativeDuration: number;
};

export const useRideSearchTextFlipper = () => {
    const { transformedRotatingData, transformedBoostedRotatingData } = useGetRotatingData();
    const customerTip = useAppSelector(state => selectCustomerTip(state, null));
    const selectedPricingItem = useAppSelector(state => selectSelectedPricingItems(state, null));
    const isSearchBoosted = useAppSelector(state => selectIsSearchBoosted(state, null));
    const userProfile = useAppSelector(selectUserProfile);
    const currentLanguage = userProfile?.language ?? 'ENGLISH';
    const escalatedTime = useAppSelector(state => selectEscalatedTime(state, null));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentRotatingData, setCurrentData] = useState(
        isSearchBoosted ? transformedBoostedRotatingData : transformedRotatingData,
    );

    const [currentText, setCurrentText] = useState('');
    const [currentTimer, setCurrentTimer] = useState(0);
    const [currentZoom, setCurrentZoom] = useState(currentRotatingData[currentIndex]?.rotatingData.zoomLevel ?? 18);

    useEffect(() => {
        setCurrentIndex(0);
        setCurrentData(isSearchBoosted ? transformedBoostedRotatingData : transformedRotatingData);
    }, [isSearchBoosted, customerTip, selectedPricingItem]);

    useEffect(() => {
        if (escalatedTime) {
            const filteredArray = currentRotatingData.filter(
                (item: rotatingTextCumulative) => item.cumulativeDuration > escalatedTime,
            );
            if (filteredArray.length > 0 && filteredArray[0]) {
                const correctedArray = {
                    ...filteredArray[0],
                    duration: filteredArray[0].cumulativeDuration - escalatedTime,
                };
                setCurrentData([correctedArray, ...filteredArray.slice(1)]);
            }
        }
    }, [escalatedTime]);

    useEffect(() => {
        const newText = getLanguageBasedText(currentRotatingData[currentIndex], currentLanguage);
        if (currentRotatingData[currentIndex]) {
            const newTimer = currentRotatingData[currentIndex].rotatingData.duration;
            const newZoom = currentRotatingData[currentIndex].rotatingData.zoomLevel;
            setCurrentZoom(newZoom);
            setCurrentTimer(newTimer);
        }
        setCurrentText(newText);
    }, [currentRotatingData, currentIndex]);

    useEffect(() => {
        if (currentTimer != 0 && currentIndex < currentRotatingData.length) {
            const timeoutId = setTimeout(() => {
                setCurrentIndex(prev => (prev + 1 === currentRotatingData.length ? 0 : prev + 1));
            }, currentTimer * 1000);
            return () => clearTimeout(timeoutId);
        }
        return () => {};
    }, [currentTimer, currentText, currentRotatingData]);

    const [visibleText, setVisibleText] = useState(currentText);
    useEffect(() => {
        const timeout = setTimeout(() => setVisibleText(currentText), 50);
        return () => clearTimeout(timeout);
    }, [currentText]);

    return { visibleText, currentZoom };
};

const useGetRotatingData = () => {
    const userProfile = useAppSelector(selectUserProfile);
    const isFemale = userProfile?.gender === 'FEMALE';
    const selectedPricingItem = useAppSelector(state => selectSelectedPricingItems(state, null));
    const appConfig = useAppSelector(selectAppConfig);
    const enableFemaleRotatingText = appConfig?.flowConfig?.enableFemaleRotatingText ?? false;

    const vehicleType = selectedPricingItem?.[0]?.vehicleVariant ?? selectedPricingItem?.[0]?.serviceTierType ?? '';

    const baseRotatingData = defaultRotatingTextConfig.bangalore;
    const baseBoostedRotatingData = defaultBoostedRotatingTextConfig.bangalore;

    const shouldShowFemaleText = isFemale && enableFemaleRotatingText;
    const rotatingData = shouldShowFemaleText
        ? getFemaleRotatingTextConfig(baseRotatingData, vehicleType)
        : baseRotatingData;
    const boostedRotatingData = shouldShowFemaleText
        ? getFemaleRotatingTextConfig(baseBoostedRotatingData, vehicleType)
        : baseBoostedRotatingData;

    const currentSum = useRef(0);
    const currentBoostedSum = useRef(0);
    const transformedRotatingData: rotatingTextCumulative[] = rotatingData.map((item: rotatingTexts) => {
        currentSum.current += item.duration;
        return {
            rotatingData: item,
            cumulativeDuration: currentSum.current,
        };
    });
    const transformedBoostedRotatingData: rotatingTextCumulative[] = boostedRotatingData.map((item: rotatingTexts) => {
        currentBoostedSum.current += item.duration;
        return {
            rotatingData: item,
            cumulativeDuration: currentBoostedSum.current,
        };
    });
    return { transformedRotatingData, transformedBoostedRotatingData };
};

const getLanguageBasedText = (config: rotatingTextCumulative | undefined, language: Language_language) => {
    if (config === undefined) {
        return '';
    }
    switch (language) {
        case 'KANNADA':
            return config.rotatingData.texts.kn;
        case 'HINDI':
            return config.rotatingData.texts.hi;
        case 'TAMIL':
            return config.rotatingData.texts.ta;
        case 'TELUGU':
            return config.rotatingData.texts.te;
        case 'ENGLISH':
            return config.rotatingData.texts.en;
        case 'BENGALI':
            return config.rotatingData.texts.bn;
        case 'MALAYALAM':
            return config.rotatingData.texts.ml;
        case 'ODIA':
            return config.rotatingData.texts.od;
        case 'FRENCH':
        default:
            return config.rotatingData.texts.en;
    }
};
