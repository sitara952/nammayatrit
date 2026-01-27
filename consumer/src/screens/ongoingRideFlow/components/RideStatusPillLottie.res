open ReactNative
open Style
open Tailwind

@react.component
let make = (~updatedPickupDist, ~distanceUnit, ~rideStatus, ~second, ~isWaiting) => {
  let (showView, setShowView) = React.useState(() => false)

  React.useEffect1(() => {
    setShowView(_ => true)
    let timer = Js.Global.setTimeout(() => setShowView(_ => false), 4000)

    Some(() => Js.Global.clearTimeout(timer))
  }, [rideStatus])

  <>
    <View style={tw("flex-row")}>
      <View style={tw("justify-center")}>
        {switch updatedPickupDist {
        | Some(distance) =>
          if isWaiting == true && second <= 60 {
            <Lottie
              source={Lottie.Source.fromRequired(
                Packager.require("../../../resources/assets/lottie/bridge-to-destination.json"),
              )}
              style={tw(`h-[65px] w-[70px]`)}
              resizeMode=#contain
              autoPlay=true
            />
          } else if isWaiting == true && second > 60 {
            showView
              ? <Lottie
                  source={Lottie.Source.fromRequired(
                    Packager.require("../../../resources/assets/lottie/bridge-to-destination.json"),
                  )}
                  style={tw(`h-[65px] w-[70px]`)}
                  resizeMode=#contain
                  autoPlay=true
                />
              : <View
                  style={tw(
                    "w-15 h-14 rounded-full pt-1.5 bg-fillNegativeLow items-center self-center",
                  )}>
                  {
                    let (timeValue, unit) = Utils.fetchTime(second)
                    <View style={viewStyle(~alignItems=#center, ())}>
                      <TextWrapper text=CUSTOM_TEXT({text: timeValue}) textType={Title_800} />
                      <TextWrapper text=CUSTOM_TEXT({text: unit}) textType={Body_600} />
                    </View>
                  }
                </View>
          } else if showView {
            <Lottie
              source={Lottie.Source.fromRequired(
                Packager.require("../../../resources/assets/lottie/bridge-to-destination.json"),
              )}
              style={tw(`h-[65px] w-[70px]`)}
              resizeMode=#contain
              autoPlay=true
            />
          } else {
            {
              <View style={tw("items-center mt-1.5 ")}>
                <TextWrapper
                  text=CUSTOM_TEXT({text: distance->Float.toString}) textType=SHead_800
                />
                <TextWrapper text=CUSTOM_TEXT({text: distanceUnit}) textType=SBody_700 />
              </View>
            }
          }
        | None =>
          <Text style={tw("items-center justify-center text-4xl mt-2.5")}>
            {React.string("--")}
          </Text>
        }}
      </View>
    </View>
  </>
}
