import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle } from 'react-native-reanimated';
import WhereAreYouGoingView from '@/typescript/screens/home/homeComponents/WhereAreYouGoing.tsx';
import RedBusModal from '@/typescript/screens/home/homeComponents/RedBudModal.tsx';
import SheetScrollView, { SheetScrollViewRef } from '@/typescript/screens/home/homeComponents/SheetScrollView.tsx';
import CleverTap from 'clevertap-react-native';
import {
    BottomSheetStage,
    selectBottomSheetStage,
    selectCurrentLocationCoords,
    selectNearbyDriversConfig,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { EdgePadding } from 'react-native-maps';
import { GeolocationResponse } from '@/typescript/utils/location.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';
import { useNearbyVehicleMarkers } from '@/src-v2/hooks/useNearbyVehicleMarkers';

type HomeSheetComponentProps = {
    recenterLocation: (zoomLevel: number | undefined, position: GeolocationResponse | undefined) => void;
    addStaticMapPadding: ((params: Partial<EdgePadding>) => void) | undefined;
    isVisible: boolean;
};

const HomeSheetComponent = (props: HomeSheetComponentProps) => {
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const scrollViewRef = useRef<SheetScrollViewRef>(null);

    const { addStaticMapPadding } = props;
    const renderCount = useRef(0);

    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const appConfig = useAppSelector(selectAppConfig);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { newBookingFlowSheetRef } = useRefsContext();
    const nearbyDriversConfig = useAppSelector(selectNearbyDriversConfig);
    const { setAutoClearTimeout } = useAutoClearTimeout();
    const isAndroid = Platform.OS === 'android';
    const isConfigEnabled = nearbyDriversConfig.enabled && (isAndroid ? nearbyDriversConfig.androidEnabled : true);

    useNearbyVehicleMarkers({
        bottomSheetStage,
        enabled: isConfigEnabled,
        travelMode: 'Taxi',
        navigation,
        startTracking: true,
    });

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Handle tab switches and other navigation that might not trigger Redux changes
            if (bottomSheetStage !== BottomSheetStage.Search) {
                setAutoClearTimeout(() => {
                    newBookingFlowSheetRef.current?.snapToIndex(0);
                    scrollViewRef.current?.scrollToTop();
                }, 50);
            }
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (bottomSheetStage === BottomSheetStage.Home) renderCount.current = 0;
    }, [bottomSheetStage]);

    useEffect(() => {
        ++renderCount.current;
        CleverTap.setLocation(
            currentLocationCoords?.coords?.latitude || 0.0,
            currentLocationCoords?.coords?.longitude || 0.0,
        );
        if (addStaticMapPadding)
            addStaticMapPadding({ top: 0, right: 0, bottom: appConfig.uiConfig.homeScreenMapPaddingBottom, left: 0 });
        props.recenterLocation(undefined, undefined);

        // Scroll to top when homesheet becomes visible
        scrollViewRef.current?.scrollToTop();
    }, [addStaticMapPadding, appConfig.uiConfig.homeScreenMapPaddingBottom]);

    const scrollChildStyle = useAnimatedStyle(() => {
        return {};
    });

    return (
        <Animated.View entering={FadeIn.duration(400)} style={[style.bottomSheetContainer]} accessible={false}>
            <Animated.View style={[style.topContainer]}>
                <WhereAreYouGoingView recenterLocation={props.recenterLocation} />
            </Animated.View>
            <SheetScrollView ref={scrollViewRef} recenterLocation={props.recenterLocation} style={scrollChildStyle} />
            <RedBusModal />
        </Animated.View>
    );
};

const style = StyleSheet.create({
    bottomSheetContainer: {
        height: '100%',
    },
    topContainer: {
        flexDirection: 'row',
        paddingBottom: 10,
    },
});

export default React.memo(HomeSheetComponent);
