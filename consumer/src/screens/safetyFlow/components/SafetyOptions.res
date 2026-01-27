open ReactNative
open Reanimated
open Tailwind

type safetyOption = {
  action: unit => unit,
  icon: ReactNative.Image.Source.t,
  iconBackgroundColor: string,
  text: LocaleStringType.localeString,
  textColor: string,
}

@react.component
let make = (
  ~closeSafetyModal,
  ~openCallSupportPopUp,
  ~openEmergencyAssistancePopUp,
  ~openShareRideInfo,
) => {
  let theme = ThemebasedStyle.useThemeBasedStyle()

  let safetyOptions: array<safetyOption> = [
    {
      action: () => openCallSupportPopUp(),
      icon: Image.Source.fromRequired(
        Packager.require("../../../resources/assets/png/chat_filled.png"),
      ),
      iconBackgroundColor: theme.headerBgColor,
      text: CALL_CUSTOMER_SUPPORT,
      textColor: ThemebasedStyle.colorClass.textBlack,
    },
    {
      action: () => openShareRideInfo(),
      icon: Image.Source.fromRequired(
        Packager.require("../../../resources/assets/png/share_filled.png"),
      ),
      iconBackgroundColor: theme.headerBgColor,
      text: RIDE_SHARE_INFO,
      textColor: ThemebasedStyle.colorClass.textBlack,
    },
    {
      action: () => openEmergencyAssistancePopUp(),
      icon: Image.Source.fromRequired(
        Packager.require("../../../resources/assets/png/emergency_filled.png"),
      ),
      iconBackgroundColor: "#E5545415",
      text: EMERGENCY_ASSISTANCE,
      textColor: ThemebasedStyle.colorClass.textNegative,
    },
  ]

  let optionView = (item: safetyOption, index: int) => {
    <View
      style={tw(`my-1.5 rounded-md border-borderNeutralMid border-[1px]`)}
      key={string_of_int(index)}>
      <PressableComponent
        style={tw("px-4 py-3 flex-row justify-between")} onPress={_ => item.action()}>
        <View style={tw("flex-row gap-3")}>
          <View style={tw(`px-3 py-3 rounded-full bg-[${item.iconBackgroundColor}]`)}>
            <Image source=item.icon style={tw(`w-4 h-3.5 self-center`)} />
          </View>
          <TextWrapper
            overRideStyle={tw(`self-center`)}
            color=item.textColor
            textType={Body_600}
            text=item.text
          />
        </View>
        <View style={tw("self-center")}>
          <ReanimatedView style={tw("h-4 w-4")}>
            <ArrowRight fill="black" />
          </ReanimatedView>
        </View>
      </PressableComponent>
    </View>
  }

  <TouchableWithoutFeedback onPress={_ => ()}>
    <PopUpModal
      popUpModalType=PopUpModal.PopUp2({
        title: SAFETY_TOOLS,
        onClose: Some(closeSafetyModal),
        children: {
          <View>
            {safetyOptions
            ->Array.mapWithIndex((item, index) => optionView(item, index))
            ->React.array}
          </View>
        },
        button1: None,
        button2: None,
      })
    />
  </TouchableWithoutFeedback>
}
