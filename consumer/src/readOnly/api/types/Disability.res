open Utils

@genType
type disability = {
  description: option<string>,
  id: string,
  tag: option<string>,
}

let decodeDisability = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          description: getOptionString(dict, "description"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          tag: getOptionString(dict, "tag"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Disability ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: disability) => {
  req->asJson
}
