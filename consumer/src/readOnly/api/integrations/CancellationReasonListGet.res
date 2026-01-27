open Enums
open CancellationReasonAPIEntityArray
open Utils

let cancellationReasonListGetApiCall = async (
  cancellationStage: CancellationReasonListCancellationStage.cancellationReasonListCancellationStage,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/cancellationReason/list" ++
    ("?" ++
    "&cancellationStage=" ++
    cancellationStage->CancellationReasonListCancellationStage.cancellationReasonListCancellationStageToString),
  )
  CancellationReasonAPIEntityArray.decodeCancellationReasonAPIEntityArray(data)
}
