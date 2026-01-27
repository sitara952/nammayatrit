open Utils

type apiSuccess = {result: string}

let decodeToApiSuccess = dict => {
  try {
    let res = getOptionString(dict, "result")->Option.getExn
    if res == "success" {
      Some({result: res})
    } else {
      None
    }
  } catch {
  | _ => None
  }
}
