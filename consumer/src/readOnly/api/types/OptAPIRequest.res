open Enums
open Utils

@genType
type optAPIRequest = {status: OptApiMethods.optApiMethods}

let decodeOptAPIRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          status: OptApiMethods.decodeOptApiMethodsResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OptAPIRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: optAPIRequest) => {
  req->asJson
}
