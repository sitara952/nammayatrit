open ReactNavigation

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  let (_, setNavigationState) = React.useContext(NavigationStateContext.navigationStateContext)

  <ScreenWrapperWithSafeArearViewAndPadding>
    <TextWrapper textType={Title_900} text={ENTER_OTP_SCREEN} />
    <CustomButton
      text="Go to enter CustomerOnboarding"
      onPress={_ => {
        setNavigationState(_ => CustomerOnboarding)
      }}
    />
  </ScreenWrapperWithSafeArearViewAndPadding>
}
