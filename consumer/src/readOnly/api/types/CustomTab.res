open Utils

@genType
type customTab = {
  body: string,
  header: string,
}

let decodeCustomTab = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          body: getOptionString(dict, "body")->Option.getExn(~message="body not found"),
          header: getOptionString(dict, "header")->Option.getExn(~message="header not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CustomTab ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: customTab) => {
  req->asJson
}
