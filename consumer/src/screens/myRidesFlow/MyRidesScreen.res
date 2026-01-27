open ReactNative
open ReactNavigation
open FlatListUtils
open Tailwind
open MyRidesScreenType

module MyRideNoItemView = {
  @react.component
  let make = () => {
    <View style={tw("flex-col gap-17px justify-center items-center mt-144px")}>
      <View style={tw("h-130px w-130px bg-fillPrimaryLow rounded-[30px]")} />
      <TextWrapper
        text={NO_RIDE_HISTORY_AVAILABLE}
        textType={Head_800}
        overRideStyle={tw("text-center")}
        color=ThemebasedStyle.colorClass.textBlack
      />
      <TextWrapper
        text={YOU_HAVE_NOT_TAKEN_A_RIDE_YET}
        textType={Body_600}
        overRideStyle={tw("text-center")}
        color=ThemebasedStyle.colorClass.textBlack
      />
    </View>
  }
}

module MyRideScreenError = {
  @react.component
  let make = () => {
    <View style={tw("flex-col gap-17px justify-center items-center mt-288px")}>
      <TextWrapper
        text={SOMETHING_WENT_WRONG_FETCHING_THE_RIDES}
        textType={Head_800}
        overRideStyle={tw("text-center")}
        color=ThemebasedStyle.colorClass.textBlack
      />
      <TextWrapper
        text={TRY_AGAIN}
        textType={Body_600}
        overRideStyle={tw("text-center")}
        color=ThemebasedStyle.colorClass.textBlack
      />
    </View>
  }
}

module MyRideScreenShimmer = {
  @react.component
  let make = () => {
    <View style={tw("flex flex-col gap-10")}>
      {[1, 2, 3, 4]
      ->Array.map(_ =>
        <View style={tw("flex flex-col gap-6 p-5 h-25 mb-3")}>
          <View style={tw("flex flex-row gap-2")}>
            <ShimmerView isLoading=true height="50" width="80" />
            <View style={tw("flex flex-col gap-2")}>
              <ShimmerView isLoading=true height="20" width="120" />
              <ShimmerView isLoading=true height="20" width="40" />
            </View>
            <View style={tw("mr-10px ml-auto")}>
              <ShimmerView isLoading=true height="40" width="40" />
            </View>
          </View>
          <View style={tw("flex flex-col gap-2")}>
            <ShimmerView isLoading=true height="10" width="240" />
            <ShimmerView isLoading=true height="10" width="240" />
          </View>
        </View>
      )
      ->React.array}
    </View>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)

  let onBackPress = _ => {
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted =>
      Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
    | _ => Core.Navigation.goBack(navigation, ())
    }
  }

  let goToRideDetail = rideDetail => {
    Core.Navigation.navigateWithParams(
      navigation,
      AppRoutes.navigationRouts.myRideDetails,
      {
        "data": rideDetail,
      },
    )
  }

  let navigateToScreen = (rideDetail: MyRidesScreenType.rideDetail) => {
    rideDetail.rideStatus == INPROGRESS || rideDetail.rideStatus == NEW
      ? Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
      : goToRideDetail(rideDetail)
  }

  let renderRideDetail = (~item: option<MyRidesScreenType.rideDetail>) => {
    switch item {
    | Some(rideDetail) =>
      <TouchableOpacity style={tw("my-12px")} onPress={_ => navigateToScreen(rideDetail)}>
        <RideDetailCard
          date={DateAndTimeHelpers.getISTWithFormat(
            rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
            "ddd, DD MMM",
          )}
          time={DateAndTimeHelpers.getISTWithFormat(
            rideDetail.rideStartTime->Option.getOr(rideDetail.createdAt),
            "hh:mm A",
          )}
          amount={rideDetail.computedPrice->Option.getOr(
            rideDetail.estimatedFareWithCurrency.amount,
          )}
          currency=rideDetail.currency
          source=rideDetail.sourceLocationInfo.ward
          destination=rideDetail.destinationLocationInfo.ward
          cabType=rideDetail.vehicleVariant
          isRideActive={rideDetail.rideStatus == INPROGRESS || rideDetail.rideStatus == NEW}
          isRideCancelled={rideDetail.rideStatus == CANCELLED}
        />
      </TouchableOpacity>
    | None => React.null
    }
  }

  let apiCall = async (~offset, ~limit) => {
    let resp = await ApiCall.callGetAPI'(
      ~url=ApiRoutes.apiRoutes.rideBookingList(
        limit->Int.toString,
        offset->Int.toString,
        "false",
        None,
        None,
      ),
    )
    switch resp->JSON.Decode.object {
    | Some(obj) =>
      let rideList = RideBookingList.itemToObjectMapper(obj)
      let listData = rideList.list->Array.map(transformRideBooking)
      {
        data: listData,
        nextCursor: offset + listData->Array.length,
      }
    | None => {
        data: [],
        nextCursor: offset,
      }
    }
  }

  <View style={tw("flex-col flex-1")}>
    <HeaderWithSafeArea title={MY_RIDES} onBackPress backgroundColor="bg-fillPrimaryLow" />
    <View
      style={tw(
        "flex-col h-64px bg-fillPrimaryLow py-12px px-16px justify-center items-center hidden",
      )}>
      <View style={tw("flex-row gap-12px items-center justify-center")}>
        <View
          style={tw(
            "flex-1 h-40px bg-fillNeutralWhite py-12px px-16px flex-row items-center justify-between rounded-[20px]",
          )}>
          <View style={tw("flex-row gap-5px items-center")}>
            <Svg.SvgXml xml=Calendar.svg />
            <TextWrapper
              text={RECENT} textType={SBody_600} color=ThemebasedStyle.colorClass.textBlack
            />
          </View>
          <Svg.SvgXml xml=DownArrow.svg />
        </View>
        <View
          style={tw(
            "flex-1 h-40px bg-fillNeutralWhite py-12px px-16px flex-row items-center justify-between rounded-3xl",
          )}>
          <View style={tw("flex-row gap-5px items-center")}>
            <TextWrapper
              text={ALL_RIDES} textType={SBody_600} color=ThemebasedStyle.colorClass.textBlack
            />
          </View>
          <Svg.SvgXml xml=DownArrow.svg />
        </View>
      </View>
    </View>
    <View style={tw("bg-fillNeutralWhite px-16px flex-1 ")}>
      <FlatListInfiniteQuery
        listItem={renderRideDetail}
        noItemView={<MyRideNoItemView />}
        shimmerViewItem={<MyRideScreenShimmer />}
        errorItem={<MyRideScreenError />}
        apiCall
        apiKey={["myrides"]}
        limit={10}
        isRefreshable=true
      />
    </View>
  </View>
}
