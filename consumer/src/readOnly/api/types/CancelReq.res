open Enums
open Utils

@genType
type cancelReq = {
  additionalInfo: option<string>,
  reallocate: option<bool>,
  reasonCode: string,
  reasonStage: CancellationStage.cancellationStage,
}

let decodeCancelReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          additionalInfo: getOptionString(dict, "additionalInfo"),
          reallocate: getOptionBool(dict, "reallocate"),
          reasonCode: getOptionString(dict, "reasonCode")->Option.getExn(
            ~message="reasonCode not found",
          ),
          reasonStage: CancellationStage.decodeCancellationStageResult(
            dict,
            "reasonStage",
          )->Utils.getResultExn(~message="reasonStage is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CancelReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancelReq) => {
  req->asJson
}
