open APISuccess
open Utils

let paymentMethodsPaymentMethodIdDeleteDeleteApiCall = async (paymentMethodId: string) => {
  let data = await ApiCall.callDeleteAPI'(
    ~url="/payment/methods" ++ "/" ++ paymentMethodId ++ "/" ++ "delete",
  )
  APISuccess.decodeAPISuccess(data)
}
