open ReactNative
open RideTrackScreenType
open Tailwind

@react.component
let make = (~vehicleDetail, ~rideStatus, ~destinationLocationInfo) => {
  let splitAtFirstDigit = s => {
    let rec findFirstDigitIndex = idx => {
      if idx >= String.length(s) {
        -1
      } else {
        switch String.get(s, idx) {
        | Some("0" | "1" | "2" | "4" | "5" | "6" | "7" | "8" | "9") => idx
        | Some(_) => findFirstDigitIndex(idx + 1)
        | None => -1
        }
      }
    }
    let index = findFirstDigitIndex(0)
    if index == -1 {
      (s, "")
    } else {
      (
        String.substring(s, ~start=0, ~end=index),
        String.substring(s, ~start=index, ~end=String.length(s) - index),
      )
    }
  }

  <View style={tw("flex-row justify-between  pt-1.5 rounded-br-[36px] overflow-hidden")}>
    <ScrollView
      horizontal=true
      showsHorizontalScrollIndicator=false
      contentContainerStyle={tw("flex-row items-center justify-between gap-1.5 pr-15px")}>
      {switch rideStatus {
      | Some(RideBooking.RideStatus.INPROGRESS) =>
        <TextWrapper
          color=ThemebasedStyle.colorClass.textMid
          textType={Body_600}
          text=destinationLocationInfo
          overRideStyle={tw("h-5")}
        />

      | _ =>
        <>
          {switch vehicleDetail {
          | Some(detail) =>
            <>
              <View>
                <TextWrapper
                  color=ThemebasedStyle.colorClass.textLow
                  textType={Body_600}
                  text={CUSTOM_TEXT({text: detail.vehColor})}
                />
              </View>
              <View style={tw("mt-0.5")}>
                <Svg.SvgXml xml=Dot.svg width={"3"} height={"3"} />
              </View>
              <View>
                <TextWrapper
                  color=ThemebasedStyle.colorClass.textLow
                  textType={Body_600}
                  text={CUSTOM_TEXT({text: detail.variant})}
                />
              </View>
              <View>
                {
                  let (primaryText, secondaryText) = splitAtFirstDigit(detail.vehicleNumber)
                  <View style={tw("flex-row bg-white bg-opacity-10 rounded-md p-1  gap-1")}>
                    <TextWrapper
                      color=ThemebasedStyle.colorClass.textWhite
                      textType={SBody_600}
                      text={CUSTOM_TEXT({text: primaryText})}
                    />
                    <Svg.SvgXml xml=PlaceMap.svg />
                    <TextWrapper
                      color=ThemebasedStyle.colorClass.textWhite
                      textType={SBody_600}
                      text={CUSTOM_TEXT({text: secondaryText})}
                    />
                  </View>
                }
              </View>
            </>
          | None => React.null
          }}
        </>
      }}
    </ScrollView>
  </View>
}
