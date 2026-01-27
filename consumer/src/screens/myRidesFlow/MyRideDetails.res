open ReactNative
open Tailwind
open ReactNavigation

module RideDetailsInfoPill = {
  @react.component
  let make = (
    ~title="",
    ~subTitle="",
    ~overRideTitleStyle="",
    ~overRideSubTitleStyle="",
    ~onPress=_ => (),
    ~iconRight=React.null,
    ~iconLeft=React.null,
  ) => {
    <View style={tw("gap-7px")}>
      <TextWrapper
        text={CUSTOM_TEXT({text: title})}
        textType={SBody_600}
        color=ThemebasedStyle.colorClass.textMid
        overRideStyle={tw(overRideTitleStyle)}
      />
      <TouchableOpacity onPress style={tw("flex-row items-center disabled:")}>
        iconLeft
        <TextWrapper
          text={CUSTOM_TEXT({text: subTitle})}
          textType={Body_600}
          color=ThemebasedStyle.colorClass.textBlack
          overRideStyle={tw(overRideSubTitleStyle)}
        />
        iconRight
      </TouchableOpacity>
    </View>
  }
}

module RideDetail = {
  @react.component
  let make = (~rideDetail: MyRidesScreenType.rideDetail) => {
    let distanceUnitToString = (distanceUnit: RideBooking.distanceUnit) => {
      switch distanceUnit {
      | Meter => "m"
      | Mile => "Mile"
      | Yard => "Yard"
      | Kilometer => "Km"
      }
    }

    let convertToMiles = (distance, unit) => {
      if distance < Constants.mile_to_Meter_distance {
        distance->Int.toString ++ " " ++ distanceUnitToString(unit)
      } else {
        (distance->Int.toFloat *. 0.000621371)->Float.toInt->Int.toString ++ " Mile"
      }
    }

    <View style={tw("p-16px gap-24px border border-borderNeutralLow rounded-2xl")}>
      {rideDetail.rideStatus == RideBooking.RideStatus.CANCELLED
        ? <RideDetailsInfoPill
            title="Ride Id"
            subTitle=rideDetail.shortRideId
            iconRight={<View style={tw("ml-4px")}>
              <Svg.SvgXml xml=CopyContent.svg width="20" height="20" />
            </View>}
            onPress={_ => ClipboardModule.copyToClipboard(~text=rideDetail.shortRideId)}
          />
        : <View style={tw("flex-row  gap-24px ")}>
            <View style={tw("flex-col w-6/12 gap-24px  ")}>
              <RideDetailsInfoPill title="Vehicle Model" subTitle={rideDetail.vehicleModel} />
              <RideDetailsInfoPill
                title="Ride Distance"
                subTitle={convertToMiles(
                  rideDetail.distanceWithUnit.value->Float.toInt,
                  rideDetail.distanceWithUnit.unit,
                )}
              />
              <RideDetailsInfoPill
                title="Payment Method"
                subTitle="••••3919"
                iconLeft={<Image
                  source={Image.Source.fromRequired(
                    Packager.require("../../resources/assets/png/payment-icons/mastercard.png"),
                  )}
                  style={tw("w-40px h-25px")}
                />}
              />
              <RideDetailsInfoPill
                title="Your Rating"
                subTitle="Add Now"
                overRideSubTitleStyle={"text-textPrimary Body_700"}
              />
            </View>
            <View style={tw("flex-col gap-24px ")}>
              <RideDetailsInfoPill title="Driver" subTitle=rideDetail.driverName />
              {
                let (duration, durationUnit) = Utils.fetchTime(
                  rideDetail.estimatedDuration->Option.getOr(0),
                )
                <RideDetailsInfoPill
                  title=GetLocale.getLocale(RIDE_TIME).text
                  subTitle={duration ++ " " ++ durationUnit}
                />
              }
              <RideDetailsInfoPill
                title="Ride Id"
                subTitle=rideDetail.shortRideId
                iconRight={<View style={tw("ml-4px")}>
                  <Svg.SvgXml xml=CopyContent.svg width="20" height="20" />
                </View>}
                onPress={_ => ClipboardModule.copyToClipboard(~text=rideDetail.shortRideId)}
              />
              <RideDetailsInfoPill
                title="Driver Tip"
                subTitle="Add Now"
                overRideSubTitleStyle={"text-textPrimary Body_700"}
              />
            </View>
          </View>}
    </View>
  }
}

module DateAndLocation = {
  @react.component
  let make = (~dateAndTime, ~location: MyRidesScreenType.locationInfo) => {
    <View style={tw("flex-col justify-start items-start ")}>
      <View style={tw("flex-row gap-6px justify-center items-center mb-4px ")}>
        <TextWrapper
          text={CUSTOM_TEXT({text: dateAndTime})}
          textType={SBody_600}
          color=ThemebasedStyle.colorClass.textBlack
        />
      </View>
      <View style={tw("pr-20px")}>
        <TextWrapper
          color=ThemebasedStyle.colorClass.textBlack
          numberOfLines=1
          truncate={Ellipsize(#tail)}
          text=CUSTOM_TEXT({
            text: location.ward,
          })
          textType={SBody_400}
        />
        <View style={tw("h-2px")} />
        <TextWrapper
          color=ThemebasedStyle.colorClass.textHigh
          truncate={Ellipsize(#tail)}
          text=CUSTOM_TEXT({
            text: location.address,
          })
          textType={SBody_400}
        />
      </View>
    </View>
  }
}

module FromToMap = {
  @react.component
  let make = (~source, ~destination, ~rideStartTimeInfo, ~rideEndTimeInfo, ~isRideCancelled) => {
    let rideStartDate = DateAndTimeHelpers.getISTWithFormat(
      rideStartTimeInfo->Option.getOr(""),
      "ddd, DD MMM",
    )
    let rideStartTime = DateAndTimeHelpers.getISTWithFormat(
      rideStartTimeInfo->Option.getOr(""),
      "hh:mm A",
    )
    let rideEndDate = DateAndTimeHelpers.getISTWithFormat(
      rideEndTimeInfo->Option.getOr(""),
      "ddd, DD MMM",
    )
    let rideEndTime = DateAndTimeHelpers.getISTWithFormat(
      rideEndTimeInfo->Option.getOr(""),
      "hh:mm A",
    )

    <View style={tw("flex-row")}>
      <Image
        source={Image.Source.fromRequired(
          Packager.require("../../resources/assets/png/down-arrow-long.png"),
        )}
        style={tw("mr-9px mt-4px")}
      />
      <View style={tw("gap-24px")}>
        <DateAndLocation
          dateAndTime={isRideCancelled ? "Pickup" : rideStartTime ++ " . " ++ rideStartDate}
          location=source
        />
        <DateAndLocation
          dateAndTime={isRideCancelled ? "Drop" : rideEndTime ++ " . " ++ rideEndDate}
          location=destination
        />
      </View>
    </View>
  }
}

module NextButton = {
  @react.component
  let make = (~icon, ~title, ~onPress=_ => ()) => {
    <TouchableOpacity onPress>
      <View style={tw("p-16px rounded-t-2xl ")}>
        <View style={tw("flex-row justify-between items-center")}>
          <View style={tw("flex-row gap-12px")}>
            icon
            <TextWrapper
              text={CUSTOM_TEXT({text: title})}
              textType={Body_600}
              color=ThemebasedStyle.colorClass.textBlack
            />
          </View>
          <View>
            <Svg.SvgXml xml=ChevronRight.svg />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation, ~route) => {
  let rideData: option<MyRidesScreenType.rideDetail> = switch route.params {
  | Some(a) => Some(Core.Params.unsafeGetValue(a)["data"])
  | None => None
  }

  let onBackPressed = _ => {
    Core.Navigation.goBack(navigation, ())
  }

  let goToInvoiceScreen = (rideDetail: MyRidesScreenType.rideDetail) => {
    Core.Navigation.navigateWithParams(
      navigation,
      AppRoutes.navigationRouts.invoiceScreen,
      {
        "data": rideDetail,
      },
    )
  }

  switch rideData {
  | Some(rideDetail) =>
    let isRideCancelled = rideDetail.rideStatus == RideBooking.RideStatus.CANCELLED
    <View style={tw("bg-white h-full flex-col")}>
      <HeaderWithSafeArea
        title={RIDE_DETAILS} onBackPress=onBackPressed backgroundColor="bg-fillPrimaryLow"
      />
      <ScrollView style={tw("flex-col flex-1 px-16px")}>
        <View style={tw("mb-16px mt-20px")}>
          <RideDetailCard
            onlyShowRideDetail=true
            date={DateAndTimeHelpers.getISTWithFormat(
              rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
              "ddd, DD MMM",
            )}
            time={DateAndTimeHelpers.getISTWithFormat(
              rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
              "hh:mm A",
            )}
            amount={rideDetail.computedPrice->Option.getOr(0)}
            currency=rideDetail.currency
            cabType={rideDetail.vehicleVariant}
            isRideCancelled
            overRideStyle="border-borderNeutralLow"
          />
        </View>
        <View style={tw("mb-16px")}>
          <RideDetail rideDetail />
        </View>
        <View style={tw("mb-16px")}>
          <View style={tw("p-16px border border-borderNeutralLow rounded-2xl gap-16px flex-col")}>
            <FromToMap
              isRideCancelled
              source=rideDetail.sourceLocationInfo
              destination=rideDetail.destinationLocationInfo
              rideStartTimeInfo=rideDetail.rideStartTime
              rideEndTimeInfo=rideDetail.rideEndTime
            />
          </View>
        </View>
        <View style={tw("border border-borderNeutralLow rounded-2xl flex-col mb-16px")}>
          {isRideCancelled
            ? React.null
            : <NextButton
                onPress={_ => goToInvoiceScreen(rideDetail)}
                title="View Driver Receipt"
                icon={<Image
                  source={Image.Source.fromRequired(
                    Packager.require("../../resources/assets/png/invoice-logo.png"),
                  )}
                />}
              />}
          {isRideCancelled
            ? React.null
            : <View style={tw("border-t border-borderNeutralLow mx-16px")} />}
          <NextButton
            title="Help and Support"
            icon={<Image
              source={Image.Source.fromRequired(
                Packager.require("../../resources/assets/png/help-support-icon.png"),
              )}
            />}
          />
        </View>
      </ScrollView>
    </View>
  | None =>
    <HeaderWithSafeArea
      title={RIDE_DETAILS} onBackPress=onBackPressed backgroundColor="bg-fillPrimaryLow"
    />
  }
}
