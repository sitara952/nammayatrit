let finding_estimates_polling = 180
let finding_estimates_polling_interval = 3
let debounce_delay = 500
let estimates_polling_count = 10
let estimates_polling_interval = 1000
let recent_searches_limit = 100
let confirmPickupSnapPoints = [Js.Float.toString(Utils.dpToPercentageHeight(250.))]
let confirmSpecialPickupSnapPoints = [Js.Float.toString(Utils.dpToPercentageHeight(350.))]
let findingRidesSnapPoints = [Js.Float.toString(Utils.dpToPercentageHeight(350.))]
let locUnserviceableSnapPoints = [Js.Float.toString(Utils.dpToPercentageHeight(440.))]
let searchScreenSnapPoints = ["100%"]
let stripePublishableKey = "pk_test_51PH53iJ2B2RowHsd9MltP788iVlFyapXqlYiFx0U5gtMbQEdEB538kYiIQBnWAOQ81SQlMpbm2iPatGnj3oV8BXq00Cm7phnJ2"
let mile_to_Meter_distance = 1609
let customerSupportNumber = "112"
let emergencyContactNumber = "911"
let termsAndCondLink = "https://bridge.cab/terms_of_use/"
let privacyPolicyLink = "https://www.bridge.cab/privacy-policy/"
let multiplier = "1.5"
let nightChargesFrom = "10 PM"
let nightChargesTill = "5 AM"
let emergencyContactLimit = 3
let androidCugPackageName = "in.juspay.cug"
let iosCugPackageName = "devtools"
let pickupThreshold = 50

let findingRidesDataInterval = 6000

let initialCoordinate: ReactMap.latLng = {
  latitude: 13.0827,
  longitude: 80.2707,
}

let minneapolisDefaultCoordinate: LatLong.latLong = {
  lat: 44.986656,
  lon: -93.258133,
}

type referralData = {
  customerAppId: string,
  domain: string,
}

let referralData: referralData = {
  customerAppId: "com.mobility.movingtech",
  domain: "https://bridge.cab",
}
