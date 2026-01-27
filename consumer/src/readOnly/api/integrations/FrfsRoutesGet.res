open Enums
open FRFSRouteAPIArray
open Utils

let frfsRoutesGetApiCall = async (
  endStationCode: option<string>,
  startStationCode: option<string>,
  city: FrfsRoutesCity.frfsRoutesCity,
  vehicleType: FrfsRoutesVehicleType.frfsRoutesVehicleType,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/routes" ++
    ("?" ++
    Option.mapOr(endStationCode, "", x => "&endStationCode=" ++ x) ++
    Option.mapOr(startStationCode, "", x => "&startStationCode=" ++ x) ++
    "&city=" ++
    city->FrfsRoutesCity.frfsRoutesCityToString ++
    "&vehicleType=" ++
    vehicleType->FrfsRoutesVehicleType.frfsRoutesVehicleTypeToString),
  )
  FRFSRouteAPIArray.decodeFRFSRouteAPIArray(data)
}
