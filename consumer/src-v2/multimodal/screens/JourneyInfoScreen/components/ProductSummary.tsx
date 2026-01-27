interface JourneyDetails {
    source: string;
    destination: string;
    arrowIcon?: string;
    appName: string;
    totalPayableFare: number;
}

export const generateProductSummary = (journeyDetails: JourneyDetails): string => {
    // Helper to ellipsize text
    const ellipsize = (text: string, maxLength: number = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
    };

    const source = ellipsize(journeyDetails.source);
    const destination = ellipsize(journeyDetails.destination);

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
                text: source,
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
                url: journeyDetails.arrowIcon || defaultArrowIcon,
                size: 20,
            },
            {
                type: 'space',
                width: 10,
            },
            {
                type: 'text',
                text: destination,
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

    const productSummaryArrayNammayatribap = [
        [
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'rowconfig',
                padding: [16, 16, 16, 10],
            },
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'text',
                text: 'Public transport',
                textSize: 14,
                fontType: 'semiBold',
                color: '#14171F',
            },
            {
                type: 'space',
                weight: 1,
            },
            {
                type: 'text',
                text: '₹' + journeyDetails.totalPayableFare.toString(),
                textSize: 14,
                fontType: 'semiBold',
                color: '#14171F',
            },
        ],
        [
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'text',
                text: source,
                fontType: 'semiBold',
                textSize: 14,
                color: '#5B6777',
            },
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'rowconfig',
                padding: [16, 2, 16, 3],
            },
        ],
        [
            {
                type: 'space',
                width: 0,
            },
            {
                type: 'rowconfig',
                padding: [16, 2, 16, 6],
            },
            {
                type: 'image',
                url: 'https://assets.juspay.in/hyper/assets/in.juspay.merchants/images/nammayatribap/jp_toarrow_20250708195526.png',
                size: 14,
            },
            {
                type: 'space',
                width: 10,
            },
            {
                type: 'text',
                text: destination,
                fontType: 'semiBold',
                textSize: 14,
                color: '#5B6777',
            },
            {
                type: 'space',
                weight: 1,
            },
            {
                type: 'image',
                url: 'https://assets.juspay.in/hyper/assets/in.juspay.merchants/images/nammayatribap/jp_metro_20250708195539.png',
                size: 44,
            },
        ],
    ];

    const nammaOdisha = journeyDetails.appName === 'nammaYatri' || journeyDetails.appName === 'odishaYatri';

    const productSummaryArray = nammaOdisha ? productSummaryArrayNammayatribap : productSummaryArrayCumta;

    return JSON.stringify(productSummaryArray);
};
