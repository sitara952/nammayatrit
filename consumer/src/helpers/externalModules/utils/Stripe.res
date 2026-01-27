module StripeProvider = {
  @module("@stripe/stripe-react-native") @react.component
  external make: (~children: React.element, ~publishableKey: string) => React.element =
    "StripeProvider"
}

type stripeError = {
  code: string,
  message: string,
}

type stripeRes = {error: option<stripeError>}

type billingDetails = {name: string}

type initPaymentSheetParams = {
  merchantDisplayName: string,
  customerId: string,
  customerEphemeralKeySecret: string,
  setupIntentClientSecret: string,
  allowsDelayedPaymentMethods: bool,
  defaultBillingDetails: billingDetails,
}

type useStripeFns = {
  initPaymentSheet: initPaymentSheetParams => promise<stripeRes>,
  presentPaymentSheet: unit => promise<stripeRes>,
}

@module("@stripe/stripe-react-native")
external useStripe: unit => useStripeFns = "useStripe"
