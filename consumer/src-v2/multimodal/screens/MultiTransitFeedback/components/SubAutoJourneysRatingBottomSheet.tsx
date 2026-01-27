import greyThumbsDown from '../../../../../../consumer/src/typescript/assets/grey_thumbsDown.webp';
import greyThumbsUp from '../../../../../../consumer/src/typescript/assets/grey_thumbsUp.webp';
import positiveRatedThumbsUp from '../../../../../../consumer/src/typescript/assets/positiveRated_ThumbsUp.webp';
import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { SubAutoJourneysRatingProps } from '../types';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const SubAutoJourneysRating: React.FC<SubAutoJourneysRatingProps> = props => {
    const [isPositiveRated, setPositiveRated] = useState<boolean>(false);
    const handleOnClick = (feedBack: boolean) => {
        setPositiveRated(feedBack);
        props.mbdDispatch({
            type: 'ADD_SUBAUTO_FEEDBACK',
            payload: {
                subAutoFeedBack: {
                    isExperienceGood: feedBack,
                    legOrder: props.legOrder,
                    travelMode: 'Taxi',
                    rating: undefined,
                },
                journeyId: props.journeyId,
            },
        });
    };
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind.style(`items-center p-4 bg-gray-100 rounded-lg pb-[50px]`)}>
            {isPositiveRated == true ? (
                <>
                    <View style={tailwind.style(`items-center`)}>
                        <Text style={tailwind.style(`text-lg font-semibold text-black mb-3`)}>
                            {userLanguageStrings.Thanksforyourfeedback}
                        </Text>
                        <Image
                            accessible={true}
                            accessibilityLabel="positive rated thumbs up image"
                            source={positiveRatedThumbsUp}
                            style={tailwind.style({ width: 25, height: 25 })}
                        />
                    </View>
                </>
            ) : (
                <>
                    <View style={tailwind.style(`items-center`)}>
                        <Text style={tailwind.style(`text-lg font-semibold text-black mb-3`)}>
                            {userLanguageStrings.Rateyourrideexperience}
                        </Text>
                        <View style={tailwind.style(`flex-row gap-4`)}>
                            <TouchableOpacity
                                accessibilityRole="button"
                                testID={`da9d8fcc-6c9b-4c5e-ba56-5385a23dbc40`}
                                style={tailwind.style(`bg-white p-2 rounded-full shadow`)}
                                onPress={() => handleOnClick(true)}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="grey thumbs up image"
                                    source={greyThumbsUp}
                                    style={tailwind.style({ width: 20, height: 20 })}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                accessibilityRole="button"
                                testID={`08fb1557-6844-46bf-b53e-76d29de3c1d9`}
                                style={tailwind.style(`bg-white p-2 rounded-full shadow`)}
                                onPress={() => handleOnClick(false)}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="grey thumbs down image"
                                    source={greyThumbsDown}
                                    style={tailwind.style({ width: 20, height: 20 })}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

export default SubAutoJourneysRating;
