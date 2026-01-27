// let defaultSetter = (_: flow) => ()
// let navigationStateContext = React.createContext((SplashScreen, defaultSetter))
@genType
type dataType = {
  entity_type: string,
  notification_json: string,
  entity_ids: string,
  entity_data: string,
  notification_type: string,
  show_notification: string,
  driver_notification_payload: string,
}

// type alertType = {
//   body: string,
//   title: string,
// }
// type apsType = {data: dataType, category: string, alert: alertType, sound: string}
// type payloadType = {aps: apsType}
// type headersType = {"apns-priority": string}
// type apnsType = {payload: payloadType, headers: headersType}

@genType
let defaultPayloadData: dataType = {
  entity_type: "",
  notification_json: "",
  entity_ids: "",
  entity_data: "",
  notification_type: "",
  show_notification: "",
  driver_notification_payload: "",
}
let defaultSetter = (_: dataType) => ()
@genType
let reactNotificationContext = React.createContext((defaultPayloadData, defaultSetter))
module Provider = {
  let make = React.Context.provider(reactNotificationContext)
}
@react.component
let make = (~children) => {
  let (state, setInternalState) = React.useState(_ => defaultPayloadData)
  let setState = React.useCallback1(val => {
    setInternalState(_ => val)
  }, [setInternalState])

  React.useEffect1(() => {
    setInternalState(_ => defaultPayloadData)
    None
  }, [state])
  <Provider value=(state, setState)> children </Provider>
}
