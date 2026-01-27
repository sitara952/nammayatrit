import React, { useCallback } from 'react';
import { RideCancelModalFlowProps } from './Types';
import { RideCancelModalUI } from './UI';
import { useFindAnotherDriver } from '@/src-v2/hooks/useFindAnotherDriver';

export const RideCancelModalFlow: React.FC<RideCancelModalFlowProps> = ({
    setShowCancellationChargesModal,
    cancellationFee,
    onConfirmCancel,
    onReallocate,
    bookingId,
    rideId,
    multimodalProps,
    vehicleVariant,
    setImageKey,
    imageKey,
}) => {
    const handleClose = useCallback(() => {
        setShowCancellationChargesModal(false);
    }, [setShowCancellationChargesModal]);

    const { findAnotherDriver, isLoading } = useFindAnotherDriver({
        bookingId,
        rideId,
        multimodalProps,
        onSuccess: () => {
            setShowCancellationChargesModal(false);
            onReallocate();
        },
        cancellationFee: cancellationFee,
        imageKey: imageKey,
        onClose: () => setShowCancellationChargesModal(false),
    });

    return (
        <RideCancelModalUI
            onClose={handleClose}
            onConfirmCancel={onConfirmCancel}
            onFindAnotherDriver={findAnotherDriver}
            cancellationFee={cancellationFee ?? 0}
            isLoading={isLoading}
            vehicleVariant={vehicleVariant}
            setImageKey={setImageKey}
        />
    );
};
