import React, { createContext, MutableRefObject, ReactElement, useEffect, useRef } from 'react';
import { getPersonFlowStatusRes } from '@/readOnly/api/types/GetPersonFlowStatusRes.gen';
import { decodeGetPersonFlowStatusRes } from '@/readOnly/api/types/GetPersonFlowStatusRes.bs';
import { getStringItem, MMKVKey } from '../utils/MMKV';
import Config from 'react-native-config';

export type FlowStatusContextType = {
    data: MutableRefObject<{
        TAG: string;
        _0: getPersonFlowStatusRes;
    } | null> | null;
    err: MutableRefObject<Response | null> | null;
    resetData: () => void;
};

const initialFlowStatusContextType: FlowStatusContextType = {
    data: null,
    err: null,
    resetData: () => {},
};

export const FlowStatusContext = createContext<FlowStatusContextType>(initialFlowStatusContextType);

export const FlowStatusContextProvider = ({ children }: { children: ReactElement }) => {
    const data = useRef<{
        TAG: string;
        _0: getPersonFlowStatusRes;
    } | null>(null);

    const err = useRef<Response | null>(null);

    useEffect(() => {
        if (getStringItem(MMKVKey.REGISTRATION_TOKEN) !== null && data.current === null) {
            fetch(Config['BASE_URL'] + '/frontend/flowStatus?isPolling=false&checkForActiveBooking=true', {
                method: 'GET',
                headers: {
                    token: getStringItem(MMKVKey.REGISTRATION_TOKEN) ?? '',
                },
            })
                .then(res => {
                    res.json().then(respBody => {
                        const decodedResp = decodeGetPersonFlowStatusRes(respBody);
                        if (decodedResp.TAG === 'Ok') {
                            data.current = decodedResp;
                        } else {
                            data.current = null;
                        }
                    });
                })
                .catch(e => {
                    console.error('FlowStatusFails', e);
                    err.current = e;
                });
        }
    }, []);

    const resetData = () => {
        data.current = null;
        err.current = null;
    };

    const provideValue = { data, err, resetData };
    return <FlowStatusContext.Provider value={provideValue}>{children}</FlowStatusContext.Provider>;
};
