import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    PricingItemType,
    selectCustomerTip,
    selectSelectedPricingItems,
    setIsEditClicked,
    selectIsEditButtonDisabled,
} from '@/typescript/state/client/search';

import { selectSearchId } from '@/typescript/state/client/user';
import { StyleType } from '@/typescript/types/CommonTypes';
import { BoostSearchInfoUI } from './UI';
import { BoostSearchInfoAction, BoostSearchInfoUIProps } from './types';
import { createDispatcher, Resolver } from '@/typescript/utils/common';

const CardBoostSearchInfo: React.FC<{ containerStyle: StyleType }> = ({
    containerStyle,
}: {
    containerStyle: StyleType;
}) => {
    const customerTip = useAppSelector(state => selectCustomerTip(state, null));
    const dispatch = useAppDispatch();
    const isEditButtonDisabled = useAppSelector(selectIsEditButtonDisabled);
    const searchId = useAppSelector(state => selectSearchId(state, null));

    const selectedPricingItems: PricingItemType[] = useAppSelector(state => selectSelectedPricingItems(state, null));

    const selectedItemName = selectedPricingItems?.map(item => item?.serviceTierName)?.join(', ');

    const resolver: Resolver<BoostSearchInfoAction> = async action => {
        switch (action.type) {
            case 'ON_EDIT_CLICKED':
                dispatch(setIsEditClicked({ id: searchId, payload: true }));
                break;
            default:
                break;
        }
    };

    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const BoostSearchInfoProps: BoostSearchInfoUIProps = {
        containerStyle,
        customerTip,
        selectedItemName,
        rcsDispatch,
        isEditButtonDisabled,
    };

    return <BoostSearchInfoUI {...BoostSearchInfoProps} />;
};

export default CardBoostSearchInfo;
