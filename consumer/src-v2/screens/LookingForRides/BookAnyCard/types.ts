import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { Action, Resolver } from '@/typescript/utils/common';

export type BookAnyCardAction = Action<
    'TAG_SELECTED',
    {
        name: string;
        value: number | string;
        service: ServiceTierType_serviceTierType | undefined;
        isAc: boolean;
    }
>;

export type BookAnyCardProps = {
    optionHeader: { text: string; minAmount: number; maxAmount: number } | undefined;
    options: {
        name: string;
        value: number | string;
        service: ServiceTierType_serviceTierType | undefined;
        isAc: boolean;
    }[];
    onOptionSelect: ((value: string[]) => void) | undefined;
    allowMultipleSelect: boolean | undefined;
    defaultSelectedOptions: string[] | undefined;
    autoSelectedOptions: string[] | undefined;
    userInteractedVariants: Set<string> | undefined;
    onVariantInteraction: ((variantId: string) => void) | undefined;
    setHeight: React.Dispatch<React.SetStateAction<number>>;
};

export interface BookAnyUiProps {
    options: {
        name: string;
        value: number | string;
        service: ServiceTierType_serviceTierType | undefined;
        isAc: boolean;
    }[];
    selectedOption: string[];
    autoSelectedOptions?: string[] | undefined;
    userInteractedVariants?: Set<string>;
    optionHeader:
        | {
              text: string;
              minAmount: number;
              maxAmount: number;
          }
        | undefined;
    rcsDispatch: Resolver<BookAnyCardAction>;
    setHeight: React.Dispatch<React.SetStateAction<number>>;
}
