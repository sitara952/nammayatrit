open Enums
open FRFSRouteAPI
open Utils

let frfsRouteRouteCodeGetApiCall = async (
  routeCode: string,
  platformType: option<FrfsRouteRouteCodePlatformType.frfsRouteRouteCodePlatformType>,
  city: FrfsRouteRouteCodeCity.frfsRouteRouteCodeCity,
  vehicleType: FrfsRouteRouteCodeVehicleType.frfsRouteRouteCodeVehicleType,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/route" ++
    "/" ++
    routeCode ++
    "/" ++
    "" ++
    ("?" ++
    Option.mapOr(platformType, "", x =>
      "&platformType=" ++ x->FrfsRouteRouteCodePlatformType.frfsRouteRouteCodePlatformTypeToString
    ) ++
    "&city=" ++
    city->FrfsRouteRouteCodeCity.frfsRouteRouteCodeCityToString ++
    "&vehicleType=" ++
    vehicleType->FrfsRouteRouteCodeVehicleType.frfsRouteRouteCodeVehicleTypeToString),
  )
  FRFSRouteAPI.decodeFRFSRouteAPI(data)
}
