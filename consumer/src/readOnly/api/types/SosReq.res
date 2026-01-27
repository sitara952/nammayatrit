open LatLong
open SosType
open Utils

@genType
type sosReq = {
  customerLocation: option<latLong>,
  flow: sosType,
  isRideEnded: option<bool>,
  notifyAllContacts: option<bool>,
  rideId: string,
  sendPNOnPostRideSOS: option<bool>,
}

let decodeSosReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          customerLocation: dict
          ->Dict.get("customerLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          flow: dict
          ->Dict.get("flow")
          ->Option.getExn(~message="flow is not found")
          ->decodeSosType
          ->Utils.getResultExn(~message="flow is coming as undefined"),
          isRideEnded: getOptionBool(dict, "isRideEnded"),
          notifyAllContacts: getOptionBool(dict, "notifyAllContacts"),
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
          sendPNOnPostRideSOS: getOptionBool(dict, "sendPNOnPostRideSOS"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SosReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sosReq) => {
  req->asJson
}
