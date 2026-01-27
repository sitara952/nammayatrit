import HyperSdkReact, * as HyperSDK from 'hyper-sdk-react';
import * as React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { createSdkPayload } from '../hybrid/hybridSDK';
import { NativeModules } from 'react-native';
import { getStringItem, MMKVKey, setStringItem } from '../utils/MMKV';
import { useDispatch } from 'react-redux';
import { hybridActions, initialHybridFlags, setWentToHybridSection } from '../state/client/appinfo';
import { selectAppReadableName } from '../state/client/session';
import { useAppSelector } from '../state/hooks';
import { selectCurrentLocation } from '@/typescript/state/client/session';
import { HomeTabParamList } from '../navigation/globalParamList';
import { selectUserId } from '../state/client/user';
import { createMMKV } from '@/utils/mmkvUtils';
import { NativeEventEmitter } from 'react-native';
import { parseHyperEventData } from '@/src-v2/utils/common';
import Config from 'react-native-config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from 'config-types/src/domain/default/themes/colors';
type HyperViewProps = {
    /* eslint-disable myCustomPlugin/enforce-optional-params */
    route?: RouteProp<HomeTabParamList, 'baseHybridFlow'>;
    viewParam?: string;
    sharedPrefValues?: string;
};

export const HyperView: React.FC<HyperViewProps> = ({ route, viewParam }) => {
    const vparam = route?.params?.viewParam ?? viewParam;
    console.info('[HyperEvent] Component mounted with viewParam:', vparam);
    const [appToken, setAppToken] = React.useState<string | null>(null);
    const dispatch = useDispatch();
    const appReadableName = useAppSelector(selectAppReadableName);
    const { setEnabled } = useKeyboardController();
    const { MainAppUtils } = NativeModules;
    const currentLocation = useAppSelector(selectCurrentLocation);

    React.useEffect(() => {
        setEnabled(false);
        const retrieveAndStoreToken = async () => {
            try {
                const storedToken = getStringItem(MMKVKey.REGISTRATION_TOKEN);
                console.info('[HyperEvent] Token retrieved:', storedToken ? 'EXISTS' : 'EMPTY');
                setAppToken(storedToken || ''); // Store token or an empty string if not found
            } catch (error) {
                console.error('[HyperEvent] Error retrieving token:', error);
            }
        };

        retrieveAndStoreToken();
        updateMMKVStorageToGodel();
        return () => {
            setEnabled(true);
        };
    }, []);

    React.useEffect(() => {
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        if (vparam && vparam in initialHybridFlags) vparam && dispatch(setWentToHybridSection(vparam as hybridActions));
    }, []);

    const handleLocationChange = async () => {
        try {
            if (currentLocation != null) {
                if (currentLocation?.lat !== undefined) {
                    await setStringItem(MMKVKey.LAST_KNOWN_LAT, currentLocation.lat.toString());
                }
                if (currentLocation?.lng !== undefined) {
                    await setStringItem(MMKVKey.LAST_KNOWN_LON, currentLocation.lng.toString());
                }
                console.info(
                    'lat is and lon is',
                    getStringItem(MMKVKey.LAST_KNOWN_LAT),
                    getStringItem(MMKVKey.LAST_KNOWN_LON),
                );
            }
        } catch (error) {
            console.error('Error handling location change:', error);
        }
    };

    const updateMMKVStorageToGodel = async () => {
        await handleLocationChange();
        const mmkvStorage = createMMKV();
        const mmkvKeys = mmkvStorage.getAllKeys();

        const whiteListedKV = new Map<string, { key: string; value: (arg: string) => string }>([
            ['REGISTRATION_TOKEN', { key: 'REGISTERATION_TOKEN', value: (reg: string) => reg }],
            ['FCM_TOKEN', { key: 'FCM_TOKEN', value: (fcm: string) => fcm }],
            ['OPERATING_CITY', { key: 'CUSTOMER_LOCATION', value: (location: string) => location }],
            ['MOBILE_NUMBER', { key: 'MOBILE_NUMBER', value: (mobile: string) => mobile }],
            ['LAST_KNOWN_LAT', { key: 'LAST_KNOWN_LAT', value: (lat: string) => lat }],
            ['LAST_KNOWN_LON', { key: 'LAST_KNOWN_LON', value: (lon: string) => lon }],
            ['USER_NAME', { key: 'USER_NAME', value: (mobile: string) => mobile }],
        ]);

        const storeEntries = mmkvKeys
            .map((key): [string, string] | null => {
                const mapping = whiteListedKV.get(key);
                if (mapping) {
                    const storedValue = mmkvStorage.getString(key) ?? '';
                    return [mapping.key, mapping.value(storedValue)];
                }
                return null;
            })
            .filter((entry): entry is [string, string] => entry !== null);

        const store = new Map<string, string>(storeEntries);

        console.info('updating these key values to godel', Object.fromEntries(store));
        MainAppUtils.updateSharedPreferences(Object.fromEntries(store))
            .then((response: unknown) => console.info('updateSharedPreferences: success', response))
            .catch((error: Error) => console.error('updateSharedPreferences: failed', error));
    };
    const personId = useAppSelector(selectUserId);

    const sdkPayload = createSdkPayload({
        environment: Config['PRESTO_ENV'] || 'production',
        purpose: 'process',
        appToken: appToken || '',
        viewParam: vparam,
        readableAppName: appReadableName,
        service: 'in.yatri.consumer',
        customerId: personId || '',
    });

    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const checkAndInitiate = async () => {
            console.info('[HyperEvent] Checking SDK initialization status');
            const isInitialised = await HyperSdkReact.isInitialised('hyperKey');
            console.info('[HyperEvent] SDK isInitialised:', isInitialised);
            setIsLoading(!isInitialised);
            if (!isInitialised) {
                console.info('[HyperEvent] Creating HyperServices and initiating SDK');
                HyperSdkReact.createHyperServices('hyperKey');
                HyperSdkReact.initiate(JSON.stringify(sdkPayload), 'hyperKey');
            }
        };

        checkAndInitiate();

        return () => {};
    }, []);

    React.useEffect(() => {
        // NOTE:: This useEffect register an event listener for hybridFlow, events can be called on any occasion -
        //        currently being used to exit the app by calling terminate action.
        console.info('[HyperEvent] Registering HyperEvent listener');
        const eventEmitter = new NativeEventEmitter(NativeModules['HyperSdkReact']);
        const eventListener = eventEmitter.addListener('HyperEvent', resp => {
            console.info('[HyperEvent] HyperEvent received:', resp);
            const data = parseHyperEventData(resp, 'hyperEvent');

            if (!data || typeof data !== 'object') {
                console.error('[HyperEvent] Failed to parse HyperEvent data');
                return;
            }

            const event = data.event || '';
            console.info('[HyperEvent] Received event data:', data);
            switch (event) {
                case 'initiate_result':
                    setIsLoading(false);
                    console.info('[HyperEvent] Initiate result received:', data);
                    break;
                default:
                    console.info('Reached here: ', data);
                    console.info('data------>', data?.payload?.value);
            }
        });

        return () => {
            eventListener.remove();
        };
    }, []);

    console.info('[HyperEvent] Rendering - appToken:', appToken ? 'EXISTS' : 'NULL', 'isLoading:', isLoading);

    return (
        <>
            {!appToken || isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <HyperSDK.HyperFragmentView
                    height={'100%'}
                    width={'100%'}
                    namespace={'main'}
                    payload={JSON.stringify(sdkPayload)}
                    triggerProcess={!isLoading}
                    hyperKey={'hyperKey'}
                />
            )}
        </>
    );
};

// Kept separate to handle backward compatibility with already introduced HelpStackNavigator which calls HyperView directly
export const HyperViewStackNavigator: React.FC<HyperViewProps> = ({ route, viewParam, sharedPrefValues }) => {
    const HyperViewStack = createNativeStackNavigator();

    const HyperViewScreen = () => {
        return (
            <View style={{ flex: 1, backgroundColor: colors.white }}>
                <HyperView route={route} viewParam={viewParam} sharedPrefValues={sharedPrefValues} />
            </View>
        );
    };

    return Platform.OS === 'android' ? (
        <SafeAreaView style={{ flex: 1 }}>
            <HyperViewStack.Navigator screenOptions={{ headerShown: false }}>
                <HyperViewStack.Screen
                    name={'hyperViewScreen'}
                    component={HyperViewScreen}
                    options={{ animation: 'ios_from_right' }}
                />
            </HyperViewStack.Navigator>
        </SafeAreaView>
    ) : (
        <HyperViewStack.Navigator screenOptions={{ headerShown: false }}>
            <HyperViewStack.Screen
                name={'hyperViewScreen'}
                component={HyperViewScreen}
                options={{ animation: 'ios_from_right' }}
            />
        </HyperViewStack.Navigator>
    );
};
