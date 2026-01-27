import { Currency_currency } from '@/readOnly/api/types/Enums.gen';

export const getCurrency = (currency: string | undefined) => {
    switch (currency) {
        case 'INR':
        case '₹':
            return '₹';
        case 'USD':
        case '$':
            return '$';
        case 'EUR':
        case '€':
            return '€';
        default:
            return '₹';
    }
};

export const getCurrencyApiType = (currency: string): Currency_currency => {
    switch (currency) {
        case 'INR':
        case '₹':
            return 'INR';
        case 'USD':
        case '$':
            return 'USD';
        case 'EUR':
        case '€':
            return 'EUR';
        default:
            return 'INR';
    }
};
