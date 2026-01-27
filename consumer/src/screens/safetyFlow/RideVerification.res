open ReactNavigation
open ReactNative
open Tailwind

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let (rideVerificationStatus, setRideVerificationStatus) = React.useState(_ => true)

  <View style={tw(`flex-col justify-between h-full w-full bg-white`)}>
    <View>
      <HeaderWithSafeArea
        title=RIDE_VERIFICATION
        onBackPress={_ => {
          navigation->Core.Navigation.goBack()
        }}
        backgroundColor="bg-fillPrimaryLow"
      />
      <View
        style={tw(`mx-4 my-5 px-4 py-4.5 flex-col rounded-2xl border-[1px] border-borderNeutralMid bg-ctaSecondaryDisabled justify-start`)}>
        <View style={tw(`flex-row items-center justify-between`)}>
          <View style={tw(`flex-row items-center`)}>
            <View style={tw(`flex-col`)}>
              <TextWrapper
                textType={Body_700}
                text=USE_PIN_TO_VERIFY_RIDE
                color=ThemebasedStyle.colorClass.textBlack
              />
            </View>
          </View>
          <PressableComponent
            onPress={_ => setRideVerificationStatus(_ => !rideVerificationStatus)}
            style={
              let backgroundColor = rideVerificationStatus ? `fillPositiveHigh` : `fillNeutralMid`
              tw(`bg-${backgroundColor} h-6 w-10.5 rounded-2xl justify-center`)
            }>
            <View
              style={
                let togglePosition = rideVerificationStatus ? `self-end` : `self-start`
                tw(`rounded-full h-5 w-5 bg-white m-0.5 ${togglePosition}`)
              }
            />
          </PressableComponent>
        </View>
        <TextWrapper
          textType={Body_600}
          text=REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES
          color=ThemebasedStyle.colorClass.textHigh
          overRideStyle={tw(`mt-4`)}
        />
      </View>
    </View>
    <PressableButton
      text=DONE
      backgroundColor={`ctaPrimaryActive`}
      textColor=ThemebasedStyle.colorClass.textWhite
      overRideStyle={tw(`rounded-lg m-4`)}
      onPress={() => {
        ()
      }}
    />
  </View>
}
