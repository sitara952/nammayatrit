import React from 'react';
import { View } from 'react-native';
import { tailwind } from '../tailwindTheme/tailwind'; // Assuming Tailwind is set up

const DashedLine = ({ color = '#FFFFFF' }) => {
    return (
        <View style={tailwind.style('flex-row justify-between items-center w-full')}>
            {/* Generate several small dashes */}
            {Array.from({ length: 40 }).map((_, index) => (
                <View
                    key={index}
                    style={tailwind.style(`w-1.5 h-0.2 bg-[${color}] my-2`)} // Adjust the width and height for the dash size
                />
            ))}
        </View>
    );
};

export default DashedLine;
