open Utils

@genType
type estimatedEndTimeRange = {
  end: string,
  start: string,
}

let decodeEstimatedEndTimeRange = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          end: getOptionString(dict, "end")->Option.getExn(~message="end not found"),
          start: getOptionString(dict, "start")->Option.getExn(~message="start not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EstimatedEndTimeRange ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: estimatedEndTimeRange) => {
  req->asJson
}
