open PassInfoAPIEntity
open Utils

@genType
type passInfoAPIEntityArray = array<passInfoAPIEntity>

let decodePassInfoAPIEntityArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodePassInfoAPIEntity(x)->Utils.getResultExn(
          ~message="error in parsing passInfoAPIEntity",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("PassInfoAPIEntityArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passInfoAPIEntityArray) => {
  req->asJson
}
