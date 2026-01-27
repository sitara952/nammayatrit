let bootUpUserProfile: Profile.userProfile = {
  id: "",
  firstName: Some("User"),
  middleName: None,
  lastName: None,
  email: None,
  maskedMobileNumber: None,
  maskedDeviceToken: None,
  hasTakenRide: false,
  hasTakenValidRide: false,
  hasTakenValidAutoRide: false,
  hasTakenValidCabRide: false,
  hasTakenValidBikeRide: false,
  hasTakenValidAmbulanceRide: false,
  referralCode: None,
  language: None,
  hasDisability: None,
  disability: None,
  gender: UNKNOWN,
  hasCompletedSafetySetup: false,
  hasCompletedMockSafetyDrill: None,
  followsRide: false,
  frontendConfigHash: None,
  isSafetyCenterDisabled: false,
  customerReferralCode: None,
  preferredPaymentMethodId: None,
  customerTags: None,
}

let defaultSetter = (_: Profile.userProfile) => ()

let userProfileContext = React.createContext((bootUpUserProfile, defaultSetter))

module Provider = {
  let make = React.Context.provider(userProfileContext)
}

@react.component
let make = (~children) => {
  let (state, setState) = React.useState(_ => bootUpUserProfile)
  let setState' = React.useCallback1(val => {
    setState(_ => val)
  }, [setState])

  <Provider value=(state, setState')> children </Provider>
}
