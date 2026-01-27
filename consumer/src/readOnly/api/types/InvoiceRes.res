open Distance
open FareBreakup
open Utils

@genType
type invoiceRes = {
  chargeableDistance: option<float>,
  chargeableDistanceWithUnit: option<distance>,
  date: string,
  destination: string,
  driverName: string,
  faresList: array<fareBreakup>,
  rideEndTime: string,
  rideStartTime: string,
  shortRideId: string,
  source: string,
  totalAmount: string,
  vehicleNumber: string,
}

let decodeInvoiceRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          chargeableDistance: getOptionFloat(dict, "chargeableDistance"),
          chargeableDistanceWithUnit: dict
          ->Dict.get("chargeableDistanceWithUnit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          date: getOptionString(dict, "date")->Option.getExn(~message="date not found"),
          destination: getOptionString(dict, "destination")->Option.getExn(
            ~message="destination not found",
          ),
          driverName: getOptionString(dict, "driverName")->Option.getExn(
            ~message="driverName not found",
          ),
          faresList: dict
          ->Dict.get("faresList")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="faresList is not of array")
          ->Array.map(x =>
            decodeFareBreakup(x)->Utils.getResultExn(~message="faresList is coming as undefined")
          ),
          rideEndTime: getOptionString(dict, "rideEndTime")->Option.getExn(
            ~message="rideEndTime not found",
          ),
          rideStartTime: getOptionString(dict, "rideStartTime")->Option.getExn(
            ~message="rideStartTime not found",
          ),
          shortRideId: getOptionString(dict, "shortRideId")->Option.getExn(
            ~message="shortRideId not found",
          ),
          source: getOptionString(dict, "source")->Option.getExn(~message="source not found"),
          totalAmount: getOptionString(dict, "totalAmount")->Option.getExn(
            ~message="totalAmount not found",
          ),
          vehicleNumber: getOptionString(dict, "vehicleNumber")->Option.getExn(
            ~message="vehicleNumber not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("InvoiceRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: invoiceRes) => {
  req->asJson
}
