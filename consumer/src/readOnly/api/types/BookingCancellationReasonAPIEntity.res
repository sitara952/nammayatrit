open Enums
open Utils

@genType
type bookingCancellationReasonAPIEntity = {
  additionalInfo: option<string>,
  reasonCode: option<string>,
  reasonStage: option<CancellationStage.cancellationStage>,
  source: CancellationSource.cancellationSource,
}

let decodeBookingCancellationReasonAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          additionalInfo: getOptionString(dict, "additionalInfo"),
          reasonCode: getOptionString(dict, "reasonCode"),
          reasonStage: CancellationStage.decodeCancellationStageResult(
            dict,
            "reasonStage",
          )->Result.mapOr(None, x => Some(x)),
          source: CancellationSource.decodeCancellationSourceResult(
            dict,
            "source",
          )->Utils.getResultExn(~message="source is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingCancellationReasonAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingCancellationReasonAPIEntity) => {
  req->asJson
}
