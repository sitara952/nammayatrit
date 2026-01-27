import { editLocationReq } from '../../../readOnly/api/types/EditLocationReq.gen';
import { useNavigation } from '@react-navigation/native';
import { location } from '../../../helpers/utils/Location/LocationTypes.gen';
import { decodeError } from './../../utils/error';
import { setToastProps } from '@/typescript/state/client/session';
import { strings } from 'config-types';
import { RideId } from '@/typescript/state/client/booking';
import { useGetBookingDetailsMutation } from '../../state/server/bookingApi';
import { useAppDispatch } from '@/typescript/state/hooks.ts';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { useRideRideIdEditLocationPostMutation } from '@/api/integrations/rtk/RideRideIdEditLocationPost';
import { emptyLocationAddress } from '@/src-v2/utils/location';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const useEditPickup = (
    editPickupLocationResp: location | undefined,
    rideId: RideId,
    bookingId: string,
    currentDist: number,
    circleRadius: number,
    userLanguageStrings: strings,
) => {
    const dispatch = useAppDispatch();
    const [getBookingDetails] = useGetBookingDetailsMutation();

    const [callEditLocationApi, { isLoading, isSuccess }] = useRideRideIdEditLocationPostMutation();

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const finalIsLoading = isLoading || isSuccess;

    const handleConfirmLocation = async () => {
        if (currentDist > circleRadius) return;

        const body: editLocationReq = {
            destination: undefined, // in edit pickup, destination will be Nothing
            origin: {
                address: editPickupLocationResp?.addressComponents ?? emptyLocationAddress,
                gps: {
                    lat: editPickupLocationResp?.lat ?? 0,
                    lon: editPickupLocationResp?.lng ?? 0,
                },
            },
        };

        callEditLocationApi({ rideId, body })
            .unwrap()
            .then(async () => {
                try {
                    await getBookingDetails(bookingId);
                } catch (error) {
                    console.error('Failed to fetch booking details:', error);
                }

                dispatch(
                    setToastProps({
                        message: userLanguageStrings.PickupUpdatedSuccessfully,
                        backgroundColor: 'green',
                        autoDismissAfter: 1500,
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
                navigation.goBack();
            })
            .catch(error => {
                const decodedError = decodeError(error);
                dispatch(
                    setToastProps({
                        visible: true,
                        message: decodedError.errorMessage,
                        backgroundColor: `${colors?.primitive?.red?.danger}`,
                        autoDismissAfter: 1000,
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
            });
    };

    return { handleConfirmLocation, finalIsLoading };
};
