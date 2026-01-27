open Utils

@genType
type fRFSPossibleStopsReq = {stationCodes: array<string>}

let decodeFRFSPossibleStopsReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          stationCodes: getOptionStrArrayFromDict(dict, "stationCodes")->Option.getExn(
            ~message="stationCodes not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSPossibleStopsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSPossibleStopsReq) => {
  req->asJson
}
