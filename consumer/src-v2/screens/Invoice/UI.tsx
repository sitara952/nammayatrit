import React, { useState, useCallback, useRef, useEffect } from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { View, Platform } from 'react-native';
import { InvoiceUIProps } from './Types';
import InvoiceCard from './components/InvoiceCard';
import { Header } from '@/src-v2/primitives/Header';
import Animated from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ScrollView } from 'react-native-gesture-handler';
import { homeSheetBg } from '../HomeScreen/HomeScreenFragment';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import ExportInvoiceModal, { ExportInvoiceOption } from '../MyRides/components/ExportInvoiceModal';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { selectUserProfile } from '@/typescript/state/client/user';
import { useRideBookingInvoiceGeneratePostMutation } from '@/api/integrations/rtk/RideBookingInvoiceGeneratePost';
import { setToastProps } from '@/typescript/state/client/session';
import colorsPalette from '@/typescript/designSystem/colorPalette';

const Invoice: React.FC<InvoiceUIProps> = ({
    firstRideEntity,
    invDispatch,
    endDate,
    endTime,
    costData,
    sourceAddress,
    destinationAddress,
    pdfProps,
    bookingId,
    bookingStatus,
}) => {
    const { bottom } = useSafeAreaInsets();
    const userProfile = useAppSelector(selectUserProfile);
    const dispatch = useAppDispatch();
    const [rideBookingInvoiceGeneratePost] = useRideBookingInvoiceGeneratePostMutation();
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [selectedExportOption, setSelectedExportOption] = useState<ExportInvoiceOption>('EMAIL');
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Ref to track pending PDF download for iOS
    const pendingDownloadRef = useRef<boolean>(false);

    const onClose = () => {
        invDispatch({ type: 'GO_BACK', payload: undefined });
    };

    const handleExportInvoiceAction = useCallback(() => {
        setIsExportModalVisible(false);
    }, []);

    useEffect(() => {
        if (Platform.OS === 'ios' && !isExportModalVisible && pendingDownloadRef.current) {
            pendingDownloadRef.current = false;

            setTimeout(() => {
                invDispatch({ type: 'DOWNLOAD_PDF', payload: undefined });
            }, 500);
        }
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [isExportModalVisible, invDispatch]);

    const handleExportAction = useCallback(
        async (email: string) => {
            if (selectedExportOption === 'EMAIL') {
                if (!bookingId || !firstRideEntity) {
                    dispatch(
                        setToastProps({
                            message: userLanguageStrings.Somethingwentwrong || 'Invalid booking data',
                            backgroundColor: colorsPalette.recovered.pinkRed,
                            autoDismissAfter: 2000,
                            visible: true,
                            buttons: [],
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            logo: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                    return;
                }

                try {
                    const rideStartTime = firstRideEntity.rideStartTime || firstRideEntity.createdAt;
                    const rideEndTime = firstRideEntity.rideEndTime || rideStartTime;

                    const startDateObj = new Date(rideStartTime);
                    const startDate = new Date(
                        Date.UTC(
                            startDateObj.getUTCFullYear(),
                            startDateObj.getUTCMonth(),
                            startDateObj.getUTCDate(),
                            0,
                            0,
                            0,
                            0,
                        ),
                    ).toISOString();

                    const endDateObj = new Date(rideEndTime);
                    const now = new Date();
                    const endOfDayUTC = new Date(
                        Date.UTC(
                            endDateObj.getUTCFullYear(),
                            endDateObj.getUTCMonth(),
                            endDateObj.getUTCDate(),
                            23,
                            59,
                            59,
                            999,
                        ),
                    );
                    const endDate = endOfDayUTC > now ? now.toISOString() : endOfDayUTC.toISOString();

                    // Call the API with bookingId
                    await rideBookingInvoiceGeneratePost({
                        body: {
                            email,
                            bookingId,
                            startDate,
                            endDate,
                            billingCategories: undefined,
                            rideTypes: undefined,
                        },
                    }).unwrap();

                    dispatch(
                        setToastProps({
                            message: userLanguageStrings.InvoiceSentSuccessfully,
                            backgroundColor: colorsPalette.recovered.greenMid,
                            autoDismissAfter: 2000,
                            visible: true,
                            buttons: [],
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            logo: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                } catch (error) {
                    console.error('Error generating invoice:', error);

                    // Extract error message from RTK Query error response
                    const getErrorMessage = (): string => {
                        if (error && typeof error === 'object' && 'data' in error) {
                            const errorData = error.data;
                            if (errorData && typeof errorData === 'object' && 'errorMessage' in errorData) {
                                const message = errorData.errorMessage;
                                if (typeof message === 'string') {
                                    return message;
                                }
                            }
                        }
                        return userLanguageStrings.Somethingwentwrong || 'Error generating invoice';
                    };
                    const errorMessage = getErrorMessage();

                    dispatch(
                        setToastProps({
                            message: errorMessage,
                            backgroundColor: colorsPalette.recovered.pinkRed,
                            autoDismissAfter: 2000,
                            visible: true,
                            buttons: [],
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            logo: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                }
            }
        },
        [
            selectedExportOption,
            bookingId,
            firstRideEntity,
            dispatch,
            rideBookingInvoiceGeneratePost,
            userLanguageStrings,
        ],
    );

    const handleDownloadAction = useCallback(async () => {
        if (Platform.OS === 'ios') {
            pendingDownloadRef.current = true;
        } else {
            invDispatch({ type: 'DOWNLOAD_PDF', payload: undefined });
        }
    }, [invDispatch]);

    const onPress = () => {
        setSelectedExportOption('EMAIL');
        setIsExportModalVisible(true);
    };
    return (
        <View style={tailwind.style(`flex-col flex-1 bg-[${homeSheetBg}]`)}>
            <Header title={userLanguageStrings.DriverReceipt} onBackPress={onClose} />
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
                {firstRideEntity && (
                    <ScrollView style={tailwind.style(`w-full p-2`)}>
                        <InvoiceCard
                            rideDetail={firstRideEntity}
                            data={costData}
                            sourceAddress={sourceAddress ?? ''}
                            destinationAddress={destinationAddress ?? ''}
                            endDate={endDate}
                            endTime={endTime}
                            pdfProps={pdfProps}
                            invDispatch={invDispatch}
                        />
                    </ScrollView>
                )}
                {bookingStatus === 'COMPLETED' && (
                    <Animated.View style={tailwind.style(`w-full pt-4 px-4 mb-[${bottom}]`)}>
                        <Button
                            testID="invoice_download_pdf_click"
                            type="primary"
                            text={userLanguageStrings.ExportInvoice}
                            onPress={onPress}
                        />
                    </Animated.View>
                )}
            </View>
            <AnimatedModal
                visible={isExportModalVisible}
                setVisible={setIsExportModalVisible}
                onClose={() => setSelectedExportOption('EMAIL')}
                showCloseButton={true}
                animationDuration={200}>
                <ExportInvoiceModal
                    selectedOption={selectedExportOption}
                    onSelectOption={setSelectedExportOption}
                    onPrimaryAction={handleExportInvoiceAction}
                    onExportAction={handleExportAction}
                    onDownloadAction={handleDownloadAction}
                    businessEmail={userProfile?.businessEmail ?? undefined}
                    isBusinessEmailVerified={userProfile?.businessProfileVerified ?? undefined}
                    personalEmail={userProfile?.email ?? undefined}
                />
            </AnimatedModal>
        </View>
    );
};
export default Invoice;
