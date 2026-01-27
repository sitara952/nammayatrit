module ConfigManager = {
  type configSource =
    | Firebase
    | AnyOtherProvider // add more providers here like CAC

  let currentFetchAndActivateProvider = ref(FBConfigProvider.FBConfigProvider.fetchAndActivate)
  let currentBooleanProvider = ref(FBConfigProvider.FBConfigProvider.getBoolean)
  let currentNumberProvider = ref(FBConfigProvider.FBConfigProvider.getNumber)
  let currentStringProvider = ref(FBConfigProvider.FBConfigProvider.getString)
  let currentRealTimeUpdate = ref(FBConfigProvider.FBConfigProvider.realTimeUpdate)

  let setProvider = (source: configSource) => {
    currentFetchAndActivateProvider :=
      switch source {
      | Firebase => FBConfigProvider.FBConfigProvider.fetchAndActivate
      | _ => FBConfigProvider.FBConfigProvider.fetchAndActivate // Keeping Firebase as default for now, this can be switched with CAC or any other provider
      }

    currentBooleanProvider :=
      switch source {
      | Firebase => FBConfigProvider.FBConfigProvider.getBoolean
      | _ => FBConfigProvider.FBConfigProvider.getBoolean
      }

    currentNumberProvider :=
      switch source {
      | Firebase => FBConfigProvider.FBConfigProvider.getNumber
      | _ => FBConfigProvider.FBConfigProvider.getNumber
      }

    currentStringProvider :=
      switch source {
      | Firebase => FBConfigProvider.FBConfigProvider.getString
      | _ => FBConfigProvider.FBConfigProvider.getString
      }

    currentRealTimeUpdate :=
      switch source {
      | Firebase => FBConfigProvider.FBConfigProvider.realTimeUpdate
      | _ => FBConfigProvider.FBConfigProvider.realTimeUpdate
      }
  }

  let fetchAndActivate = () => {
    currentFetchAndActivateProvider.contents()
  }

  let getBoolean = (key: string) => {
    currentBooleanProvider.contents(key)
  }

  let getNumber = (key: string) => {
    currentNumberProvider.contents(key)
  }

  let getString = (key: string) => {
    currentStringProvider.contents(key)
  }

  let realTimeUpdate = () => {
    currentRealTimeUpdate.contents()
  }
}
