open ReactNative
open Style
open Reanimated
open Tailwind

let quotes: array<ChooseRideTypes.quotesProp> = [
  {
    imgSource: Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/choose-ride-assets/ride-express.png"),
    ),
    title: "Express",
    noOfPersons: 4.,
    rideType: "Quick",
    duration: 5.0,
    price: "$14.22",
    ar: Belt.Float.fromInt(116) /. Belt.Float.fromInt(80),
    destinationArrivalTime: "6:20 PM",
  },
  {
    imgSource: Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/choose-ride-assets/ride-premium.png"),
    ),
    title: "Premium",
    noOfPersons: 4.,
    rideType: "Extra comfort",
    duration: 8.0,
    price: "$18.34",
    ar: Belt.Float.fromInt(116) /. Belt.Float.fromInt(80),
    destinationArrivalTime: "6:20 PM",
  },
  {
    imgSource: Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/choose-ride-assets/ride-xl.png"),
    ),
    title: "XL",
    noOfPersons: 6.,
    rideType: "Extra seats",
    duration: 128.0,
    price: "$21.66",
    ar: Belt.Float.fromInt(116) /. Belt.Float.fromInt(80),
    destinationArrivalTime: "6:20 PM",
  },
  {
    imgSource: Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/choose-ride-assets/ride-black.png"),
    ),
    title: "Black",
    noOfPersons: 3.,
    rideType: "Luxury",
    duration: 7.0,
    price: "$31.54",
    ar: Belt.Float.fromInt(116) /. Belt.Float.fromInt(80),
    destinationArrivalTime: "6:20 PM",
  },
]

@react.component
let make = () => {
  let selectedRide = useSharedValue(-1.)

  let (loading, setLoading) = React.useState(() => true)

  // Set loading to false after 3 seconds
  React.useEffect(() => {
    let timeoutId = Js.Global.setTimeout(() => {
      setLoading(_ => false)

      // TODO: set the value to 0 with a min delay using withDelay() from Reanimated
      selectedRide.value = 0.
    }, 3000)

    // Cleanup function to clear the timeout if the component unmounts
    Some(() => Js.Global.clearTimeout(timeoutId))
  }, [])

  <ReanimatedView style={tw("flex-1 bg-[#FCFCFD]")}>
    <Text style={array([tw("font-extraBold leading-[21px] text-[#2C2F3A] text-[17px] px-4")])}>
      {React.string("Choose your ride")}
    </Text>
    <RideQuoteList list={quotes} selectedRide={selectedRide} isLoading={loading} />
  </ReanimatedView>
}
