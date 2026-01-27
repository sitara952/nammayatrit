open ReactNative
open Tailwind

@react.component
let make = (
  ~estimateFareBreakup: array<FareBreakupHelper.estimateFareBreakupItem>=[],
  ~dismissPopup=_ => (),
) => {
  <View style={tw(" w-full bg-fillNeutralWhite rounded-t-3xl")}>
    <View style={tw(" flex-col items-center mb-10")}>
      <View style={tw(" flex-row justify-between items-center py-5 px-4 w-full ")}>
        <TextWrapper text={PRICING_BRIDGE_MINI} textType={Head_800} />
        <IconButton onPress={_ => dismissPopup()} icon={Cancel.svg} backgroundColor="#F1F2F7" />
      </View>
      <View style={tw("border-t border-fillNeutralMid w-[92%]")} />
      <View style={tw(" flex-col items-start w-full p-4 justify-start ")}>
        <FlatList
          data={estimateFareBreakup}
          showsHorizontalScrollIndicator=false
          keyExtractor={(_, i) => i->Int.toString}
          horizontal=false
          renderItem={({item, _}) =>
            <View style={tw("")}>
              <View style={tw("flex-row justify-between w-full py-2")}>
                <TextWrapper text={item.key} textType={Body_400} />
                <View style={tw("flex-row")}>
                  <TextWrapper
                    text={CUSTOM_TEXT({
                      text: if item.value.amount == 0.0 {
                        "-"
                      } else {
                        item.value.currency ++ Js.Float.toFixed(item.value.amount)
                      },
                    })}
                    textType={Body_600}
                  />
                  <TextWrapper
                    text={item.value.amount == 0.0 ? CUSTOM_TEXT({text: ""}) : item.value.end}
                    textType={Body_600}
                  />
                </View>
              </View>
            </View>}
        />
      </View>
      <View style={tw("border-t-[0.5px] border-fillNeutralMid w-[92%] mb-4")} />
      <TextWrapper
        text={DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(
          Constants.multiplier,
          Constants.nightChargesFrom,
          Constants.nightChargesTill,
        )}
        textType={SBody_600}
      />
    </View>
  </View>
}
