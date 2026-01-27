open Utils

type userSosFlow = {
  tag: string,
  contents: string,
}

type sosReq = {
  flow: userSosFlow,
  rideId: string,
  isRideEnded: bool,
}

type sosRes = {sosId: string}

let makeSosFlow = (tag, contents) => {
  tag,
  contents,
}

let makeSosReq = (flow, rideId, isRideEnded) => {
  flow,
  rideId,
  isRideEnded,
}

let decodeSosRes = (res): sosRes => {
  let dict = res->getDictFromJson
  {sosId: getString(dict, "sosId", "")}
}
