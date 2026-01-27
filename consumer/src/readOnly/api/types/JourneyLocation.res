open FRFSStationAPI
open LocationAPIEntity
open Utils

@genType
type journeyLocation = Taxi(locationAPIEntity) | Frfs(fRFSStationAPI) | Null

let decodeJourneyLocation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("Taxi") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeLocationAPIEntity
            ->Result.map(x => Taxi(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Frfs") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeFRFSStationAPI
            ->Result.map(x => Frfs(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Null") => Null
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyLocation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyLocation) => {
  req->asJson
}
