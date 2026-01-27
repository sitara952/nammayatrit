open Reanimated
open ReactNative
open Style
open Tailwind

@react.component
let make = (~size: option<string>=?, ~icon: React.component<unit>) => {
  <ReanimatedView style={array([tw(size->Option.getOr("h-4")), viewStyle(~aspectRatio=1.0, ())])}>
    {icon()}
  </ReanimatedView>
}
