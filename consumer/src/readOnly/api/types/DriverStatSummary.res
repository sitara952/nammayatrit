open Utils

@genType
type driverStatSummary = {
  avgRating: option<float>,
  cancellationRate: int,
  likedByRidersNum: int,
  numTrips: int,
}

let decodeDriverStatSummary = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          avgRating: getOptionFloat(dict, "avgRating"),
          cancellationRate: getOptionInt(dict, "cancellationRate")->Option.getExn(
            ~message="cancellationRate not found",
          ),
          likedByRidersNum: getOptionInt(dict, "likedByRidersNum")->Option.getExn(
            ~message="likedByRidersNum not found",
          ),
          numTrips: getOptionInt(dict, "numTrips")->Option.getExn(~message="numTrips not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverStatSummary ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverStatSummary) => {
  req->asJson
}
