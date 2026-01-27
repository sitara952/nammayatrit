open ReactNative
open ReactNavigation
open Tailwind

module TotalFare = {
  @react.component
  let make = (~rideDetail: MyRidesScreenType.rideDetail) => {
    let date = {
      DateAndTimeHelpers.getISTWithFormat(
        rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
        "ddd, DD MMM",
      )
    }
    let time = {
      DateAndTimeHelpers.getISTWithFormat(
        rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
        "hh:mm A",
      )
    }
    let amount = rideDetail.computedPrice->Option.getOr(0)->Int.toString
    let currency = rideDetail.currency

    <>
      <View style={tw("gap-8px border-b border-[#E5E7EB] pb-20px")}>
        <View style={tw("flex-row gap-8px justify-start items-center")}>
          <TextWrapper
            text={CUSTOM_TEXT({text: date})}
            textType={SBody_600}
            color=ThemebasedStyle.colorClass.textHigh
          />
          <View style={tw("w-4px h-4px opacity-50 bg-[#5B6777] rounded-full")} />
          <TextWrapper
            text={CUSTOM_TEXT({text: time})}
            textType={SBody_600}
            color=ThemebasedStyle.colorClass.textHigh
          />
        </View>
        <View style={tw("flex-row")}>
          <TextWrapper
            text={CUSTOM_TEXT({text: "Total Paid"})}
            textType={Title_800}
            overRideStyle={tw("flex-1")}
            color=ThemebasedStyle.colorClass.textBlack
          />
          <TextWrapper
            text={CUSTOM_TEXT({text: currency ++ amount})}
            textType={Title_800}
            color=ThemebasedStyle.colorClass.textBlack
          />
        </View>
      </View>
    </>
  }
}

module FareInfo = {
  @react.component
  let make = (~fareInfo: RideBooking.fareBreakupAPIEntity) => {
    let amount = fareInfo.amountWithCurrency.amount->Int.toString
    let currency = CurrencyHelper.getCurrencyFromType(fareInfo.amountWithCurrency.currency)
    <>
      <View style={tw("flex-row")}>
        <TextWrapper
          text={MyRidesScreenType.getFareDescription(fareInfo.description)}
          textType={Body_600}
          overRideStyle={tw("flex-1")}
          color=ThemebasedStyle.colorClass.textHigh
        />
        <TextWrapper
          text={CUSTOM_TEXT({text: currency ++ amount})}
          textType={Body_600}
          color=ThemebasedStyle.colorClass.textHigh
        />
      </View>
    </>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation, ~route) => {
  let (userProfile, _) = React.useContext(UserProfileContext.userProfileContext)
  let userName =
    userProfile.firstName->Option.getOr("User") ++ " " ++ userProfile.lastName->Option.getOr("")

  let rideData: option<MyRidesScreenType.rideDetail> = switch route.params {
  | Some(rideDetail) => Some(Core.Params.unsafeGetValue(rideDetail)["data"])
  | None => None
  }
  let fareBreakup = switch rideData {
  | Some(rideDetail) => rideDetail.fareBreakup
  | None => []
  }

  let customerTipPresent =
    Array.length(fareBreakup->Array.filter(v => v.description == "Post Ride Tip")) != 0

  let waitingChargesPresent = false
  //Array.length(fareBreakup->Array.filter(v => v.description == "WAITING_OR_PICKUP_CHARGES")) != 0

  let pdf = async (rideDetail: MyRidesScreenType.rideDetail) => {
    let date = {
      DateAndTimeHelpers.getISTWithFormat(
        rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
        "YYYYDDMM",
      )
    }
    let time = DateAndTimeHelpers.getISTWithFormat(
      rideDetail.rideStartTime->Option.getOr(""),
      "HHMM",
    )
    if Platform.os == #android {
      await PermissionHelpers.getPermission("post notification")
      await PermissionHelpers.getPermission("write external storage")
    }
    await PdfGenerator.convert({
      html: PdfFormat.pdf(
        rideDetail,
        userName,
        waitingChargesPresent,
        customerTipPresent,
        MyRidesScreenType.getHTMLFares(fareBreakup),
      ),
      fileName: `Invoice_${date}_${time}`,
      base64: false,
      height: 1050.,
      width: 750.,
    })
  }

  switch rideData {
  | Some(rideDetail) =>
    <>
      <View style={tw("bg-white h-full flex-col")}>
        <HeaderWithSafeArea
          title={INVOICE}
          onBackPress={_ => Core.Navigation.goBack(navigation, ())}
          backgroundColor="bg-fillPrimaryLow"
          overRideStyle="border-b border-borderNeutralMid"
        />
        <ScrollView>
          <View style={tw("bg-fillPrimaryLow px-16px pt-20px")}>
            <TotalFare rideDetail />
            <View style={tw("gap-32px pt-20px pb-20px")}>
              {fareBreakup
              ->Array.mapWithIndex((item, index) =>
                <View key={index->Int.toString}>
                  <FareInfo fareInfo=item />
                </View>
              )
              ->React.array}
            </View>
          </View>
          <View style={tw("flex-row border-t border-borderPrimaryLow")}>
            <Svg.SvgXml xml=InvoiceLine.svg />
            <Svg.SvgXml xml=InvoiceLine.svg />
          </View>
          <View style={tw("pt-12px pb-16px px-16px mt-12px gap-12px")}>
            {customerTipPresent
              ? <TextWrapper
                  text={CUSTOMER_TIP_INFO}
                  textType={SBody_400}
                  color=ThemebasedStyle.colorClass.textMid
                />
              : React.null}
            {waitingChargesPresent
              ? <TextWrapper
                  text={WAIT_CHARGE_INFO}
                  textType={SBody_400}
                  color=ThemebasedStyle.colorClass.textMid
                />
              : React.null}
          </View>
        </ScrollView>
        <View style={tw("mb-38px px-16px bg-transparent")}>
          <CustomButton
            text="Download PDF"
            textType={SHead_700}
            overRideStyle={tw("bg-ctaPrimaryActive text-textWhite h-50px rounded-lg")}
            onPress={_ => pdf(rideDetail)->ignore}
          />
        </View>
      </View>
    </>
  | None => React.null
  }
}
