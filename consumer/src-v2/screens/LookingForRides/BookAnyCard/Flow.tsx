import React, { useEffect, useMemo, useState } from 'react';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { BookAnyCardAction, BookAnyCardProps, BookAnyUiProps } from './types';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { BookAnyCardUI } from './UI';

const BookAnyCard: React.FC<BookAnyCardProps> = ({
    optionHeader = undefined,
    options,
    onOptionSelect = () => {},
    allowMultipleSelect,
    defaultSelectedOptions,
    autoSelectedOptions,
    userInteractedVariants,
    onVariantInteraction,
    setHeight,
}) => {
    const [selectedOption, setSelectedOption] = useState<string[]>([]);

    useEffect(() => {
        if (defaultSelectedOptions) {
            setSelectedOption(defaultSelectedOptions);
        }
    }, [defaultSelectedOptions]);

    const onPress = (item: {
        name: string;
        value: number | string;
        service: ServiceTierType_serviceTierType | undefined;
        isAc: boolean;
    }) => {
        const currentSelected = selectedOption ?? [];
        const itemValue = item.value?.toString();

        if (onVariantInteraction && itemValue) {
            onVariantInteraction(itemValue);
        }

        if (currentSelected.includes(itemValue)) {
            if (currentSelected.length === 1 && allowMultipleSelect) return;

            const updatedData = currentSelected.filter(v => v !== itemValue);
            setSelectedOption(updatedData);
            onOptionSelect(
                updatedData.map(
                    dataItem => options.find(opt => opt.value?.toString() === dataItem)?.value?.toString() || '',
                ),
            );
        } else {
            const updatedData = allowMultipleSelect ? [...currentSelected, itemValue] : [itemValue];

            setSelectedOption(updatedData);
            onOptionSelect(
                updatedData.map(
                    dataItem => options.find(opt => opt.value?.toString() === dataItem)?.value?.toString() || '',
                ),
            );
        }
    };

    const resolver: Resolver<BookAnyCardAction> = async action => {
        switch (action.type) {
            case 'TAG_SELECTED':
                if (action.payload) onPress(action.payload);
                break;
            default:
                break;
        }
    };

    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const BookAnyCardProps: BookAnyUiProps = {
        options,
        selectedOption,
        autoSelectedOptions,
        userInteractedVariants,
        optionHeader,
        rcsDispatch,
        setHeight,
    };

    return <BookAnyCardUI {...BookAnyCardProps} />;
};

export default BookAnyCard;
