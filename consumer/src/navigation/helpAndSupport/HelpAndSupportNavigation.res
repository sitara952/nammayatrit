open ReactNavigation
open AppRoutes

include Stack.Make()
@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  <Navigator
    initialRouteName=navigationRouts.helpAndSupportScreen
    screenOptions={_ => {
      headerShown: false,
    }}>
    <Screen name=navigationRouts.helpAndSupportScreen component=HelpAndSupportScreen.make />
    <Screen name=navigationRouts.reportIssueScreen component=ReportIssueScreen.make />
    <Screen name=navigationRouts.myRidesScreenNavigation>
      {_ => <TypeScriptModules.MyRidesNavigation />}
    </Screen>
    <Screen name=navigationRouts.myRideDetails component=MyRideDetails.make />
  </Navigator>
}
