open Utils

@genType
type nightShiftRateAPIEntity = {
  nightShiftEnd: string,
  nightShiftMultiplier: option<float>,
  nightShiftStart: string,
}

let decodeNightShiftRateAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          nightShiftEnd: getOptionString(dict, "nightShiftEnd")->Option.getExn(
            ~message="nightShiftEnd not found",
          ),
          nightShiftMultiplier: getOptionFloat(dict, "nightShiftMultiplier"),
          nightShiftStart: getOptionString(dict, "nightShiftStart")->Option.getExn(
            ~message="nightShiftStart not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NightShiftRateAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nightShiftRateAPIEntity) => {
  req->asJson
}
