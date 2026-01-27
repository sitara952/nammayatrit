open Reanimated
open Tailwind
open ReactNative

@react.component
let make = () => {
  <ReanimatedView style={tw("bg-white")}>
    <ReanimatedView
      style={tw("pt-4 border-t-[1px] border-[#D9D9D9] flex flex-row justify-between px-[18px]")}>
      <ReanimatedView>
        <AnimatedText style={tw("text-[15px] leading-[18px] font-extraBold text-[#7A8697]")}>
          {React.string("Pay by")}
        </AnimatedText>
      </ReanimatedView>
      <ReanimatedView style={tw("flex flex-row items-center")}>
        <Image
          source={Image.Source.fromRequired(
            Packager.require("../../resources/assets/png/payment-icons/mastercard.png"),
          )}
          style={tw("w-[25px] h-[15px] mx-1")}
        />
        <AnimatedText style={tw("text-[15px] leading-[18px] font-bold text-[#655488]")}>
          {React.string("**3919")}
        </AnimatedText>
      </ReanimatedView>
    </ReanimatedView>
    <SlideToBookRideButton onSlideEnd={() => ()} /> // Api Call to Book Ride
  </ReanimatedView>
}
