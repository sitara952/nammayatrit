import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { convertTimestamp } from '../MyRides/UI';
import Invoice from './UI';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { NativeModules } from 'react-native';
import colors from '@/typescript/designSystem/colorPalette';
import { InvoiceScreenAction, InvoiceUIProps, pdfProps } from './Types';
import { getISTWithFormat } from './utils';
import { getCurrency } from '@/typescript/utils/getCurrency';
import { formatLocation, getStopsWithDestination } from '../MyBookingDetails/utils';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectUserName } from '@/typescript/state/client/user';
import { rideReceiptPdf } from './components/rideReceiptPdf';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { FareTypes, getFare, getInvoiceFare } from '@/typescript/utils/fareEntityHelper';
import { selectAppName, setToastProps, selectAppConfig } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, MyRidesParamList } from '@/typescript/navigation/globalParamList';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

const InvoiceFlow = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<MyRidesParamList, 'invoiceScreen'>>();
    const routeParams = route.params;
    const bookingDetail = routeParams?.bookingDetail;
    const userName = useAppSelector(selectUserName);
    const dispatch = useAppDispatch();
    const handleGoBack = () => {
        navigation.goBack();
    };
    const appName = useAppSelector(selectAppName);
    const configManager = useConfigContext();
    const appConfig = useAppSelector(selectAppConfig);
    if (!bookingDetail) {
        return <></>;
    }
    const firstRideEntity = bookingDetail.rideList.at(0);
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appLogoImage = appConfig.assets.appLogoUri;

    const handleDownloadPDF = async () => {
        try {
            const baseFare = getFare(
                bookingDetail.estimatedFareBreakup,
                FareTypes.BASE_FARE,
                false,
                true,
                userLanguageStrings,
                bookingDetail.isPetRide,
                bookingDetail.vehicleServiceTierType,
                undefined,
            );
            const cleverTapParams = {
                'Base fare': baseFare,
                Distance: bookingDetail.estimatedDistance,
                'Driver pickup charges': `${CURRENCY_SYMBOL.value} 10`,
                'Total fare': bookingDetail.estimatedTotalFare,
                'Ride completion timestamp': bookingDetail.rideList.at(0)?.rideEndTime,
            };
            logEvent(EventName.USER_INTERCITY_SCHEDULED_RIDE_CONFIRMED, cleverTapParams);
            const pdfPropsForPDF: pdfProps = {
                ...pdfProps,
                appLogoImage: appConfig.assets.appLogoB64,
            };

            const date = getISTWithFormat(
                firstRideEntity?.rideStartTime || firstRideEntity?.createdAt || '',
                'YYYYDDMM',
            );
            const time = getISTWithFormat(firstRideEntity?.rideStartTime || firstRideEntity?.createdAt || '', 'HHMM');
            await NativeModules['RNHTMLtoPDF'].convert({
                html: rideReceiptPdf(pdfPropsForPDF),
                fileName: `Invoice_${date}_${time}`,
                base64: false,
                height: 1050,
                width: 750,
            });
            // PDF viewer will open automatically - no need for toast notification
        } catch (error) {
            console.error('Error generating PDF:', error);
            dispatch(
                setToastProps({
                    message: userLanguageStrings.Somethingwentwrong || 'Error generating invoice',
                    backgroundColor: colors.recovered.pinkRed,
                    autoDismissAfter: 2000,
                    buttons: [],
                    visible: true,
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
    };
    const resolver: Resolver<InvoiceScreenAction> = async action => {
        switch (action.type) {
            case 'GO_BACK':
                handleGoBack();
                break;
            case 'DOWNLOAD_PDF':
                handleDownloadPDF();
                break;
            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    };
    const invDispatch = createDispatcher(resolver);
    const { date, time } = convertTimestamp(bookingDetail.rideEndTime);
    console.info('bookingDetail :', bookingDetail?.fareBreakup);
    const stops = getStopsWithDestination(bookingDetail.bookingDetails);
    const lastStop = stops.length > 0 ? stops.at(stops.length - 1) : undefined;
    const destinationAddress = lastStop ? formatLocation(lastStop) : undefined;
    const fareBreakup = bookingDetail.fareBreakup;

    const fareList = getInvoiceFare(
        fareBreakup,
        appName,
        userLanguageStrings,
        bookingDetail.bookingDetails.TAG === 'OneWaySpecialZoneAPIDetails',
        bookingDetail.isPetRide,
    );
    const htmlFares = fareList
        .map(v => {
            return `<div style="display: flex; flex-direction: row; ">
                    <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280; flex-grow:1;">${v.key}</div>
                    <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280;">${v.amountText}</div>
                </div>`;
        })
        .join('');
    const extraInfo = fareList
        .map(v => {
            return v.extraDetail !== ''
                ? `<div style="font-weight: 400; font-size: 16px; line-height: 20px; color:#868B98; font-style: italic;">
                                    ${v.extraDetail}
                                        </div>`
                : '';
        })
        .join('');
    const stopsInfoArray = bookingDetail.rideList.at(0)?.stopsInfo
        ? [...(bookingDetail.rideList.at(0)?.stopsInfo || [])]
              .sort((a, b) => a.stopOrder - b.stopOrder)
              .map(stop => ({
                  stopsTime: getISTWithFormat(stop.waitingTimeStart || '', 'hh:mm A'),
                  stopsLocation: formatLocation(stops[stop.stopOrder - 1] ?? null),
              }))
        : [];

    const pdfProps: pdfProps = {
        license: firstRideEntity?.vehicleNumber || '',
        sourceDate: getISTWithFormat(
            firstRideEntity?.rideStartTime || firstRideEntity?.createdAt || '',
            'ddd, DD MMM, YYYY',
        ),
        finalAmount: `${
            firstRideEntity?.computedPriceWithCurrency?.currency
                ? getCurrency(firstRideEntity?.computedPriceWithCurrency?.currency)
                : CURRENCY_SYMBOL.value
        }${Math.round(firstRideEntity?.computedPriceWithCurrency?.amount || 0)}
    `,
        driverName: firstRideEntity?.driverName || '',
        sourceAddress: formatLocation(bookingDetail.fromLocation),
        destinationAddress,
        sourceTime: getISTWithFormat(firstRideEntity?.rideStartTime || firstRideEntity?.createdAt || '', 'hh:mm A'),
        destinationTime: getISTWithFormat(firstRideEntity?.rideEndTime || '', 'hh:mm A'),
        extraInfo,
        htmlFares,
        userName,
        rideShortId: firstRideEntity?.shortRideId || '',
        stopsInfo: stopsInfoArray || undefined,
        height: stopsInfoArray.length * 120 || 80,
        appLogoImage: appLogoImage,
    };
    const localState: InvoiceUIProps = {
        firstRideEntity,
        invDispatch,
        endDate: date,
        endTime: time,
        sourceAddress: bookingDetail?.fromLocation?.ward,
        destinationAddress: '',
        costData: fareList,
        pdfProps,
        bookingId: bookingDetail?.id,
        bookingStatus: bookingDetail?.status,
    };
    return <Invoice {...localState} />;
};
export default InvoiceFlow;
