// useEstimateSelection.res

let useEstimateSelection = (rideResults: array<EstimateType.estimate>, onSuccess) => {
  let (isSelected, setIsSelected) = React.useState(() => 0)
  let (rideSearchContext, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)

  let selectEstimateApi = (setIsLoading, paymentMethodId) => {
    switch rideResults[isSelected] {
    | Some(estimate) => {
        let estimateId = estimate.estimateId
        setIsLoading(_ => true)
        setRideSearchData({
          ...rideSearchContext,
          estimateId: Loaded(estimateId),
        })

        let selectReq: Select2Api.select2req = {
          autoAssignEnabled: true,
          autoAssignEnabledV2: true,
          paymentMethodId,
        }

        ApiCall.callPostAPI(
          ~url=ApiRoutes.apiRoutes.estimateSelect2(estimateId),
          ~body=Select2Api.encodeSelect2req(selectReq),
          ~onSuccess=_ => {
            Console.log("select2 success")
            onSuccess()
          },
          ~onError=_ => Console.log("error in /rideSearch/"),
        )->ignore
        setIsLoading(_ => false)
      }
    | None => ()
    }
  }

  (isSelected, setIsSelected, selectEstimateApi)
}

let getBookingId = (~estimateId: string): option<RideTrackScreenType.rideDetail> => {
  let selectReq: Select2Api.select2req = {
    autoAssignEnabled: true,
    autoAssignEnabledV2: true,
    paymentMethodId: "",
  }

  let (
    rideBookingDetail: option<RideTrackScreenType.rideDetail>,
    setRideDetail,
  ) = React.useState(_ => None)

  let handleAPISuccess = data => {
    let estimateResultsResp = EstimatesResults.itemToObjectMapper(data)
    Console.log2("Estimate Results", estimateResultsResp)
    let mbBookingId = estimateResultsResp.bookingId
    switch mbBookingId {
    | None => ()
    | Some(bookingId) =>
      ApiCall.callPostAPI(
        ~url=ApiRoutes.apiRoutes.rideBooking(bookingId),
        ~onSuccess=resp => {
          switch resp->JSON.Decode.object {
          | Some(obj) => {
              let rideDetail = RideBooking.itemToObjectMapper(obj)
              let transformedRideDetail = RideTrackScreenType.transformRideBooking(rideDetail)
              setRideDetail(_ => transformedRideDetail)
            }
          | None => ()
          }
        },
        ~onError=_ => {
          Console.warn("rideBooking API ERROR")
        },
      )->ignore
    }
  }

  let estimatesResultsAPI = () =>
    ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.estimateResults(estimateId),
      ~onSuccess=handleAPISuccess,
      ~onError={
        err => {
          Console.log2("error in api call", err)
        }
      },
    )->ignore

  ApiCall.callPostAPI(
    ~url=ApiRoutes.apiRoutes.estimateSelect2(estimateId),
    ~body=Select2Api.encodeSelect2req(selectReq),
    ~onSuccess=_ => {
      Console.log("select2 success")
      estimatesResultsAPI()
    },
    ~onError=_ => Console.log("error in /rideSearch/"),
  )->ignore

  rideBookingDetail
}

type postSelectAPI = {
  customerExtraFeeWithCurrency: option<PriceAPIEntity.priceAPIEntity>,
  estimateId: string,
  customerExtraFee: option<int>,
  otherSelectedEstimates: option<array<string>>,
}

let postSelectApi = () => {
  ReactQuery.useMutation({
    mutationKey: ["postSelectEstimate"],
    mutationFn: (body: postSelectAPI) => {
      let selectReq: Select2Req.dSelectReq = {
        autoAssignEnabled: true,
        autoAssignEnabledV2: Some(true),
        customerExtraFee: body.customerExtraFee,
        customerExtraFeeWithCurrency: body.customerExtraFeeWithCurrency,
        deliveryDetails: None,
        isAdvancedBookingEnabled: None,
        otherSelectedEstimates: body.otherSelectedEstimates,
        paymentMethodId: Some(""),
      }
      EstimateEstimateIdResultsGetEP.estimateEstimateIdSelect2PostApiCall(
        body.estimateId,
        selectReq,
      )
    },
  })
}
