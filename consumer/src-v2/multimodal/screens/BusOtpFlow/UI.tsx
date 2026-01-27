import BusOtpScreen from './BusOtpScreen';
import { BusOtpFlowProps } from './Types';

export const BusOtpUI = (props: BusOtpFlowProps) => {
    const {
        mpDispatch: _mpDispatch,
        isPublicTransportDataLoading,
        isWrongOtp,
        setIsWrongOtp,
        setIsSuccess,
        isPublicTransportDataSuccess,
        autoFillOtp,
        scanOtpRef,
        displaySearchBar,
        recentSearches,
        suggestions,
        loadingSuggestions,
        searchPublicTransport,
        onRecentSearchPress,
        currentOtp,
        isTouristBus,
        clearTouristBusPassData,
        onBuyTouristBusTicket,
        onSearchTouristBusDestination,
        availablePasses,
        isProcessingPayment,
    } = props;

    return (
        <BusOtpScreen
            isError={isWrongOtp ?? false}
            onOtpComplete={() => {}}
            autoFillOtp={undefined}
            autoFillOtpFromDeepLink={autoFillOtp}
            isScanOtp={false}
            type="Book"
            onScanQrPress={() => {}}
            legInfo={undefined}
            journeyId=""
            legOrder={0}
            subLegOrder={0}
            mpDispatch={_mpDispatch}
            isLoading={isPublicTransportDataLoading}
            setIsWrongOtp={setIsWrongOtp}
            isOtpScreen={false}
            isSuccess={isPublicTransportDataSuccess}
            setIsSuccess={setIsSuccess}
            scanOtpRef={scanOtpRef}
            displaySearchBar={displaySearchBar}
            recentSearches={recentSearches}
            suggestions={suggestions}
            loadingSuggestions={loadingSuggestions}
            searchPublicTransport={searchPublicTransport}
            onRecentSearchPress={onRecentSearchPress}
            currentOtp={currentOtp}
            isTouristBus={isTouristBus}
            clearTouristBusPassData={clearTouristBusPassData}
            onBuyTouristBusTicket={onBuyTouristBusTicket}
            onSearchTouristBusDestination={onSearchTouristBusDestination}
            availablePasses={availablePasses}
            isProcessingPayment={isProcessingPayment}
        />
    );
};
