open Utils

@genType
type passCategoryAPIEntity = {
  description: string,
  id: string,
  name: string,
}

let decodePassCategoryAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassCategoryAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passCategoryAPIEntity) => {
  req->asJson
}
