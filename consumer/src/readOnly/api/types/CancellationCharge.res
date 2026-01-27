open CancelCharge
open Utils

@genType
type cancellationCharge = {
  cancelCharge: cancelCharge,
  time: int,
}

let decodeCancellationCharge = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cancelCharge: dict
          ->Dict.get("cancelCharge")
          ->Option.getExn(~message="cancelCharge is not found")
          ->decodeCancelCharge
          ->Utils.getResultExn(~message="cancelCharge is coming as undefined"),
          time: getOptionInt(dict, "time")->Option.getExn(~message="time not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CancellationCharge ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancellationCharge) => {
  req->asJson
}
