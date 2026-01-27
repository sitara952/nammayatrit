import { MERCHANT_SHORT_ID, HOST_URL, AUTH_ENDPOINT } from '../src/typescript/constants/common';

interface SuccessCallback {
    (response: { authId: string }): void;
}

interface ErrorCallback {
    (error: any): void;
}

export const triggerEmailOTP = async (email: string, succCb: SuccessCallback, errCb: ErrorCallback) => {
    const postData = {
        merchantId: MERCHANT_SHORT_ID,
        email,
        identifierType: 'EMAIL',
    };

    try {
        const res = await fetch(HOST_URL + AUTH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        const k = await res.json();
        console.info('auth res', res.status, k);

        if (res.status !== 200) {
            errCb(k); // Use k to provide error details
        } else {
            succCb(k);
        }
    } catch (error) {
        errCb(error); // Pass error directly
    }
};
