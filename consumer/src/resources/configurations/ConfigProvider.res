module type ConfigProvider = {
  let fetchAndActivate: unit => Promise.t<bool>
  let realTimeUpdate: unit => unit
  let getBoolean: string => Promise.t<bool>
  let getNumber: string => Promise.t<float>
  let getString: string => string
}
