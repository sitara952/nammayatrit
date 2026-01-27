interface PassProductSummaryDetails {
    validFrom: string;
    validTill: string;
}

export const generatePassProductSummary = (passDetails: PassProductSummaryDetails): string => {
    const defaultArrowIcon =
        'https://assets.juspay.in/hyper/assets/in.juspay.merchants/images/cumta/jp_arrow_20250424224415.png';

    const productSummaryArrayCumta = [
        [
            {
                type: 'rowconfig',
                cornerRadii: [0, true, true, false, false],
            },
        ],
        [
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'text',
                text: passDetails.validFrom,
                fontType: 'semiBold',
                textSize: 14,
                color: '#332D39',
            },
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'rowconfig',
                padding: [16, 6, 16, 6],
            },
        ],
        [
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'image',
                url: defaultArrowIcon,
                size: 20,
            },
            {
                type: 'space',
                width: 10,
            },
            {
                type: 'text',
                text: passDetails.validTill,
                fontType: 'semiBold',
                textSize: 14,
                color: '#332D39',
            },
            {
                type: 'rowconfig',
                padding: [16, 2, 16, 6],
            },
        ],
        [
            {
                type: 'rowconfig',
                cornerRadii: [0, false, false, true, true],
            },
        ],
    ];
    return JSON.stringify(productSummaryArrayCumta);
};
