open Utils

@genType
type getPlaceDetailsReq = {
  placeId: string,
  sessionToken: option<string>,
}

let decodeGetPlaceDetailsReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          placeId: getOptionString(dict, "placeId")->Option.getExn(~message="placeId not found"),
          sessionToken: getOptionString(dict, "sessionToken"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetPlaceDetailsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getPlaceDetailsReq) => {
  req->asJson
}
