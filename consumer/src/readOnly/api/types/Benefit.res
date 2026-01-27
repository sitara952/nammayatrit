open HighPrecMoney
open Utils

@genType
type benefit = FullSaving | FixedSaving(highPrecMoney) | PercentageSaving(highPrecMoney)

let decodeBenefit = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("FullSaving") => FullSaving
          | Some("FixedSaving") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeHighPrecMoney
            ->Result.map(x => FixedSaving(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("PercentageSaving") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeHighPrecMoney
            ->Result.map(x => PercentageSaving(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Benefit ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: benefit) => {
  req->asJson
}
