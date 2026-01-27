open Utils

@genType
type version = {
  build: option<string>,
  maintenance: int,
  major: int,
  minor: int,
  preRelease: option<string>,
}

let decodeVersion = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          build: getOptionString(dict, "build"),
          maintenance: getOptionInt(dict, "maintenance")->Option.getExn(
            ~message="maintenance not found",
          ),
          major: getOptionInt(dict, "major")->Option.getExn(~message="major not found"),
          minor: getOptionInt(dict, "minor")->Option.getExn(~message="minor not found"),
          preRelease: getOptionString(dict, "preRelease"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Version ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: version) => {
  req->asJson
}
