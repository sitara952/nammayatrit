open Utils

@genType
type nextStopDetails = {
  sequenceNumber: int,
  stopCode: string,
  stopName: option<string>,
  travelDistance: option<int>,
  travelTime: option<int>,
}

let decodeNextStopDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          sequenceNumber: getOptionInt(dict, "sequenceNumber")->Option.getExn(
            ~message="sequenceNumber not found",
          ),
          stopCode: getOptionString(dict, "stopCode")->Option.getExn(~message="stopCode not found"),
          stopName: getOptionString(dict, "stopName"),
          travelDistance: getOptionInt(dict, "travelDistance"),
          travelTime: getOptionInt(dict, "travelTime"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NextStopDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nextStopDetails) => {
  req->asJson
}
