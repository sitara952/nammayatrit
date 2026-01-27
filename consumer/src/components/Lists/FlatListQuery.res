open ReactNative

@react.component
let make = (
  ~listItem: (~item: 'queryData) => React.element,
  ~noItemsToShowViewItem: React.element,
  ~shimmerViewItem: React.element,
  ~errorItem: React.element,
  ~apiCall: unit => promise<array<'queryData>>,
  ~apiKey: array<string>,
  ~isRefreshable: bool,
) => {
  let {data, isFetching, status} = ReactQuery.useQuery({
    queryFn: _ => apiCall(),
    queryKey: apiKey,
  })

  let queryClient = ReactQuery.useQueryClient()

  let onFresh = () => {
    queryClient.invalidateQueries(
      Some({
        queryKey: apiKey,
      }),
      None,
    )->ignore
  }

  switch status {
  | #success =>
    let data = Option.getOr(data, [])
    data->Array.length == 0
      ? noItemsToShowViewItem
      : switch isRefreshable {
        | true =>
          <FlatList
            onEndReachedThreshold=0.5
            keyExtractor={(_, i) => i->Int.toString}
            refreshing=isFetching
            onRefresh=onFresh
            data
            showsVerticalScrollIndicator=false
            renderItem={({item, _}) => {
              listItem(~item)
            }}
          />
        | false =>
          <FlatList
            onEndReachedThreshold=0.5
            keyExtractor={(_, i) => i->Int.toString}
            data
            showsVerticalScrollIndicator=false
            renderItem={({item, _}) => {
              listItem(~item)
            }}
          />
        }
  | #error => errorItem
  | #pending => shimmerViewItem
  }
}
