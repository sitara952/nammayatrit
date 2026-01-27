open Enums
open PublicTransportInfo
open Utils

@genType
type publicTransportBucket = {
  serviceTierName: option<string>,
  serviceType: option<FRFSServiceTierType.fRFSServiceTierType>,
  vehicles: array<publicTransportInfo>,
}

let decodePublicTransportBucket = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          serviceTierName: getOptionString(dict, "serviceTierName"),
          serviceType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceType",
          )->Result.mapOr(None, x => Some(x)),
          vehicles: dict
          ->Dict.get("vehicles")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="vehicles is not of array")
          ->Array.map(x =>
            decodePublicTransportInfo(x)->Utils.getResultExn(
              ~message="vehicles is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PublicTransportBucket ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: publicTransportBucket) => {
  req->asJson
}
