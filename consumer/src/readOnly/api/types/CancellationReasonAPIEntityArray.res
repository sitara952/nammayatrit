open CancellationReasonAPIEntity
open Utils

@genType
type cancellationReasonAPIEntityArray = array<cancellationReasonAPIEntity>

let decodeCancellationReasonAPIEntityArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeCancellationReasonAPIEntity(x)->Utils.getResultExn(
          ~message="error in parsing cancellationReasonAPIEntity",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("CancellationReasonAPIEntityArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancellationReasonAPIEntityArray) => {
  req->asJson
}
