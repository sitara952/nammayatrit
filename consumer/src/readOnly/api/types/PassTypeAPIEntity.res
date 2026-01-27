open Utils

@genType
type passTypeAPIEntity = {
  catchline: option<string>,
  description: option<string>,
  id: string,
  name: option<string>,
  title: string,
}

let decodePassTypeAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          catchline: getOptionString(dict, "catchline"),
          description: getOptionString(dict, "description"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          name: getOptionString(dict, "name"),
          title: getOptionString(dict, "title")->Option.getExn(~message="title not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassTypeAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passTypeAPIEntity) => {
  req->asJson
}
