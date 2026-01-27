open CancelChargePercentage
open HighPrecMoney
open Utils

@genType
type cancelCharge = FlatFee(highPrecMoney) | Percentage(cancelChargePercentage)

let decodeCancelCharge = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("FlatFee") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeHighPrecMoney
            ->Result.map(x => FlatFee(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Percentage") =>
            data
            ->decodeCancelChargePercentage
            ->Result.map(x => Percentage(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CancelCharge ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancelCharge) => {
  req->asJson
}
