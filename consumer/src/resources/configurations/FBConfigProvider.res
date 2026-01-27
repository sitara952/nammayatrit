module FBConfigProvider: ConfigProvider.ConfigProvider = {
  let fetchAndActivate = () => Firebase.getRemoteConfig()->Firebase.fetchAndActivate()
  let getBoolean = (key: string) => Firebase.getRemoteConfig()->Firebase.getBoolean(key)
  let getNumber = (key: string) => Firebase.getRemoteConfig()->Firebase.getNumber(key)
  let getString = (key: string) => Firebase.getRemoteConfig()->Firebase.getString(key)
  let realTimeUpdate = () =>
    Firebase.getRemoteConfig()->Firebase.onConfigUpdated(Firebase.onUpdateActivate)
}
