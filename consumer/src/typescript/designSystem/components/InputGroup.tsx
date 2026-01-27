import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import DraggableFlatList, { DragEndParams, RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import InputGroupDirection from '../../assets/svg/direction/InputGroupDirection';
import PlusIcon from '../../assets/svg/symbols/PlusIcon';
import MinusIcon from '../../assets/svg/symbols/MinusIcon';
import { useRefsContext } from '../../context/RefsContext';
import { tailwind } from '../../tailwindTheme/tailwind';
import Divider from '../components/primitives/Divider';
import Input from '../components/primitives/Input';
import token from '../tokens';
import Button from '@/src-v2/primitives/Button';
import { AppDispatchType, useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    SearchInput,
    selectActiveInput,
    setActiveInput,
    setIsPickup,
    setIsServiceable,
    setSelectedSearchedStopIndex,
    updateStopLocationTextInput,
    updateSearchedStop,
    addSearchedStop,
    removeSearchedStop,
    selectStartLocationFromTextInput,
    setSearchedSource,
    selectSearchedSource,
    selectSearchedStops,
    setStartLocationFromTextInput,
    reorderAllSearchedStops,
    selectStopLocationsTextInput,
    selectNewFeatureFlags,
} from '@/typescript/state/client/session';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { Platform, Text, View } from 'react-native';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import classNames from 'classnames';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useCallback, useMemo, useState } from 'react';
import { DragHandleIcon } from '../../assets/svg/symbols/DragHandleIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { logger } from '@/src-v2/systems/logger';

/**
 * Safely executes UI operations on the main thread with error handling
 * @param operation Function containing the UI operation to perform
 * @param errorContext Context description for logging if an error occurs
 */
export const safelyRunUIOperation = (operation: () => void, errorContext: string): void => {
    try {
        operation();
    } catch (error) {
        logger.logError(`${errorContext}: ${error}`, 'InputGroup');
    }
};

export type LocationType = 'source' | 'destination' | 'stop';

type InputGroupProps = {
    isSourceAndStopEditable: boolean;
    isMultiModal: boolean | undefined;
    presentGenericSearchModal: (locationType: LocationType, stopIndex: number) => void;
};

export const handleAddStop = (
    dispatch: AppDispatchType,
    presentGenericSearchModal: (locationType: LocationType, stopIndex: number) => void,
    currentStopIndex: number,
) => {
    dispatch(addSearchedStop(null));
    presentGenericSearchModal('stop', currentStopIndex - 1);
};

const InputGroup: React.FC<InputGroupProps> = ({
    presentGenericSearchModal,
    isSourceAndStopEditable,
    isMultiModal = false,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { enableAddStop } = useAppSelector(selectNewFeatureFlags);

    const startLocationFromTextInput = useAppSelector(selectStartLocationFromTextInput);
    const source: location | null = useAppSelector(selectSearchedSource);
    const stops = useAppSelector(selectSearchedStops);
    const activeInput = useAppSelector(selectActiveInput);
    const dispatch = useAppDispatch();

    const { startLocationTextInputRef } = useRefsContext();
    const inputStyles = classNames(`input-secondary`, [themeColors.Fill_neutralMidLow]);
    const selectionObject = useMemo(() => {
        const inputLength = (
            source
                ? `${source.title} ${source?.subtitle ? source?.subtitle : ''}`
                : startLocationFromTextInput
                  ? startLocationFromTextInput
                  : ''
        ).length;
        return {
            start: 0,
            end: inputLength,
        };
    }, [source, startLocationFromTextInput]);

    const stopIndex = 0;
    const stop = stops[stopIndex];

    const { stopLocationsTextInputRef } = useRefsContext();
    const stopLocationsTextInput = useAppSelector(state => selectStopLocationsTextInput(state, stopIndex));

    const selectionStopObject = useMemo(() => {
        const inputLength = (
            stop
                ? `${stop.title} ${stop?.subtitle ? stop?.subtitle : ''}`
                : stopLocationsTextInput
                  ? stopLocationsTextInput
                  : ''
        ).length;
        return {
            start: 0,
            end: inputLength,
        };
    }, [stops, stopLocationsTextInput]);

    // Named functions for UI operations
    const setInitialSelection = useCallback(() => {
        if (startLocationTextInputRef?.current) {
            startLocationTextInputRef.current.setSelection(0, selectionObject.end);
        }
        hapticEffect(HapticFeedbackTypes.impactLight, undefined);
    }, [selectionObject]);

    const handleSourcePress = useCallback(() => {
        dispatch(setActiveInput(SearchInput.Source));
        dispatch(setIsPickup(true));
        source ? dispatch(setIsServiceable(source?.serviceable ?? false)) : dispatch(setIsServiceable(true));
    }, [dispatch, source]);

    const handleStopOnFocus = () => {
        dispatch(setActiveInput(SearchInput.Destination));
        if (stopLocationsTextInputRef.current) {
            stopLocationsTextInputRef.current[stopIndex]?.setSelection(0, selectionStopObject.end);
        }
        dispatch(setSelectedSearchedStopIndex(stopIndex));
        if (source ? source.serviceable : true) {
            if (stop) {
                dispatch(setIsServiceable(stop?.serviceable ?? false));
            } else {
                dispatch(setIsServiceable(true));
            }
        }
    };

    return (
        <Animated.View
            style={[
                tailwind.style(
                    `bg-[${themeColors.Fill_neutralMin}] border-[${themeColors.Fill_neutralLow}] border rounded-[${token?.corner.md}] px-[${token?.spacing[16]}] py-[4] mb-2.5 flex-row gap-[${token?.gap.spacing[12]}]`,
                ),
            ]}>
            <InputGroupDirection numStops={stops.length - 1} heightMap={undefined} isMultimodal={isMultiModal} />
            <Animated.View style={[tailwind.style('flex-1')]}>
                {stops.length <= 1 ? (
                    activeInput === SearchInput.Source ? (
                        <Animated.View
                            entering={
                                Platform.OS === 'android' && (source !== null || startLocationFromTextInput !== '')
                                    ? FadeIn.duration(180)
                                          .reduceMotion(ReduceMotion.Never)
                                          .withInitialValues({ opacity: 0.5 })
                                    : undefined
                            }
                            exiting={FadeOut.duration(10)}>
                            <Input
                                ref={startLocationTextInputRef}
                                editable={isSourceAndStopEditable}
                                type="secondary"
                                placeholder={userLanguageStrings.Startingfrom + '?'}
                                containerStyle={tailwind.style('px-0 border-0')}
                                style={[tailwind.style('text-[#14171F]')]}
                                autoFocus={true}
                                defaultValue={
                                    source
                                        ? `${source.title} ${source?.subtitle ? source?.subtitle : ''}`
                                        : `${startLocationFromTextInput}`
                                }
                                onChangeText={text => {
                                    dispatch(setSearchedSource(null));
                                    dispatch(setStartLocationFromTextInput(text));
                                    dispatch(dispatch(setIsServiceable(true)));
                                }}
                                onFocus={setInitialSelection}
                                prefix={undefined}
                                suffix={undefined}
                                accessibleLabel={undefined}
                            />
                        </Animated.View>
                    ) : (
                        <Pressable
                            accessibilityRole="button"
                            testID="4c6e8621-85ac-4d38-84a8-c08d13e73f9e"
                            style={[
                                tailwind?.style(inputStyles),
                                { paddingLeft: Platform.OS === 'android' ? 4 : 0, paddingRight: 3, borderWidth: 0 },
                            ]}
                            onPress={handleSourcePress}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    tailwind?.style('body-2 mb-[1px] -ml-[0.5px] leading-[18px] text-[#14171F]'),
                                    !source && startLocationFromTextInput === ''
                                        ? { color: token?.text?.['text-weak'], marginBottom: 0 }
                                        : undefined,
                                ]}>
                                {source
                                    ? `${source.title} ${source?.subtitle ? source?.subtitle : ''}`
                                    : startLocationFromTextInput
                                      ? `${startLocationFromTextInput}`
                                      : `${userLanguageStrings.Startingfrom}?`}
                            </Text>
                        </Pressable>
                    )
                ) : (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                            const locationType: LocationType = 'source';
                            presentGenericSearchModal(locationType, -1);
                        }}
                        style={[tailwind.style(inputStyles), { paddingLeft: 4, paddingRight: 3, borderWidth: 0 }]}
                        testID="source-input-pressable">
                        {source ? (
                            <Text
                                numberOfLines={1}
                                style={[
                                    tailwind?.style('body-2 mb-[1px] -ml-[0.3px] leading-[18px] text-[#14171F]'),
                                    !source && startLocationFromTextInput === ''
                                        ? { color: token?.text?.['text-weak'] }
                                        : { marginBottom: 5 },
                                ]}>
                                {`${source.title} ${source.subtitle ?? ''}`}
                            </Text>
                        ) : (
                            <Text style={tailwind.style('body-2')}>{`${userLanguageStrings.Startingfrom}?`}</Text>
                        )}
                    </Pressable>
                )}
                {stops.length <= 1 ? (
                    <View>
                        <Animated.View style={tailwind.style('py-[2px]')}>
                            <Divider
                                type={undefined}
                                direction={undefined}
                                style={undefined}
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                                dividerColor={undefined}
                                strokeDashArray={undefined}
                            />
                        </Animated.View>
                        {activeInput === SearchInput.Destination ? (
                            <Input
                                ref={el => {
                                    if (stopLocationsTextInputRef.current && el) {
                                        stopLocationsTextInputRef.current[stopIndex] = el;
                                    }
                                }}
                                type="secondary"
                                placeholder={userLanguageStrings.Whereareyougoing}
                                containerStyle={tailwind.style('px-0 border-0')}
                                autoFocus={true}
                                defaultValue={stop ? `${stop.title} ${stop.subtitle ?? ''}` : stopLocationsTextInput}
                                onChangeText={text => {
                                    dispatch(updateSearchedStop({ index: stopIndex, location: null }));
                                    dispatch(updateStopLocationTextInput({ index: stopIndex, text }));
                                    if (source ? source.serviceable : true) dispatch(setIsServiceable(true));
                                }}
                                onFocus={handleStopOnFocus}
                                prefix={undefined}
                                suffix={undefined}
                                accessibleLabel={undefined}
                            />
                        ) : (
                            <Pressable
                                style={[
                                    tailwind?.style(inputStyles),
                                    { paddingLeft: 4, paddingRight: 3, borderWidth: 0 },
                                ]}
                                onPress={() => {
                                    dispatch(setActiveInput(SearchInput.Destination));
                                    dispatch(setSelectedSearchedStopIndex(stopIndex));
                                    if (source ? source.serviceable : true) {
                                        if (stop) {
                                            dispatch(setIsServiceable(stop.serviceable ?? false));
                                        } else {
                                            dispatch(setIsServiceable(true));
                                        }
                                    }
                                }}
                                accessibilityRole="button"
                                testID="destination-input-pressable">
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        tailwind?.style('body-2 mb-[1px] -ml-[0.5px] leading-[18px] text-[#14171F]'),
                                        !stop && stopLocationsTextInput === ''
                                            ? { color: token?.text?.['text-weak'] }
                                            : { marginBottom: 4.5 },
                                    ]}>
                                    {stop
                                        ? `${stop.title} ${stop?.subtitle ? stop?.subtitle : ''}`
                                        : stopLocationsTextInput
                                          ? `${stopLocationsTextInput}`
                                          : `${userLanguageStrings.Whereareyougoing}`}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                ) : (
                    <StopsDraggableList
                        presentGenericSearchModal={presentGenericSearchModal}
                        isSourceAndStopEditable={isSourceAndStopEditable}
                    />
                )}
            </Animated.View>

            {stops.length <= 1 && enableAddStop ? (
                <View style={tailwind.style('self-center')}>
                    <Button
                        testID="df22a206-a0ef-4945-b598-470ebbfc6b24"
                        accessibilityRole="button"
                        type="secondary"
                        size="md"
                        prefix={<PlusIcon fillColor={undefined} />}
                        style={[
                            tailwind.style(`border-[${themeColors.Fill_neutralMidLow}] border`),
                            styles.addRemoveStopButton,
                        ]}
                        onPress={() => {
                            handleAddStop(dispatch, presentGenericSearchModal, stops.length);
                        }}
                    />
                </View>
            ) : null}
        </Animated.View>
    );
};

export default InputGroup;

type DraggableListProps = {
    presentGenericSearchModal: (locationType: LocationType, stopIndex: number) => void;
    isSourceAndStopEditable: boolean;
};

type StopWithId = {
    id: string;
    data: location | null;
};

const StopsDraggableList: React.FC<DraggableListProps> = ({ presentGenericSearchModal, isSourceAndStopEditable }) => {
    const dispatch = useAppDispatch();
    const stops: (location | null)[] = useAppSelector(selectSearchedStops);
    const focusIndex = stops.indexOf(null) !== -1 ? stops.indexOf(null) : stops.length - 1;
    const [listKey, setListKey] = useState(0);

    const stopsWithIds = useMemo(
        () => stops.map((stop, index) => ({ id: `stop-${index}-${listKey}`, data: stop })),
        [stops, listKey],
    );
    const handleDragEnd = useCallback(
        (params: DragEndParams<StopWithId>) => {
            dispatch(reorderAllSearchedStops(params.data.map(item => item.data)));
            setListKey(prev => prev + 1);
        },
        [dispatch],
    );

    const renderItem = useCallback(
        ({ item, drag, isActive, getIndex }: RenderItemParams<StopWithId>) => (
            <ScaleDecorator activeScale={1.0}>
                <StopInput
                    stop={item.data}
                    stopIndex={getIndex() ?? 0}
                    totalStops={stops.length}
                    presentGenericSearchModal={presentGenericSearchModal}
                    drag={drag}
                    isActive={isActive}
                    isSourceAndStopEditable={isSourceAndStopEditable}
                    focusIndex={focusIndex}
                />
            </ScaleDecorator>
        ),
        [stops.length, presentGenericSearchModal, isSourceAndStopEditable, focusIndex],
    );

    return (
        <DraggableFlatList
            key={listKey}
            data={stopsWithIds}
            keyExtractor={(item: StopWithId) => item.id}
            onDragEnd={handleDragEnd}
            renderItem={renderItem}
        />
    );
};
type StopInputProps = {
    stop: location | null;
    stopIndex: number;
    totalStops: number;
    presentGenericSearchModal: (locationType: LocationType, stopIndex: number) => void;
    drag: () => void;
    isActive: boolean;
    focusIndex: number;
    isSourceAndStopEditable: boolean;
};

const StopInput: React.FC<StopInputProps> = props => {
    const { stop, stopIndex, totalStops, presentGenericSearchModal, drag, isActive } = props;
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();
    const isPlusIcon = totalStops <= 2 && stopIndex === totalStops - 1;
    const isDestination = stopIndex === totalStops - 1;

    const inputStyles = classNames(`input-secondary`, [themeColors.Fill_neutralMidLow]);

    return (
        <Animated.View>
            <Animated.View
                style={[
                    {
                        backgroundColor: isActive ? '#f1f5f9' : 'transparent',
                    },
                ]}>
                <Animated.View style={tailwind.style('py-[2px]')}>
                    <Divider
                        type={undefined}
                        direction={undefined}
                        style={undefined}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('flex-row items-center')}>
                    <Pressable
                        accessibilityRole="button"
                        style={{ padding: 8, marginRight: 8 }}
                        onPressIn={drag}
                        testID={`drag-handle-${stopIndex}`}>
                        <DragHandleIcon />
                    </Pressable>

                    <Animated.View style={tailwind.style('flex-1')}>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                const locationType: LocationType = isDestination ? 'destination' : 'stop';
                                presentGenericSearchModal(locationType, stopIndex);
                            }}
                            style={[tailwind.style(inputStyles), { borderWidth: 0, paddingLeft: 0 }]}
                            testID={`stop-input-${stopIndex}`}>
                            {stop ? (
                                <Text
                                    style={[tailwind?.style('body-2 text-[#14171F] w-full'), { marginBottom: 4.5 }]}
                                    numberOfLines={1}>
                                    {`${stop.title}, ${stop.subtitle ?? ''}`}
                                </Text>
                            ) : (
                                <Text style={tailwind.style('body-2')}>
                                    {isDestination
                                        ? userLanguageStrings.SelectDestination
                                        : `${userLanguageStrings.Addstop} ${stopIndex + 1}`}
                                </Text>
                            )}
                        </Pressable>
                    </Animated.View>

                    {totalStops > 1 && stopIndex < 2 ? (
                        <Button
                            testID="0a7c1539-91e6-43a4-bbd6-d417e14e5a2e"
                            type="secondary"
                            accessibilityRole="button"
                            size="md"
                            prefix={isPlusIcon ? <PlusIcon fillColor={undefined} /> : <MinusIcon />}
                            style={[
                                tailwind.style(`border-[${themeColors.Fill_neutralMidLow}] border`),
                                styles.addRemoveStopButton,
                            ]}
                            onPress={() => {
                                if (isPlusIcon) {
                                    handleAddStop(dispatch, presentGenericSearchModal, stopIndex + 1);
                                } else {
                                    dispatch(removeSearchedStop(stopIndex));
                                }
                            }}
                        />
                    ) : null}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    addRemoveStopButton: {
        width: 36,
        height: 28,
        paddingVertical: 4,
        paddingHorizontal: 8,
        gap: 8,
        opacity: 1,
        justifyContent: 'center',
    },
});
