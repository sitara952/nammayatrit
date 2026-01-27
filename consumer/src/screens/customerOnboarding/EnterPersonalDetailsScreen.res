open ReactNavigation

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  <ScreenWrapperWithSafeArearViewAndPadding>
    <TextWrapper textType={Title_900} text=ENTER_PERSONAL_DETAILS />
    <CustomButton
      text="Go to Permission Screen"
      onPress={_ => {
        Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.checkPermissions)
      }}
    />
  </ScreenWrapperWithSafeArearViewAndPadding>
}
