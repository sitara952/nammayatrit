open ReactNavigation

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  <ScreenWrapperWithSafeArearViewAndPadding>
    <TextWrapper textType={Title_900} text={RIDE_COMPLETED_SCREEN} />
    <CustomButton
      text="Go to HomeScreen"
      onPress={_ => {
        rideFlowAction(UpdateStage(HomeScreen))
      }}
    />
  </ScreenWrapperWithSafeArearViewAndPadding>
}
