open Reanimated
open Tailwind

@react.component
let make = (
  ~list: array<ChooseRideTypes.quotesProp>,
  ~selectedRide: SharedValue.t<float>,
  ~isLoading: bool,
) => {
  <ReanimatedView style={tw("mt-4")}>
    {list
    ->Array.mapWithIndex((quote, index) => {
      <RideQuoteItem
        key={quote.title}
        quote={quote}
        index={index->Int.toFloat}
        selectedRide={selectedRide}
        ridesLength={4.}
        isLoading={isLoading}
      />
    })
    ->React.array}
  </ReanimatedView>
}
