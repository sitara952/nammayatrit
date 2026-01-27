open Sos
open Utils

@genType
type sosDetailsRes = {sos: option<sos>}

let decodeSosDetailsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          sos: dict
          ->Dict.get("sos")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeSos(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SosDetailsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sosDetailsRes) => {
  req->asJson
}
