open ReactNative
open Style
open Tailwind

module RideCancelled = {
  @react.component
  let make = () => {
    <View style={tw("h-25px px-8px pt-4px pb-5px rounded-[22px] bg-fillNegativeLow")}>
      <TextWrapper
        color=ThemebasedStyle.colorClass.textNegative
        overRideStyle={tw("text-xs")}
        text=CUSTOM_TEXT({text: "Cancelled"})
        textType={Body_400}
      />
    </View>
  }
}

module RideActive = {
  @react.component
  let make = () => {
    <View
      style={tw(
        "h-38px rounded-t-3xl absolute bottom-34 left-0 w-full items-center bg-fillPositiveHigh",
      )}>
      <TextWrapper
        color=ThemebasedStyle.colorClass.textWhite
        overRideStyle={tw("mt-1")}
        text=CUSTOM_TEXT({text: "Active Ride"})
        textType={SBody_600}
      />
    </View>
  }
}

module RideDetail = {
  @react.component
  let make = (~date, ~time, ~amount, ~isRideCancelled, ~cabType, ~currency) => {
    let source = VehicleHelper.getVehicleImageName(cabType)
    <View style={tw("flex-row items-center  justify-between")}>
      <View style={tw("flex-row items-center")}>
        <View style={tw("h-32px w-56px  mr-12px")}>
          <Image source style={imageStyle(~height=32.->dp, ~width=60.->dp, ())} />
        </View>
        <View style={tw("flex-col justify-start items-start ")}>
          <View style={tw("flex-row gap-6px justify-center items-center mb-4px")}>
            <TextWrapper
              text={CUSTOM_TEXT({text: date})}
              textType={SBody_600}
              color=ThemebasedStyle.colorClass.textBlack
            />
            <View style={tw("w-4px h-4px opacity-50 rounded-full bg-fillNeutralBlack")} />
            <TextWrapper
              text={CUSTOM_TEXT({text: time})}
              textType={SBody_600}
              color=ThemebasedStyle.colorClass.textBlack
            />
          </View>
          <View style={tw("rounded px-6px py-4px bg-fillPrimaryLow")}>
            <TextWrapper
              text=CUSTOM_TEXT({text: cabType})
              textType={Cap_700}
              color=ThemebasedStyle.colorClass.textHigh
            />
          </View>
        </View>
      </View>
      {isRideCancelled
        ? <RideCancelled />
        : <TextWrapper
            color=ThemebasedStyle.colorClass.textBlack
            text=CUSTOM_TEXT({text: {currency ++ amount->Int.toString}})
            textType={Title_800}
          />}
    </View>
  }
}

module FromToDetail = {
  @react.component
  let make = (~source, ~destination) => {
    <>
      <View style={tw("border-borderNeutralMid border-t")} />
      <View style={tw("flex-row gap-5px")}>
        <View style={tw("w-17px h-45px justify-start")}>
          <Svg.SvgXml xml=VerticalArrow.svg />
        </View>
        <View style={tw("gap-12px pr-6px")}>
          <TextWrapper
            text=CUSTOM_TEXT({text: source})
            textType={SBody_600}
            truncate={Ellipsize(#tail)}
            color=ThemebasedStyle.colorClass.textHigh
          />
          <TextWrapper
            text=CUSTOM_TEXT({text: destination})
            textType={SBody_600}
            truncate={Ellipsize(#tail)}
            color=ThemebasedStyle.colorClass.textHigh
          />
        </View>
      </View>
    </>
  }
}

@react.component
let make = (
  ~isRideCancelled=false,
  ~isRideActive=false,
  ~date="",
  ~time="",
  ~source="",
  ~destination="",
  ~onlyShowRideDetail=false,
  ~onlyShowFromTo=false,
  ~amount=0,
  ~currency="$",
  ~cabType="Auto",
  ~overRideStyle="",
) => {
  <ScreenWrapperWithSafeArearViewAndPadding paddingHorizontal={0.->dp}>
    <View>
      {isRideActive ? <RideActive /> : React.null}
      <View
        style={tw(
          "bg-[#FCFCFD] flex-col gap-16px border-borderNeutralMid border p-16px " ++ (
            isRideActive ? "rounded-b-2xl mt-5 " : "rounded-2xl " ++ overRideStyle
          ),
        )}>
        {onlyShowFromTo
          ? React.null
          : <RideDetail date time isRideCancelled amount cabType currency />}
        {onlyShowRideDetail ? React.null : <FromToDetail source destination />}
      </View>
    </View>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
