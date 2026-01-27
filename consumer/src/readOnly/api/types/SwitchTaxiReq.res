open Utils

@genType
type switchTaxiReq = {estimateId: string}

let decodeSwitchTaxiReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          estimateId: getOptionString(dict, "estimateId")->Option.getExn(
            ~message="estimateId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SwitchTaxiReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: switchTaxiReq) => {
  req->asJson
}
