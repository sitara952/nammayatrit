open Utils

@genType
type fareBreakup = {
  price: string,
  title: string,
}

let decodeFareBreakup = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          price: getOptionString(dict, "price")->Option.getExn(~message="price not found"),
          title: getOptionString(dict, "title")->Option.getExn(~message="title not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FareBreakup ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fareBreakup) => {
  req->asJson
}
