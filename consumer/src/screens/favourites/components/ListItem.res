open ReactNative
open Reanimated
open Style
open Tailwind

@react.component
let make = (~index: int, ~listLength: int, ~item: FavouriteFlowTypes.listItemType) => {
  //   If icon is present we render it or a fallback icon is set
  let iconElement = switch item.locationIcon {
  | Some(icon) => <ReanimatedView> {icon} </ReanimatedView>
  | None => <IconWrapper icon={() => <LocationPinIcon fill="#F84A4A" />} size="h-4" />
  }

  <Pressable
    onPress={_ => item.handlePress()}
    style={interactionState =>
      array([
        tw("px-4"),
        interactionState.pressed
          ? tw(
              `bg-borderNeutralLow ${index === 0 ? "rounded-t-[13px]" : ""} ${index ===
                  listLength - 1
                  ? "rounded-b-[13px]"
                  : ""}`,
            )
          : tw(""),
      ])}>
    {_ =>
      <ReanimatedView
        style={array([
          tw(`py-4 ${index != listLength - 1 ? "border-b-[1px] border-borderNeutralLow" : ""}`),
        ])}>
        <ReanimatedView style={tw("flex flex-row items-center justify-between")}>
          <ReanimatedView style={tw("flex-row items-start max-w-11/12")}>
            {iconElement}
            <ReanimatedView style={tw("pl-3")}>
              <TextWrapper
                numberOfLines={1}
                text={CUSTOM_TEXT({text: item.uiTitle})}
                textType={SHead_800}
                overRideStyle={tw("text-textBlack")}
              />
              <TextWrapper
                text={CUSTOM_TEXT({text: item.locationAddress})}
                truncate={Ellipsize(#tail)}
                numberOfLines={1}
                textType={SBody_600}
                overRideStyle={tw("text-textHigh pt-1")}
              />
            </ReanimatedView>
          </ReanimatedView>
        </ReanimatedView>
      </ReanimatedView>}
  </Pressable>
}
