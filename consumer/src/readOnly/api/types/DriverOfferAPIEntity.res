open Distance
open PriceAPIEntity
open Utils

@genType
type driverOfferAPIEntity = {
  distanceToPickup: option<float>,
  distanceToPickupWithUnit: option<distance>,
  driverName: string,
  durationToPickup: option<int>,
  isUpgradedToCab: bool,
  rating: option<float>,
  tollCharges: option<priceAPIEntity>,
  validTill: string,
}

let decodeDriverOfferAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          distanceToPickup: getOptionFloat(dict, "distanceToPickup"),
          distanceToPickupWithUnit: dict
          ->Dict.get("distanceToPickupWithUnit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          driverName: getOptionString(dict, "driverName")->Option.getExn(
            ~message="driverName not found",
          ),
          durationToPickup: getOptionInt(dict, "durationToPickup"),
          isUpgradedToCab: getOptionBool(dict, "isUpgradedToCab")->Option.getExn(
            ~message="isUpgradedToCab not found",
          ),
          rating: getOptionFloat(dict, "rating"),
          tollCharges: dict
          ->Dict.get("tollCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          validTill: getOptionString(dict, "validTill")->Option.getExn(
            ~message="validTill not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverOfferAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverOfferAPIEntity) => {
  req->asJson
}
