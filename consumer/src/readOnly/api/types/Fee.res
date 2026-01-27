open FeeFlat
open FeePercentage
open Utils

@genType
type fee = Percentage(feePercentage) | Flat(feeFlat)

let decodeFee = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("Percentage") =>
            data
            ->decodeFeePercentage
            ->Result.map(x => Percentage(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Flat") =>
            data
            ->decodeFeeFlat
            ->Result.map(x => Flat(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Fee ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fee) => {
  req->asJson
}
