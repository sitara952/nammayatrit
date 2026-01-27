open JourneyBookingPaymentStatus
open Utils

let multimodalJourneyIdBookingPaymentStatusGetApiCall = async (journeyId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "booking/paymentStatus",
  )
  JourneyBookingPaymentStatus.decodeJourneyBookingPaymentStatus(data)
}
