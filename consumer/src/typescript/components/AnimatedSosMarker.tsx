import React from 'react';
import { RippleCircle } from './RippleCircle';
import { latLng } from '../../helpers/externalModules/GMap/ReactMap.gen';
import { View } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';

interface props {
    latlon: latLng | null;
    startingRadius: number;
    radiusGap: number;
    strokeColor: string;
}

export const AnimatedSosMarker: React.FC<props> = props => {
    return (
        <View style={tailwind.style('absolute h-1000px')}>
            <RippleCircle
                initialRadius={props.startingRadius}
                startingDelay={0}
                strokeColor={props.strokeColor}
                initialStrokeWidth={2}
                strokeWidthIncreament={5}
                radiusIncreament={2}
                endingDelay={1000}
                animationDuration={200}
                location={props.latlon}
            />
            <RippleCircle
                initialRadius={props.startingRadius + props.radiusGap}
                startingDelay={100}
                strokeColor={props.strokeColor}
                initialStrokeWidth={2}
                strokeWidthIncreament={5}
                radiusIncreament={2}
                endingDelay={1000}
                animationDuration={200}
                location={props.latlon}
            />
            <RippleCircle
                initialRadius={props.startingRadius + props.radiusGap * 2}
                startingDelay={200}
                strokeColor={props.strokeColor}
                initialStrokeWidth={2}
                strokeWidthIncreament={5}
                radiusIncreament={2}
                endingDelay={1000}
                animationDuration={200}
                location={props.latlon}
            />
            <RippleCircle
                initialRadius={props.startingRadius + props.radiusGap * 3}
                startingDelay={300}
                strokeColor={props.strokeColor}
                initialStrokeWidth={2}
                strokeWidthIncreament={5}
                radiusIncreament={2}
                endingDelay={1000}
                animationDuration={200}
                location={props.latlon}
            />
            <RippleCircle
                initialRadius={props.startingRadius + props.radiusGap * 4}
                startingDelay={400}
                strokeColor={props.strokeColor}
                initialStrokeWidth={2}
                strokeWidthIncreament={5}
                radiusIncreament={2}
                endingDelay={1000}
                animationDuration={200}
                location={props.latlon}
            />
        </View>
    );
};
