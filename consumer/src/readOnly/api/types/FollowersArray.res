open Followers
open Utils

@genType
type followersArray = array<followers>

let decodeFollowersArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeFollowers(x)->Utils.getResultExn(~message="error in parsing followers")
      ),
    )
  } catch {
  | err => {
      Console.log2("FollowersArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: followersArray) => {
  req->asJson
}
