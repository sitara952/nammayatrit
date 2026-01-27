import { loggingOutUser, updateCTEventData } from '@/typescript/utils/common';
import { ApiError, getErrorCode } from '@/typescript/utils/error';
import { selectToken } from '../client/auth';
import { initSession } from '../client/session';
import { setProfile } from '../client/user';
import { RootState } from '../store';
import { api } from './../api';
import { getCrashlytics, setUserId } from '@react-native-firebase/crashlytics';
import { updateProfileReq } from '@/readOnly/api/types/UpdateProfileReq.gen';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
export const userApi = api.injectEndpoints({
    endpoints: build => ({
        getProfile: build.query<profileRes, void>({
            query: () => ({
                url: '/profile?includeProfileImage=True',
                method: 'GET',
            }),
            onQueryStarted: async (_arg, { queryFulfilled, dispatch, getState }) => {
                try {
                    const { data } = await queryFulfilled;
                    const crashlyticsInstance = getCrashlytics();
                    setUserId(crashlyticsInstance, data?.id);
                    // eslint-disable-next-line
                    const state = getState() as RootState;
                    const userToken = selectToken(state);
                    dispatch(initSession(data?.id));
                    updateCTEventData(
                        {
                            firstName: data?.firstName,
                            middleName: data?.middleName,
                            lastName: data?.lastName,
                            hasTakenValidCabRide: data?.hasTakenValidCabRide,
                            hasTakenValidAutoRide: data?.hasTakenValidAutoRide,
                            hasTakenValidBikeRide: data?.hasTakenValidBikeRide,
                        },
                        dispatch,
                        state,
                    );
                    dispatch(setProfile({ id: userToken, payload: data }));
                } catch (err) {
                    console.error('Error in Fetching User Profile: ', err);
                    // eslint-disable-next-line
                    const errorCode = getErrorCode(err as ApiError);
                    if (errorCode === 'PERSON_NOT_FOUND') {
                        loggingOutUser(dispatch, undefined);
                    }
                }
            },
            onCacheEntryAdded: undefined,
            keepUnusedDataFor: 24 * 60 * 60,
            merge: undefined,
            forceRefetch: undefined,
        }),
        updateProfile: build.mutation<aPISuccess, updateProfileReq>({
            query: request => ({
                url: '/profile',
                method: 'POST',
                body: request,
            }),
            onQueryStarted: async (_arg: updateProfileReq, { queryFulfilled, dispatch }) => {
                try {
                    const { data } = await queryFulfilled;
                    console.info('Updated user profile: ', data);
                } catch (err) {
                    console.error('Error in Updating User Profile: ', err);
                    // eslint-disable-next-line
                    const errorCode = getErrorCode(err as ApiError);
                    if (errorCode === 'PERSON_NOT_FOUND') {
                        loggingOutUser(dispatch, undefined);
                    }
                }
            },
            onCacheEntryAdded: undefined,
        }),
    }),
    overrideExisting: false,
});

export const initialUpdateProfileReq: updateProfileReq = {
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    gender: undefined,
    dateOfBirth: undefined,
    profilePicture: undefined,
    androidId: undefined,
    bundleVersion: undefined,
    clientVersion: undefined,
    deviceId: undefined,
    deviceToken: undefined,
    enableOtpLessRide: undefined,
    language: undefined,
    middleName: undefined,
    notificationToken: undefined,
    referralCode: undefined,
    verificationChannel: undefined,
    disability: undefined,
    hasDisability: undefined,
    marketingParams: undefined,
    businessEmail: undefined,
    latestLat: undefined,
    latestLon: undefined,
    liveActivityToken: undefined,
    registrationLat: undefined,
    registrationLon: undefined,
};

export const {
    useLazyGetProfileQuery,

    useGetProfileQuery,

    useUpdateProfileMutation,
} = userApi;
