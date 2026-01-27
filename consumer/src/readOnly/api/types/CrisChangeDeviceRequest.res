open Utils

@genType
type crisChangeDeviceRequest = {otp: string}

let decodeCrisChangeDeviceRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          otp: getOptionString(dict, "otp")->Option.getExn(~message="otp not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CrisChangeDeviceRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: crisChangeDeviceRequest) => {
  req->asJson
}
