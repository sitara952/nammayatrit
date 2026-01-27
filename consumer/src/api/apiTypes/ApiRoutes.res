type apiRoutes = {
  auth: string,
  autoComplete: string,
  cancelRide: string => string,
  confirmRide: string => string,
  driverLocation: string => string,
  estimateCancel: string => string,
  estimateResults: string => string,
  estimateSelect2: string => string,
  flowStatus: string,
  getPlaceDetails: string,
  getPlaceName: string,
  getRoute: string => string,
  rideBooking: string => string,
  rideBookingList: (string, string, string, option<string>, option<string>) => string,
  ridefeedback: string,
  rideSearch: string,
  rideSearchResults: string => string,
  savedLocationList: string,
  savedLocation: string,
  serviceability: string => string,
  getProfile: string,
  getPaymentMethods: string,
  getPaymentIntentSetup: string,
  getPaymentIntent: string,
  updatePaymentMethod: (string, string) => string,
  deletePaymentMethod: string => string,
  setDefaultPaymentMethod: string => string,
  addTip: string => string,
  issueCategory: string,
  issueReport: string,
  sendIssue: string,
  emergencyContacts: string,
  createSos: string,
  shareRideDetail: string,
  getEmergencySettings: string,
}

let baseUrl = switch RNConfig.getVar("BASE_URL") {
| Some(apiUrl) => apiUrl
| None => "https://api.moving.tech/pilot/app/v2"
}

let rideBookingList = (limit, offset, isActive, status, clientId) =>
  switch status {
  | Some(rideStatus) =>
    let clientIdStr = switch clientId {
    | Some(clientIdValue) => clientIdValue
    | None => ""
    }
    if clientIdStr === "" {
      "/rideBooking/list?limit=" ++
      limit ++
      "&offset=" ++
      offset ++
      "&onlyActive=" ++
      isActive ++
      "&status=" ++
      rideStatus
    } else {
      "/rideBooking/list?limit=" ++
      limit ++
      "&offset=" ++
      offset ++
      "&onlyActive=" ++
      isActive ++
      "&status=" ++
      rideStatus ++
      "&clientId=" ++
      clientIdStr
    }
  | None =>
    "/rideBooking/list?limit=" ++ limit ++ "&offset=" ++ offset ++ "&onlyActive=" ++ isActive
  }

let rideBookingId = rideBookingId => "/rideBooking/" ++ rideBookingId

let apiRoutes = {
  auth: "/auth/",
  autoComplete: "/maps/autoComplete",
  cancelRide: bookingId => {"/rideBooking/" ++ bookingId ++ "/cancel"},
  confirmRide: (quoteId: string) => "/rideSearch/quotes/" ++ quoteId ++ "/confirm",
  driverLocation: (rideId: string) => "/ride/" ++ rideId ++ "/driver/location",
  estimateCancel: (estimateId: string) => "/estimate/" ++ estimateId ++ "/cancel",
  estimateResults: (estimateId: string) => "/estimate/" ++ estimateId ++ "/results",
  estimateSelect2: (estimateId: string) => "/estimate/" ++ estimateId ++ "/select2",
  flowStatus: "/frontend/flowStatus?isPolling=true",
  getPlaceDetails: "/maps/getPlaceDetails",
  getPlaceName: "/maps/getPlaceName",
  getRoute: routeType => "/" ++ routeType ++ "/route",
  rideBooking: rideBookingId => {"/rideBooking/" ++ rideBookingId},
  rideBookingList,
  ridefeedback: "/feedback/rateRide",
  rideSearch: "/rideSearch",
  rideSearchResults: searchId => {"/rideSearch/" ++ searchId ++ "/results"},
  savedLocationList: "/savedLocation/list",
  savedLocation: "/savedLocation",
  serviceability: type_ => {"/serviceability/" ++ type_},
  getProfile: "/profile",
  getPaymentMethods: "/payment/methods",
  getPaymentIntentSetup: "/payment/intent/setup",
  getPaymentIntent: "/payment/intent/payment",
  updatePaymentMethod: (rideId, paymentMethodId) =>
    "/payment/" ++ rideId ++ "/method/" ++ paymentMethodId ++ "/update",
  deletePaymentMethod: paymentMethodId => "/payment/methods/" ++ paymentMethodId ++ "/delete",
  setDefaultPaymentMethod: paymentMethodId =>
    "/payment/methods/" ++ paymentMethodId ++ "/makeDefault",
  addTip: rideId => "/payment/" ++ rideId ++ "/addTip",
  issueCategory: "/issue/category?language=en",
  issueReport: "/issue?language=en",
  sendIssue: "/support/sendIssue",
  emergencyContacts: "/profile/defaultEmergencyNumbers",
  createSos: "/sos/create",
  shareRideDetail: "/share/ride",
  getEmergencySettings: "/profile/getEmergencySettings",
}
