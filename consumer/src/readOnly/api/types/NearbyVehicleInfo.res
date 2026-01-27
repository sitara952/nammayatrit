open NearByDriversBucket
open PublicTransportBucket
open Utils

@genType
type nearbyVehicleInfo = PublicTransport(publicTransportBucket) | Taxi(nearByDriversBucket)

let decodeNearbyVehicleInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("PublicTransport") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodePublicTransportBucket
            ->Result.map(x => PublicTransport(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Taxi") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeNearByDriversBucket
            ->Result.map(x => Taxi(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NearbyVehicleInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nearbyVehicleInfo) => {
  req->asJson
}
