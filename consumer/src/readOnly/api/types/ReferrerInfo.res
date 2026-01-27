open Utils

@genType
type referrerInfo = {
  applicableServiceTiers: option<array<string>>,
  firstName: option<string>,
  lastName: option<string>,
  middleName: option<string>,
  rating: option<float>,
  referrerImageUri: option<string>,
  registeredAt: string,
  totalRides: int,
  vehicleNumber: option<string>,
  vehicleVariant: option<string>,
}

let decodeReferrerInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          applicableServiceTiers: getOptionStrArrayFromDict(dict, "applicableServiceTiers"),
          firstName: getOptionString(dict, "firstName"),
          lastName: getOptionString(dict, "lastName"),
          middleName: getOptionString(dict, "middleName"),
          rating: getOptionFloat(dict, "rating"),
          referrerImageUri: getOptionString(dict, "referrerImageUri"),
          registeredAt: getOptionString(dict, "registeredAt")->Option.getExn(
            ~message="registeredAt not found",
          ),
          totalRides: getOptionInt(dict, "totalRides")->Option.getExn(
            ~message="totalRides not found",
          ),
          vehicleNumber: getOptionString(dict, "vehicleNumber"),
          vehicleVariant: getOptionString(dict, "vehicleVariant"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ReferrerInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: referrerInfo) => {
  req->asJson
}
