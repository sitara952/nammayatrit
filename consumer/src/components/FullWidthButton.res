open Reanimated
open Tailwind
open ReactNative
open Style

@react.component
let make = (
  ~text: string,
  ~prefix: option<React.element>=?,
  ~handlePress: Event.pressEvent => unit=_ => (),
  ~hasArrowRight: option<bool>=false,
  ~noBackgroundColor: option<bool>=false,
  ~isDestructive: option<bool>=false,
  ~isButtonDisabled: option<bool>=false,
  ~bgColor: string="",
  ~textColor: string="",
) => {
  let handleButtonPressCallback = React.useCallback(event => {
    // TODO: Add haptic
    // haptic?.();
    handlePress(event)
  }, [handlePress])

  let hasPrefix = switch prefix {
  | Some(_) => true
  | None => false
  }

  let prefixIcon = switch prefix {
  | Some(prefix) => <ReanimatedView style={tw("pb-[2px]")}> {prefix} </ReanimatedView>
  | None => React.null
  }

  <ReanimatedView style={tw("h-[52px]")}>
    <PressableComponent
      disabled={isButtonDisabled}
      onPress={pressEvent => handleButtonPressCallback(pressEvent)}
      style={array([
        tw("h-full flex-row items-center justify-center rounded-[12px]"),
        tw(
          noBackgroundColor
            ? ""
            : isDestructive
            ? "bg-red-50"
            : bgColor->String.length != 0
            ? `bg-[${bgColor}]`
            : "bg-[#171723]",
        ),
        tw(isButtonDisabled ? "bg-[#D7DBE1]" : ""),
      ])}>
      {prefixIcon}
      <TextWrapper
        text={CUSTOM_TEXT({text: text})}
        textType={SBody_600}
        overRideStyle={array([
          tw("text-base font-bold tracking-[0.16px] leading-[22px]"),
          tw(
            isDestructive
              ? "text-[#DB4324]"
              : textColor->String.length != 0
              ? `text-[${textColor}]`
              : noBackgroundColor
              ? "text-[#14171F]"
              : "text-white",
          ),
          tw(hasPrefix ? "pl-1" : ""),
        ])}
      />
    </PressableComponent>
  </ReanimatedView>
}
