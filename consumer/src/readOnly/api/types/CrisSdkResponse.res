open Utils

@genType
type crisSdkResponse = {
  bookAuthCode: string,
  latency: option<int>,
  osBuildVersion: string,
  osType: string,
}

let decodeCrisSdkResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookAuthCode: getOptionString(dict, "bookAuthCode")->Option.getExn(
            ~message="bookAuthCode not found",
          ),
          latency: getOptionInt(dict, "latency"),
          osBuildVersion: getOptionString(dict, "osBuildVersion")->Option.getExn(
            ~message="osBuildVersion not found",
          ),
          osType: getOptionString(dict, "osType")->Option.getExn(~message="osType not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CrisSdkResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: crisSdkResponse) => {
  req->asJson
}
