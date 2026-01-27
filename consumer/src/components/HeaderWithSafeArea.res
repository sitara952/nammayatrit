open ReactNative
open Style
open Tailwind

@react.component
let make = (
  ~title: LocaleStringType.localeString,
  ~textType=TextWrapper.SHead_700,
  ~textColor=ThemebasedStyle.colorClass.textBlack,
  ~onBackPress=_ => (),
  ~backgroundColor="bg-fillPrimaryLow",
  ~overRideStyle="",
  ~component=?,
) => {
  <>
    <SafeAreaView
      style={tw(`${backgroundColor}`)} collapsable=true needsOffscreenAlphaCompositing=true
    />
    <View style={tw(`flex-col w-full justify-center ${backgroundColor} ` ++ overRideStyle)}>
      <View style={tw("h-24px m-16px flex-row justify-between items-baseline ")}>
        <View style={tw("flex-row gap-16px items-center")}>
          <View style={tw("items-center  w-24px")}>
            <IconButton
              onPress=onBackPress
              height={28.->dp}
              width={28.->dp}
              icon={LeftArrow.svg}
              backgroundColor
            />
          </View>
          <TextWrapper text=title textType={textType} color=textColor />
        </View>
      </View>
      {switch component {
      | Some(comp) => comp
      | None => React.null
      }}
    </View>
  </>
}
