import React, { useCallback } from 'react';
import Animated, { FadeIn, SharedValue } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '@/typescript/components/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import AddLocationCard from '../components/UserProfileFavouritesScreen/AddLocationCard';
import FavouriteListCard from '../components/UserProfileFavouritesScreen/FavouriteListCard';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { TrashIcon } from '../components/FavouritesToastMessages';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import ChooseNameScreen from '../components/ChooseNameScreen';
import CrossIcon from '@/typescript/components/svg/CloseIcon';
import { FavouriteLocation, LocationFavouriteProps, ManageFavouritesProps, TagType } from '../Types';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { DoubleActionModal } from '../components/DoubleActionModal';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { AnimatedSwipeHint } from './DriverFavourite';
import useKeyBoardMovement from '@/src-v2/hooks/useKeyBoardMovement';

interface LocationFavouriteUIProps extends ManageFavouritesProps, LocationFavouriteProps {
    locationDeleteModalRef: React.RefObject<BottomSheetModal | null>;
    selectedFavourite: FavouriteLocation | null;
    hasWorkFavourite: boolean;
    hasHomeFavourite: boolean;
}

export const EditIcon = ({ fillColor }: { fillColor: string }) => {
    return (
        <Svg width={15} height={15} viewBox="0 0 13 13" fill="none">
            <Path
                d="M12.249 11.159v1.084l-3.651-.001v-1.084h3.65zm-4-8.97a1.506 1.506 0 012.126 0l1.424 1.424c.282.282.44.658.44 1.062 0 .405-.159.78-.44 1.063l-5.977 5.97a.743.743 0 01-.433.208l-2.833.311h-.08v.008a.722.722 0 01-.723-.803L2.065 8.6a.747.747 0 01.21-.435L8.25 2.19zm1.36.759a.415.415 0 00-.593 0L7.925 4.04 9.94 6.057l1.093-1.093a.41.41 0 00.122-.296.41.41 0 00-.122-.296L9.61 2.948z"
                fill={fillColor}
            />
        </Svg>
    );
};

const LocationFavouriteUI = (props: LocationFavouriteUIProps) => {
    const {
        mcDispatch,
        lfDispatch,
        favouriteLocations,
        existingTags,
        editFavouriteModalRef,
        locationDeleteModalRef,
        selectedFavourite,
        hasWorkFavourite,
        hasHomeFavourite,
    } = props;

    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const renderBackdrop = useCallback(
        (props: BottomSheetBackgroundProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        ),
        [],
    );

    const onAddFavouritePress = (intendedTag: TagType | undefined) => {
        mcDispatch({ type: 'ENTER_FAVOURITE', payload: { intendedTag } });
    };

    const renderRightActions = useCallback(
        (_progress: SharedValue<number>, _translation: SharedValue<number>, index: number) => {
            const favourite = favouriteLocations[index];
            if (!favourite) return null;

            return (
                <View
                    style={[
                        styles.swipeActionsContainer,
                        index === favouriteLocations.length - 1 && styles.swipeActionsLastItem,
                    ]}>
                    <Pressable
                        accessibilityLabel="Edit button"
                        accessibilityRole="button"
                        testID={`edit-button-${index}`}
                        onPress={() => lfDispatch({ type: 'SWIPEABLE_EDIT', payload: { favourite, index } })}
                        style={styles.swipeActionButton}>
                        <Icon icon={<EditIcon fillColor={colors.blue600} />} size={18} />
                        <Animated.Text style={[styles.swipeActionText, tailwind.style('font-areaNormal-extrabold')]}>
                            {userLanguageStrings.Edit}
                        </Animated.Text>
                    </Pressable>
                    <Pressable
                        accessibilityLabel="Delete button"
                        accessibilityRole="button"
                        testID={`delete-button-${index}`}
                        onPress={() => lfDispatch({ type: 'SWIPEABLE_DELETE', payload: { favourite, index } })}
                        style={styles.swipeActionButton}>
                        <Icon icon={<TrashIcon />} size={18} color={colors.red600} />
                        <Animated.Text style={[styles.swipeActionText, tailwind.style('font-areaNormal-extrabold')]}>
                            {userLanguageStrings.Delete}
                        </Animated.Text>
                    </Pressable>
                </View>
            );
        },
        [favouriteLocations, lfDispatch, userLanguageStrings],
    );

    const renderFavouriteItem: ListRenderItem<FavouriteLocation> = useCallback(
        ({ item, index }) => (
            <ReanimatedSwipeable
                overshootLeft={false}
                overshootRight={false}
                enableTrackpadTwoFingerGesture={true}
                key={`${item.locationAddress.lat}-${item.locationAddress.lng}`}
                friction={2}
                rightThreshold={40}
                renderRightActions={(progress, translation) => renderRightActions(progress, translation, index)}>
                <Animated.View
                    style={[styles.listItemContainer, index === favouriteLocations.length - 1 && styles.listItemLast]}>
                    <FavouriteListCard
                        type={item.tag}
                        title={item.locationName}
                        address={item.locationAddress?.title ?? item.locationAddress?.subtitle ?? ''}
                        onPress={() => lfDispatch({ type: 'LIST_ITEM_PRESS', payload: item })}
                    />
                </Animated.View>
            </ReanimatedSwipeable>
        ),
        [favouriteLocations, renderRightActions, lfDispatch],
    );

    const keyExtractor = useCallback(
        (item: FavouriteLocation) => `${item.locationAddress.lat}-${item.locationAddress.lng}`,
        [],
    );

    useKeyBoardMovement(editFavouriteModalRef);

    return (
        <Animated.View style={[styles.mainContainer, { paddingTop: 16, backgroundColor: homeSheetBg }]}>
            <Animated.View style={styles.contentContainer} entering={FadeIn.duration(200)}>
                <Animated.View style={styles.addCardsContainer}>
                    {!hasHomeFavourite && !hasWorkFavourite && (
                        <Animated.View style={styles.bothCardsContainer}>
                            <AddLocationCard type="home" onAddFavouritePress={() => onAddFavouritePress('Home')} />
                            <AddLocationCard
                                type="work-collapsed"
                                onAddFavouritePress={() => onAddFavouritePress('Work')}
                            />
                        </Animated.View>
                    )}

                    {hasHomeFavourite && !hasWorkFavourite && (
                        <AddLocationCard type="work" onAddFavouritePress={() => onAddFavouritePress('Work')} />
                    )}

                    {!hasHomeFavourite && hasWorkFavourite && (
                        <AddLocationCard type="home" onAddFavouritePress={() => onAddFavouritePress('Home')} />
                    )}

                    {hasWorkFavourite && hasHomeFavourite && (
                        <FavouriteListCard
                            type="Add"
                            title="NA"
                            address={userLanguageStrings.Getroutesfasterinaclick}
                            onPress={() => onAddFavouritePress('Favourite')}
                        />
                    )}
                </Animated.View>

                <FlatList
                    data={favouriteLocations}
                    renderItem={renderFavouriteItem}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    style={[styles.scrollView]}
                    contentContainerStyle={styles.scrollViewContent}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={10}
                />
            </Animated.View>
            {favouriteLocations && favouriteLocations.length > 0 ? <AnimatedSwipeHint /> : null}

            <BottomSheetModal
                ref={editFavouriteModalRef}
                index={0}
                snapPoints={undefined}
                enableDynamicSizing={true}
                enableOverDrag={false}
                backdropComponent={renderBackdrop}
                handleStyle={styles.modalHandleHidden}
                handleIndicatorStyle={styles.modalHandleIndicator}
                backgroundStyle={styles.modalBackground}>
                <BottomSheetView>
                    <Animated.View style={[styles.modalContent]}>
                        {selectedFavourite && (
                            <ChooseNameScreen
                                currentBottomSheetRef={editFavouriteModalRef}
                                showAllFavouritePills={false}
                                headerContent={
                                    <Animated.View style={styles.modalHeader}>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Close button"
                                            testID="favourites-search-close-button"
                                            {...handlers}
                                            onPress={() =>
                                                lfDispatch({ type: 'DISMISS_EDIT_MODAL', payload: undefined })
                                            }>
                                            <Animated.View style={[styles.closeButton, animatedStyle]}>
                                                <Icon icon={<CrossIcon />} color={colors.gray450} size={16} />
                                            </Animated.View>
                                        </Pressable>

                                        <Animated.Text
                                            style={[styles.modalTitle, tailwind.style('font-areaNormal-extrabold')]}>
                                            {userLanguageStrings.EditFavourite}
                                        </Animated.Text>

                                        <Animated.View style={styles.modalHeaderSpacer} />
                                    </Animated.View>
                                }
                                isEdit={true}
                                existingTags={existingTags}
                                location={selectedFavourite.locationAddress}
                                onChangeLocationPress={() =>
                                    lfDispatch({ type: 'CHANGE_LOCATION', payload: undefined })
                                }
                                onConfirmPress={(location, tag, favouriteName) =>
                                    lfDispatch({
                                        type: 'CONFIRM_EDIT',
                                        payload: { location, tag, favouriteName },
                                    })
                                }
                                onDeletePress={() => lfDispatch({ type: 'DELETE_FROM_EDIT_MODAL', payload: undefined })}
                                selectedTag={selectedFavourite.tag}
                                selectedTagName={selectedFavourite.locationName}
                            />
                        )}
                    </Animated.View>
                </BottomSheetView>
            </BottomSheetModal>

            <DoubleActionModal
                doubleActionModalRef={locationDeleteModalRef}
                onPrimaryAction={() => lfDispatch({ type: 'CANCEL_DELETE', payload: undefined })}
                onSecondaryAction={() => lfDispatch({ type: 'CONFIRM_DELETE', payload: undefined })}
                title={userLanguageStrings.DeleteXAddress(selectedFavourite?.tag ?? '')}
                subtitle={userLanguageStrings.WellremoveitfromyourfavouritesYoucanadditagainifneeded}
                primaryButtonText={userLanguageStrings.Cancel}
                secondaryButtonText={userLanguageStrings.Delete}
            />
        </Animated.View>
    );
};

export default LocationFavouriteUI;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: 10,
    },
    addCardsContainer: {
        paddingHorizontal: 16,
        marginTop: 0,
    },
    bothCardsContainer: {
        flexDirection: 'column',
        gap: 16,
    },
    scrollView: {
        marginTop: 12,
    },
    scrollViewContent: {
        gap: 10,
        paddingBottom: 60,
    },
    listItemContainer: {
        paddingHorizontal: 16,
    },
    listItemLast: {
        marginBottom: 20,
    },
    swipeActionsContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingRight: 16,
    },
    swipeActionsLastItem: {
        marginBottom: 20,
    },
    swipeActionButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.gray140,
        borderRadius: 20,
        height: '100%',
        width: 68,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'center',
        textAlign: 'center',
    },
    swipeActionText: {
        fontSize: 12,
        color: colors.gray300,
    },
    modalHandleHidden: {
        display: 'none',
    },
    modalHandleIndicator: {
        backgroundColor: homeSheetBg,
        width: 38,
    },
    modalBackground: {
        backgroundColor: homeSheetBg,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    modalContent: {
        paddingTop: 20,
        paddingBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: homeSheetBg,
    },
    closeButton: {
        backgroundColor: colors.gray240,
        borderRadius: 18.5,
        width: 48,
        height: 37,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 15,
        color: colors.gray450,
    },
    modalHeaderSpacer: {
        width: 37,
        height: 37,
    },
});
