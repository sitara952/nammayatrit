import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
    PopupModalStatus,
    PopupModalStatusKeys,
    selectPopupModalsStatus,
    setPopupModalStatus,
} from '../state/client/session';
import { SNAP_POINT_TYPE } from '@gorhom/bottom-sheet';
import { useRefsContext } from '../context/RefsContext';
import { useAppSelector } from '../state/hooks';

const useModalHandlers = () => {
    const dispatch = useDispatch();
    const popupModalStatus: PopupModalStatus = useAppSelector(selectPopupModalsStatus);
    const {
        tipsBottomSheetModalRef,
        redbusWebviewRef,
        tryBoostedSearchModalRef,
        tripDetailsBottomSheetModalRef,
        changeVehicleBottomsheetModalRef,
        retryBoostedSearchModalRef,
        rateCardRef,
        logoutModalRef,
        cancelRideBottomsheetRideConfirmedModalRef,
        cancellationReasonBottomsheetModalRef,
    } = useRefsContext();

    const handleModalOnChange = useCallback(
        (modalType: string, index: number, position: number, snapPointType: SNAP_POINT_TYPE) => {
            dispatch(
                setPopupModalStatus({
                    [modalType]: { index, position, snapPointType },
                    tryBoostedSearchModal: undefined,
                    rateCardModal: undefined,
                    tripDetailsModal: undefined,
                    logoutModal: undefined,
                    redBusModal: undefined,
                    retryBoostedSearchModal: undefined,
                    changeVehicleModal: undefined,
                    tipsBottomSheetModal: undefined,
                    cancelRideModal: undefined,
                    cancellationReasonModal: undefined,
                }),
            );
        },
        [dispatch],
    );

    const createModalOnChangeHandler = useCallback(
        (modalType: string) => {
            return (index: number, position: number, snapPointType: SNAP_POINT_TYPE) => {
                handleModalOnChange(modalType, index, position, snapPointType);
            };
        },
        [handleModalOnChange],
    );

    const checkForOpenModal = useCallback(() => {
        if (popupModalStatus.redBusModal?.index == 0) {
            redbusWebviewRef?.current?.dismiss();
            return true;
        } else if (popupModalStatus.logoutModal?.index == 0) {
            logoutModalRef.current?.dismiss();
            return true;
        } else if (popupModalStatus.rateCardModal?.index == 0) {
            rateCardRef.current?.dismiss();
            return true;
        } else if (popupModalStatus.retryBoostedSearchModal?.index == 0) {
            retryBoostedSearchModalRef.current?.dismiss();
            return true;
        } else if (popupModalStatus.changeVehicleModal?.index == 0) {
            changeVehicleBottomsheetModalRef.current?.dismiss();
            return true;
        } else if (popupModalStatus.tipsBottomSheetModal?.index == 0) {
            tipsBottomSheetModalRef.current?.dismiss();
            return true;
        } else if (popupModalStatus.tryBoostedSearchModal?.index == 0) {
            tryBoostedSearchModalRef?.current?.dismiss();
            return true;
        } else if (popupModalStatus.tripDetailsModal?.index == 0) {
            tripDetailsBottomSheetModalRef.current?.dismiss();
            return true;
        } else if (popupModalStatus.cancelRideModal?.index == 0) {
            cancelRideBottomsheetRideConfirmedModalRef.current?.dismiss();
            return true;
        } else if (popupModalStatus.cancellationReasonModal?.index == 0) {
            cancellationReasonBottomsheetModalRef.current?.dismiss();
            return true;
        }
        return false;
    }, [popupModalStatus]);

    const result = useMemo(() => {
        return {
            checkForOpenModal,
            handleBoostedSearchModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.tryBoostedSearchModal),
            handleLogoutModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.logoutModal),
            handleTripDetailsModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.tripDetailsModal),
            handleRetryBoostedSearchModalOnChange: createModalOnChangeHandler(
                PopupModalStatusKeys.retryBoostedSearchModal,
            ),
            handleChangeVehicleModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.changeVehicleModal),
            handleTipsBottomSheetModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.tipsBottomSheetModal),
            handleRedbusWebviewModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.redBusModal),
            handleRateCardModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.rateCardModal),
            handleCancellationReasonModalOnChange: createModalOnChangeHandler(
                PopupModalStatusKeys.cancellationReasonModal,
            ),
            handleCancelRideModalOnChange: createModalOnChangeHandler(PopupModalStatusKeys.cancelRideModal),
        };
    }, [checkForOpenModal, createModalOnChangeHandler]);

    return result;
};

export default useModalHandlers;
