import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { Banner, BannerType } from './Banner';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfile } from '@/typescript/state/client/user.ts';
import { selectAppConfig, selectCityConfig } from '@/typescript/state/client/session.ts';
import { CarouselItems, ModalConfig, AnnaModalPayload } from '@/src-v2/systems/configs/types.ts';
import { Linking, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useRefsContext } from '../../../context/RefsContext';
import { PopUpModal } from '../../../components/PopUpModal';
import { PromotionalModal } from '../../../components/PromotionalModal';
import { useMemo, useState } from 'react';
import { selectAppReadableName } from '@/typescript/state/client/session';
import { AnnaOfferModal } from '@/typescript/components/AnnaOfferModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { PanGesture } from 'react-native-gesture-handler';
import { extractDistrictOfferCode } from '@/src-v2/multimodal/screens/JourneyInfoScreen/utils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useHomeActions } from '@/typescript/homeActions/useHomeActions';
// import colors from '@/typescript/designSystem/colorPalette';
// import { useConfigContext } from '@/typescript/context/ConfigContext';

export const HomeScreenCarousel = () => {
    // const ref = useRef<ICarouselInstance>(null);
    const progress = useSharedValue<number>(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

    const userProfile = useAppSelector(selectUserProfile);
    const width = useWindowDimensions().width;
    const refs = useRefsContext();
    const appName = useAppSelector(selectAppReadableName);
    const { carouselModalRef } = refs;
    const { triggerHomeAction } = useHomeActions();

    const carouselConfig = useAppSelector(state => selectCityConfig(state, 'carousel_banner_config'));
    const moviePromotionalConfig = useAppSelector(state => selectCityConfig(state, 'movie_promotional_config'));
    const imageHeight = carouselConfig.maxHeight;
    const offerCode = extractDistrictOfferCode(userProfile?.customerTags?.['DistrictOffer']);
    const isDistrictOfferApplied = offerCode !== null;
    const appConfig = useAppSelector(selectAppConfig);

    const safetySetupItem: CarouselItems = {
        imageUrl:
            'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/img-safetysetupnow-1757831404075.webp',
        onClick: undefined,
        onClickV2: {
            actionName: 'navigateToScreen',
            actionData: {
                navigator: 'profileTab',
                screen: 'safetyScreen',
                params: undefined,
                pop: undefined,
            },
        },
    };

    const genderMissingItem: CarouselItems = {
        imageUrl:
            'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/bannerUpload/img-complete_profile_banner-1766148711245.png',
        onClick: undefined,
        onClickV2: {
            actionName: 'navigateToScreen',
            actionData: {
                navigator: 'profileTab',
                screen: 'updateMyProfile',
                params: { bookingId: null },
                pop: undefined,
            },
        },
    };

    const couponRedeemBanner: CarouselItems = {
        imageUrl: moviePromotionalConfig.images.redeemBanner,
        onClick: {
            actionName: 'openModal',
            actionData: {
                title: userLanguageStrings.YouHaveWonAMovieCoupon,
                buttonText: userLanguageStrings.GoToDistrictApp,
                modalRef: carouselModalRef,
                imageUrl: undefined,
                onButtonPress: () => {
                    Linking.openURL(moviePromotionalConfig.getAppUrl);
                },
                videoUrl: undefined,
            },
        },
        onClickV2: undefined,
    };
    const promotionBanner: CarouselItems = {
        imageUrl: moviePromotionalConfig.images.detailBanner,
        onClick: {
            actionName: 'openLink',
            actionData: moviePromotionalConfig.detailBannerUrl,
        },
        onClickV2: undefined,
    };

    const banner = moviePromotionalConfig.enabled
        ? isDistrictOfferApplied
            ? couponRedeemBanner
            : promotionBanner
        : undefined;

    const updatedCarousel: CarouselItems[] = useMemo(() => {
        const topPriorityItems = [userProfile?.gender === 'UNKNOWN' ? genderMissingItem : undefined, banner].filter(
            (item): item is CarouselItems => item !== undefined,
        );

        const bottomPriorityItems = [
            !userProfile?.hasCompletedSafetySetup && appConfig.uiConfig.showSafetyBannerOnCarousel
                ? safetySetupItem
                : undefined,
        ].filter((item): item is CarouselItems => item !== undefined);

        return [...topPriorityItems, ...carouselConfig.carouselItems, ...bottomPriorityItems];
    }, [carouselConfig, banner, userProfile, safetySetupItem, genderMissingItem]);

    const onTnCClick = () => {
        Linking.openURL('https://docs.google.com/document/d/1YgyJ404SYpuYa4LN5ZPb1cmG_Lw6gUK2bT3y45V72RU/');
    };

    const handleBannerClick = (item: CarouselItems) => {
        // BACKWARD COMPATIBILITY: Prefer onClickV2 (new format with navigateToScreen action), fallback to onClick (old format with navigateTo action)
        const action = item.onClickV2 ?? item.onClick;
        if (!action) return;

        const actionName = action.actionName;

        if (actionName === 'openModal') {
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            const modalData = action.actionData as ModalConfig;
            setModalConfig(modalData);
            modalData.modalRef?.current?.present();
            return;
        } else if (actionName === 'openAnnaModal') {
            try {
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                const raw = action.actionData as AnnaModalPayload;

                const allowedModalRefs: Record<string, React.RefObject<BottomSheetModal | null>> = {
                    carouselModalRef: refs.carouselModalRef,
                    annaModalRef: refs.annaModalRef,
                };

                const refName = raw?.modalRef;
                const resolvedRef = typeof refName === 'string' ? allowedModalRefs[refName] : refName;

                if (!raw?.title || !raw?.buttonText || !resolvedRef) {
                    console.warn('openAnnaModal: Missing required data, not showing modal');
                    return;
                }

                const resolveOnButtonPress = (fn: AnnaModalPayload['onButtonPress']) => {
                    if (!fn) return () => {};
                    if (typeof fn === 'function') return fn;

                    if (typeof fn === 'object' && fn.type) {
                        switch (fn.type) {
                            case 'openUrl':
                                if (typeof fn.url === 'string') return () => Linking.openURL(fn.url);
                                break;
                            default:
                                return () => {};
                        }
                    }

                    return () => {};
                };

                const modalData: ModalConfig = {
                    title: raw.title,
                    buttonText: raw.buttonText,
                    modalRef: resolvedRef,
                    onButtonPress: resolveOnButtonPress(raw.onButtonPress) ?? (() => {}),
                    imageUrl: raw.imageUrl,
                    videoUrl: raw.videoUrl,
                };

                setModalConfig(modalData);
                resolvedRef.current?.present?.();
            } catch (error) {
                console.error('Error handling openAnnaModal:', error);
            }
            return;
        } else {
            triggerHomeAction(actionName, {
                ...action,
                source: 'CAROUSEL_BANNER',
            });
        }
    };

    return (
        <>
            {updatedCarousel.length > 0 && (
                <Animated.View style={[styles.carouselContainer]}>
                    <Carousel
                        windowSize={1}
                        // ref={ref}
                        loop
                        width={width}
                        height={imageHeight}
                        vertical={false}
                        autoPlay={true}
                        onProgressChange={progress}
                        scrollAnimationDuration={50}
                        autoPlayInterval={7000}
                        style={[styles.carousel]}
                        data={updatedCarousel}
                        onConfigurePanGesture={(gestureChain: PanGesture) => gestureChain.activeOffsetX([-10, 10])}
                        renderItem={({ item, index }: { item: CarouselItems; index: number }) => (
                            <Banner
                                key={index}
                                bannerType={BannerType.ImageBanner}
                                imageSource={item.imageUrl}
                                imageStyle={{
                                    ...tailwind.style(`w-[100%] h-[${imageHeight}px] rounded-[22px]`),
                                    resizeMode: 'contain',
                                }}
                                onClick={() => {
                                    handleBannerClick(item);
                                }}
                                title={undefined}
                                buttonText={undefined}
                                buttonPrefix={undefined}
                            />
                        )}
                    />
                    <Pagination.Basic
                        progress={progress}
                        data={updatedCarousel}
                        size={8}
                        dotStyle={styles.dotStyle}
                        containerStyle={styles.dotContainer}
                        activeDotStyle={styles.activeDotStyle}
                        // horizontal
                        // onPress={onPressPagination}
                        // customReanimatedStyle={customAnimation}
                    />
                </Animated.View>
            )}

            <PopUpModal
                sheetRef={carouselModalRef}
                onHardwareBackPress={undefined}
                style={styles.popupModalContainer}
                backgroundStyle={undefined}
                showBackdrop={true}
                enableDynamicSizing={true}
                enableOverDrag={false}
                // snapPoints={['90%']}
                isScrollable={true}>
                {modalConfig && appName === 'Chennai One' && (
                    <AnnaOfferModal
                        onClose={() => modalConfig.modalRef?.current?.dismiss()}
                        onButtonPress={() => {
                            if (modalConfig.onButtonPress) {
                                modalConfig.onButtonPress();
                            }
                        }}
                        buttonText={modalConfig.buttonText}
                        title={modalConfig.title}
                        imageUrl={modalConfig.imageUrl}
                        videoUrl={modalConfig.videoUrl}
                    />
                )}
                {modalConfig && appName !== 'Chennai One' && (
                    <PromotionalModal
                        onClose={() => modalConfig.modalRef?.current?.dismiss()}
                        onButtonPress={() => {
                            if (modalConfig.onButtonPress) {
                                modalConfig.onButtonPress();
                            }
                        }}
                        buttonText={modalConfig.buttonText}
                        title={modalConfig.title}
                        userLanguageStrings={userLanguageStrings}
                        config={moviePromotionalConfig}
                        offerCode={offerCode}
                        onTnCClick={onTnCClick}
                    />
                )}
            </PopUpModal>
        </>
    );
};

const styles = StyleSheet.create({
    dotContainer: { gap: 5, marginTop: 10 },
    dotStyle: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 50,
        height: 8,
        width: 8,
    },
    activeDotStyle: { borderRadius: 50 },
    carousel: {
        backgroundColor: '#F8F8F8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        zIndex: 1,
    },
    carouselContainer: {
        marginTop: 32,
    },
    popupModalContainer: {
        borderRadius: 16,
        padding: 0,
        backgroundColor: '#F1F2F7',
    },
});
