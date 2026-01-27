type remoteConfigService = {
  fetchConfigs: unit => Promise.t<unit>,
  getConfigValue: string => string,
  activateConfigs: unit => Promise.t<unit>,
}
