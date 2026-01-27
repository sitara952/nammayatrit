open SavedReqLocationAPIEntity
open Utils

@genType
type savedReqLocationsListRes = {list: array<savedReqLocationAPIEntity>}

let decodeSavedReqLocationsListRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          list: dict
          ->Dict.get("list")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="list is not of array")
          ->Array.map(x =>
            decodeSavedReqLocationAPIEntity(x)->Utils.getResultExn(
              ~message="list is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SavedReqLocationsListRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: savedReqLocationsListRes) => {
  req->asJson
}
