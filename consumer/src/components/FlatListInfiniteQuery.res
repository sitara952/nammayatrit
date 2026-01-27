open ReactNative

@react.component
let make = (
  ~listItem: (~item: 'queryData) => React.element,
  ~noItemView: React.element,
  ~shimmerViewItem: React.element,
  ~errorItem: React.element,
  ~apiCall: (
    ~offset: int,
    ~limit: int,
  ) => promise<FlatListUtils.infiniteQueryData<array<'queryData>>>,
  ~apiKey: array<string>,
  ~limit: int,
  ~isRefreshable: bool,
) => {
  let {
    data,
    fetchNextPage,
    hasNextPage,
    status,
    isFetching,
    isFetchingNextPage,
  } = ReactQuery.useInfiniteQuery({
    queryKey: apiKey,
    queryFn: ({pageParam}) => apiCall(~offset=Option.getOr(pageParam, 0), ~limit),
    initialPageParam: 0,
    getNextPageParam: data => {
      if data.data->Array.length < limit {
        None
      } else {
        Some(data.nextCursor)
      }
    },
  })

  let (isRefreshing, setRefresh) = React.useState(_ => false)
  let queryClient = ReactQuery.useQueryClient()
  let onFresh = () => {
    setRefresh(_ => true)
    queryClient.invalidateQueries(
      Some({
        queryKey: apiKey,
      }),
      None,
    )->ignore
  }

  let onEndReached = _ => {
    if hasNextPage {
      fetchNextPage()
    }
  }

  React.useEffect(() => {
    if isRefreshing && isFetching == false {
      setRefresh(_ => false)
    }
    None
  }, [isFetching])

  switch status {
  | #success =>
    switch data {
    | Some(data) =>
      let data =
        data.pages
        ->Array.map(v => v.data)
        ->Belt.Array.concatMany
      data->Array.length == 0
        ? noItemView
        : switch isRefreshable {
          | true =>
            <>
              <FlatList
                refreshing=isRefreshing
                \"ListFooterComponent"={() => isFetchingNextPage ? shimmerViewItem : React.null}
                onRefresh=onFresh
                keyExtractor={(_, i) => i->Int.toString}
                onEndReached
                data
                showsVerticalScrollIndicator=false
                onEndReachedThreshold=0.5
                renderItem={({item, _}) => {
                  listItem(~item)
                }}
              />
            </>
          | false =>
            <>
              <FlatList
                keyExtractor={(_, i) => i->Int.toString}
                \"ListFooterComponent"={() => isFetchingNextPage ? shimmerViewItem : React.null}
                onEndReached
                data
                showsVerticalScrollIndicator=false
                onEndReachedThreshold=0.5
                renderItem={({item, _}) => {
                  listItem(~item)
                }}
              />
            </>
          }
    | None => React.null
    }
  | #error => errorItem
  | #pending => shimmerViewItem
  }
}
