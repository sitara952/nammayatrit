open ReactNative
open Style
open LocaleStringType

@react.component
let make = () => {
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)

  <View
    style={Style.viewStyle(
      ~width=100.->pct,
      ~borderTopLeftRadius=20.,
      ~borderTopRightRadius=20.,
      ~backgroundColor="#ffffff",
      ~alignItems=#center,
      ~alignSelf=#center,
      (),
    )}>
    <View
      style={Style.viewStyle(
        ~alignItems=#center,
        ~justifyContent=#center,
        ~paddingTop=24.->dp,
        (),
      )}>
      <Image
        source={Image.Source.fromRequired(
          Packager.require("../../../resources/assets/png/no-car-avialable.png"),
        )}
        style={imageStyle(~width=162.88->dp, ~height=101.->dp, ())}
      />
    </View>
    <View
      style={viewStyle(
        ~alignItems=#center,
        ~justifyContent=#center,
        ~paddingLeft=16.->dp,
        ~paddingRight=16.->dp,
        ~paddingBottom=22.->dp,
        ~paddingTop=22.->dp,
        ~flexDirection=#column,
        (),
      )}>
      <View
        style={Style.viewStyle(
          ~alignItems=#center,
          ~justifyContent=#center,
          ~paddingBottom=10.->dp,
          (),
        )}>
        <TextWrapper
          text={NO_CAR_AVAILABLE} textType=Head_800 color=ThemebasedStyle.colorClass.textBlack
        />
      </View>
      <View
        style={Style.viewStyle(
          ~alignItems=#center,
          ~justifyContent=#center,
          ~alignContent=#center,
          (),
        )}>
        <TextWrapper
          text=IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA
          color=ThemebasedStyle.colorClass.textHigh
          textType={Body_600}
          overRideStyle={textStyle(~textAlign=#center, ())}
        />
      </View>
    </View>
    <View
      style={Style.viewStyle(
        ~alignItems=#center,
        ~justifyContent=#center,
        ~paddingLeft=16.->dp,
        ~paddingRight=16.->dp,
        ~paddingBottom=16.->dp,
        (),
      )}>
      <CustomButton
        buttonSize={Medium}
        backgroundColor="#171723"
        text=GetLocale.getLocale(GO_HOME).text
        onPress={_ => {
          rideFlowAction(UpdateStage(HomeScreen))
        }}
      />
    </View>
  </View>
}
