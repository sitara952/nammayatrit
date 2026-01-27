type designToken = NAMMA_YATRI_APP | BRIDGE_APP | YATRI_APP | MANA_YATRI_APP | YATRI_SATHI_APP

let getTokenByAppId = (~appId: string) => {
  switch appId {
  | "nammayatri" => NAMMA_YATRI_APP
  | "bridge" => BRIDGE_APP
  | "yatri" => YATRI_APP
  | "manayatri" => MANA_YATRI_APP
  | "yatrisathi" => YATRI_SATHI_APP
  | _ => NAMMA_YATRI_APP
  }
}

type initialPayload = {
  appId: string,
  designToken: designToken,
  // other items can be added here which we get from native payload
}

let defaultPayload: initialPayload = {
  appId: "",
  designToken: NAMMA_YATRI_APP,
}

let defaultSetter = (_: initialPayload) => ()
let initialPayloadContext = React.createContext((defaultPayload, defaultSetter))

module Provider = {
  let make = React.Context.provider(initialPayloadContext)
}

@react.component
let make = (~children) => {
  let (state, setState) = React.useState(_ => defaultPayload)
  let setState' = React.useCallback1(val => {
    setState(_ => val)
  }, [setState])

  <Provider value=(state, setState')> children </Provider>
}
