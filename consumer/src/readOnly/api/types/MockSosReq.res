open Utils

@genType
type mockSosReq = {
  onRide: option<bool>,
  startDrill: option<bool>,
}

let decodeMockSosReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          onRide: getOptionBool(dict, "onRide"),
          startDrill: getOptionBool(dict, "startDrill"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MockSosReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: mockSosReq) => {
  req->asJson
}
