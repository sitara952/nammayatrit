import React from 'react';
import { View } from 'react-native';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

export const TicketCardShimmer: React.FC = () => {
    return (
        <View style={tailwind.style('px-3 pt-3 pb-3')}>
            <View style={tailwind.style('border border-[#F1F2F7] rounded-2xl bg-white')}>
                <ContentLoader
                    speed={2}
                    width={350}
                    height={150}
                    viewBox="0 0 350 150"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb">
                    <Rect x="15" y="10" rx="8" ry="8" width="87" height="99" />
                    <Rect x="120" y="15" rx="4" ry="4" width="60" height="15" />
                    <Rect x="120" y="40" rx="4" ry="4" width="100" height="15" />
                    <Rect x="120" y="65" rx="4" ry="4" width="120" height="15" />
                    <Rect x="280" y="40" rx="4" ry="4" width="50" height="30" />

                    <Rect x="15" y="95" rx="2" ry="2" width="320" height="2" />

                    <Rect x="15" y="115" rx="4" ry="4" width="80" height="15" />
                    <Rect x="250" y="115" rx="4" ry="4" width="80" height="15" />
                </ContentLoader>
            </View>
        </View>
    );
};
