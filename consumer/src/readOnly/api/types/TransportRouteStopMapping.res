open Utils

@genType
type transportRouteStopMapping = {
  ibc: string,
  rc: string,
  sc: string,
  sn: int,
}

let decodeTransportRouteStopMapping = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          ibc: getOptionString(dict, "ibc")->Option.getExn(~message="ibc not found"),
          rc: getOptionString(dict, "rc")->Option.getExn(~message="rc not found"),
          sc: getOptionString(dict, "sc")->Option.getExn(~message="sc not found"),
          sn: getOptionInt(dict, "sn")->Option.getExn(~message="sn not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TransportRouteStopMapping ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: transportRouteStopMapping) => {
  req->asJson
}
