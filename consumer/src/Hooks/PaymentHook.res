type paymentHooks = {
  paymentMethodList: array<Payment.customerCard>,
  defaultPaymentMethod: option<Payment.customerCard>,
  updatePaymentMethods: unit => promise<unit>,
  initPaymentSheet: unit => promise<unit>,
  isAddCardEnabled: bool,
  disableManage: bool,
  setDisableManage: (bool => bool) => unit,
  setIsAddCardEnabled: (bool => bool) => unit,
  handleAddCard: unit => promise<option<Stripe.stripeError>>,
  handleDeleteCard: string => promise<unit>,
  handleSetDefaultPaymentMethod: string => promise<unit>,
}

let jsonObjToDict = jsonObj => {
  jsonObj->Js.Json.decodeObject
}

let getSelectedPaymentMethod: (
  option<string>,
  array<Payment.customerCard>,
) => option<Payment.customerCard> = (optSelectedCardId, paymentList) => {
  optSelectedCardId
  ->Option.map(selectedCardId => {
    paymentList->Array.find(payment => payment.cardId == selectedCardId)
  })
  ->Option.flatMap(x => x)
}

let usePayments: unit => paymentHooks = () => {
  let (userProfile, updateUserProfile) = React.useContext(UserProfileContext.userProfileContext)

  let {initPaymentSheet, presentPaymentSheet} = Stripe.useStripe()
  let (paymentMethodList, setPaymentMethodList) = React.useState((): array<
    Payment.customerCard,
  > => [])
  let (defaultPaymentMethod, setDefaultPaymentMethod) = React.useState(() => None)
  let (isAddCardEnabled, setIsAddCardEnabled) = React.useState(() => true)
  let (disableManage, setDisableManage) = React.useState(() => false)

  let updatePaymentMethods = async () => {
    let handlePaymentMethodList = (paymentMethods: Payment.customerCardListResp) => {
      setPaymentMethodList(_ => paymentMethods.list)
      let defaultPaymentMethodOpt = getSelectedPaymentMethod(
        paymentMethods.defaultPaymentMethodId,
        paymentMethods.list,
      )
      Console.log2("Selected PM", defaultPaymentMethodOpt)
      setDefaultPaymentMethod(_ => {
        switch defaultPaymentMethodOpt {
        | Some(paymentMethod) => Some(paymentMethod)
        | None => paymentMethods.list[0]
        }
      })
    }

    await ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.getPaymentMethods,
      ~onSuccess=resp => {
        resp
        ->JSON.Decode.object
        ->Option.map(paymentMethods => {
          Payment.decodeToCustomerCardListResp(paymentMethods)->Option.map(handlePaymentMethodList)
        })
        ->ignore
      },
      ~onError=err => {
        Console.error2("Payment Methods", err)
      },
    )
  }

  let initPaymentSheet = () => {
    Promise.make((resolve, reject) => {
      ApiCall.callGetAPI(
        ~url=ApiRoutes.apiRoutes.getPaymentIntentSetup,
        ~onSuccess=resp => {
          switch resp->jsonObjToDict->Option.flatMap(Payment.decodeToSetupIntentResponse) {
          | Some(
              {setupIntentClientSecret, customerId, ephemeralKey}: Payment.setupIntentResponse,
            ) =>
            initPaymentSheet({
              merchantDisplayName: "Moving Tech Innovations Pvt Ltd",
              customerId,
              customerEphemeralKeySecret: ephemeralKey,
              setupIntentClientSecret,
              allowsDelayedPaymentMethods: true,
              defaultBillingDetails: {
                name: "Jane Doe",
              },
            })
            ->Promise.thenResolve(({error}) => {
              if error->Option.isSome {
                Console.log2("initializePaymentSheet error", error->Option.getExn)
                reject(error)
              } else {
                resolve()
              }
            })
            ->ignore
          | None => Console.log("Error decoding setup intent response")
          }
        },
        ~onError=err => {
          Console.log2("Error fetching setup intent", err)
        },
      )->ignore
    })
  }

  let handleAddCard = async () => {
    Console.log("handleAddCard")
    let {error} = await presentPaymentSheet()
    setIsAddCardEnabled(_ => true)
    setDisableManage(_ => false)
    switch error {
    | Some(error) =>
      Console.log2(`Error code: ${error.code}`, error.message)
      Some(error)
    | None => {
        Console.log2("Success", "Your order is confirmed!")
        await updatePaymentMethods()
        Console.log("Payment methods updated")
        None
      }
    }
  }

  let handleDeleteCard = async (cardId: string) => {
    await ApiCall.callDeleteAPI(
      ~url=ApiRoutes.apiRoutes.deletePaymentMethod(cardId),
      ~onSuccess=resp => {
        switch resp->jsonObjToDict->Option.flatMap(ApiSuccessOld.decodeToApiSuccess) {
        | Some(_) => Console.log2("Card deleted", cardId)

        | None => Console.log("Error decoding setup intent response")
        }
      },
      ~onError=err => {
        Console.log2("Error parsing response", err)
      },
    )
  }

  let handleSetDefaultPaymentMethod = (paymentMethodId: string) => {
    updateUserProfile({
      ...userProfile,
      preferredPaymentMethodId: Some(paymentMethodId),
    })

    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.setDefaultPaymentMethod(paymentMethodId),
      ~onSuccess=_resp => {
        Console.log2("Default payment method set", paymentMethodId)
        updatePaymentMethods()->ignore
      },
      ~onError=err => {
        Console.log2("setDefaultPaymentMethod", err)
      },
    )
  }

  {
    paymentMethodList,
    defaultPaymentMethod,
    updatePaymentMethods,
    initPaymentSheet,
    isAddCardEnabled,
    setIsAddCardEnabled,
    disableManage,
    setDisableManage,
    handleAddCard,
    handleDeleteCard,
    handleSetDefaultPaymentMethod,
  }
}
