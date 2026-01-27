import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Header } from '../../../primitives/Header';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';
import DriverProfileGradient from './DriverProfileGradient';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { ViewStyleSheet } from '../Stylesheet';

interface DriverProfileShimmerProps {
    onBackPress: () => void;
}

const DriverProfileShimmer: React.FC<DriverProfileShimmerProps> = ({ onBackPress }) => {
    return (
        <HardwareBackpressHandler>
            <DriverProfileGradient>
                <Header title="" onBackPress={onBackPress} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    contentContainerStyle={ViewStyleSheet._scrollViewContent}>
                    <Animated.View style={ViewStyleSheet._profileContainer}>
                        {/* Profile Photo Shimmer */}
                        <Animated.View style={ViewStyleSheet._avatarContainer}>
                            <ContentLoader width={120} height={120}>
                                <Rect x="0" y="0" rx="60" ry="60" width="120" height="120" />
                            </ContentLoader>
                        </Animated.View>
                        {/* Name Shimmer */}
                        <View style={{ width: 120, height: 24, borderRadius: 6, marginTop: 10, marginBottom: 5 }}>
                            <ContentLoader width={120} height={24}>
                                <Rect x="0" y="0" rx="6" ry="6" width="120" height="24" />
                            </ContentLoader>
                        </View>
                        {/* Endorsements Shimmer */}
                        <View style={{ width: 100, height: 18, borderRadius: 6, marginVertical: 5 }}>
                            <ContentLoader width={100} height={18}>
                                <Rect x="0" y="0" rx="6" ry="6" width="100" height="18" />
                            </ContentLoader>
                        </View>
                        {/* Stats Card Shimmer */}
                        <View
                            style={[
                                ViewStyleSheet._statsCard,
                                { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                            ]}>
                            {[0, 1, 2].map((_, idx) => (
                                <View
                                    key={idx}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingHorizontal: 8,
                                    }}>
                                    <ContentLoader width={40} height={24}>
                                        <Rect x="0" y="0" rx="6" ry="6" width="40" height="24" />
                                    </ContentLoader>
                                    <View style={{ height: 8 }} />
                                    <ContentLoader width={60} height={14}>
                                        <Rect x="0" y="0" rx="6" ry="6" width="60" height="14" />
                                    </ContentLoader>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                    {/* White Container Shimmer */}
                    <Animated.View style={[ViewStyleSheet._whiteContainer, { marginTop: 30 }]}>
                        {/* About Me Section Shimmer */}
                        <View style={{ width: '60%', height: 20, borderRadius: 6, padding: 20 }}>
                            <ContentLoader width={'100%'} height={20}>
                                <Rect x="0" y="0" rx="6" ry="6" width="100%" height="20" />
                            </ContentLoader>
                        </View>
                        <View style={{ width: '100%', height: 100, borderRadius: 8, marginBottom: 20, padding: 20 }}>
                            <ContentLoader width={'100%'} height={100}>
                                <Rect x="0" y="0" rx="8" ry="8" width="100%" height="100" />
                            </ContentLoader>
                        </View>
                    </Animated.View>
                </ScrollView>
            </DriverProfileGradient>
        </HardwareBackpressHandler>
    );
};
export default DriverProfileShimmer;
