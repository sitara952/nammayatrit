open Enums
open FRFSStationAPIArray
open Utils

let frfsStationsGetApiCall = async (
  city: option<FrfsStationsCity.frfsStationsCity>,
  routeCode: option<string>,
  startStationCode: option<string>,
  vehicleType: FrfsStationsVehicleType.frfsStationsVehicleType,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/stations" ++
    ("?" ++
    Option.mapOr(city, "", x => "&city=" ++ x->FrfsStationsCity.frfsStationsCityToString) ++
    Option.mapOr(routeCode, "", x => "&routeCode=" ++ x) ++
    Option.mapOr(startStationCode, "", x => "&startStationCode=" ++ x) ++
    "&vehicleType=" ++
    vehicleType->FrfsStationsVehicleType.frfsStationsVehicleTypeToString),
  )
  FRFSStationAPIArray.decodeFRFSStationAPIArray(data)
}
