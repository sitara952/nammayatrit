open Enums
open LatLong
open Utils

@genType
type personStatsRes = {
  commonAppUseCase: AppUseCase.appUseCase,
  email: option<string>,
  emergencyContactsNum: int,
  favoriteLocationsNum: int,
  frequencyCategory: FrequencyCategory.frequencyCategory,
  isBlocked: bool,
  isChurnedUser: bool,
  isWhatsAppOptInStatus: bool,
  lastRideTaken: option<string>,
  latestSearch: option<string>,
  latestSearchFrom: option<latLong>,
  lifetimeRides: int,
  offPeakRidesRate: float,
  overalCancellationRate: float,
  riderId: string,
  signupDate: string,
  userCancellationRate: float,
  userCategory: UserCategory.userCategory,
  weekdayEveningPeakRidesRate: float,
  weekdayMorningPeakRidesRate: float,
  weekdayRidesRate: float,
  weekendPeakRideRate: float,
  weekendRidesRate: float,
}

let decodePersonStatsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          commonAppUseCase: AppUseCase.decodeAppUseCaseResult(
            dict,
            "commonAppUseCase",
          )->Utils.getResultExn(~message="commonAppUseCase is coming as undefined"),
          email: getOptionString(dict, "email"),
          emergencyContactsNum: getOptionInt(dict, "emergencyContactsNum")->Option.getExn(
            ~message="emergencyContactsNum not found",
          ),
          favoriteLocationsNum: getOptionInt(dict, "favoriteLocationsNum")->Option.getExn(
            ~message="favoriteLocationsNum not found",
          ),
          frequencyCategory: FrequencyCategory.decodeFrequencyCategoryResult(
            dict,
            "frequencyCategory",
          )->Utils.getResultExn(~message="frequencyCategory is coming as undefined"),
          isBlocked: getOptionBool(dict, "isBlocked")->Option.getExn(
            ~message="isBlocked not found",
          ),
          isChurnedUser: getOptionBool(dict, "isChurnedUser")->Option.getExn(
            ~message="isChurnedUser not found",
          ),
          isWhatsAppOptInStatus: getOptionBool(dict, "isWhatsAppOptInStatus")->Option.getExn(
            ~message="isWhatsAppOptInStatus not found",
          ),
          lastRideTaken: getOptionString(dict, "lastRideTaken"),
          latestSearch: getOptionString(dict, "latestSearch"),
          latestSearchFrom: dict
          ->Dict.get("latestSearchFrom")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          lifetimeRides: getOptionInt(dict, "lifetimeRides")->Option.getExn(
            ~message="lifetimeRides not found",
          ),
          offPeakRidesRate: getOptionFloat(dict, "offPeakRidesRate")->Option.getExn(
            ~message="offPeakRidesRate not found",
          ),
          overalCancellationRate: getOptionFloat(dict, "overalCancellationRate")->Option.getExn(
            ~message="overalCancellationRate not found",
          ),
          riderId: getOptionString(dict, "riderId")->Option.getExn(~message="riderId not found"),
          signupDate: getOptionString(dict, "signupDate")->Option.getExn(
            ~message="signupDate not found",
          ),
          userCancellationRate: getOptionFloat(dict, "userCancellationRate")->Option.getExn(
            ~message="userCancellationRate not found",
          ),
          userCategory: UserCategory.decodeUserCategoryResult(
            dict,
            "userCategory",
          )->Utils.getResultExn(~message="userCategory is coming as undefined"),
          weekdayEveningPeakRidesRate: getOptionFloat(
            dict,
            "weekdayEveningPeakRidesRate",
          )->Option.getExn(~message="weekdayEveningPeakRidesRate not found"),
          weekdayMorningPeakRidesRate: getOptionFloat(
            dict,
            "weekdayMorningPeakRidesRate",
          )->Option.getExn(~message="weekdayMorningPeakRidesRate not found"),
          weekdayRidesRate: getOptionFloat(dict, "weekdayRidesRate")->Option.getExn(
            ~message="weekdayRidesRate not found",
          ),
          weekendPeakRideRate: getOptionFloat(dict, "weekendPeakRideRate")->Option.getExn(
            ~message="weekendPeakRideRate not found",
          ),
          weekendRidesRate: getOptionFloat(dict, "weekendRidesRate")->Option.getExn(
            ~message="weekendRidesRate not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PersonStatsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: personStatsRes) => {
  req->asJson
}
