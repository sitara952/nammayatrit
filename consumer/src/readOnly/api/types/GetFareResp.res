open Utils

@genType
type getFareResp = {
  personId: string,
  searchId: string,
  token: string,
}

let decodeGetFareResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          searchId: getOptionString(dict, "searchId")->Option.getExn(~message="searchId not found"),
          token: getOptionString(dict, "token")->Option.getExn(~message="token not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetFareResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getFareResp) => {
  req->asJson
}
