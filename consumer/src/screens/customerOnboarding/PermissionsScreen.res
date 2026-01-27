open ReactNavigation

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  let (_, setNavigationState) = React.useContext(NavigationStateContext.navigationStateContext)

  <ScreenWrapperWithSafeArearViewAndPadding>
    <TextWrapper textType={Title_900} text={GIVE_PERMISSIONS} />
    <CustomButton
      text="Go to MainApp"
      onPress={_ => {
        setNavigationState(_ => MainApp(HomeScreen, None))
      }}
    />
  </ScreenWrapperWithSafeArearViewAndPadding>
}
