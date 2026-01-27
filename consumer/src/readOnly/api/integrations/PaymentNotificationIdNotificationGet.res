open CreateOrderResp
open Utils

let paymentNotificationIdNotificationGetApiCall = async (notificationId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/payment" ++ "/" ++ notificationId ++ "/" ++ "notification",
  )
  CreateOrderResp.decodeCreateOrderResp(data)
}
