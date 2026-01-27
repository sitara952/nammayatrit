open Utils

@genType
type suggestedStations = {
  index: int,
  stationsList: array<string>,
  toggableIndex: int,
  towardsStation: string,
}

let decodeSuggestedStations = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          index: getOptionInt(dict, "index")->Option.getExn(~message="index not found"),
          stationsList: getOptionStrArrayFromDict(dict, "stationsList")->Option.getExn(
            ~message="stationsList not found",
          ),
          toggableIndex: getOptionInt(dict, "toggableIndex")->Option.getExn(
            ~message="toggableIndex not found",
          ),
          towardsStation: getOptionString(dict, "towardsStation")->Option.getExn(
            ~message="towardsStation not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SuggestedStations ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: suggestedStations) => {
  req->asJson
}
