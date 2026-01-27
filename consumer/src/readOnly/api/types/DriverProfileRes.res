open DriverReview
open DriverStatSummary
open Utils

@genType
type driverProfileRes = {
  aboutMe: option<string>,
  aspirations: array<string>,
  certificates: array<string>,
  driverName: string,
  driverStats: driverStatSummary,
  drivingSince: option<int>,
  homeTown: option<string>,
  images: array<string>,
  languages: array<string>,
  onboardedAt: string,
  pledges: array<string>,
  profileImage: option<string>,
  topReviews: array<driverReview>,
  vechicleVariant: option<string>,
  vehicleNum: option<string>,
  vehicleTags: array<string>,
}

let decodeDriverProfileRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          aboutMe: getOptionString(dict, "aboutMe"),
          aspirations: getOptionStrArrayFromDict(dict, "aspirations")->Option.getExn(
            ~message="aspirations not found",
          ),
          certificates: getOptionStrArrayFromDict(dict, "certificates")->Option.getExn(
            ~message="certificates not found",
          ),
          driverName: getOptionString(dict, "driverName")->Option.getExn(
            ~message="driverName not found",
          ),
          driverStats: dict
          ->Dict.get("driverStats")
          ->Option.getExn(~message="driverStats is not found")
          ->decodeDriverStatSummary
          ->Utils.getResultExn(~message="driverStats is coming as undefined"),
          drivingSince: getOptionInt(dict, "drivingSince"),
          homeTown: getOptionString(dict, "homeTown"),
          images: getOptionStrArrayFromDict(dict, "images")->Option.getExn(
            ~message="images not found",
          ),
          languages: getOptionStrArrayFromDict(dict, "languages")->Option.getExn(
            ~message="languages not found",
          ),
          onboardedAt: getOptionString(dict, "onboardedAt")->Option.getExn(
            ~message="onboardedAt not found",
          ),
          pledges: getOptionStrArrayFromDict(dict, "pledges")->Option.getExn(
            ~message="pledges not found",
          ),
          profileImage: getOptionString(dict, "profileImage"),
          topReviews: dict
          ->Dict.get("topReviews")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="topReviews is not of array")
          ->Array.map(x =>
            decodeDriverReview(x)->Utils.getResultExn(~message="topReviews is coming as undefined")
          ),
          vechicleVariant: getOptionString(dict, "vechicleVariant"),
          vehicleNum: getOptionString(dict, "vehicleNum"),
          vehicleTags: getOptionStrArrayFromDict(dict, "vehicleTags")->Option.getExn(
            ~message="vehicleTags not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverProfileRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverProfileRes) => {
  req->asJson
}
