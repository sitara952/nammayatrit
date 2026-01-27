open Utils

@genType
type driverReview = {
  feedBackPills: array<string>,
  rating: int,
  review: option<string>,
  riderName: option<string>,
  tripDate: string,
}

let decodeDriverReview = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          feedBackPills: getOptionStrArrayFromDict(dict, "feedBackPills")->Option.getExn(
            ~message="feedBackPills not found",
          ),
          rating: getOptionInt(dict, "rating")->Option.getExn(~message="rating not found"),
          review: getOptionString(dict, "review"),
          riderName: getOptionString(dict, "riderName"),
          tripDate: getOptionString(dict, "tripDate")->Option.getExn(~message="tripDate not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverReview ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverReview) => {
  req->asJson
}
