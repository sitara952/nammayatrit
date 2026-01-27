open ReactNavigation
open AppRoutes
open ReactNative
open Style

include Stack.Make()
@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  let initialRouteName = navigationRouts.homeScreen
  <Navigator
    initialRouteName
    screenOptions={_ => {
      headerShown: false,
      cardStyle: {viewStyle(~backgroundColor="transparent", ())},
    }}>
    //todo - had to add more screens
    <Screen name=navigationRouts.homeScreen> {_ => <TypeScriptModules.Home />} </Screen>
    <Group
      screenOptions={_ => {
        headerShown: false,
        presentation: #transparentModal,
      }}>
      <Screen
        name=navigationRouts.rateCard
        options={_ => {
          cardStyle: viewStyle(~backgroundColor="transparent", ()),
        }}>
        {_ => <TypeScriptModules.RateCard />}
      </Screen>
    </Group>
    // screen for confirm pickup
    // estimates
    // search screen
  </Navigator>
}
