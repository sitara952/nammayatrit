open ExpiryTypeInstantExpiry
open TimeOfDay
open Utils

@genType
type expiryType = InstantExpiry(expiryTypeInstantExpiry) | VisitDate(timeOfDay)

let decodeExpiryType = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("InstantExpiry") =>
            data
            ->decodeExpiryTypeInstantExpiry
            ->Result.map(x => InstantExpiry(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("VisitDate") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeTimeOfDay
            ->Result.map(x => VisitDate(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ExpiryType ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: expiryType) => {
  req->asJson
}
