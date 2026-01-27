open Utils

type cancelReq = {
  additionalInfo: option<string>,
  reasonCode: string,
  reasonStage: string,
}

let makeCancelRideRequest = (info, code, stage): cancelReq => {
  additionalInfo: info,
  reasonCode: code,
  reasonStage: stage,
}

let cancelRideRequestBody = (req: cancelReq) => {
  req->asJson->JSON.stringify->Some
}
let toJson = (req: cancelReq) => {
  req->asJson
}
