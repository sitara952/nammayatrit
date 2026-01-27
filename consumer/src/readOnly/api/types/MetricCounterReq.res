open Utils

@genType
type metricCounterReq = {
  message: string,
  metricName: string,
}

let decodeMetricCounterReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          metricName: getOptionString(dict, "metricName")->Option.getExn(
            ~message="metricName not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MetricCounterReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: metricCounterReq) => {
  req->asJson
}
