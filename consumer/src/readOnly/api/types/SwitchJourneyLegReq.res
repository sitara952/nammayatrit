open Utils

@genType
type switchJourneyLegReq = {journeyLegId: string}

let decodeSwitchJourneyLegReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          journeyLegId: getOptionString(dict, "journeyLegId")->Option.getExn(
            ~message="journeyLegId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SwitchJourneyLegReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: switchJourneyLegReq) => {
  req->asJson
}
