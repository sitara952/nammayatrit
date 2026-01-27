import React, { memo, useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import Typography from '../../designSystem/components/primitives/Typography';
import { useAppSelector } from '../../state/hooks';
import BookAnyCard from '@/src-v2/screens/LookingForRides/BookAnyCard/Flow';
import {
    selectPricingItems,
    selectSelectedPricingItems,
    selectBoostPreSelectedVariants,
    selectSearchResults,
    setBoostPreSelectedVariants,
} from '../../state/client/search';
import { AccessibilityInfo } from 'react-native';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { EventName, logEvent, LogInterface } from '@/typescript/utils/logger';
import { extractBoostPreSelectedVariants } from '@/typescript/state/server/searchApi';
import { useAppDispatch } from '@/typescript/state/hooks';
import { selectSearchId } from '@/typescript/state/client/user';

interface BoostSearchChangeVehicleModalProps {
    selectedExpandedData: string[];
    setSelectedExpandedData: React.Dispatch<React.SetStateAction<string[]>>;
    setHeight: React.Dispatch<React.SetStateAction<number>>;
    updateInitialSelectedVehicles?: React.Dispatch<React.SetStateAction<string[]>>;
}

// Simple counter using module-level variable
const variantChangeCounter = {
    count: 0,
    increment() {
        this.count++;
    },
    reset() {
        this.count = 0;
    },
    get() {
        return this.count;
    },
};

export const getVariantChangeCount = () => variantChangeCounter.get();
export const resetVariantChangeCount = () => variantChangeCounter.reset();

const BoostSearchChangeVehicleModal = memo(
    ({
        selectedExpandedData,
        setSelectedExpandedData,
        setHeight,
        updateInitialSelectedVehicles,
    }: BoostSearchChangeVehicleModalProps) => {
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const pricingItems = useAppSelector(state => selectPricingItems(state, null));
        const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
        const boostPreSelectedVariants = useAppSelector(state => selectBoostPreSelectedVariants(state, null));
        const searchResults = useAppSelector(state => selectSearchResults(state, null));
        const searchId = useAppSelector(state => selectSearchId(state, null));
        const dispatch = useAppDispatch();

        const [userInteractedVariants, setUserInteractedVariants] = useState<Set<string>>(new Set());

        useEffect(() => {
            if (searchResults && selectedPricingItems && pricingItems) {
                const preSelectedVariants = extractBoostPreSelectedVariants(
                    searchResults,
                    pricingItems,
                    selectedPricingItems,
                );
                dispatch(setBoostPreSelectedVariants({ id: searchId, payload: preSelectedVariants }));
            }
        }, []);

        useEffect(() => {
            const currentlySelectedIds = selectedPricingItems?.map(item => item.id) || [];

            if (boostPreSelectedVariants && boostPreSelectedVariants.length > 0) {
                const preSelectedIds = boostPreSelectedVariants.filter(variantId =>
                    pricingItems?.some(item => item.id === variantId),
                );

                const combinedSelection = Array.from(new Set([...currentlySelectedIds, ...preSelectedIds]));

                if (combinedSelection.length > currentlySelectedIds.length) {
                    setSelectedExpandedData(combinedSelection);
                    if (updateInitialSelectedVehicles) {
                        updateInitialSelectedVehicles(combinedSelection);
                    }
                    return;
                }
            }

            setSelectedExpandedData(currentlySelectedIds);
            if (updateInitialSelectedVehicles) {
                updateInitialSelectedVehicles(currentlySelectedIds);
            }
        }, [selectedPricingItems, boostPreSelectedVariants, pricingItems, updateInitialSelectedVehicles]);

        const vehicleOptions = pricingItems
            ?.filter((item): item is typeof item & { serviceTierName: string; id: string } =>
                Boolean(item?.serviceTierName && item?.id),
            )
            .map(item => ({
                name: item.serviceTierName,
                value: item.id,

                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                service: (item.vehicleVariant || 'AUTO_RICKSHAW') as ServiceTierType_serviceTierType,
                isAc: item.isAirConditioned ?? false,
            }));

        useEffect(() => {
            AccessibilityInfo.announceForAccessibilityWithOptions('Boost search opened', { queue: true });
        }, []);

        const handleVariantInteraction = (variantId: string) => {
            setUserInteractedVariants(prev => new Set(prev).add(variantId));
        };

        const handleVariantChange = (tagData: string[]) => {
            variantChangeCounter.increment();
            logEvent(EventName.VARIANT_CHANGE, {}, [LogInterface.Firebase]);

            setSelectedExpandedData(tagData);
            if (updateInitialSelectedVehicles) {
                updateInitialSelectedVehicles(tagData);
            }
        };

        return (
            <Animated.View style={{ paddingHorizontal: 16 }}>
                <Typography
                    type="callout-1"
                    style={{ color: '#908A96', fontSize: 14 }}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.addVehicleToBoostSearch}
                </Typography>

                <BookAnyCard
                    defaultSelectedOptions={selectedExpandedData}
                    autoSelectedOptions={
                        boostPreSelectedVariants?.filter(
                            variantId => !(selectedPricingItems?.map(item => item.id) || []).includes(variantId),
                        ) || undefined
                    }
                    userInteractedVariants={userInteractedVariants}
                    onVariantInteraction={handleVariantInteraction}
                    allowMultipleSelect={true}
                    optionHeader={undefined}
                    onOptionSelect={handleVariantChange}
                    options={vehicleOptions}
                    setHeight={setHeight}
                />
            </Animated.View>
        );
    },
);

export default BoostSearchChangeVehicleModal;
