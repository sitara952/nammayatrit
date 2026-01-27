open EstimateType
open FareBreakupHelper
open ReactQuery

let useRideSearch = (footerHeight, estimateListHeight: float, setBottomSheetHeight) => {
  let (rideSearchContext, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)
  let (searchResult, setSearchResult) = React.useState(() => None)
  let (loading, setLoading) = React.useState(() => rideSearchContext.validTill == "" ? true : false)
  let drawRoute = UseMapRoute.useMapRoute(None, None)
  let bgTaskId = ref(Nullable.null)
  let pollingCount = ref(0)

  // store bottom sheet height in stringify percentage
  let updateBottomSheetHeight = () => {
    let heightInDp = footerHeight +. 85. +. estimateListHeight
    let percentHeight = Utils.dpToPercentageHeight(heightInDp)
    setBottomSheetHeight(_ => Math.min(70., percentHeight))
  }

  React.useEffect(() => {
    updateBottomSheetHeight()
    None
  }, [estimateListHeight])

  let mapRideEstimates = (
    estimates: array<SearchResults.estimateAPIEntity>,
    estimatedDuration: option<int>,
  ): array<estimate> =>
    estimates->Array.map((estimate: SearchResults.estimateAPIEntity) => {
      let estimatedPickupDuration = switch estimate.estimatedPickupDuration {
      | Some(duration) =>
        let mins = duration / 60
        mins == 0 ? "1 min away" : `${string_of_int(mins)} mins away`
      | None => ""
      }

      {
        title: switch estimate.serviceTierName {
        | Some(data) => data
        | None => ""
        },
        subtitle: Some(estimate.serviceTierShortDesc),
        fare: CurrencyHelper.getCurrency(estimate) ++ string_of_int(estimate.estimatedFare),
        capacity: estimate.vehicleServiceTierSeatingCapacity->Int.toString,
        pickupTime: estimatedPickupDuration,
        estimateId: estimate.id,
        estimateFareBreakup: constructFareBreakup(estimate, CurrencyHelper.getCurrency(estimate)),
        estimatedDuration,
      }
    })

  let handleFetchError = errorMsg => _ => {
    Console.log2("error", errorMsg)
    setLoading(_ => false)
  }
  let stopBackGroundPolling = () => {
    switch bgTaskId.contents->Nullable.toOption {
    | Some(id) => ()
    | None => ()
    }
    setLoading(_ => false)
  }
  let fetchRideResults = (rideSearchResponse: option<RideSearch.searchResp>) => {
    let handleFetchSuccess = data => {
      let results = SearchResults.itemToObjectMapper(data).estimates
      let _ = results->Array.map(v => Console.log2("ride estimates", v.vehicleVariant))
      let estimatesLength = Array.length(results)
      let estimatedDuration = switch rideSearchResponse {
      | Some(res) =>
        switch res.routeInfo {
        | Some(des) => Some(des.duration)
        | None => None
        }
      | None => None
      }
      if estimatesLength > 0 {
        let modifiedResults = mapRideEstimates(results, estimatedDuration)
        setRideSearchData({
          ...rideSearchContext,
          estimateList: modifiedResults,
          validTill: results
          ->Array.map(estimate => estimate.validTill)
          ->Array.get(0)
          ->Option.getOr(""),
        })
        stopBackGroundPolling()
      }
    }
    let fetchResults = () => {
      if pollingCount.contents >= Constants.estimates_polling_count {
        stopBackGroundPolling()
      } else {
        pollingCount.contents = pollingCount.contents + 1
        switch rideSearchResponse {
        | None => Console.log2("rideSearchResponse is null", rideSearchResponse)
        | Some(response: RideSearch.searchResp) =>
          ApiCall.callGetAPI(
            ~url=ApiRoutes.apiRoutes.rideSearchResults(response.searchId),
            ~onSuccess=handleFetchSuccess,
            ~onError=handleFetchError("error in /rideSearch/" ++ response.searchId ++ "results"),
          )->ignore
        }
      }
    }

    // bgTaskId.contents = Nullable.make(
    //   BackGroundTask.runBackgroundInterval(
    //     ~task=fetchResults,
    //     ~interval=Constants.estimates_polling_interval,
    //   ),
    // )
  }

  let initiateRideSearch = () => {
    let handleInitialFetchSuccess = data => {
      setSearchResult(_ => RideSearch.itemToObjectMapper(data).routeInfo)
      fetchRideResults(Some(RideSearch.itemToObjectMapper(data)))->ignore
    }

    let searchReq = RideSearch.mkRideSearchReq(
      rideSearchContext.source,
      rideSearchContext.destination,
      [],
      true,
      None,
      None,
      false,
      None,
      None,
      None,
      None,
      false,
    )

    drawRoute(searchResult)->ignore
    updateBottomSheetHeight()
    if rideSearchContext.validTill == "" {
      setLoading(_ => true)
      setRideSearchData({...rideSearchContext, estimateList: []})
      switch searchReq {
      | Some(req) =>
        ApiCall.callPostAPI(
          ~url=ApiRoutes.apiRoutes.rideSearch,
          ~body=RideSearch.searchReqTypeToJson(req),
          ~onSuccess=handleInitialFetchSuccess,
          ~onError=handleFetchError("error in /rideSearch/"),
        )->ignore
      | None => Console.log2("searchReq is null", searchReq)
      }
    }
    Some(stopBackGroundPolling)
  }

  React.useEffect(() => {
    drawRoute(searchResult)->ignore
    None
  }, [searchResult])

  (rideSearchContext.estimateList, loading, initiateRideSearch)
}

let mapsRideSearchData = async (body: RideSearch.searchReqType) => {
  let data = await ApiCall.callPostAPI'(
    ~url=ApiRoutes.apiRoutes.rideSearch,
    ~body=RideSearch.searchReqTypeToJson(body),
  )
  RideSearch.itemToObjectMapper(data)
}
let mapSearchResultData = async (~searchId: string) => {
  let data = switch searchId {
  | "" => Js.Exn.raiseError("SearchId not defined")
  | _ => await ApiCall.callGetAPI'(~url=ApiRoutes.apiRoutes.rideSearchResults(searchId))
  }
  SearchResults.itemToObjectMapper(data)
}

type mutateParams = {
  source: option<LocationTypes.location>,
  destination: option<LocationTypes.location>,
}

let getSearchId = (~mutationKey: array<string>) => {
  useMutation({
    mutationKey,
    mutationFn: ({source, destination}: mutateParams) => {
      let searchReq = RideSearch.mkRideSearchReq(
        source,
        destination,
        [],
        true,
        None,
        None,
        false,
        None,
        None,
        None,
        None,
        false,
      )
      let req = switch searchReq {
      | Some(req) => req
      | None => Js.Exn.raiseError("RideSearch body not defined")
      }

      mapsRideSearchData(req)
    },
  })
}

let refetchIntervalCondition = (data: option<SearchResults.getQuotesRes>) => {
  switch data {
  | Some(data) => data.quotes->Array.length == 0 && data.estimates->Array.length == 0
  | None => true
  }
}

@genType
let callSearchResults = (
  ~searchId: string,
  ~queryKey: array<string>,
  ~refetchIntervalTime: int,
  ~enabled: bool,
) => {
  useQuery({
    queryKey,
    queryFn: _ => mapSearchResultData(~searchId),
    onSuccess: data => Console.log2("data debug", data),
    refetchInterval: data =>
      refetchInterval(
        refetchIntervalCondition(data.state.data) ? #number(refetchIntervalTime) : #bool(false),
      ),
    enabled,
  })
}
