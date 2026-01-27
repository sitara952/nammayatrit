import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../state/hooks';
import { ParsedUrl, parseValueInParams } from '@/src-v2/utils/urlParser';
import { selectDeepLinkUrl, setDeepLinkUrl } from '../../../state/client/session';
import { useRefsContext } from '@/typescript/context/RefsContext';

export function useDeepLinking() {
    const dispatch = useAppDispatch();
    const deepLinkUrl: ParsedUrl | null = useAppSelector(selectDeepLinkUrl);
    const { referralModalRef } = useRefsContext();
    const [utmReferralCode, setUtmReferralCode] = useState('');

    useEffect(() => {
        if (deepLinkUrl) {
            switch (deepLinkUrl?.pathname) {
                case '/refer': {
                    const referrerParams = parseValueInParams(deepLinkUrl, 'referrer');
                    if (referrerParams?.['utm_campaign']) {
                        setUtmReferralCode(referrerParams['utm_campaign']);
                        referralModalRef?.current?.present();
                    }
                    break;
                }
                default:
                    break;
            }
            // Clear the deepLinkUrl from Redux so we don't handle it repeatedly
            dispatch(setDeepLinkUrl(null));
        }
    }, [deepLinkUrl]);

    return {
        referralModalRef,
        utmReferralCode,
    };
}
