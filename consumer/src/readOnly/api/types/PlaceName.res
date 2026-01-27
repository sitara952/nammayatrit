open AddressResp
open LatLong
open Utils

@genType
type placeName = {
  addressComponents: array<addressResp>,
  formattedAddress: option<string>,
  location: latLong,
  placeId: option<string>,
  plusCode: option<string>,
  source: option<string>,
}

let decodePlaceName = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          addressComponents: dict
          ->Dict.get("addressComponents")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="addressComponents is not of array")
          ->Array.map(x =>
            decodeAddressResp(x)->Utils.getResultExn(
              ~message="addressComponents is coming as undefined",
            )
          ),
          formattedAddress: getOptionString(dict, "formattedAddress"),
          location: dict
          ->Dict.get("location")
          ->Option.getExn(~message="location is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="location is coming as undefined"),
          placeId: getOptionString(dict, "placeId"),
          plusCode: getOptionString(dict, "plusCode"),
          source: getOptionString(dict, "source"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PlaceName ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: placeName) => {
  req->asJson
}
