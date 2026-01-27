open ReactNative
open Style
open Tailwind

@react.component
let make = (~heading="", ~subHeading="", ~image) => {
  <View style={tw(`mx-4 flex-col rounded-lg justify-center bg-fillNeutralLow`)}>
    <View>
      <Image
        source=image
        style={imageStyle(
          ~width=100.->pct,
          ~height=150.->dp,
          ~overflow=#hidden,
          ~resizeMode=#contain,
          ~alignContent=#center,
          ~borderTopLeftRadius=8.,
          ~borderTopRightRadius=8.,
          (),
        )}
      />
    </View>
    <View style={tw(`px-4 py-3`)}>
      <TextWrapper
        color=ThemebasedStyle.colorClass.textBlack
        textType={Head_800}
        text=CUSTOM_TEXT({text: heading})
      />
      <TextWrapper
        color=ThemebasedStyle.colorClass.textBlack
        textType={Body_600}
        text=CUSTOM_TEXT({text: subHeading})
        overRideStyle={tw(`pt-1.5 text-[#454545]`)}
      />
    </View>
  </View>
}
