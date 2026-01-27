open LegStatusArray
open Utils

let multimodalJourneyJourneyIdStatusPostApiCall = async (journeyId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal/journey" ++ "/" ++ journeyId ++ "/" ++ "status",
  )
  LegStatusArray.decodeLegStatusArray(data)
}
