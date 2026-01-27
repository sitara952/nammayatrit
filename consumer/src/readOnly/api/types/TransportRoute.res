open Utils

@genType
type transportRoute = {
  cd: string,
  clr: option<string>,
  dTC: option<int>,
  ibc: string,
  lN: string,
  sN: string,
  stC: option<int>,
  vt: string,
}

let decodeTransportRoute = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cd: getOptionString(dict, "cd")->Option.getExn(~message="cd not found"),
          clr: getOptionString(dict, "clr"),
          dTC: getOptionInt(dict, "dTC"),
          ibc: getOptionString(dict, "ibc")->Option.getExn(~message="ibc not found"),
          lN: getOptionString(dict, "lN")->Option.getExn(~message="lN not found"),
          sN: getOptionString(dict, "sN")->Option.getExn(~message="sN not found"),
          stC: getOptionInt(dict, "stC"),
          vt: getOptionString(dict, "vt")->Option.getExn(~message="vt not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TransportRoute ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: transportRoute) => {
  req->asJson
}
