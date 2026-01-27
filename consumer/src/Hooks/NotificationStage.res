open RideFlowContext
let useChangeStageOnNotification = notificationType => {
  switch notificationType {
  | "REALLOCATE_PRODUCT" => FindingRides
  | "TRIP_STARTED" => RideAssigned
  | "DRIVER_ASSIGNMENT" => RideAssigned
  | "TRIP_FINISHED" => RideCompleted
  | "CANCELLED_PRODUCT" => HomeScreen
  | _ => HomeScreen
  }
}
