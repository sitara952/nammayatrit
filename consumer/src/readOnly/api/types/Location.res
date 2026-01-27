open LocationAddress
open Utils

@genType
type location = {
  address: locationAddress,
  createdAt: string,
  id: string,
  lat: float,
  lon: float,
  updatedAt: string,
}

let decodeLocation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          address: dict
          ->Dict.get("address")
          ->Option.getExn(~message="address is not found")
          ->decodeLocationAddress
          ->Utils.getResultExn(~message="address is coming as undefined"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Location ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: location) => {
  req->asJson
}
