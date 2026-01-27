open ReactNative
open Style
open PaymentCardBrandLogo
open Tailwind

@react.component
let make = (~currency, ~amount, ~paymentDetails: option<RideBooking.paymentDetails>) => {
  <View style={tw("w-full flex-row justify-between items-center ")}>
    <View style={tw("ml-2")}>
      <TextWrapper
        text=CUSTOM_TEXT({
          text: currency ++ Int.toString(amount),
        })
        textType={Title_900}
      />
    </View>
    {switch paymentDetails {
    | Some(paymentDetails) =>
      <View style={tw("flex-row  gap-1  mr-3 ")}>
        <TextWrapper
          text=PAID_VIA textType={SBody_700} overRideStyle={textStyle(~paddingRight=5.->dp, ())}
        />
        <PaymentCardBrandLogo cardBrand=paymentDetails.cardBrand width={30.->dp} />
        <TextWrapper
          text={CUSTOM_TEXT({text: "••" ++ paymentDetails.last4->Int.toString})}
          textType={SBody_700}
        />
      </View>
    | None =>
      <>
        //------------- only for development purpose-------------
        <View style={tw("flex-row  gap-1  mr-3 ")}>
          <TextWrapper
            text=PAID_VIA textType={SBody_700} overRideStyle={textStyle(~paddingRight=5.->dp, ())}
          />
          <PaymentCardBrandLogo cardBrand="visa" width={30.->dp} />
          <TextWrapper text={CUSTOM_TEXT({text: "••4242"})} textType={SBody_700} />
        </View>
      </>
    }}
  </View>
}
