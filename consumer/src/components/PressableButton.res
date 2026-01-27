open ReactNative
open Tailwind
open Style

@react.component
let make = (
  ~onPress=() => (),
  ~backgroundColor=`ctaPrimaryActive`,
  ~borderColor=?,
  ~text,
  ~textType=TextWrapper.SHead_700,
  ~overRideStyle=tw(``),
  ~textColor=ThemebasedStyle.colorClass.textWhite,
) => {
  let borderColor' = switch borderColor {
  | Some(color) => color
  | None => backgroundColor
  }

  <PressableComponent
    onPress={_ => onPress()}
    style={array([
      tw(`bg-${backgroundColor} py-4 rounded-2xl`),
      overRideStyle,
      tw(`border-[1px] border-${borderColor'}`),
    ])}>
    <TextWrapper text textType overRideStyle={tw(`text-center`)} color=textColor />
  </PressableComponent>
}
