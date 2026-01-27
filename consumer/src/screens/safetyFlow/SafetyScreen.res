open ReactNavigation
open AppRoutes

include Stack.Make()
@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  <Navigator
    initialRouteName=navigationRouts.selectContact
    screenOptions={_ => {
      headerShown: false,
    }}>
    <Screen name=navigationRouts.selectContact>
      {({navigation, route}) => <SelectContact navigation route />}
    </Screen>
    <Screen name=navigationRouts.safetySetup>
      {({navigation, route}) => <SafetySetup navigation route />}
    </Screen>
    <Screen name=navigationRouts.trustedContacts>
      {({navigation, route}) => <TrustedContacts navigation route />}
    </Screen>
    <Screen name=navigationRouts.rideVerification>
      {({navigation, route}) => <RideVerification navigation route />}
    </Screen>
  </Navigator>
}
