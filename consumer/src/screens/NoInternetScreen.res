open ReactNavigation
open ReactNative
open Style

include Stack.Make()
@module("react-native") @scope("DevSettings")
external reload: unit => unit = "reload"
@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) =>
  <View
    style={viewStyle(
      ~alignItems=#center,
      ~justifyContent=#center,
      ~flex=1.,
      ~marginTop=24.->dp,
      ~backgroundColor={"#FFFFFF"},
      ~borderTopLeftRadius=16.,
      ~borderTopRightRadius=16.,
      ~paddingHorizontal=16.->dp,
      ~paddingVertical=24.->dp,
      (),
    )}>
    <Svg.SvgXml xml=LocationUnserviceableImage.svg />
    <Space height=16. />
    <TextWrapper
      text={OFFLINE}
      overRideStyle={textStyle(~color="#454545", ~textAlign=#center, ())}
      textType={Title_800}
    />
    <TextWrapper
      text={CHECK_INTERNET}
      overRideStyle={textStyle(~color="#454545", ~textAlign=#center, ())}
      textType={Body_700}
    />
    <Space height=8. />
    <Space height=24. />
    <CustomButton
      backgroundColor="#171723"
      text={GetLocale.getLocale(TRY_AGAIN).text}
      textType={SHead_700}
      onPress={_ => {
        reload()
      }}
      useFlex=true
      borderRadius=12.
      buttonSize=Large
      rightIcon={NoIcon}
    />
  </View>

let noInternetScreen = make
