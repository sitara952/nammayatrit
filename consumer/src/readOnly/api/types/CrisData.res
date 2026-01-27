open Utils

@genType
type crisData = {
  bookAuthCode: string,
  deviceId: string,
  osBuildVersion: string,
  osType: string,
}

let decodeCrisData = data => {
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
          deviceId: getOptionString(dict, "deviceId")->Option.getExn(~message="deviceId not found"),
          osBuildVersion: getOptionString(dict, "osBuildVersion")->Option.getExn(
            ~message="osBuildVersion not found",
          ),
          osType: getOptionString(dict, "osType")->Option.getExn(~message="osType not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CrisData ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: crisData) => {
  req->asJson
}
