@genType
type estimate = {
  title: string,
  subtitle: option<string>,
  fare: string,
  capacity: string,
  pickupTime: string,
  estimateId: string,
  estimateFareBreakup: array<FareBreakupHelper.estimateFareBreakupItem>,
  estimatedDuration: option<int>,
}
