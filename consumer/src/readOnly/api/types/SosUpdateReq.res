open Enums
open Utils

@genType
type sosUpdateReq = {
  comment: option<string>,
  status: SosStatus.sosStatus,
}

let decodeSosUpdateReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          comment: getOptionString(dict, "comment"),
          status: SosStatus.decodeSosStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SosUpdateReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sosUpdateReq) => {
  req->asJson
}
