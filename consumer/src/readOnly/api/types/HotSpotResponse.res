open HotSpotInfo
open Utils

@genType
type hotSpotResponse = {
  blockRadius: option<int>,
  hotSpotInfo: array<hotSpotInfo>,
}

let decodeHotSpotResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          blockRadius: getOptionInt(dict, "blockRadius"),
          hotSpotInfo: dict
          ->Dict.get("hotSpotInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="hotSpotInfo is not of array")
          ->Array.map(x =>
            decodeHotSpotInfo(x)->Utils.getResultExn(~message="hotSpotInfo is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("HotSpotResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: hotSpotResponse) => {
  req->asJson
}
