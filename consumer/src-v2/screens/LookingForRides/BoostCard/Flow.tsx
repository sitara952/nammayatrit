import React, { memo } from 'react';
import { BoostCardProps } from './types';
import { BoostCardUI } from './UI';

export const BoostCard = memo(
    ({
        additionalFare,
        setAdditionalFare,
        selectedExpandedData,
        setSelectedExpandedData,
        containerStyle,
        setHeight,
        updateInitialSelectedVehicles,
        tipOptions,
        currentlySelectedIds,
    }: BoostCardProps) => {
        const BoostCardProps: BoostCardProps = {
            containerStyle,
            additionalFare,
            setAdditionalFare,
            selectedExpandedData,
            setSelectedExpandedData,
            setHeight,
            updateInitialSelectedVehicles,
            tipOptions,
            currentlySelectedIds,
        };

        return <BoostCardUI {...BoostCardProps} />;
    },
);
