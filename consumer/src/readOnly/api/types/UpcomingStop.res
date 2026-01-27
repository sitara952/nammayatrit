open Utils

@genType
type upcomingStop = {
  actualTravelTime: option<string>,
  estimatedTravelTime: option<string>,
  stopCode: string,
  stopName: string,
  stopSeq: int,
  travelDistance: option<int>,
}

let decodeUpcomingStop = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          actualTravelTime: getOptionString(dict, "actualTravelTime"),
          estimatedTravelTime: getOptionString(dict, "estimatedTravelTime"),
          stopCode: getOptionString(dict, "stopCode")->Option.getExn(~message="stopCode not found"),
          stopName: getOptionString(dict, "stopName")->Option.getExn(~message="stopName not found"),
          stopSeq: getOptionInt(dict, "stopSeq")->Option.getExn(~message="stopSeq not found"),
          travelDistance: getOptionInt(dict, "travelDistance"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpcomingStop ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upcomingStop) => {
  req->asJson
}
