import { useRef, useState } from 'react';
import BusOtpScreen from './BusOtpScreen';
import { BusOtpActivateFlowProps, BusOtpAction } from './Types';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { PassVerificationFailedModal } from '@/src-v2/screens/Passes/BusPass/components/PassVerificationFailedModal';

export const BusOtpActivateUI = (
    props: BusOtpActivateFlowProps & {
        mpDispatch: ((action: BusOtpAction) => void) | undefined;
        displaySearchBar: boolean;
        verificationErrorMessage: string;
        onCloseVerificationFailedModal: () => void;
    },
) => {
    const {
        legOrder,
        subLegOrder,
        journeyId,
        legInfo,
        type,
        mpDispatch,
        displaySearchBar,
        verificationErrorMessage,
        onCloseVerificationFailedModal,
    } = props;

    const [isWrongOtp, setIsWrongOtp] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const scanOtpRef = useRef(true);
    const { passVerificationFailedModalRef } = useRefsContext();

    return (
        <>
            <BusOtpScreen
                isError={isWrongOtp}
                onOtpComplete={() => {}}
                autoFillOtp={undefined}
                isScanOtp={false}
                type={type ?? 'Activate'}
                onScanQrPress={() => {}}
                legInfo={legInfo}
                journeyId={journeyId}
                legOrder={legOrder}
                subLegOrder={subLegOrder}
                mpDispatch={mpDispatch ?? (() => {})}
                isLoading={undefined}
                isOtpScreen={true}
                setIsWrongOtp={setIsWrongOtp}
                setIsSuccess={setIsSuccess}
                isSuccess={isSuccess}
                autoFillOtpFromDeepLink={undefined}
                scanOtpRef={scanOtpRef}
                displaySearchBar={displaySearchBar}
                recentSearches={undefined}
                suggestions={undefined}
                loadingSuggestions={false}
                searchPublicTransport={undefined}
                onRecentSearchPress={undefined}
                currentOtp={''}
                isTouristBus={false}
                clearTouristBusPassData={undefined}
                onBuyTouristBusTicket={undefined}
                onSearchTouristBusDestination={undefined}
                availablePasses={undefined}
                isProcessingPayment={undefined}
            />
            <PopUpModal
                sheetRef={passVerificationFailedModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={onCloseVerificationFailedModal}
                showBackdrop={undefined}
                isScrollable={false}
                borderRadius={36}>
                <PassVerificationFailedModal
                    onClose={onCloseVerificationFailedModal}
                    errorMessage={verificationErrorMessage}
                />
            </PopUpModal>
        </>
    );
};
