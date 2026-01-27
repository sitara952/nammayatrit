import { LinearGradient } from 'react-native-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

import React from 'react';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import Shimmer from '../../Search/components/SearchSectionListItem/Shimmer';
import { StopPickerItem } from './StopPicker';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type DestinationPickerItem = {
    id: number;
    name: string;
    code: string;
};

const DestinationList = ({
    list,
    selectedId,
    selectedSource,
    handleOnChange,
}: {
    list: DestinationPickerItem[];
    selectedId: number;
    selectedSource: number;
    handleOnChange: (item: StopPickerItem) => void;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    if (!list || list.length === 0) {
        return (
            <Animated.View entering={FadeIn.delay(150)} style={tailwind.style('bg-[#F5F5F5] flex-1 relative')}>
                <Animated.View style={tailwind.style('pt-[18px] pb-[30px]')}>
                    <Animated.View
                        style={tailwind.style('h-full absolute left-0 right-0 top-0 z-10')}
                        pointerEvents="none">
                        <LinearGradient
                            style={tailwind.style('h-10')}
                            colors={['#f5f5f5', 'rgba(245, 245, 245, 0)']}
                            locations={[1, 0]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                        />
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style(
                            '-mt-[30px] justify-center items-center absolute top-[20px] left-0 right-0 z-10',
                        )}>
                        <Animated.View
                            style={tailwind.style('flex-row items-center h-[21px] bg-[#343334] px-5 rounded-3xl')}>
                            <Animated.Text
                                style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#838185]')}>
                                {userLanguageStrings.TO}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style('pt-[14px] gap-10 flex-row pb-[8px] justify-center items-center')}>
                        <Animated.FlatList
                            data={new Array(4).fill(0)}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={item => String(item.id)}
                            contentContainerStyle={tailwind.style('gap-y-3 pb-5')}
                            renderItem={({ index }) => (
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            'min-h-13 justify-center items-center bg-white mx-[33px] rounded-[16px] overflow-visible',
                                        ),
                                        {
                                            shadowColor: '#00000003',
                                            shadowOffset: {
                                                width: 0,
                                                height: 1,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 10,

                                            elevation: 12,
                                            overflow: 'visible',
                                        },
                                    ]}>
                                    <Shimmer
                                        key={index}
                                        width={'100%'}
                                        height={52}
                                        borderRadius={16}
                                        backgroundColor={'#DBDBDB'}
                                    />
                                </Animated.View>
                            )}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        );
    }

    if (selectedId <= selectedSource) {
        const newSelectedId = selectedSource + 1;
        const newSelectedItem = list.find(item => item.id === newSelectedId);
        if (newSelectedItem) {
            handleOnChange(newSelectedItem);
        }
    }
    return (
        <Animated.View style={tailwind.style('bg-[#F5F5F5] flex-1 relative')}>
            <Animated.View style={tailwind.style('h-full absolute left-0 right-0 top-0 z-10')} pointerEvents="none">
                <LinearGradient
                    style={tailwind.style('h-10')}
                    colors={['#f5f5f5', 'rgba(245, 245, 245, 0)']}
                    locations={[1, 0]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                />
            </Animated.View>
            <Animated.View
                style={tailwind.style(
                    '-mt-[36px] justify-center items-center absolute top-[20px] left-0 right-0 z-10',
                )}>
                <Animated.View style={tailwind.style('flex-row items-center h-[28px] bg-[#343334] px-5 rounded-3xl')}>
                    <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#838185]')}>
                        {userLanguageStrings.TO}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>

            <Animated.FlatList
                data={list}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={tailwind.style('gap-y-3 pt-6 pb-5')}
                renderItem={({ item }) => (
                    <DestinationItem
                        onChange={handleOnChange}
                        item={item}
                        isSelected={item.id === selectedId}
                        selectedSourceIdx={selectedSource}
                    />
                )}
            />
            <Animated.View
                style={tailwind.style('h-[60px] absolute left-0 right-0 -bottom-0 z-10')}
                pointerEvents="none">
                <LinearGradient
                    style={tailwind.style('flex-1')}
                    colors={['rgba(245, 245, 245, 0)', '#f5f5f5']}
                    locations={[0, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default React.memo(DestinationList);

const DestinationItem = ({
    item,
    isSelected,
    onChange,
    selectedSourceIdx,
}: {
    item: { id: number; name: string; code: string };
    isSelected: boolean;
    onChange: (item: StopPickerItem) => void;
    selectedSourceIdx: number;
}) => {
    const handlePress = () => {
        onChange(item);
    };
    const isDisabled = item.id <= selectedSourceIdx;
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name} to ${item.code} button`}
            testID={`89fd5b70-017b-4071-88a0-50cbe52878db`}
            style={[
                tailwind.style(
                    'border-[1px] min-h-13 justify-center items-center px-4 bg-white mx-[33px] rounded-[16px] overflow-visible',
                    isSelected ? 'border-[#4285F4] bg-[#4285F4]' : 'border-[#F2F2F2]',
                    isDisabled ? 'bg-[#b3b3b3] opacity-60' : '',
                ),
                {
                    shadowColor: '#00000003',
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 10,

                    elevation: 12,
                    overflow: 'visible',
                },
            ]}
            disabled={isDisabled}
            onPress={handlePress}>
            <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                    'text-[14px] leading-[22px] font-areaNormal-extrabold capitalize text-center',
                    isSelected || isDisabled ? 'text-[#FFFFFF]' : 'text-[#3B3A3C]',
                )}>
                {item.name}
            </Animated.Text>
        </Pressable>
    );
};
