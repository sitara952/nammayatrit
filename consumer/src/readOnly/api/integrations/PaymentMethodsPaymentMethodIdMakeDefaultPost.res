open APISuccess
open Utils

let paymentMethodsPaymentMethodIdMakeDefaultPostApiCall = async (paymentMethodId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/payment/methods" ++ "/" ++ paymentMethodId ++ "/" ++ "makeDefault",
  )
  APISuccess.decodeAPISuccess(data)
}
