module RideBookingListV2BillingCategory = {
  @genType
  type rideBookingListV2BillingCategory = PERSONAL | BUSINESS

  let decodeRideBookingListV2BillingCategoryEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideBookingListV2BillingCategory type"), str => {
      switch str {
      | "PERSONAL" => Ok(PERSONAL)
      | "BUSINESS" => Ok(BUSINESS)
      | _ => Error("failed to decode enum RideBookingListV2BillingCategory")
      }
    })
  }

  let decodeRideBookingListV2BillingCategory = data => {
    decodeRideBookingListV2BillingCategoryEnumResult(Some(data))
  }

  let decodeRideBookingListV2BillingCategoryResult = (dict, key): result<
    rideBookingListV2BillingCategory,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideBookingListV2BillingCategoryEnumResult
  }

  let rideBookingListV2BillingCategoryToString = enumValue => {
    switch enumValue {
    | PERSONAL => "PERSONAL"
    | BUSINESS => "BUSINESS"
    }
  }
}
module RideBookingListV2RideType = {
  @genType
  type rideBookingListV2RideType = NORMAL | RENTAL | INTERCITY | AMBULANCE | DELIVERY | METER_RIDE

  let decodeRideBookingListV2RideTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideBookingListV2RideType type"), str => {
      switch str {
      | "NORMAL" => Ok(NORMAL)
      | "RENTAL" => Ok(RENTAL)
      | "INTERCITY" => Ok(INTERCITY)
      | "AMBULANCE" => Ok(AMBULANCE)
      | "DELIVERY" => Ok(DELIVERY)
      | "METER_RIDE" => Ok(METER_RIDE)
      | _ => Error("failed to decode enum RideBookingListV2RideType")
      }
    })
  }

  let decodeRideBookingListV2RideType = data => {
    decodeRideBookingListV2RideTypeEnumResult(Some(data))
  }

  let decodeRideBookingListV2RideTypeResult = (dict, key): result<
    rideBookingListV2RideType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideBookingListV2RideTypeEnumResult
  }

  let rideBookingListV2RideTypeToString = enumValue => {
    switch enumValue {
    | NORMAL => "NORMAL"
    | RENTAL => "RENTAL"
    | INTERCITY => "INTERCITY"
    | AMBULANCE => "AMBULANCE"
    | DELIVERY => "DELIVERY"
    | METER_RIDE => "METER_RIDE"
    }
  }
}

module RideBookingListV2BookingRequestType = {
  @genType
  type rideBookingListV2BookingRequestType = BookingRequest | JourneyRequest | RequestBoth

  let decodeRideBookingListV2BookingRequestTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideBookingListV2BookingRequestType type"), str => {
      switch str {
      | "BookingRequest" => Ok(BookingRequest)
      | "JourneyRequest" => Ok(JourneyRequest)
      | "RequestBoth" => Ok(RequestBoth)
      | _ => Error("failed to decode enum RideBookingListV2BookingRequestType")
      }
    })
  }

  let decodeRideBookingListV2BookingRequestType = data => {
    decodeRideBookingListV2BookingRequestTypeEnumResult(Some(data))
  }

  let decodeRideBookingListV2BookingRequestTypeResult = (dict, key): result<
    rideBookingListV2BookingRequestType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideBookingListV2BookingRequestTypeEnumResult
  }

  let rideBookingListV2BookingRequestTypeToString = enumValue => {
    switch enumValue {
    | BookingRequest => "BookingRequest"
    | JourneyRequest => "JourneyRequest"
    | RequestBoth => "RequestBoth"
    }
  }
}

module RideType = {
  @genType
  type rideType = NORMAL | RENTAL | INTERCITY | AMBULANCE | DELIVERY | METER_RIDE

  let decodeRideTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideType type"), str => {
      switch str {
      | "NORMAL" => Ok(NORMAL)
      | "RENTAL" => Ok(RENTAL)
      | "INTERCITY" => Ok(INTERCITY)
      | "AMBULANCE" => Ok(AMBULANCE)
      | "DELIVERY" => Ok(DELIVERY)
      | "METER_RIDE" => Ok(METER_RIDE)
      | _ => Error("failed to decode enum RideType")
      }
    })
  }

  let decodeRideType = data => {
    decodeRideTypeEnumResult(Some(data))
  }

  let decodeRideTypeResult = (dict, key): result<rideType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideTypeEnumResult
  }

  let rideTypeToString = enumValue => {
    switch enumValue {
    | NORMAL => "NORMAL"
    | RENTAL => "RENTAL"
    | INTERCITY => "INTERCITY"
    | AMBULANCE => "AMBULANCE"
    | DELIVERY => "DELIVERY"
    | METER_RIDE => "METER_RIDE"
    }
  }
}
module InvoiceStatus = {
  @genType
  type invoiceStatus = PROCESSING | COMPLETED | FAILED

  let decodeInvoiceStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to InvoiceStatus type"), str => {
      switch str {
      | "PROCESSING" => Ok(PROCESSING)
      | "COMPLETED" => Ok(COMPLETED)
      | "FAILED" => Ok(FAILED)
      | _ => Error("failed to decode enum InvoiceStatus")
      }
    })
  }

  let decodeInvoiceStatus = data => {
    decodeInvoiceStatusEnumResult(Some(data))
  }

  let decodeInvoiceStatusResult = (dict, key): result<invoiceStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeInvoiceStatusEnumResult
  }

  let invoiceStatusToString = enumValue => {
    switch enumValue {
    | PROCESSING => "PROCESSING"
    | COMPLETED => "COMPLETED"
    | FAILED => "FAILED"
    }
  }
}

module BillingCategory = {
  @genType
  type billingCategory = PERSONAL | BUSINESS

  let decodeBillingCategoryEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to BillingCategory type"), str => {
        switch str {
          | "PERSONAL" => Ok(PERSONAL)
				| "BUSINESS" => Ok(BUSINESS)
				| _ => Error("failed to decode enum BillingCategory")
        }
    })
  }

  let decodeBillingCategory = data => {
    decodeBillingCategoryEnumResult(Some(data))
  }

  let decodeBillingCategoryResult = (dict, key): result<billingCategory, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeBillingCategoryEnumResult
  }

  let billingCategoryToString = enumValue => {
    switch enumValue {
      | PERSONAL => "PERSONAL"
		| BUSINESS => "BUSINESS"
    }
  }
}

module TicketBookingsV2Status = {
  @genType
  type ticketBookingsV2Status = Pending | Failed | Booked | Cancelled | RefundInitiated

  let decodeTicketBookingsV2StatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TicketBookingsV2Status type"), str => {
      switch str {
      | "Pending" => Ok(Pending)
      | "Failed" => Ok(Failed)
      | "Booked" => Ok(Booked)
      | "Cancelled" => Ok(Cancelled)
      | "RefundInitiated" => Ok(RefundInitiated)
      | _ => Error("failed to decode enum TicketBookingsV2Status")
      }
    })
  }

  let decodeTicketBookingsV2Status = data => {
    decodeTicketBookingsV2StatusEnumResult(Some(data))
  }

  let decodeTicketBookingsV2StatusResult = (dict, key): result<ticketBookingsV2Status, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTicketBookingsV2StatusEnumResult
  }

  let ticketBookingsV2StatusToString = enumValue => {
    switch enumValue {
    | Pending => "Pending"
    | Failed => "Failed"
    | Booked => "Booked"
    | Cancelled => "Cancelled"
    | RefundInitiated => "RefundInitiated"
    }
  }
}

module APISuccessResult = {
  @genType
  type aPISuccessResult = Success

  let decodeAPISuccessResultEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to APISuccessResult type"), str => {
      switch str {
      | "Success" => Ok(Success)
      | _ => Error("failed to decode enum APISuccessResult")
      }
    })
  }

  let decodeAPISuccessResult = data => {
    decodeAPISuccessResultEnumResult(Some(data))
  }

  let decodeAPISuccessResultResult = (dict, key): result<aPISuccessResult, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeAPISuccessResultEnumResult
  }

  let aPISuccessResultToString = enumValue => {
    switch enumValue {
    | Success => "Success"
    }
  }
}
module Gender = {
  @genType
  type gender = MALE | FEMALE | OTHER | UNKNOWN | PREFER_NOT_TO_SAY

  let decodeGenderEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to Gender type"), str => {
      switch str {
      | "MALE" => Ok(MALE)
      | "FEMALE" => Ok(FEMALE)
      | "OTHER" => Ok(OTHER)
      | "UNKNOWN" => Ok(UNKNOWN)
      | "PREFER_NOT_TO_SAY" => Ok(PREFER_NOT_TO_SAY)
      | _ => Error("failed to decode enum Gender")
      }
    })
  }

  let decodeGender = data => {
    decodeGenderEnumResult(Some(data))
  }

  let decodeGenderResult = (dict, key): result<gender, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeGenderEnumResult
  }

  let genderToString = enumValue => {
    switch enumValue {
    | MALE => "MALE"
    | FEMALE => "FEMALE"
    | OTHER => "OTHER"
    | UNKNOWN => "UNKNOWN"
    | PREFER_NOT_TO_SAY => "PREFER_NOT_TO_SAY"
    }
  }
}
module IdentifierType = {
  @genType
  type identifierType = MOBILENUMBER | AADHAAR | EMAIL

  let decodeIdentifierTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IdentifierType type"), str => {
      switch str {
      | "MOBILENUMBER" => Ok(MOBILENUMBER)
      | "AADHAAR" => Ok(AADHAAR)
      | "EMAIL" => Ok(EMAIL)
      | _ => Error("failed to decode enum IdentifierType")
      }
    })
  }

  let decodeIdentifierType = data => {
    decodeIdentifierTypeEnumResult(Some(data))
  }

  let decodeIdentifierTypeResult = (dict, key): result<identifierType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIdentifierTypeEnumResult
  }

  let identifierTypeToString = enumValue => {
    switch enumValue {
    | MOBILENUMBER => "MOBILENUMBER"
    | AADHAAR => "AADHAAR"
    | EMAIL => "EMAIL"
    }
  }
}
module AbsoluteDirection = {
  @genType
  type absoluteDirection =
    | AbsoluteDirectionNORTH
    | AbsoluteDirectionNORTHEAST
    | AbsoluteDirectionEAST
    | AbsoluteDirectionSOUTHEAST
    | AbsoluteDirectionSOUTH
    | AbsoluteDirectionSOUTHWEST
    | AbsoluteDirectionWEST
    | AbsoluteDirectionNORTHWEST

  let decodeAbsoluteDirectionEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to AbsoluteDirection type"), str => {
      switch str {
      | "AbsoluteDirectionNORTH" => Ok(AbsoluteDirectionNORTH)
      | "AbsoluteDirectionNORTHEAST" => Ok(AbsoluteDirectionNORTHEAST)
      | "AbsoluteDirectionEAST" => Ok(AbsoluteDirectionEAST)
      | "AbsoluteDirectionSOUTHEAST" => Ok(AbsoluteDirectionSOUTHEAST)
      | "AbsoluteDirectionSOUTH" => Ok(AbsoluteDirectionSOUTH)
      | "AbsoluteDirectionSOUTHWEST" => Ok(AbsoluteDirectionSOUTHWEST)
      | "AbsoluteDirectionWEST" => Ok(AbsoluteDirectionWEST)
      | "AbsoluteDirectionNORTHWEST" => Ok(AbsoluteDirectionNORTHWEST)
      | _ => Error("failed to decode enum AbsoluteDirection")
      }
    })
  }

  let decodeAbsoluteDirection = data => {
    decodeAbsoluteDirectionEnumResult(Some(data))
  }

  let decodeAbsoluteDirectionResult = (dict, key): result<absoluteDirection, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeAbsoluteDirectionEnumResult
  }

  let absoluteDirectionToString = enumValue => {
    switch enumValue {
    | AbsoluteDirectionNORTH => "AbsoluteDirectionNORTH"
    | AbsoluteDirectionNORTHEAST => "AbsoluteDirectionNORTHEAST"
    | AbsoluteDirectionEAST => "AbsoluteDirectionEAST"
    | AbsoluteDirectionSOUTHEAST => "AbsoluteDirectionSOUTHEAST"
    | AbsoluteDirectionSOUTH => "AbsoluteDirectionSOUTH"
    | AbsoluteDirectionSOUTHWEST => "AbsoluteDirectionSOUTHWEST"
    | AbsoluteDirectionWEST => "AbsoluteDirectionWEST"
    | AbsoluteDirectionNORTHWEST => "AbsoluteDirectionNORTHWEST"
    }
  }
}
module Language = {
  @genType
  type language =
    | ENGLISH
    | HINDI
    | KANNADA
    | TAMIL
    | MALAYALAM
    | BENGALI
    | FRENCH
    | TELUGU
    | ODIA
    | DUTCH
    | GERMAN
    | FINNISH
    | SWEDISH
    | GUJARATI

  let decodeLanguageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to Language type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "ODIA" => Ok(ODIA)
      | "DUTCH" => Ok(DUTCH)
      | "GERMAN" => Ok(GERMAN)
      | "FINNISH" => Ok(FINNISH)
      | "SWEDISH" => Ok(SWEDISH)
      | "GUJARATI" => Ok(GUJARATI)
      | _ => Error("failed to decode enum Language")
      }
    })
  }

  let decodeLanguage = data => {
    decodeLanguageEnumResult(Some(data))
  }

  let decodeLanguageResult = (dict, key): result<language, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeLanguageEnumResult
  }

  let languageToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | ODIA => "ODIA"
    | DUTCH => "DUTCH"
    | GERMAN => "GERMAN"
    | FINNISH => "FINNISH"
    | SWEDISH => "SWEDISH"
    | GUJARATI => "GUJARATI"
    }
  }
}
module OTPChannel = {
  @genType
  type oTPChannel = SMS | WHATSAPP | EMAIL

  let decodeOTPChannelEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to OTPChannel type"), str => {
      switch str {
      | "SMS" => Ok(SMS)
      | "WHATSAPP" => Ok(WHATSAPP)
      | "EMAIL" => Ok(EMAIL)
      | _ => Error("failed to decode enum OTPChannel")
      }
    })
  }

  let decodeOTPChannel = data => {
    decodeOTPChannelEnumResult(Some(data))
  }

  let decodeOTPChannelResult = (dict, key): result<oTPChannel, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeOTPChannelEnumResult
  }

  let oTPChannelToString = enumValue => {
    switch enumValue {
    | SMS => "SMS"
    | WHATSAPP => "WHATSAPP"
    | EMAIL => "EMAIL"
    }
  }
}
module OptApiMethods = {
  @genType
  type optApiMethods = OPT_IN | OPT_OUT

  let decodeOptApiMethodsEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to OptApiMethods type"), str => {
      switch str {
      | "OPT_IN" => Ok(OPT_IN)
      | "OPT_OUT" => Ok(OPT_OUT)
      | _ => Error("failed to decode enum OptApiMethods")
      }
    })
  }

  let decodeOptApiMethods = data => {
    decodeOptApiMethodsEnumResult(Some(data))
  }

  let decodeOptApiMethodsResult = (dict, key): result<optApiMethods, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeOptApiMethodsEnumResult
  }

  let optApiMethodsToString = enumValue => {
    switch enumValue {
    | OPT_IN => "OPT_IN"
    | OPT_OUT => "OPT_OUT"
    }
  }
}
module LoginType = {
  @genType
  type loginType = OTP | PASSWORD | DIRECT | OAUTH

  let decodeLoginTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to LoginType type"), str => {
      switch str {
      | "OTP" => Ok(OTP)
      | "PASSWORD" => Ok(PASSWORD)
      | "DIRECT" => Ok(DIRECT)
      | "OAUTH" => Ok(OAUTH)
      | _ => Error("failed to decode enum LoginType")
      }
    })
  }

  let decodeLoginType = data => {
    decodeLoginTypeEnumResult(Some(data))
  }

  let decodeLoginTypeResult = (dict, key): result<loginType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeLoginTypeEnumResult
  }

  let loginTypeToString = enumValue => {
    switch enumValue {
    | OTP => "OTP"
    | PASSWORD => "PASSWORD"
    | DIRECT => "DIRECT"
    | OAUTH => "OAUTH"
    }
  }
}
module CancellationReasonListCancellationStage = {
  @genType
  type cancellationReasonListCancellationStage = OnSearch | OnInit | OnConfirm | OnAssign

  let decodeCancellationReasonListCancellationStageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(
      Error("failed to decode to CancellationReasonListCancellationStage type"),
      str => {
        switch str {
        | "OnSearch" => Ok(OnSearch)
        | "OnInit" => Ok(OnInit)
        | "OnConfirm" => Ok(OnConfirm)
        | "OnAssign" => Ok(OnAssign)
        | _ => Error("failed to decode enum CancellationReasonListCancellationStage")
        }
      },
    )
  }

  let decodeCancellationReasonListCancellationStage = data => {
    decodeCancellationReasonListCancellationStageEnumResult(Some(data))
  }

  let decodeCancellationReasonListCancellationStageResult = (dict, key): result<
    cancellationReasonListCancellationStage,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCancellationReasonListCancellationStageEnumResult
  }

  let cancellationReasonListCancellationStageToString = enumValue => {
    switch enumValue {
    | OnSearch => "OnSearch"
    | OnInit => "OnInit"
    | OnConfirm => "OnConfirm"
    | OnAssign => "OnAssign"
    }
  }
}
module DistanceUnit = {
  @genType
  type distanceUnit = Meter | Mile | Yard | Kilometer

  let decodeDistanceUnitEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to DistanceUnit type"), str => {
      switch str {
      | "Meter" => Ok(Meter)
      | "Mile" => Ok(Mile)
      | "Yard" => Ok(Yard)
      | "Kilometer" => Ok(Kilometer)
      | _ => Error("failed to decode enum DistanceUnit")
      }
    })
  }

  let decodeDistanceUnit = data => {
    decodeDistanceUnitEnumResult(Some(data))
  }

  let decodeDistanceUnitResult = (dict, key): result<distanceUnit, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeDistanceUnitEnumResult
  }

  let distanceUnitToString = enumValue => {
    switch enumValue {
    | Meter => "Meter"
    | Mile => "Mile"
    | Yard => "Yard"
    | Kilometer => "Kilometer"
    }
  }
}
module BookingUpdateRequestStatus = {
  @genType
  type bookingUpdateRequestStatus = SOFT | CONFIRM

  let decodeBookingUpdateRequestStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to BookingUpdateRequestStatus type"), str => {
      switch str {
      | "SOFT" => Ok(SOFT)
      | "CONFIRM" => Ok(CONFIRM)
      | _ => Error("failed to decode enum BookingUpdateRequestStatus")
      }
    })
  }

  let decodeBookingUpdateRequestStatus = data => {
    decodeBookingUpdateRequestStatusEnumResult(Some(data))
  }

  let decodeBookingUpdateRequestStatusResult = (dict, key): result<
    bookingUpdateRequestStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeBookingUpdateRequestStatusEnumResult
  }

  let bookingUpdateRequestStatusToString = enumValue => {
    switch enumValue {
    | SOFT => "SOFT"
    | CONFIRM => "CONFIRM"
    }
  }
}
module CancelAPIResponseResult = {
  @genType
  type cancelAPIResponseResult = BookingAlreadyCreated | FailedToCancel | Success

  let decodeCancelAPIResponseResultEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CancelAPIResponseResult type"), str => {
      switch str {
      | "BookingAlreadyCreated" => Ok(BookingAlreadyCreated)
      | "FailedToCancel" => Ok(FailedToCancel)
      | "Success" => Ok(Success)
      | _ => Error("failed to decode enum CancelAPIResponseResult")
      }
    })
  }

  let decodeCancelAPIResponseResult = data => {
    decodeCancelAPIResponseResultEnumResult(Some(data))
  }

  let decodeCancelAPIResponseResultResult = (dict, key): result<
    cancelAPIResponseResult,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCancelAPIResponseResultEnumResult
  }

  let cancelAPIResponseResultToString = enumValue => {
    switch enumValue {
    | BookingAlreadyCreated => "BookingAlreadyCreated"
    | FailedToCancel => "FailedToCancel"
    | Success => "Success"
    }
  }
}
module Currency = {
  @genType
  type currency = INR | USD | EUR

  let decodeCurrencyEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to Currency type"), str => {
      switch str {
      | "INR" => Ok(INR)
      | "USD" => Ok(USD)
      | "EUR" => Ok(EUR)
      | _ => Error("failed to decode enum Currency")
      }
    })
  }

  let decodeCurrency = data => {
    decodeCurrencyEnumResult(Some(data))
  }

  let decodeCurrencyResult = (dict, key): result<currency, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCurrencyEnumResult
  }

  let currencyToString = enumValue => {
    switch enumValue {
    | INR => "INR"
    | USD => "USD"
    | EUR => "EUR"
    }
  }
}
module ServiceTierType = {
  @genType
  type serviceTierType =
    | COMFY
    | ECO
    | PREMIUM
    | SUV
    | AUTO_RICKSHAW
    | HATCHBACK
    | SEDAN
    | TAXI
    | TAXI_PLUS
    | PREMIUM_SEDAN
    | BLACK
    | BLACK_XL
    | BIKE
    | AMBULANCE_TAXI
    | AMBULANCE_TAXI_OXY
    | AMBULANCE_AC
    | AMBULANCE_AC_OXY
    | AMBULANCE_VENTILATOR
    | SUV_PLUS
    | DELIVERY_BIKE
    | DELIVERY_LIGHT_GOODS_VEHICLE
    | HERITAGE_CAB
    | EV_AUTO_RICKSHAW
    | AUTO_PLUS
    | UNKNOWN_SERVICE_TYPE
    | BIKE_PLUS
    | AC_PRIORITY
    | E_RICKSHAW

  let decodeServiceTierTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to ServiceTierType type"), str => {
      switch str {
      | "COMFY" => Ok(COMFY)
      | "ECO" => Ok(ECO)
      | "PREMIUM" => Ok(PREMIUM)
      | "SUV" => Ok(SUV)
      | "AUTO_RICKSHAW" => Ok(AUTO_RICKSHAW)
      | "HATCHBACK" => Ok(HATCHBACK)
      | "SEDAN" => Ok(SEDAN)
      | "TAXI" => Ok(TAXI)
      | "TAXI_PLUS" => Ok(TAXI_PLUS)
      | "PREMIUM_SEDAN" => Ok(PREMIUM_SEDAN)
      | "BLACK" => Ok(BLACK)
      | "BLACK_XL" => Ok(BLACK_XL)
      | "BIKE" => Ok(BIKE)
      | "AMBULANCE_TAXI" => Ok(AMBULANCE_TAXI)
      | "AMBULANCE_TAXI_OXY" => Ok(AMBULANCE_TAXI_OXY)
      | "AMBULANCE_AC" => Ok(AMBULANCE_AC)
      | "AMBULANCE_AC_OXY" => Ok(AMBULANCE_AC_OXY)
      | "AMBULANCE_VENTILATOR" => Ok(AMBULANCE_VENTILATOR)
      | "SUV_PLUS" => Ok(SUV_PLUS)
      | "DELIVERY_BIKE" => Ok(DELIVERY_BIKE)
      | "DELIVERY_LIGHT_GOODS_VEHICLE" => Ok(DELIVERY_LIGHT_GOODS_VEHICLE)
      | "HERITAGE_CAB" => Ok(HERITAGE_CAB)
      | "AUTO_PLUS" => Ok(AUTO_PLUS)
      | "EV_AUTO_RICKSHAW" => Ok(EV_AUTO_RICKSHAW)
      | "BIKE_PLUS" => Ok(BIKE_PLUS)
      | "AC_PRIORITY" => Ok(AC_PRIORITY)
      | "E_RICKSHAW" => Ok(E_RICKSHAW)
      | _ => {
          Console.warn(
            "Unknown service tier type received from backend, using UNKNOWN_SERVICE_TYPE as fallback",
          )
          Ok(UNKNOWN_SERVICE_TYPE)
        }
      }
    })
  }

  let decodeServiceTierType = data => {
    decodeServiceTierTypeEnumResult(Some(data))
  }

  let decodeServiceTierTypeResult = (dict, key): result<serviceTierType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeServiceTierTypeEnumResult
  }

  let serviceTierTypeToString = enumValue => {
    switch enumValue {
    | COMFY => "COMFY"
    | ECO => "ECO"
    | PREMIUM => "PREMIUM"
    | SUV => "SUV"
    | AUTO_RICKSHAW => "AUTO_RICKSHAW"
    | HATCHBACK => "HATCHBACK"
    | SEDAN => "SEDAN"
    | TAXI => "TAXI"
    | TAXI_PLUS => "TAXI_PLUS"
    | PREMIUM_SEDAN => "PREMIUM_SEDAN"
    | BLACK => "BLACK"
    | BLACK_XL => "BLACK_XL"
    | BIKE => "BIKE"
    | AMBULANCE_TAXI => "AMBULANCE_TAXI"
    | AMBULANCE_TAXI_OXY => "AMBULANCE_TAXI_OXY"
    | AMBULANCE_AC => "AMBULANCE_AC"
    | AMBULANCE_AC_OXY => "AMBULANCE_AC_OXY"
    | AMBULANCE_VENTILATOR => "AMBULANCE_VENTILATOR"
    | SUV_PLUS => "SUV_PLUS"
    | DELIVERY_BIKE => "DELIVERY_BIKE"
    | DELIVERY_LIGHT_GOODS_VEHICLE => "DELIVERY_LIGHT_GOODS_VEHICLE"
    | HERITAGE_CAB => "HERITAGE_CAB"
    | EV_AUTO_RICKSHAW => "EV_AUTO_RICKSHAW"
    | AUTO_PLUS => "AUTO_PLUS"
    | UNKNOWN_SERVICE_TYPE => "AUTO_RICKSHAW"
    | BIKE_PLUS => "BIKE_PLUS"
    | AC_PRIORITY => "AC_PRIORITY"
    | E_RICKSHAW => "E_RICKSHAW"
    }
  }
}
module DeliveryParties = {
  @genType
  type deliveryParties = Sender | Receiver | SomeoneElse

  let decodeDeliveryPartiesEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to DeliveryParties type"), str => {
      switch str {
      | "Sender" => Ok(Sender)
      | "Receiver" => Ok(Receiver)
      | "SomeoneElse" => Ok(SomeoneElse)
      | _ => Error("failed to decode enum DeliveryParties")
      }
    })
  }

  let decodeDeliveryParties = data => {
    decodeDeliveryPartiesEnumResult(Some(data))
  }

  let decodeDeliveryPartiesResult = (dict, key): result<deliveryParties, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeDeliveryPartiesEnumResult
  }

  let deliveryPartiesToString = enumValue => {
    switch enumValue {
    | Sender => "Sender"
    | Receiver => "Receiver"
    | SomeoneElse => "SomeoneElse"
    }
  }
}
module Category = {
  @genType
  type category = RIDE | DRIVER | VEHICLE

  let decodeCategoryEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to Category type"), str => {
      switch str {
      | "RIDE" => Ok(RIDE)
      | "DRIVER" => Ok(DRIVER)
      | "VEHICLE" => Ok(VEHICLE)
      | _ => Error("failed to decode enum Category")
      }
    })
  }

  let decodeCategory = data => {
    decodeCategoryEnumResult(Some(data))
  }

  let decodeCategoryResult = (dict, key): result<category, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCategoryEnumResult
  }

  let categoryToString = enumValue => {
    switch enumValue {
    | RIDE => "RIDE"
    | DRIVER => "DRIVER"
    | VEHICLE => "VEHICLE"
    }
  }
}
module AnswerType = {
  @genType
  type answerType = Text | Checkbox | Radio

  let decodeAnswerTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to AnswerType type"), str => {
      switch str {
      | "Text" => Ok(Text)
      | "Checkbox" => Ok(Checkbox)
      | "Radio" => Ok(Radio)
      | _ => Error("failed to decode enum AnswerType")
      }
    })
  }

  let decodeAnswerType = data => {
    decodeAnswerTypeEnumResult(Some(data))
  }

  let decodeAnswerTypeResult = (dict, key): result<answerType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeAnswerTypeEnumResult
  }

  let answerTypeToString = enumValue => {
    switch enumValue {
    | Text => "Text"
    | Checkbox => "Checkbox"
    | Radio => "Radio"
    }
  }
}
module FrfsAutocompletePlatformType = {
  @genType
  type frfsAutocompletePlatformType = MULTIMODAL | PARTNERORG | APPLICATION

  let decodeFrfsAutocompletePlatformTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsAutocompletePlatformType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "PARTNERORG" => Ok(PARTNERORG)
      | "APPLICATION" => Ok(APPLICATION)
      | _ => Error("failed to decode enum FrfsAutocompletePlatformType")
      }
    })
  }

  let decodeFrfsAutocompletePlatformType = data => {
    decodeFrfsAutocompletePlatformTypeEnumResult(Some(data))
  }

  let decodeFrfsAutocompletePlatformTypeResult = (dict, key): result<
    frfsAutocompletePlatformType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsAutocompletePlatformTypeEnumResult
  }

  let frfsAutocompletePlatformTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | PARTNERORG => "PARTNERORG"
    | APPLICATION => "APPLICATION"
    }
  }
}
module FrfsAutocompleteCity = {
  @genType
  type frfsAutocompleteCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Birbhum

  let decodeFrfsAutocompleteCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsAutocompleteCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | "Birbhum" => Ok(Birbhum)
      | _ => Error("failed to decode enum FrfsAutocompleteCity")
      }
    })
  }

  let decodeFrfsAutocompleteCity = data => {
    decodeFrfsAutocompleteCityEnumResult(Some(data))
  }

  let decodeFrfsAutocompleteCityResult = (dict, key): result<frfsAutocompleteCity, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsAutocompleteCityEnumResult
  }

  let frfsAutocompleteCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    | Birbhum => "Birbhum"
    }
  }
}
module FrfsAutocompleteVehicleType = {
  @genType
  type frfsAutocompleteVehicleType = METRO | SUBWAY | BUS

  let decodeFrfsAutocompleteVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsAutocompleteVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum FrfsAutocompleteVehicleType")
      }
    })
  }

  let decodeFrfsAutocompleteVehicleType = data => {
    decodeFrfsAutocompleteVehicleTypeEnumResult(Some(data))
  }

  let decodeFrfsAutocompleteVehicleTypeResult = (dict, key): result<
    frfsAutocompleteVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsAutocompleteVehicleTypeEnumResult
  }

  let frfsAutocompleteVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FrfsBookingListVehicleType = {
  @genType
  type frfsBookingListVehicleType = METRO | SUBWAY | BUS

  let decodeFrfsBookingListVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsBookingListVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum FrfsBookingListVehicleType")
      }
    })
  }

  let decodeFrfsBookingListVehicleType = data => {
    decodeFrfsBookingListVehicleTypeEnumResult(Some(data))
  }

  let decodeFrfsBookingListVehicleTypeResult = (dict, key): result<
    frfsBookingListVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsBookingListVehicleTypeEnumResult
  }

  let frfsBookingListVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FRFSQuoteType = {
  @genType
  type fRFSQuoteType = SingleJourney | ReturnJourney | Pass | SpecialFareSingleJourney

  let decodeFRFSQuoteTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FRFSQuoteType type"), str => {
      switch str {
      | "SingleJourney" => Ok(SingleJourney)
      | "ReturnJourney" => Ok(ReturnJourney)
      | "Pass" => Ok(Pass)
      | "SpecialFareSingleJourney" => Ok(SpecialFareSingleJourney)
      | _ => Error("failed to decode enum FRFSQuoteType")
      }
    })
  }

  let decodeFRFSQuoteType = data => {
    decodeFRFSQuoteTypeEnumResult(Some(data))
  }

  let decodeFRFSQuoteTypeResult = (dict, key): result<fRFSQuoteType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFRFSQuoteTypeEnumResult
  }

  let fRFSQuoteTypeToString = enumValue => {
    switch enumValue {
    | SingleJourney => "SingleJourney"
    | ReturnJourney => "ReturnJourney"
    | Pass => "Pass"
    | SpecialFareSingleJourney => "SpecialFareSingleJourney"
    }
  }
}
module City = {
  @genType
  type city =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Sambalpur
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Birbhum
    | Ahmedabad
    | Surat
    | Vadodara
    | Jamnagar
    | AnyCity
  let decodeCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to City type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Sambalpur" => Ok(Sambalpur)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Birbhum" => Ok(Birbhum)
      | "Ahmedabad" => Ok(Ahmedabad)
      | "Surat" => Ok(Surat)
      | "Vadodara" => Ok(Vadodara)
      | "Jamnagar" => Ok(Jamnagar)
      | "AnyCity" => Ok(AnyCity)
      | _ => Error("failed to decode enum City")
      }
    })
  }

  let decodeCity = data => {
    decodeCityEnumResult(Some(data))
  }

  let decodeCityResult = (dict, key): result<city, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCityEnumResult
  }

  let cityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Sambalpur => "Sambalpur"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Birbhum => "Birbhum"
    | Ahmedabad => "Ahmedabad"
    | Surat => "Surat"
    | Vadodara => "Vadodara"
    | Jamnagar => "Jamnagar"
    | AnyCity => "AnyCity"
    }
  }
}
module MandateType = {
  @genType
  type mandateType = OPTIONAL | REQUIRED

  let decodeMandateTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to MandateType type"), str => {
      switch str {
      | "OPTIONAL" => Ok(OPTIONAL)
      | "REQUIRED" => Ok(REQUIRED)
      | _ => Error("failed to decode enum MandateType")
      }
    })
  }

  let decodeMandateType = data => {
    decodeMandateTypeEnumResult(Some(data))
  }

  let decodeMandateTypeResult = (dict, key): result<mandateType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMandateTypeEnumResult
  }

  let mandateTypeToString = enumValue => {
    switch enumValue {
    | OPTIONAL => "OPTIONAL"
    | REQUIRED => "REQUIRED"
    }
  }
}
module TransactionStatus = {
  @genType
  type transactionStatus =
    | NEW
    | PENDING_VBV
    | CHARGED
    | AUTHENTICATION_FAILED
    | AUTHORIZATION_FAILED
    | CANCELLED
    | JUSPAY_DECLINED
    | AUTHORIZING
    | COD_INITIATED
    | STARTED
    | AUTO_REFUNDED
    | CLIENT_AUTH_TOKEN_EXPIRED

  let decodeTransactionStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TransactionStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "PENDING_VBV" => Ok(PENDING_VBV)
      | "CHARGED" => Ok(CHARGED)
      | "AUTHENTICATION_FAILED" => Ok(AUTHENTICATION_FAILED)
      | "AUTHORIZATION_FAILED" => Ok(AUTHORIZATION_FAILED)
      | "CANCELLED" => Ok(CANCELLED)
      | "JUSPAY_DECLINED" => Ok(JUSPAY_DECLINED)
      | "AUTHORIZING" => Ok(AUTHORIZING)
      | "COD_INITIATED" => Ok(COD_INITIATED)
      | "STARTED" => Ok(STARTED)
      | "AUTO_REFUNDED" => Ok(AUTO_REFUNDED)
      | "CLIENT_AUTH_TOKEN_EXPIRED" => Ok(CLIENT_AUTH_TOKEN_EXPIRED)
      | _ => Error("failed to decode enum TransactionStatus")
      }
    })
  }

  let decodeTransactionStatus = data => {
    decodeTransactionStatusEnumResult(Some(data))
  }

  let decodeTransactionStatusResult = (dict, key): result<transactionStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTransactionStatusEnumResult
  }

  let transactionStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | PENDING_VBV => "PENDING_VBV"
    | CHARGED => "CHARGED"
    | AUTHENTICATION_FAILED => "AUTHENTICATION_FAILED"
    | AUTHORIZATION_FAILED => "AUTHORIZATION_FAILED"
    | CANCELLED => "CANCELLED"
    | JUSPAY_DECLINED => "JUSPAY_DECLINED"
    | AUTHORIZING => "AUTHORIZING"
    | COD_INITIATED => "COD_INITIATED"
    | STARTED => "STARTED"
    | AUTO_REFUNDED => "AUTO_REFUNDED"
    | CLIENT_AUTH_TOKEN_EXPIRED => "CLIENT_AUTH_TOKEN_EXPIRED"
    }
  }
}

module PaymentFulfillmentStatus = {
  @genType
  type paymentFulfillmentStatus =
    | FulfillmentPending
    | FulfillmentFailed
    | FulfillmentSucceeded
    | FulfillmentRefundPending
    | FulfillmentRefundInitiated
    | FulfillmentRefundFailed
    | FulfillmentRefunded

  let decodePaymentFulfillmentStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to pa type"), str => {
      switch str {
      | "FulfillmentPending" => Ok(FulfillmentPending)
      | "FulfillmentFailed" => Ok(FulfillmentFailed)
      | "FulfillmentSucceeded" => Ok(FulfillmentSucceeded)
      | "FulfillmentRefundPending" => Ok(FulfillmentRefundPending)
      | "FulfillmentRefundInitiated" => Ok(FulfillmentRefundInitiated)
      | "FulfillmentRefundFailed" => Ok(FulfillmentRefundFailed)
      | "FulfillmentRefunded" => Ok(FulfillmentRefunded)
      | _ => Error("failed to decode enum PaymentFulfillmentStatus")
      }
    })
  }

  let decodePaymentFulfillmentStatus = data => {
    decodePaymentFulfillmentStatusEnumResult(Some(data))
  }

  let decodePaymentFulfillmentStatusResult = (dict, key): result<
    paymentFulfillmentStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePaymentFulfillmentStatusEnumResult
  }

  let paymentFulfillmentStatusToString = enumValue => {
    switch enumValue {
    | FulfillmentPending => "FulfillmentPending"
    | FulfillmentFailed => "FulfillmentFailed"
    | FulfillmentSucceeded => "FulfillmentSucceeded"
    | FulfillmentRefundPending => "FulfillmentRefundPending"
    | FulfillmentRefundInitiated => "FulfillmentRefundInitiated"
    | FulfillmentRefundFailed => "FulfillmentRefundFailed"
    | FulfillmentRefunded => "FulfillmentRefunded"
    }
  }
}

module FRFSBookingPaymentStatusAPI = {
  @genType
  type fRFSBookingPaymentStatusAPI = NEW | PENDING | SUCCESS | FAILURE | REFUND_PENDING | REFUNDED

  let decodeFRFSBookingPaymentStatusAPIEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FRFSBookingPaymentStatusAPI type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "PENDING" => Ok(PENDING)
      | "SUCCESS" => Ok(SUCCESS)
      | "FAILURE" => Ok(FAILURE)
      | "REFUND_PENDING" => Ok(REFUND_PENDING)
      | "REFUNDED" => Ok(REFUNDED)
      | _ => Error("failed to decode enum FRFSBookingPaymentStatusAPI")
      }
    })
  }

  let decodeFRFSBookingPaymentStatusAPI = data => {
    decodeFRFSBookingPaymentStatusAPIEnumResult(Some(data))
  }

  let decodeFRFSBookingPaymentStatusAPIResult = (dict, key): result<
    fRFSBookingPaymentStatusAPI,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFRFSBookingPaymentStatusAPIEnumResult
  }

  let fRFSBookingPaymentStatusAPIToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | PENDING => "PENDING"
    | SUCCESS => "SUCCESS"
    | FAILURE => "FAILURE"
    | REFUND_PENDING => "REFUND_PENDING"
    | REFUNDED => "REFUNDED"
    }
  }
}
module FRFSTicketBookingStatus = {
  @genType
  type fRFSTicketBookingStatus =
    | NEW
    | APPROVED
    | PAYMENT_PENDING
    | CONFIRMING
    | FAILED
    | CONFIRMED
    | CANCELLED
    | COUNTER_CANCELLED
    | CANCEL_INITIATED
    | TECHNICAL_CANCEL_REJECTED

  let decodeFRFSTicketBookingStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FRFSTicketBookingStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "APPROVED" => Ok(APPROVED)
      | "PAYMENT_PENDING" => Ok(PAYMENT_PENDING)
      | "CONFIRMING" => Ok(CONFIRMING)
      | "FAILED" => Ok(FAILED)
      | "CONFIRMED" => Ok(CONFIRMED)
      | "CANCELLED" => Ok(CANCELLED)
      | "COUNTER_CANCELLED" => Ok(COUNTER_CANCELLED)
      | "CANCEL_INITIATED" => Ok(CANCEL_INITIATED)
      | "TECHNICAL_CANCEL_REJECTED" => Ok(TECHNICAL_CANCEL_REJECTED)
      | _ => Error("failed to decode enum FRFSTicketBookingStatus")
      }
    })
  }

  let decodeFRFSTicketBookingStatus = data => {
    decodeFRFSTicketBookingStatusEnumResult(Some(data))
  }

  let decodeFRFSTicketBookingStatusResult = (dict, key): result<
    fRFSTicketBookingStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFRFSTicketBookingStatusEnumResult
  }

  let fRFSTicketBookingStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | APPROVED => "APPROVED"
    | PAYMENT_PENDING => "PAYMENT_PENDING"
    | CONFIRMING => "CONFIRMING"
    | FAILED => "FAILED"
    | CONFIRMED => "CONFIRMED"
    | CANCELLED => "CANCELLED"
    | COUNTER_CANCELLED => "COUNTER_CANCELLED"
    | CANCEL_INITIATED => "CANCEL_INITIATED"
    | TECHNICAL_CANCEL_REJECTED => "TECHNICAL_CANCEL_REJECTED"
    }
  }
}
module FRFSTicketStatus = {
  @genType
  type fRFSTicketStatus =
    | ACTIVE
    | EXPIRED
    | INPROGRESS
    | USED
    | CANCELLED
    | COUNTER_CANCELLED
    | CANCEL_INITIATED
    | TECHNICAL_CANCEL_REJECTED

  let decodeFRFSTicketStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FRFSTicketStatus type"), str => {
      switch str {
      | "ACTIVE" => Ok(ACTIVE)
      | "EXPIRED" => Ok(EXPIRED)
      | "INPROGRESS" => Ok(INPROGRESS)
      | "USED" => Ok(USED)
      | "CANCELLED" => Ok(CANCELLED)
      | "COUNTER_CANCELLED" => Ok(COUNTER_CANCELLED)
      | "CANCEL_INITIATED" => Ok(CANCEL_INITIATED)
      | "TECHNICAL_CANCEL_REJECTED" => Ok(TECHNICAL_CANCEL_REJECTED)
      | _ => Error("failed to decode enum FRFSTicketStatus")
      }
    })
  }

  let decodeFRFSTicketStatus = data => {
    decodeFRFSTicketStatusEnumResult(Some(data))
  }

  let decodeFRFSTicketStatusResult = (dict, key): result<fRFSTicketStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFRFSTicketStatusEnumResult
  }

  let fRFSTicketStatusToString = enumValue => {
    switch enumValue {
    | ACTIVE => "ACTIVE"
    | EXPIRED => "EXPIRED"
    | INPROGRESS => "INPROGRESS"
    | USED => "USED"
    | CANCELLED => "CANCELLED"
    | COUNTER_CANCELLED => "COUNTER_CANCELLED"
    | CANCEL_INITIATED => "CANCEL_INITIATED"
    | TECHNICAL_CANCEL_REJECTED => "TECHNICAL_CANCEL_REJECTED"
    }
  }
}
module VehicleCategory = {
  @genType
  type vehicleCategory = METRO | SUBWAY | BUS

  let decodeVehicleCategoryEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to VehicleCategory type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum VehicleCategory")
      }
    })
  }

  let decodeVehicleCategory = data => {
    decodeVehicleCategoryEnumResult(Some(data))
  }

  let decodeVehicleCategoryResult = (dict, key): result<vehicleCategory, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeVehicleCategoryEnumResult
  }

  let vehicleCategoryToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FrfsConfigCity = {
  @genType
  type frfsConfigCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Birbhum

  let decodeFrfsConfigCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsConfigCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Birbhum" => Ok(Birbhum)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | _ => Error("failed to decode enum FrfsConfigCity")
      }
    })
  }

  let decodeFrfsConfigCity = data => {
    decodeFrfsConfigCityEnumResult(Some(data))
  }

  let decodeFrfsConfigCityResult = (dict, key): result<frfsConfigCity, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsConfigCityEnumResult
  }

  let frfsConfigCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Birbhum => "Birbhum"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    }
  }
}
module QuoteConfirmStatus = {
  @genType
  type quoteConfirmStatus = ON_SEARCH_NOT_RECEIVED_YET | INIT_TRIGGERED

  let decodeQuoteConfirmStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to QuoteConfirmStatus type"), str => {
      switch str {
      | "ON_SEARCH_NOT_RECEIVED_YET" => Ok(ON_SEARCH_NOT_RECEIVED_YET)
      | "INIT_TRIGGERED" => Ok(INIT_TRIGGERED)
      | _ => Error("failed to decode enum QuoteConfirmStatus")
      }
    })
  }

  let decodeQuoteConfirmStatus = data => {
    decodeQuoteConfirmStatusEnumResult(Some(data))
  }

  let decodeQuoteConfirmStatusResult = (dict, key): result<quoteConfirmStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeQuoteConfirmStatusEnumResult
  }

  let quoteConfirmStatusToString = enumValue => {
    switch enumValue {
    | ON_SEARCH_NOT_RECEIVED_YET => "ON_SEARCH_NOT_RECEIVED_YET"
    | INIT_TRIGGERED => "INIT_TRIGGERED"
    }
  }
}
module FrfsRouteRouteCodePlatformType = {
  @genType
  type frfsRouteRouteCodePlatformType = MULTIMODAL | PARTNERORG | APPLICATION

  let decodeFrfsRouteRouteCodePlatformTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsRouteRouteCodePlatformType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "PARTNERORG" => Ok(PARTNERORG)
      | "APPLICATION" => Ok(APPLICATION)
      | _ => Error("failed to decode enum FrfsRouteRouteCodePlatformType")
      }
    })
  }

  let decodeFrfsRouteRouteCodePlatformType = data => {
    decodeFrfsRouteRouteCodePlatformTypeEnumResult(Some(data))
  }

  let decodeFrfsRouteRouteCodePlatformTypeResult = (dict, key): result<
    frfsRouteRouteCodePlatformType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsRouteRouteCodePlatformTypeEnumResult
  }

  let frfsRouteRouteCodePlatformTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | PARTNERORG => "PARTNERORG"
    | APPLICATION => "APPLICATION"
    }
  }
}
module FrfsRouteRouteCodeCity = {
  @genType
  type frfsRouteRouteCodeCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Birbhum

  let decodeFrfsRouteRouteCodeCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsRouteRouteCodeCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | "Birbhum" => Ok(Birbhum)
      | _ => Error("failed to decode enum FrfsRouteRouteCodeCity")
      }
    })
  }

  let decodeFrfsRouteRouteCodeCity = data => {
    decodeFrfsRouteRouteCodeCityEnumResult(Some(data))
  }

  let decodeFrfsRouteRouteCodeCityResult = (dict, key): result<frfsRouteRouteCodeCity, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsRouteRouteCodeCityEnumResult
  }

  let frfsRouteRouteCodeCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    | Birbhum => "Birbhum"
    }
  }
}
module FrfsRouteRouteCodeVehicleType = {
  @genType
  type frfsRouteRouteCodeVehicleType = METRO | SUBWAY | BUS

  let decodeFrfsRouteRouteCodeVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsRouteRouteCodeVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum FrfsRouteRouteCodeVehicleType")
      }
    })
  }

  let decodeFrfsRouteRouteCodeVehicleType = data => {
    decodeFrfsRouteRouteCodeVehicleTypeEnumResult(Some(data))
  }

  let decodeFrfsRouteRouteCodeVehicleTypeResult = (dict, key): result<
    frfsRouteRouteCodeVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsRouteRouteCodeVehicleTypeEnumResult
  }

  let frfsRouteRouteCodeVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FrfsRoutesCity = {
  @genType
  type frfsRoutesCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Birbhum

  let decodeFrfsRoutesCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsRoutesCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | "Birbhum" => Ok(Birbhum)
      | _ => Error("failed to decode enum FrfsRoutesCity")
      }
    })
  }

  let decodeFrfsRoutesCity = data => {
    decodeFrfsRoutesCityEnumResult(Some(data))
  }

  let decodeFrfsRoutesCityResult = (dict, key): result<frfsRoutesCity, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsRoutesCityEnumResult
  }

  let frfsRoutesCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    | Birbhum => "Birbhum"
    }
  }
}
module FrfsRoutesVehicleType = {
  @genType
  type frfsRoutesVehicleType = METRO | SUBWAY | BUS

  let decodeFrfsRoutesVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsRoutesVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum FrfsRoutesVehicleType")
      }
    })
  }

  let decodeFrfsRoutesVehicleType = data => {
    decodeFrfsRoutesVehicleTypeEnumResult(Some(data))
  }

  let decodeFrfsRoutesVehicleTypeResult = (dict, key): result<frfsRoutesVehicleType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsRoutesVehicleTypeEnumResult
  }

  let frfsRoutesVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FrfsSearchCity = {
  @genType
  type frfsSearchCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Birbhum

  let decodeFrfsSearchCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsSearchCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | "Birbhum" => Ok(Birbhum)
      | _ => Error("failed to decode enum FrfsSearchCity")
      }
    })
  }

  let decodeFrfsSearchCity = data => {
    decodeFrfsSearchCityEnumResult(Some(data))
  }

  let decodeFrfsSearchCityResult = (dict, key): result<frfsSearchCity, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsSearchCityEnumResult
  }

  let frfsSearchCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    | Birbhum => "Birbhum"
    }
  }
}
module FrfsSearchVehicleType = {
  @genType
  type frfsSearchVehicleType = METRO | SUBWAY | BUS

  let decodeFrfsSearchVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsSearchVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum FrfsSearchVehicleType")
      }
    })
  }

  let decodeFrfsSearchVehicleType = data => {
    decodeFrfsSearchVehicleTypeEnumResult(Some(data))
  }

  let decodeFrfsSearchVehicleTypeResult = (dict, key): result<frfsSearchVehicleType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsSearchVehicleTypeEnumResult
  }

  let frfsSearchVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FrfsStationsCity = {
  @genType
  type frfsStationsCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Birbhum

  let decodeFrfsStationsCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsStationsCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | "Birbhum" => Ok(Birbhum)
      | _ => Error("failed to decode enum FrfsStationsCity")
      }
    })
  }

  let decodeFrfsStationsCity = data => {
    decodeFrfsStationsCityEnumResult(Some(data))
  }

  let decodeFrfsStationsCityResult = (dict, key): result<frfsStationsCity, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsStationsCityEnumResult
  }

  let frfsStationsCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    | Birbhum => "Birbhum"
    }
  }
}
module FrfsStationsPlatformType = {
  @genType
  type frfsStationsPlatformType = MULTIMODAL | PARTNERORG | APPLICATION

  let decodeFrfsStationsPlatformTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsStationsPlatformType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "PARTNERORG" => Ok(PARTNERORG)
      | "APPLICATION" => Ok(APPLICATION)
      | _ => Error("failed to decode enum FrfsStationsPlatformType")
      }
    })
  }

  let decodeFrfsStationsPlatformType = data => {
    decodeFrfsStationsPlatformTypeEnumResult(Some(data))
  }

  let decodeFrfsStationsPlatformTypeResult = (dict, key): result<
    frfsStationsPlatformType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsStationsPlatformTypeEnumResult
  }

  let frfsStationsPlatformTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | PARTNERORG => "PARTNERORG"
    | APPLICATION => "APPLICATION"
    }
  }
}
module FrfsStationsVehicleType = {
  @genType
  type frfsStationsVehicleType = METRO | SUBWAY | BUS

  let decodeFrfsStationsVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsStationsVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum FrfsStationsVehicleType")
      }
    })
  }

  let decodeFrfsStationsVehicleType = data => {
    decodeFrfsStationsVehicleTypeEnumResult(Some(data))
  }

  let decodeFrfsStationsVehicleTypeResult = (dict, key): result<
    frfsStationsVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsStationsVehicleTypeEnumResult
  }

  let frfsStationsVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FrfsTicketVerifyPlatformType = {
  @genType
  type frfsTicketVerifyPlatformType = MULTIMODAL | PARTNERORG | APPLICATION

  let decodeFrfsTicketVerifyPlatformTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsTicketVerifyPlatformType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "PARTNERORG" => Ok(PARTNERORG)
      | "APPLICATION" => Ok(APPLICATION)
      | _ => Error("failed to decode enum FrfsTicketVerifyPlatformType")
      }
    })
  }

  let decodeFrfsTicketVerifyPlatformType = data => {
    decodeFrfsTicketVerifyPlatformTypeEnumResult(Some(data))
  }

  let decodeFrfsTicketVerifyPlatformTypeResult = (dict, key): result<
    frfsTicketVerifyPlatformType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsTicketVerifyPlatformTypeEnumResult
  }

  let frfsTicketVerifyPlatformTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | PARTNERORG => "PARTNERORG"
    | APPLICATION => "APPLICATION"
    }
  }
}
module FrfsTicketVerifyCity = {
  @genType
  type frfsTicketVerifyCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Birbhum

  let decodeFrfsTicketVerifyCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsTicketVerifyCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | "Birbhum" => Ok(Birbhum)
      | _ => Error("failed to decode enum FrfsTicketVerifyCity")
      }
    })
  }

  let decodeFrfsTicketVerifyCity = data => {
    decodeFrfsTicketVerifyCityEnumResult(Some(data))
  }

  let decodeFrfsTicketVerifyCityResult = (dict, key): result<frfsTicketVerifyCity, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsTicketVerifyCityEnumResult
  }

  let frfsTicketVerifyCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    | Birbhum => "Birbhum"
    }
  }
}
module FrfsTicketVerifyVehicleType = {
  @genType
  type frfsTicketVerifyVehicleType = METRO | SUBWAY | BUS

  let decodeFrfsTicketVerifyVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsTicketVerifyVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum FrfsTicketVerifyVehicleType")
      }
    })
  }

  let decodeFrfsTicketVerifyVehicleType = data => {
    decodeFrfsTicketVerifyVehicleTypeEnumResult(Some(data))
  }

  let decodeFrfsTicketVerifyVehicleTypeResult = (dict, key): result<
    frfsTicketVerifyVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsTicketVerifyVehicleTypeEnumResult
  }

  let frfsTicketVerifyVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module FrfsTransitStopsPlatformType = {
  @genType
  type frfsTransitStopsPlatformType = MULTIMODAL | PARTNERORG | APPLICATION

  let decodeFrfsTransitStopsPlatformTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrfsTransitStopsPlatformType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "PARTNERORG" => Ok(PARTNERORG)
      | "APPLICATION" => Ok(APPLICATION)
      | _ => Error("failed to decode enum FrfsTransitStopsPlatformType")
      }
    })
  }

  let decodeFrfsTransitStopsPlatformType = data => {
    decodeFrfsTransitStopsPlatformTypeEnumResult(Some(data))
  }

  let decodeFrfsTransitStopsPlatformTypeResult = (dict, key): result<
    frfsTransitStopsPlatformType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrfsTransitStopsPlatformTypeEnumResult
  }

  let frfsTransitStopsPlatformTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | PARTNERORG => "PARTNERORG"
    | APPLICATION => "APPLICATION"
    }
  }
}
module OneWayMode = {
  @genType
  type oneWayMode = OneWayRideOtp | OneWayOnDemandStaticOffer | OneWayOnDemandDynamicOffer

  let decodeOneWayModeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to OneWayMode type"), str => {
      switch str {
      | "OneWayRideOtp" => Ok(OneWayRideOtp)
      | "OneWayOnDemandStaticOffer" => Ok(OneWayOnDemandStaticOffer)
      | "OneWayOnDemandDynamicOffer" => Ok(OneWayOnDemandDynamicOffer)
      | _ => Error("failed to decode enum OneWayMode")
      }
    })
  }

  let decodeOneWayMode = data => {
    decodeOneWayModeEnumResult(Some(data))
  }

  let decodeOneWayModeResult = (dict, key): result<oneWayMode, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeOneWayModeEnumResult
  }

  let oneWayModeToString = enumValue => {
    switch enumValue {
    | OneWayRideOtp => "OneWayRideOtp"
    | OneWayOnDemandStaticOffer => "OneWayOnDemandStaticOffer"
    | OneWayOnDemandDynamicOffer => "OneWayOnDemandDynamicOffer"
    }
  }
}
module TripMode = {
  @genType
  type tripMode = RideOtp | OnDemandStaticOffer

  let decodeTripModeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TripMode type"), str => {
      switch str {
      | "RideOtp" => Ok(RideOtp)
      | "OnDemandStaticOffer" => Ok(OnDemandStaticOffer)
      | _ => Error("failed to decode enum TripMode")
      }
    })
  }

  let decodeTripMode = data => {
    decodeTripModeEnumResult(Some(data))
  }

  let decodeTripModeResult = (dict, key): result<tripMode, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTripModeEnumResult
  }

  let tripModeToString = enumValue => {
    switch enumValue {
    | RideOtp => "RideOtp"
    | OnDemandStaticOffer => "OnDemandStaticOffer"
    }
  }
}
module FareProductType = {
  @genType
  type fareProductType =
    ONE_WAY | RENTAL | DRIVER_OFFER | ONE_WAY_SPECIAL_ZONE | INTER_CITY | AMBULANCE

  let decodeFareProductTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FareProductType type"), str => {
      switch str {
      | "ONE_WAY" => Ok(ONE_WAY)
      | "RENTAL" => Ok(RENTAL)
      | "DRIVER_OFFER" => Ok(DRIVER_OFFER)
      | "ONE_WAY_SPECIAL_ZONE" => Ok(ONE_WAY_SPECIAL_ZONE)
      | "INTER_CITY" => Ok(INTER_CITY)
      | "AMBULANCE" => Ok(AMBULANCE)
      | _ => Error("failed to decode enum FareProductType")
      }
    })
  }

  let decodeFareProductType = data => {
    decodeFareProductTypeEnumResult(Some(data))
  }

  let decodeFareProductTypeResult = (dict, key): result<fareProductType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFareProductTypeEnumResult
  }

  let fareProductTypeToString = enumValue => {
    switch enumValue {
    | ONE_WAY => "ONE_WAY"
    | RENTAL => "RENTAL"
    | DRIVER_OFFER => "DRIVER_OFFER"
    | ONE_WAY_SPECIAL_ZONE => "ONE_WAY_SPECIAL_ZONE"
    | INTER_CITY => "INTER_CITY"
    | AMBULANCE => "AMBULANCE"
    }
  }
}
module PartyRole = {
  @genType
  type partyRole = Initiator | DeliveryRoleSender | DeliveryRoleReceiver

  let decodePartyRoleEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PartyRole type"), str => {
      switch str {
      | "Initiator" => Ok(Initiator)
      | "DeliveryRoleSender" => Ok(DeliveryRoleSender)
      | "DeliveryRoleReceiver" => Ok(DeliveryRoleReceiver)
      | _ => Error("failed to decode enum PartyRole")
      }
    })
  }

  let decodePartyRole = data => {
    decodePartyRoleEnumResult(Some(data))
  }

  let decodePartyRoleResult = (dict, key): result<partyRole, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePartyRoleEnumResult
  }

  let partyRoleToString = enumValue => {
    switch enumValue {
    | Initiator => "Initiator"
    | DeliveryRoleSender => "DeliveryRoleSender"
    | DeliveryRoleReceiver => "DeliveryRoleReceiver"
    }
  }
}
module CancellationStage = {
  @genType
  type cancellationStage = OnSearch | OnInit | OnConfirm | OnAssign

  let decodeCancellationStageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CancellationStage type"), str => {
      switch str {
      | "OnSearch" => Ok(OnSearch)
      | "OnInit" => Ok(OnInit)
      | "OnConfirm" => Ok(OnConfirm)
      | "OnAssign" => Ok(OnAssign)
      | _ => Error("failed to decode enum CancellationStage")
      }
    })
  }

  let decodeCancellationStage = data => {
    decodeCancellationStageEnumResult(Some(data))
  }

  let decodeCancellationStageResult = (dict, key): result<cancellationStage, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCancellationStageEnumResult
  }

  let cancellationStageToString = enumValue => {
    switch enumValue {
    | OnSearch => "OnSearch"
    | OnInit => "OnInit"
    | OnConfirm => "OnConfirm"
    | OnAssign => "OnAssign"
    }
  }
}
module CancellationSource = {
  @genType
  type cancellationSource = ByUser | ByDriver | ByMerchant | ByAllocator | ByApplication

  let decodeCancellationSourceEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CancellationSource type"), str => {
      switch str {
      | "ByUser" => Ok(ByUser)
      | "ByDriver" => Ok(ByDriver)
      | "ByMerchant" => Ok(ByMerchant)
      | "ByAllocator" => Ok(ByAllocator)
      | "ByApplication" => Ok(ByApplication)
      | _ => Error("failed to decode enum CancellationSource")
      }
    })
  }

  let decodeCancellationSource = data => {
    decodeCancellationSourceEnumResult(Some(data))
  }

  let decodeCancellationSourceResult = (dict, key): result<cancellationSource, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCancellationSourceEnumResult
  }

  let cancellationSourceToString = enumValue => {
    switch enumValue {
    | ByUser => "ByUser"
    | ByDriver => "ByDriver"
    | ByMerchant => "ByMerchant"
    | ByAllocator => "ByAllocator"
    | ByApplication => "ByApplication"
    }
  }
}
module RideStatus = {
  @genType
  type rideStatus = UPCOMING | NEW | INPROGRESS | COMPLETED | CANCELLED

  let decodeRideStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideStatus type"), str => {
      switch str {
      | "UPCOMING" => Ok(UPCOMING)
      | "R_UPCOMING" => Ok(UPCOMING)
      | "NEW" => Ok(NEW)
      | "R_NEW" => Ok(NEW)
      | "INPROGRESS" => Ok(INPROGRESS)
      | "R_INPROGRESS" => Ok(INPROGRESS)
      | "COMPLETED" => Ok(COMPLETED)
      | "R_COMPLETED" => Ok(COMPLETED)
      | "CANCELLED" => Ok(CANCELLED)
      | "R_CANCELLED" => Ok(CANCELLED)
      | _ => Error("failed to decode enum RideStatus")
      }
    })
  }

  let decodeRideStatus = data => {
    decodeRideStatusEnumResult(Some(data))
  }

  let decodeRideStatusResult = (dict, key): result<rideStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideStatusEnumResult
  }

  let rideStatusToString = enumValue => {
    switch enumValue {
    | UPCOMING => "UPCOMING"
    | NEW => "NEW"
    | INPROGRESS => "INPROGRESS"
    | COMPLETED => "COMPLETED"
    | CANCELLED => "CANCELLED"
    }
  }
}
module Confidence = {
  @genType
  type confidence = Sure | Unsure | Neutral

  let decodeConfidenceEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to Confidence type"), str => {
      switch str {
      | "Sure" => Ok(Sure)
      | "Unsure" => Ok(Unsure)
      | "Neutral" => Ok(Neutral)
      | _ => Error("failed to decode enum Confidence")
      }
    })
  }

  let decodeConfidence = data => {
    decodeConfidenceEnumResult(Some(data))
  }

  let decodeConfidenceResult = (dict, key): result<confidence, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeConfidenceEnumResult
  }

  let confidenceToString = enumValue => {
    switch enumValue {
    | Sure => "Sure"
    | Unsure => "Unsure"
    | Neutral => "Neutral"
    }
  }
}
module VehicleVariant = {
  @genType
  type vehicleVariant =
    | SEDAN
    | SUV
    | HATCHBACK
    | AUTO_RICKSHAW
    | TAXI
    | TAXI_PLUS
    | PREMIUM_SEDAN
    | BLACK
    | BLACK_XL
    | BIKE
    | AMBULANCE_TAXI
    | AMBULANCE_TAXI_OXY
    | AMBULANCE_AC
    | AMBULANCE_AC_OXY
    | AMBULANCE_VENTILATOR
    | SUV_PLUS
    | DELIVERY_BIKE
    | DELIVERY_LIGHT_GOODS_VEHICLE
    | HERITAGE_CAB
    | EV_AUTO_RICKSHAW
    | AUTO_PLUS
    | UNKNOWN_VEHICLE_VARIANT
    | BIKE_PLUS
    | AC_PRIORITY
    | E_RICKSHAW

  let decodeVehicleVariantEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to VehicleVariant type"), str => {
      switch str {
      | "SEDAN" => Ok(SEDAN)
      | "SUV" => Ok(SUV)
      | "HATCHBACK" => Ok(HATCHBACK)
      | "AUTO_RICKSHAW" => Ok(AUTO_RICKSHAW)
      | "TAXI" => Ok(TAXI)
      | "TAXI_PLUS" => Ok(TAXI_PLUS)
      | "PREMIUM_SEDAN" => Ok(PREMIUM_SEDAN)
      | "BLACK" => Ok(BLACK)
      | "BLACK_XL" => Ok(BLACK_XL)
      | "BIKE" => Ok(BIKE)
      | "AMBULANCE_TAXI" => Ok(AMBULANCE_TAXI)
      | "AMBULANCE_TAXI_OXY" => Ok(AMBULANCE_TAXI_OXY)
      | "AMBULANCE_AC" => Ok(AMBULANCE_AC)
      | "AMBULANCE_AC_OXY" => Ok(AMBULANCE_AC_OXY)
      | "AMBULANCE_VENTILATOR" => Ok(AMBULANCE_VENTILATOR)
      | "SUV_PLUS" => Ok(SUV_PLUS)
      | "DELIVERY_BIKE" => Ok(DELIVERY_BIKE)
      | "DELIVERY_LIGHT_GOODS_VEHICLE" => Ok(DELIVERY_LIGHT_GOODS_VEHICLE)
      | "HERITAGE_CAB" => Ok(HERITAGE_CAB)
      | "AUTO_PLUS" => Ok(AUTO_PLUS)
      | "EV_AUTO_RICKSHAW" => Ok(EV_AUTO_RICKSHAW)
      | "BIKE_PLUS" => Ok(BIKE_PLUS)
      | "AC_PRIORITY" => Ok(AC_PRIORITY)
      | "E_RICKSHAW" => Ok(E_RICKSHAW)
      | _ => {
          Console.warn(
            "Unknown vehicle variant received from backend , using UNKNOWN_VEHICLE_VARIANT as fallback",
          )
          Ok(UNKNOWN_VEHICLE_VARIANT)
        }
      }
    })
  }

  let decodeVehicleVariant = data => {
    decodeVehicleVariantEnumResult(Some(data))
  }

  let decodeVehicleVariantResult = (dict, key): result<vehicleVariant, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeVehicleVariantEnumResult
  }

  let vehicleVariantToString = enumValue => {
    switch enumValue {
    | SEDAN => "SEDAN"
    | SUV => "SUV"
    | HATCHBACK => "HATCHBACK"
    | AUTO_RICKSHAW => "AUTO_RICKSHAW"
    | TAXI => "TAXI"
    | TAXI_PLUS => "TAXI_PLUS"
    | PREMIUM_SEDAN => "PREMIUM_SEDAN"
    | BLACK => "BLACK"
    | BLACK_XL => "BLACK_XL"
    | BIKE => "BIKE"
    | AMBULANCE_TAXI => "AMBULANCE_TAXI"
    | AMBULANCE_TAXI_OXY => "AMBULANCE_TAXI_OXY"
    | AMBULANCE_AC => "AMBULANCE_AC"
    | AMBULANCE_AC_OXY => "AMBULANCE_AC_OXY"
    | AMBULANCE_VENTILATOR => "AMBULANCE_VENTILATOR"
    | SUV_PLUS => "SUV_PLUS"
    | DELIVERY_BIKE => "DELIVERY_BIKE"
    | DELIVERY_LIGHT_GOODS_VEHICLE => "DELIVERY_LIGHT_GOODS_VEHICLE"
    | HERITAGE_CAB => "HERITAGE_CAB"
    | EV_AUTO_RICKSHAW => "EV_AUTO_RICKSHAW"
    | AUTO_PLUS => "AUTO_PLUS"
    | UNKNOWN_VEHICLE_VARIANT => "AUTO_RICKSHAW"
    | BIKE_PLUS => "BIKE_PLUS"
    | AC_PRIORITY => "AC_PRIORITY"
    | E_RICKSHAW => "E_RICKSHAW"
    }
  }
}
module SosStatus = {
  @genType
  type sosStatus = Resolved | NotResolved | Pending | MockPending | MockResolved

  let decodeSosStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to SosStatus type"), str => {
      switch str {
      | "Resolved" => Ok(Resolved)
      | "NotResolved" => Ok(NotResolved)
      | "Pending" => Ok(Pending)
      | "MockPending" => Ok(MockPending)
      | "MockResolved" => Ok(MockResolved)
      | _ => Error("failed to decode enum SosStatus")
      }
    })
  }

  let decodeSosStatus = data => {
    decodeSosStatusEnumResult(Some(data))
  }

  let decodeSosStatusResult = (dict, key): result<sosStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeSosStatusEnumResult
  }

  let sosStatusToString = enumValue => {
    switch enumValue {
    | Resolved => "Resolved"
    | NotResolved => "NotResolved"
    | Pending => "Pending"
    | MockPending => "MockPending"
    | MockResolved => "MockResolved"
    }
  }
}
module BookingStatus = {
  @genType
  type bookingStatus =
    NEW | CONFIRMED | AWAITING_REASSIGNMENT | REALLOCATED | COMPLETED | CANCELLED | TRIP_ASSIGNED

  let decodeBookingStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to BookingStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "CONFIRMED" => Ok(CONFIRMED)
      | "AWAITING_REASSIGNMENT" => Ok(AWAITING_REASSIGNMENT)
      | "REALLOCATED" => Ok(REALLOCATED)
      | "COMPLETED" => Ok(COMPLETED)
      | "CANCELLED" => Ok(CANCELLED)
      | "TRIP_ASSIGNED" => Ok(TRIP_ASSIGNED)
      | _ => Error("failed to decode enum BookingStatus")
      }
    })
  }

  let decodeBookingStatus = data => {
    decodeBookingStatusEnumResult(Some(data))
  }

  let decodeBookingStatusResult = (dict, key): result<bookingStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeBookingStatusEnumResult
  }

  let bookingStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | CONFIRMED => "CONFIRMED"
    | AWAITING_REASSIGNMENT => "AWAITING_REASSIGNMENT"
    | REALLOCATED => "REALLOCATED"
    | COMPLETED => "COMPLETED"
    | CANCELLED => "CANCELLED"
    | TRIP_ASSIGNED => "TRIP_ASSIGNED"
    }
  }
}
module MultimodalTravelMode = {
  @genType
  type multimodalTravelMode = Metro | Bus | Walk | Taxi | Subway

  let decodeMultimodalTravelModeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to MultimodalTravelMode type"), str => {
      switch str {
      | "Metro" => Ok(Metro)
      | "Bus" => Ok(Bus)
      | "Walk" => Ok(Walk)
      | "Taxi" => Ok(Taxi)
      | "Subway" => Ok(Subway)
      | _ => Error("failed to decode enum MultimodalTravelMode")
      }
    })
  }

  let decodeMultimodalTravelMode = data => {
    decodeMultimodalTravelModeEnumResult(Some(data))
  }

  let decodeMultimodalTravelModeResult = (dict, key): result<multimodalTravelMode, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMultimodalTravelModeEnumResult
  }

  let multimodalTravelModeToString = enumValue => {
    switch enumValue {
    | Metro => "Metro"
    | Bus => "Bus"
    | Walk => "Walk"
    | Taxi => "Taxi"
    | Subway => "Subway"
    }
  }
}
module JourneyStatus = {
  @genType
  type journeyStatus =
    | NEW
    | INITIATED
    | CONFIRMED
    | INPROGRESS
    | CANCELLED
    | FEEDBACK_PENDING
    | COMPLETED
    | EXPIRED
    | FAILED

  let decodeJourneyStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to JourneyStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "INITIATED" => Ok(INITIATED)
      | "CONFIRMED" => Ok(CONFIRMED)
      | "INPROGRESS" => Ok(INPROGRESS)
      | "CANCELLED" => Ok(CANCELLED)
      | "FEEDBACK_PENDING" => Ok(FEEDBACK_PENDING)
      | "COMPLETED" => Ok(COMPLETED)
      | "EXPIRED" => Ok(EXPIRED)
      | "FAILED" => Ok(FAILED)
      | _ => Error("failed to decode enum JourneyStatus")
      }
    })
  }

  let decodeJourneyStatus = data => {
    decodeJourneyStatusEnumResult(Some(data))
  }

  let decodeJourneyStatusResult = (dict, key): result<journeyStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeJourneyStatusEnumResult
  }

  let journeyStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | INITIATED => "INITIATED"
    | CONFIRMED => "CONFIRMED"
    | INPROGRESS => "INPROGRESS"
    | CANCELLED => "CANCELLED"
    | FEEDBACK_PENDING => "FEEDBACK_PENDING"
    | COMPLETED => "COMPLETED"
    | EXPIRED => "EXPIRED"
    | FAILED => "FAILED"
    }
  }
}
module FrontendEvent = {
  @genType
  type frontendEvent = RATE_DRIVER_SKIPPED | SEARCH_CANCELLED

  let decodeFrontendEventEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrontendEvent type"), str => {
      switch str {
      | "RATE_DRIVER_SKIPPED" => Ok(RATE_DRIVER_SKIPPED)
      | "SEARCH_CANCELLED" => Ok(SEARCH_CANCELLED)
      | _ => Error("failed to decode enum FrontendEvent")
      }
    })
  }

  let decodeFrontendEvent = data => {
    decodeFrontendEventEnumResult(Some(data))
  }

  let decodeFrontendEventResult = (dict, key): result<frontendEvent, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrontendEventEnumResult
  }

  let frontendEventToString = enumValue => {
    switch enumValue {
    | RATE_DRIVER_SKIPPED => "RATE_DRIVER_SKIPPED"
    | SEARCH_CANCELLED => "SEARCH_CANCELLED"
    }
  }
}
module IssueLanguage = {
  @genType
  type issueLanguage =
    ENGLISH | HINDI | KANNADA | TAMIL | MALAYALAM | BENGALI | FRENCH | TELUGU | DUTCH | ODIA

  let decodeIssueLanguageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IssueLanguage type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "DUTCH" => Ok(DUTCH)
      | "ODIA" => Ok(ODIA)
      | _ => Error("failed to decode enum IssueLanguage")
      }
    })
  }

  let decodeIssueLanguage = data => {
    decodeIssueLanguageEnumResult(Some(data))
  }

  let decodeIssueLanguageResult = (dict, key): result<issueLanguage, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIssueLanguageEnumResult
  }

  let issueLanguageToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | DUTCH => "DUTCH"
    | ODIA => "ODIA"
    }
  }
}
module ChatType = {
  @genType
  type chatType = IssueMessage | IssueOption | MediaFile | IssueDescription

  let decodeChatTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to ChatType type"), str => {
      switch str {
      | "IssueMessage" => Ok(IssueMessage)
      | "IssueOption" => Ok(IssueOption)
      | "MediaFile" => Ok(MediaFile)
      | "IssueDescription" => Ok(IssueDescription)
      | _ => Error("failed to decode enum ChatType")
      }
    })
  }

  let decodeChatType = data => {
    decodeChatTypeEnumResult(Some(data))
  }

  let decodeChatTypeResult = (dict, key): result<chatType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeChatTypeEnumResult
  }

  let chatTypeToString = enumValue => {
    switch enumValue {
    | IssueMessage => "IssueMessage"
    | IssueOption => "IssueOption"
    | MediaFile => "MediaFile"
    | IssueDescription => "IssueDescription"
    }
  }
}
module IssueCategoryLanguage = {
  @genType
  type issueCategoryLanguage =
    ENGLISH | HINDI | KANNADA | TAMIL | MALAYALAM | BENGALI | FRENCH | TELUGU | DUTCH | ODIA

  let decodeIssueCategoryLanguageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IssueCategoryLanguage type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "DUTCH" => Ok(DUTCH)
      | "ODIA" => Ok(ODIA)
      | _ => Error("failed to decode enum IssueCategoryLanguage")
      }
    })
  }

  let decodeIssueCategoryLanguage = data => {
    decodeIssueCategoryLanguageEnumResult(Some(data))
  }

  let decodeIssueCategoryLanguageResult = (dict, key): result<issueCategoryLanguage, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIssueCategoryLanguageEnumResult
  }

  let issueCategoryLanguageToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | DUTCH => "DUTCH"
    | ODIA => "ODIA"
    }
  }
}
module CategoryType = {
  @genType
  type categoryType = Category | FAQ

  let decodeCategoryTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CategoryType type"), str => {
      switch str {
      | "Category" => Ok(Category)
      | "FAQ" => Ok(FAQ)
      | _ => Error("failed to decode enum CategoryType")
      }
    })
  }

  let decodeCategoryType = data => {
    decodeCategoryTypeEnumResult(Some(data))
  }

  let decodeCategoryTypeResult = (dict, key): result<categoryType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCategoryTypeEnumResult
  }

  let categoryTypeToString = enumValue => {
    switch enumValue {
    | Category => "Category"
    | FAQ => "FAQ"
    }
  }
}
module IssueListLanguage = {
  @genType
  type issueListLanguage =
    ENGLISH | HINDI | KANNADA | TAMIL | MALAYALAM | BENGALI | FRENCH | TELUGU | DUTCH | ODIA

  let decodeIssueListLanguageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IssueListLanguage type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "DUTCH" => Ok(DUTCH)
      | "ODIA" => Ok(ODIA)
      | _ => Error("failed to decode enum IssueListLanguage")
      }
    })
  }

  let decodeIssueListLanguage = data => {
    decodeIssueListLanguageEnumResult(Some(data))
  }

  let decodeIssueListLanguageResult = (dict, key): result<issueListLanguage, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIssueListLanguageEnumResult
  }

  let issueListLanguageToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | DUTCH => "DUTCH"
    | ODIA => "ODIA"
    }
  }
}
module IssueStatus = {
  @genType
  type issueStatus =
    OPEN | PENDING_INTERNAL | PENDING_EXTERNAL | RESOLVED | CLOSED | REOPENED | NOT_APPLICABLE

  let decodeIssueStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IssueStatus type"), str => {
      switch str {
      | "OPEN" => Ok(OPEN)
      | "PENDING_INTERNAL" => Ok(PENDING_INTERNAL)
      | "PENDING_EXTERNAL" => Ok(PENDING_EXTERNAL)
      | "RESOLVED" => Ok(RESOLVED)
      | "CLOSED" => Ok(CLOSED)
      | "REOPENED" => Ok(REOPENED)
      | "NOT_APPLICABLE" => Ok(NOT_APPLICABLE)
      | _ => Error("failed to decode enum IssueStatus")
      }
    })
  }

  let decodeIssueStatus = data => {
    decodeIssueStatusEnumResult(Some(data))
  }

  let decodeIssueStatusResult = (dict, key): result<issueStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIssueStatusEnumResult
  }

  let issueStatusToString = enumValue => {
    switch enumValue {
    | OPEN => "OPEN"
    | PENDING_INTERNAL => "PENDING_INTERNAL"
    | PENDING_EXTERNAL => "PENDING_EXTERNAL"
    | RESOLVED => "RESOLVED"
    | CLOSED => "CLOSED"
    | REOPENED => "REOPENED"
    | NOT_APPLICABLE => "NOT_APPLICABLE"
    }
  }
}
module IssueOptionLanguage = {
  @genType
  type issueOptionLanguage =
    ENGLISH | HINDI | KANNADA | TAMIL | MALAYALAM | BENGALI | FRENCH | TELUGU | DUTCH | ODIA

  let decodeIssueOptionLanguageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IssueOptionLanguage type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "DUTCH" => Ok(DUTCH)
      | "ODIA" => Ok(ODIA)
      | _ => Error("failed to decode enum IssueOptionLanguage")
      }
    })
  }

  let decodeIssueOptionLanguage = data => {
    decodeIssueOptionLanguageEnumResult(Some(data))
  }

  let decodeIssueOptionLanguageResult = (dict, key): result<issueOptionLanguage, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIssueOptionLanguageEnumResult
  }

  let issueOptionLanguageToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | DUTCH => "DUTCH"
    | ODIA => "ODIA"
    }
  }
}
module IssueIssueIdInfoLanguage = {
  @genType
  type issueIssueIdInfoLanguage =
    ENGLISH | HINDI | KANNADA | TAMIL | MALAYALAM | BENGALI | FRENCH | TELUGU | DUTCH | ODIA

  let decodeIssueIssueIdInfoLanguageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IssueIssueIdInfoLanguage type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "DUTCH" => Ok(DUTCH)
      | "ODIA" => Ok(ODIA)
      | _ => Error("failed to decode enum IssueIssueIdInfoLanguage")
      }
    })
  }

  let decodeIssueIssueIdInfoLanguage = data => {
    decodeIssueIssueIdInfoLanguageEnumResult(Some(data))
  }

  let decodeIssueIssueIdInfoLanguageResult = (dict, key): result<
    issueIssueIdInfoLanguage,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIssueIssueIdInfoLanguageEnumResult
  }

  let issueIssueIdInfoLanguageToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | DUTCH => "DUTCH"
    | ODIA => "ODIA"
    }
  }
}
module MessageType = {
  @genType
  type messageType = Text | Audio | Image

  let decodeMessageTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to MessageType type"), str => {
      switch str {
      | "Text" => Ok(Text)
      | "Audio" => Ok(Audio)
      | "Image" => Ok(Image)
      | _ => Error("failed to decode enum MessageType")
      }
    })
  }

  let decodeMessageType = data => {
    decodeMessageTypeEnumResult(Some(data))
  }

  let decodeMessageTypeResult = (dict, key): result<messageType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMessageTypeEnumResult
  }

  let messageTypeToString = enumValue => {
    switch enumValue {
    | Text => "Text"
    | Audio => "Audio"
    | Image => "Image"
    }
  }
}
module Sender = {
  @genType
  type sender = USER | BOT

  let decodeSenderEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to Sender type"), str => {
      switch str {
      | "USER" => Ok(USER)
      | "BOT" => Ok(BOT)
      | _ => Error("failed to decode enum Sender")
      }
    })
  }

  let decodeSender = data => {
    decodeSenderEnumResult(Some(data))
  }

  let decodeSenderResult = (dict, key): result<sender, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeSenderEnumResult
  }

  let senderToString = enumValue => {
    switch enumValue {
    | USER => "USER"
    | BOT => "BOT"
    }
  }
}
module FileType = {
  @genType
  type fileType =
    Audio | Video | Image | AudioLink | VideoLink | ImageLink | PortraitVideoLink | PDF

  let decodeFileTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FileType type"), str => {
      switch str {
      | "Audio" => Ok(Audio)
      | "Video" => Ok(Video)
      | "Image" => Ok(Image)
      | "AudioLink" => Ok(AudioLink)
      | "VideoLink" => Ok(VideoLink)
      | "ImageLink" => Ok(ImageLink)
      | "PortraitVideoLink" => Ok(PortraitVideoLink)
      | "PDF" => Ok(PDF)
      | _ => Error("failed to decode enum FileType")
      }
    })
  }

  let decodeFileType = data => {
    decodeFileTypeEnumResult(Some(data))
  }

  let decodeFileTypeResult = (dict, key): result<fileType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFileTypeEnumResult
  }

  let fileTypeToString = enumValue => {
    switch enumValue {
    | Audio => "Audio"
    | Video => "Video"
    | Image => "Image"
    | AudioLink => "AudioLink"
    | VideoLink => "VideoLink"
    | ImageLink => "ImageLink"
    | PortraitVideoLink => "PortraitVideoLink"
    | PDF => "PDF"
    }
  }
}
module IssueIssueIdUpdateStatusLanguage = {
  @genType
  type issueIssueIdUpdateStatusLanguage =
    ENGLISH | HINDI | KANNADA | TAMIL | MALAYALAM | BENGALI | FRENCH | TELUGU | DUTCH | ODIA

  let decodeIssueIssueIdUpdateStatusLanguageEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to IssueIssueIdUpdateStatusLanguage type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "DUTCH" => Ok(DUTCH)
      | "ODIA" => Ok(ODIA)
      | _ => Error("failed to decode enum IssueIssueIdUpdateStatusLanguage")
      }
    })
  }

  let decodeIssueIssueIdUpdateStatusLanguage = data => {
    decodeIssueIssueIdUpdateStatusLanguageEnumResult(Some(data))
  }

  let decodeIssueIssueIdUpdateStatusLanguageResult = (dict, key): result<
    issueIssueIdUpdateStatusLanguage,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeIssueIssueIdUpdateStatusLanguageEnumResult
  }

  let issueIssueIdUpdateStatusLanguageToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | DUTCH => "DUTCH"
    | ODIA => "ODIA"
    }
  }
}
module CustomerRating = {
  @genType
  type customerRating = THUMBS_UP | THUMBS_DOWN

  let decodeCustomerRatingEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CustomerRating type"), str => {
      switch str {
      | "THUMBS_UP" => Ok(THUMBS_UP)
      | "THUMBS_DOWN" => Ok(THUMBS_DOWN)
      | _ => Error("failed to decode enum CustomerRating")
      }
    })
  }

  let decodeCustomerRating = data => {
    decodeCustomerRatingEnumResult(Some(data))
  }

  let decodeCustomerRatingResult = (dict, key): result<customerRating, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCustomerRatingEnumResult
  }

  let customerRatingToString = enumValue => {
    switch enumValue {
    | THUMBS_UP => "THUMBS_UP"
    | THUMBS_DOWN => "THUMBS_DOWN"
    }
  }
}
module CustomerResponse = {
  @genType
  type customerResponse = ACCEPT | ESCALATE

  let decodeCustomerResponseEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CustomerResponse type"), str => {
      switch str {
      | "ACCEPT" => Ok(ACCEPT)
      | "ESCALATE" => Ok(ESCALATE)
      | _ => Error("failed to decode enum CustomerResponse")
      }
    })
  }

  let decodeCustomerResponse = data => {
    decodeCustomerResponseEnumResult(Some(data))
  }

  let decodeCustomerResponseResult = (dict, key): result<customerResponse, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCustomerResponseEnumResult
  }

  let customerResponseToString = enumValue => {
    switch enumValue {
    | ACCEPT => "ACCEPT"
    | ESCALATE => "ESCALATE"
    }
  }
}
module KaptureCustomerLoginTicketType = {
  @genType
  type kaptureCustomerLoginTicketType = APP_RELATED | RIDE_RELATED

  let decodeKaptureCustomerLoginTicketTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to KaptureCustomerLoginTicketType type"), str => {
      switch str {
      | "APP_RELATED" => Ok(APP_RELATED)
      | "RIDE_RELATED" => Ok(RIDE_RELATED)
      | _ => Error("failed to decode enum KaptureCustomerLoginTicketType")
      }
    })
  }

  let decodeKaptureCustomerLoginTicketType = data => {
    decodeKaptureCustomerLoginTicketTypeEnumResult(Some(data))
  }

  let decodeKaptureCustomerLoginTicketTypeResult = (dict, key): result<
    kaptureCustomerLoginTicketType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeKaptureCustomerLoginTicketTypeEnumResult
  }

  let kaptureCustomerLoginTicketTypeToString = enumValue => {
    switch enumValue {
    | APP_RELATED => "APP_RELATED"
    | RIDE_RELATED => "RIDE_RELATED"
    }
  }
}
module LanguageTranslateSource = {
  @genType
  type languageTranslateSource =
    ENGLISH | HINDI | KANNADA | TAMIL | MALAYALAM | BENGALI | FRENCH | TELUGU | DUTCH | ODIA

  let decodeLanguageTranslateSourceEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to LanguageTranslateSource type"), str => {
      switch str {
      | "ENGLISH" => Ok(ENGLISH)
      | "HINDI" => Ok(HINDI)
      | "KANNADA" => Ok(KANNADA)
      | "TAMIL" => Ok(TAMIL)
      | "MALAYALAM" => Ok(MALAYALAM)
      | "BENGALI" => Ok(BENGALI)
      | "FRENCH" => Ok(FRENCH)
      | "TELUGU" => Ok(TELUGU)
      | "DUTCH" => Ok(DUTCH)
      | "ODIA" => Ok(ODIA)
      | _ => Error("failed to decode enum LanguageTranslateSource")
      }
    })
  }

  let decodeLanguageTranslateSource = data => {
    decodeLanguageTranslateSourceEnumResult(Some(data))
  }

  let decodeLanguageTranslateSourceResult = (dict, key): result<
    languageTranslateSource,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeLanguageTranslateSourceEnumResult
  }

  let languageTranslateSourceToString = enumValue => {
    switch enumValue {
    | ENGLISH => "ENGLISH"
    | HINDI => "HINDI"
    | KANNADA => "KANNADA"
    | TAMIL => "TAMIL"
    | MALAYALAM => "MALAYALAM"
    | BENGALI => "BENGALI"
    | FRENCH => "FRENCH"
    | TELUGU => "TELUGU"
    | DUTCH => "DUTCH"
    | ODIA => "ODIA"
    }
  }
}
module AutoCompleteType = {
  @genType
  type autoCompleteType = PICKUP | DROP

  let decodeAutoCompleteTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to AutoCompleteType type"), str => {
      switch str {
      | "PICKUP" => Ok(PICKUP)
      | "DROP" => Ok(DROP)
      | _ => Error("failed to decode enum AutoCompleteType")
      }
    })
  }

  let decodeAutoCompleteType = data => {
    decodeAutoCompleteTypeEnumResult(Some(data))
  }

  let decodeAutoCompleteTypeResult = (dict, key): result<autoCompleteType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeAutoCompleteTypeEnumResult
  }

  let autoCompleteTypeToString = enumValue => {
    switch enumValue {
    | PICKUP => "PICKUP"
    | DROP => "DROP"
    }
  }
}
module JourneyLegStatus = {
  @genType
  type journeyLegStatus =
    | InPlan
    | Assigning
    | Booked
    | AtRiskOfMissing
    | Missed
    | Delayed
    | Arriving
    | Arrived
    | OnTheWay
    | Ongoing
    | Skipped
    | Finishing
    | Cancelled
    | Completed
    | Failed

  let decodeJourneyLegStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to JourneyLegStatus type"), str => {
      switch str {
      | "InPlan" => Ok(InPlan)
      | "Assigning" => Ok(Assigning)
      | "Booked" => Ok(Booked)
      | "AtRiskOfMissing" => Ok(AtRiskOfMissing)
      | "Missed" => Ok(Missed)
      | "Delayed" => Ok(Delayed)
      | "Arriving" => Ok(Arriving)
      | "Arrived" => Ok(Arrived)
      | "OnTheWay" => Ok(OnTheWay)
      | "Ongoing" => Ok(Ongoing)
      | "Skipped" => Ok(Skipped)
      | "Finishing" => Ok(Finishing)
      | "Cancelled" => Ok(Cancelled)
      | "Completed" => Ok(Completed)
      | "Failed" => Ok(Failed)
      | _ => Error("failed to decode enum JourneyLegStatus")
      }
    })
  }

  let decodeJourneyLegStatus = data => {
    decodeJourneyLegStatusEnumResult(Some(data))
  }

  let decodeJourneyLegStatusResult = (dict, key): result<journeyLegStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeJourneyLegStatusEnumResult
  }

  let journeyLegStatusToString = enumValue => {
    switch enumValue {
    | InPlan => "InPlan"
    | Assigning => "Assigning"
    | Booked => "Booked"
    | AtRiskOfMissing => "AtRiskOfMissing"
    | Missed => "Missed"
    | Delayed => "Delayed"
    | Arriving => "Arriving"
    | Arrived => "Arrived"
    | OnTheWay => "OnTheWay"
    | Ongoing => "Ongoing"
    | Skipped => "Skipped"
    | Finishing => "Finishing"
    | Cancelled => "Cancelled"
    | Completed => "Completed"
    | Failed => "Failed"
    }
  }
}

module PassDocumentType = {
  @genType
  type passDocumentType = ProfilePicture | Aadhaar

  let decodePassDocumentTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PassDocumentType type"), str => {
      switch str {
      | "ProfilePicture" => Ok(ProfilePicture)
      | "Aadhaar" => Ok(Aadhaar)
      | _ => Error("failed to decode enum PassDocumentType")
      }
    })
  }

  let decodePassDocumentType = data => {
    decodePassDocumentTypeEnumResult(Some(data))
  }

  let decodePassDocumentTypeResult = (dict, key): result<passDocumentType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePassDocumentTypeEnumResult
  }

  let passDocumentTypeToString = enumValue => {
    switch enumValue {
    | ProfilePicture => "ProfilePicture"
    | Aadhaar => "Aadhaar"
    }
  }
}
module MultimodalPassListStatus = {
  @genType
  type multimodalPassListStatus =
    | Pending
    | Active
    | PreBooked
    | Failed
    | Expired
    | RefundPending
    | RefundInitiated
    | Refunded
    | RefundFailed
    | PhotoPending

  let decodeMultimodalPassListStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to MultimodalPassListStatus type"), str => {
      switch str {
      | "Pending" => Ok(Pending)
      | "Active" => Ok(Active)
      | "PreBooked" => Ok(PreBooked)
      | "Failed" => Ok(Failed)
      | "Expired" => Ok(Expired)
      | "RefundPending" => Ok(RefundPending)
      | "RefundInitiated" => Ok(RefundInitiated)
      | "Refunded" => Ok(Refunded)
      | "RefundFailed" => Ok(RefundFailed)
      | "PhotoPending" => Ok(PhotoPending)
      | _ => Error("failed to decode enum MultimodalPassListStatus")
      }
    })
  }

  let decodeMultimodalPassListStatus = data => {
    decodeMultimodalPassListStatusEnumResult(Some(data))
  }

  let decodeMultimodalPassListStatusResult = (dict, key): result<
    multimodalPassListStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMultimodalPassListStatusEnumResult
  }

  let multimodalPassListStatusToString = enumValue => {
    switch enumValue {
    | Pending => "Pending"
    | Active => "Active"
    | PreBooked => "PreBooked"
    | Failed => "Failed"
    | Expired => "Expired"
    | RefundPending => "RefundPending"
    | RefundInitiated => "RefundInitiated"
    | Refunded => "Refunded"
    | RefundFailed => "RefundFailed"
    | PhotoPending => "PhotoPending"
    }
  }
}
module FRFSServiceTierType = {
  @genType
  type fRFSServiceTierType =
    | ORDINARY
    | AC
    | NON_AC
    | EXPRESS
    | SPECIAL
    | EXECUTIVE
    | FIRST_CLASS
    | SECOND_CLASS
    | THIRD_CLASS

  let decodeFRFSServiceTierTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FRFSServiceTierType type"), str => {
      switch str {
      | "ORDINARY" => Ok(ORDINARY)
      | "AC" => Ok(AC)
      | "NON_AC" => Ok(NON_AC)
      | "EXPRESS" => Ok(EXPRESS)
      | "SPECIAL" => Ok(SPECIAL)
      | "EXECUTIVE" => Ok(EXECUTIVE)
      | "FIRST_CLASS" => Ok(FIRST_CLASS)
      | "SECOND_CLASS" => Ok(SECOND_CLASS)
      | "THIRD_CLASS" => Ok(THIRD_CLASS)
      | _ => Error("failed to decode enum FRFSServiceTierType")
      }
    })
  }

  let decodeFRFSServiceTierType = data => {
    decodeFRFSServiceTierTypeEnumResult(Some(data))
  }

  let decodeFRFSServiceTierTypeResult = (dict, key): result<fRFSServiceTierType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFRFSServiceTierTypeEnumResult
  }

  let fRFSServiceTierTypeToString = enumValue => {
    switch enumValue {
    | ORDINARY => "ORDINARY"
    | AC => "AC"
    | NON_AC => "NON_AC"
    | EXPRESS => "EXPRESS"
    | SPECIAL => "SPECIAL"
    | EXECUTIVE => "EXECUTIVE"
    | FIRST_CLASS => "FIRST_CLASS"
    | SECOND_CLASS => "SECOND_CLASS"
    | THIRD_CLASS => "THIRD_CLASS"
    }
  }
}
module JourneyOptionsSortingType = {
  @genType
  type journeyOptionsSortingType = FASTEST | CHEAPEST | MINIMUM_TRANSITS | MOST_RELEVANT

  let decodeJourneyOptionsSortingTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to JourneyOptionsSortingType type"), str => {
      switch str {
      | "FASTEST" => Ok(FASTEST)
      | "CHEAPEST" => Ok(CHEAPEST)
      | "MINIMUM_TRANSITS" => Ok(MINIMUM_TRANSITS)
      | "MOST_RELEVANT" => Ok(MOST_RELEVANT)
      | _ => Error("failed to decode enum JourneyOptionsSortingType")
      }
    })
  }

  let decodeJourneyOptionsSortingType = data => {
    decodeJourneyOptionsSortingTypeEnumResult(Some(data))
  }

  let decodeJourneyOptionsSortingTypeResult = (dict, key): result<
    journeyOptionsSortingType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeJourneyOptionsSortingTypeEnumResult
  }

  let journeyOptionsSortingTypeToString = enumValue => {
    switch enumValue {
    | FASTEST => "FASTEST"
    | CHEAPEST => "CHEAPEST"
    | MINIMUM_TRANSITS => "MINIMUM_TRANSITS"
    | MOST_RELEVANT => "MOST_RELEVANT"
    }
  }
}
module MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatus = {
  @genType
  type multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatus =
    | InPlan
    | Assigning
    | Booked
    | AtRiskOfMissing
    | Missed
    | Delayed
    | Arriving
    | Arrived
    | OnTheWay
    | Skipped
    | Ongoing
    | Finishing
    | Cancelled
    | Completed
    | Failed

  let decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(
      Error(
        "failed to decode to MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatus type",
      ),
      str => {
        switch str {
        | "InPlan" => Ok(InPlan)
        | "Assigning" => Ok(Assigning)
        | "Booked" => Ok(Booked)
        | "AtRiskOfMissing" => Ok(AtRiskOfMissing)
        | "Missed" => Ok(Missed)
        | "Delayed" => Ok(Delayed)
        | "Arriving" => Ok(Arriving)
        | "Arrived" => Ok(Arrived)
        | "OnTheWay" => Ok(OnTheWay)
        | "Skipped" => Ok(Skipped)
        | "Ongoing" => Ok(Ongoing)
        | "Finishing" => Ok(Finishing)
        | "Cancelled" => Ok(Cancelled)
        | "Completed" => Ok(Completed)
        | "Failed" => Ok(Failed)
        | _ =>
          Error(
            "failed to decode enum MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatus",
          )
        }
      },
    )
  }

  let decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatus = data => {
    decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatusEnumResult(
      Some(data),
    )
  }

  let decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatusResult = (
    dict,
    key,
  ): result<multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatusEnumResult
  }

  let multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusStatusToString = enumValue => {
    switch enumValue {
    | InPlan => "InPlan"
    | Assigning => "Assigning"
    | Booked => "Booked"
    | AtRiskOfMissing => "AtRiskOfMissing"
    | Missed => "Missed"
    | Delayed => "Delayed"
    | Arriving => "Arriving"
    | Arrived => "Arrived"
    | OnTheWay => "OnTheWay"
    | Skipped => "Skipped"
    | Ongoing => "Ongoing"
    | Finishing => "Finishing"
    | Cancelled => "Cancelled"
    | Completed => "Completed"
    | Failed => "Failed"
    }
  }
}
module DriverIdentifierType = {
  @genType
  type driverIdentifierType = REFERRAL_CODE | VEHICLE_NUMBER

  let decodeDriverIdentifierTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to DriverIdentifierType type"), str => {
      switch str {
      | "REFERRAL_CODE" => Ok(REFERRAL_CODE)
      | "VEHICLE_NUMBER" => Ok(VEHICLE_NUMBER)
      | _ => Error("failed to decode enum DriverIdentifierType")
      }
    })
  }

  let decodeDriverIdentifierType = data => {
    decodeDriverIdentifierTypeEnumResult(Some(data))
  }

  let decodeDriverIdentifierTypeResult = (dict, key): result<driverIdentifierType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeDriverIdentifierTypeEnumResult
  }

  let driverIdentifierTypeToString = enumValue => {
    switch enumValue {
    | REFERRAL_CODE => "REFERRAL_CODE"
    | VEHICLE_NUMBER => "VEHICLE_NUMBER"
    }
  }
}
module PlatformType = {
  @genType
  type platformType = MULTIMODAL | PARTNERORG | APPLICATION

  let decodePlatformTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PlatformType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "PARTNERORG" => Ok(PARTNERORG)
      | "APPLICATION" => Ok(APPLICATION)
      | _ => Error("failed to decode enum PlatformType")
      }
    })
  }

  let decodePlatformType = data => {
    decodePlatformTypeEnumResult(Some(data))
  }

  let decodePlatformTypeResult = (dict, key): result<platformType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePlatformTypeEnumResult
  }

  let platformTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | PARTNERORG => "PARTNERORG"
    | APPLICATION => "APPLICATION"
    }
  }
}
module MultimodalWarning = {
  @genType
  type multimodalWarning =
    NoSingleModeRoutes | NoUserPreferredFirstJourney | NoPublicTransportRoutes

  let decodeMultimodalWarningEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to MultimodalWarning type"), str => {
      switch str {
      | "NoSingleModeRoutes" => Ok(NoSingleModeRoutes)
      | "NoUserPreferredFirstJourney" => Ok(NoUserPreferredFirstJourney)
      | "NoPublicTransportRoutes" => Ok(NoPublicTransportRoutes)
      | _ => Error("failed to decode enum MultimodalWarning")
      }
    })
  }

  let decodeMultimodalWarning = data => {
    decodeMultimodalWarningEnumResult(Some(data))
  }

  let decodeMultimodalWarningResult = (dict, key): result<multimodalWarning, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMultimodalWarningEnumResult
  }

  let multimodalWarningToString = enumValue => {
    switch enumValue {
    | NoSingleModeRoutes => "NoSingleModeRoutes"
    | NoUserPreferredFirstJourney => "NoUserPreferredFirstJourney"
    | NoPublicTransportRoutes => "NoPublicTransportRoutes"
    }
  }
}
module NextVehicleDetailsRouteCodeStopCodeVehicleType = {
  @genType
  type nextVehicleDetailsRouteCodeStopCodeVehicleType = METRO | SUBWAY | BUS

  let decodeNextVehicleDetailsRouteCodeStopCodeVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(
      Error("failed to decode to NextVehicleDetailsRouteCodeStopCodeVehicleType type"),
      str => {
        switch str {
        | "METRO" => Ok(METRO)
        | "SUBWAY" => Ok(SUBWAY)
        | "BUS" => Ok(BUS)
        | _ => Error("failed to decode enum NextVehicleDetailsRouteCodeStopCodeVehicleType")
        }
      },
    )
  }

  let decodeNextVehicleDetailsRouteCodeStopCodeVehicleType = data => {
    decodeNextVehicleDetailsRouteCodeStopCodeVehicleTypeEnumResult(Some(data))
  }

  let decodeNextVehicleDetailsRouteCodeStopCodeVehicleTypeResult = (dict, key): result<
    nextVehicleDetailsRouteCodeStopCodeVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeNextVehicleDetailsRouteCodeStopCodeVehicleTypeEnumResult
  }

  let nextVehicleDetailsRouteCodeStopCodeVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module SourceType = {
  @genType
  type sourceType = LIVE | GTFS

  let decodeSourceTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to SourceType type"), str => {
      switch str {
      | "LIVE" => Ok(LIVE)
      | "GTFS" => Ok(GTFS)
      | _ => Error("failed to decode enum SourceType")
      }
    })
  }

  let decodeSourceType = data => {
    decodeSourceTypeEnumResult(Some(data))
  }

  let decodeSourceTypeResult = (dict, key): result<sourceType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeSourceTypeEnumResult
  }

  let sourceTypeToString = enumValue => {
    switch enumValue {
    | LIVE => "LIVE"
    | GTFS => "GTFS"
    }
  }
}
module RefundStatus = {
  @genType
  type refundStatus = PENDING | FAILURE | SUCCESS | MANUAL_REVIEW

  let decodeRefundStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RefundStatus type"), str => {
      switch str {
      | "PENDING" => Ok(PENDING)
      | "FAILURE" => Ok(FAILURE)
      | "SUCCESS" => Ok(SUCCESS)
      | "MANUAL_REVIEW" => Ok(MANUAL_REVIEW)
      | _ => Error("failed to decode enum RefundStatus")
      }
    })
  }

  let decodeRefundStatus = data => {
    decodeRefundStatusEnumResult(Some(data))
  }

  let decodeRefundStatusResult = (dict, key): result<refundStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRefundStatusEnumResult
  }

  let refundStatusToString = enumValue => {
    switch enumValue {
    | PENDING => "PENDING"
    | FAILURE => "FAILURE"
    | SUCCESS => "SUCCESS"
    | MANUAL_REVIEW => "MANUAL_REVIEW"
    }
  }
}
module MandateStatus = {
  @genType
  type mandateStatus = CREATED | ACTIVE | FAILURE | PAUSED | EXPIRED | REVOKED

  let decodeMandateStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to MandateStatus type"), str => {
      switch str {
      | "CREATED" => Ok(CREATED)
      | "ACTIVE" => Ok(ACTIVE)
      | "FAILURE" => Ok(FAILURE)
      | "PAUSED" => Ok(PAUSED)
      | "EXPIRED" => Ok(EXPIRED)
      | "REVOKED" => Ok(REVOKED)
      | _ => Error("failed to decode enum MandateStatus")
      }
    })
  }

  let decodeMandateStatus = data => {
    decodeMandateStatusEnumResult(Some(data))
  }

  let decodeMandateStatusResult = (dict, key): result<mandateStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMandateStatusEnumResult
  }

  let mandateStatusToString = enumValue => {
    switch enumValue {
    | CREATED => "CREATED"
    | ACTIVE => "ACTIVE"
    | FAILURE => "FAILURE"
    | PAUSED => "PAUSED"
    | EXPIRED => "EXPIRED"
    | REVOKED => "REVOKED"
    }
  }
}
module PaymentStatus = {
  @genType
  type paymentStatus =
    | ORDER_SUCCEEDED
    | ORDER_REFUNDED
    | ORDER_FAILED
    | ORDER_REFUND_FAILED
    | TXN_CREATED
    | REFUND_MANUAL_REVIEW_NEEDED
    | REFUND_INITIATED
    | AUTO_REFUND_SUCCEEDED
    | AUTO_REFUND_FAILED
    | MANDATE_CREATED
    | MANDATE_ACTIVATED
    | MANDATE_FAILED
    | MANDATE_REVOKED
    | MANDATE_PAUSED
    | MANDATE_EXPIRED
    | NOTIFICATION_FAILED
    | NOTIFICATION_SUCCEEDED
    | ORDER_AUTHORIZED
    | TXN_CHARGED
    | TXN_FAILED

  let decodePaymentStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PaymentStatus type"), str => {
      switch str {
      | "ORDER_SUCCEEDED" => Ok(ORDER_SUCCEEDED)
      | "ORDER_REFUNDED" => Ok(ORDER_REFUNDED)
      | "ORDER_FAILED" => Ok(ORDER_FAILED)
      | "ORDER_REFUND_FAILED" => Ok(ORDER_REFUND_FAILED)
      | "TXN_CREATED" => Ok(TXN_CREATED)
      | "REFUND_MANUAL_REVIEW_NEEDED" => Ok(REFUND_MANUAL_REVIEW_NEEDED)
      | "REFUND_INITIATED" => Ok(REFUND_INITIATED)
      | "AUTO_REFUND_SUCCEEDED" => Ok(AUTO_REFUND_SUCCEEDED)
      | "AUTO_REFUND_FAILED" => Ok(AUTO_REFUND_FAILED)
      | "MANDATE_CREATED" => Ok(MANDATE_CREATED)
      | "MANDATE_ACTIVATED" => Ok(MANDATE_ACTIVATED)
      | "MANDATE_FAILED" => Ok(MANDATE_FAILED)
      | "MANDATE_REVOKED" => Ok(MANDATE_REVOKED)
      | "MANDATE_PAUSED" => Ok(MANDATE_PAUSED)
      | "MANDATE_EXPIRED" => Ok(MANDATE_EXPIRED)
      | "NOTIFICATION_FAILED" => Ok(NOTIFICATION_FAILED)
      | "NOTIFICATION_SUCCEEDED" => Ok(NOTIFICATION_SUCCEEDED)
      | "ORDER_AUTHORIZED" => Ok(ORDER_AUTHORIZED)
      | "TXN_CHARGED" => Ok(TXN_CHARGED)
      | "TXN_FAILED" => Ok(TXN_FAILED)
      | _ => Error("failed to decode enum PaymentStatus")
      }
    })
  }

  let decodePaymentStatus = data => {
    decodePaymentStatusEnumResult(Some(data))
  }

  let decodePaymentStatusResult = (dict, key): result<paymentStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePaymentStatusEnumResult
  }

  let paymentStatusToString = enumValue => {
    switch enumValue {
    | ORDER_SUCCEEDED => "ORDER_SUCCEEDED"
    | ORDER_REFUNDED => "ORDER_REFUNDED"
    | ORDER_FAILED => "ORDER_FAILED"
    | ORDER_REFUND_FAILED => "ORDER_REFUND_FAILED"
    | TXN_CREATED => "TXN_CREATED"
    | REFUND_MANUAL_REVIEW_NEEDED => "REFUND_MANUAL_REVIEW_NEEDED"
    | REFUND_INITIATED => "REFUND_INITIATED"
    | AUTO_REFUND_SUCCEEDED => "AUTO_REFUND_SUCCEEDED"
    | AUTO_REFUND_FAILED => "AUTO_REFUND_FAILED"
    | MANDATE_CREATED => "MANDATE_CREATED"
    | MANDATE_ACTIVATED => "MANDATE_ACTIVATED"
    | MANDATE_FAILED => "MANDATE_FAILED"
    | MANDATE_REVOKED => "MANDATE_REVOKED"
    | MANDATE_PAUSED => "MANDATE_PAUSED"
    | MANDATE_EXPIRED => "MANDATE_EXPIRED"
    | NOTIFICATION_FAILED => "NOTIFICATION_FAILED"
    | NOTIFICATION_SUCCEEDED => "NOTIFICATION_SUCCEEDED"
    | ORDER_AUTHORIZED => "ORDER_AUTHORIZED"
    | TXN_CHARGED => "TXN_CHARGED"
    | TXN_FAILED => "TXN_FAILED"
    }
  }
}
module NotificationStatus = {
  @genType
  type notificationStatus = NOTIFICATION_CREATED | NOTIFICATION_FAILURE | PENDING | SUCCESS

  let decodeNotificationStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to NotificationStatus type"), str => {
      switch str {
      | "NOTIFICATION_CREATED" => Ok(NOTIFICATION_CREATED)
      | "NOTIFICATION_FAILURE" => Ok(NOTIFICATION_FAILURE)
      | "PENDING" => Ok(PENDING)
      | "SUCCESS" => Ok(SUCCESS)
      | _ => Error("failed to decode enum NotificationStatus")
      }
    })
  }

  let decodeNotificationStatus = data => {
    decodeNotificationStatusEnumResult(Some(data))
  }

  let decodeNotificationStatusResult = (dict, key): result<notificationStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeNotificationStatusEnumResult
  }

  let notificationStatusToString = enumValue => {
    switch enumValue {
    | NOTIFICATION_CREATED => "NOTIFICATION_CREATED"
    | NOTIFICATION_FAILURE => "NOTIFICATION_FAILURE"
    | PENDING => "PENDING"
    | SUCCESS => "SUCCESS"
    }
  }
}
module AppUseCase = {
  @genType
  type appUseCase = WEEKDAY | WEEKEND | OCCASIONAL | MISCELLANEOUS

  let decodeAppUseCaseEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to AppUseCase type"), str => {
      switch str {
      | "WEEKDAY" => Ok(WEEKDAY)
      | "WEEKEND" => Ok(WEEKEND)
      | "OCCASIONAL" => Ok(OCCASIONAL)
      | "MISCELLANEOUS" => Ok(MISCELLANEOUS)
      | _ => Error("failed to decode enum AppUseCase")
      }
    })
  }

  let decodeAppUseCase = data => {
    decodeAppUseCaseEnumResult(Some(data))
  }

  let decodeAppUseCaseResult = (dict, key): result<appUseCase, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeAppUseCaseEnumResult
  }

  let appUseCaseToString = enumValue => {
    switch enumValue {
    | WEEKDAY => "WEEKDAY"
    | WEEKEND => "WEEKEND"
    | OCCASIONAL => "OCCASIONAL"
    | MISCELLANEOUS => "MISCELLANEOUS"
    }
  }
}
module FrequencyCategory = {
  @genType
  type frequencyCategory = HIGH | MID | LOW | ZERO

  let decodeFrequencyCategoryEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FrequencyCategory type"), str => {
      switch str {
      | "HIGH" => Ok(HIGH)
      | "MID" => Ok(MID)
      | "LOW" => Ok(LOW)
      | "ZERO" => Ok(ZERO)
      | _ => Error("failed to decode enum FrequencyCategory")
      }
    })
  }

  let decodeFrequencyCategory = data => {
    decodeFrequencyCategoryEnumResult(Some(data))
  }

  let decodeFrequencyCategoryResult = (dict, key): result<frequencyCategory, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFrequencyCategoryEnumResult
  }

  let frequencyCategoryToString = enumValue => {
    switch enumValue {
    | HIGH => "HIGH"
    | MID => "MID"
    | LOW => "LOW"
    | ZERO => "ZERO"
    }
  }
}
module UserCategory = {
  @genType
  type userCategory = POWER | REGULAR | IRREGULAR | RARE

  let decodeUserCategoryEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to UserCategory type"), str => {
      switch str {
      | "POWER" => Ok(POWER)
      | "REGULAR" => Ok(REGULAR)
      | "IRREGULAR" => Ok(IRREGULAR)
      | "RARE" => Ok(RARE)
      | _ => Error("failed to decode enum UserCategory")
      }
    })
  }

  let decodeUserCategory = data => {
    decodeUserCategoryEnumResult(Some(data))
  }

  let decodeUserCategoryResult = (dict, key): result<userCategory, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeUserCategoryEnumResult
  }

  let userCategoryToString = enumValue => {
    switch enumValue {
    | POWER => "POWER"
    | REGULAR => "REGULAR"
    | IRREGULAR => "IRREGULAR"
    | RARE => "RARE"
    }
  }
}
module TravelMode = {
  @genType
  type travelMode = CAR | MOTORCYCLE | BICYCLE | FOOT

  let decodeTravelModeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TravelMode type"), str => {
      switch str {
      | "CAR" => Ok(CAR)
      | "MOTORCYCLE" => Ok(MOTORCYCLE)
      | "BICYCLE" => Ok(BICYCLE)
      | "FOOT" => Ok(FOOT)
      | _ => Error("failed to decode enum TravelMode")
      }
    })
  }

  let decodeTravelMode = data => {
    decodeTravelModeEnumResult(Some(data))
  }

  let decodeTravelModeResult = (dict, key): result<travelMode, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTravelModeEnumResult
  }

  let travelModeToString = enumValue => {
    switch enumValue {
    | CAR => "CAR"
    | MOTORCYCLE => "MOTORCYCLE"
    | BICYCLE => "BICYCLE"
    | FOOT => "FOOT"
    }
  }
}
module EntityType = {
  @genType
  type entityType = MULTIMODAL | SUBWAY | BUS | METRO | TAXI

  let decodeEntityTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to EntityType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | "METRO" => Ok(METRO)
      | "TAXI" => Ok(TAXI)
      | _ => Error("failed to decode enum EntityType")
      }
    })
  }

  let decodeEntityType = data => {
    decodeEntityTypeEnumResult(Some(data))
  }

  let decodeEntityTypeResult = (dict, key): result<entityType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeEntityTypeEnumResult
  }

  let entityTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    | METRO => "METRO"
    | TAXI => "TAXI"
    }
  }
}
module GeneralVehicleType = {
  @genType
  type generalVehicleType = Bus | MetroRail | Walk | Subway | Unspecified

  let decodeGeneralVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to GeneralVehicleType type"), str => {
      switch str {
      | "Bus" => Ok(Bus)
      | "MetroRail" => Ok(MetroRail)
      | "Walk" => Ok(Walk)
      | "Subway" => Ok(Subway)
      | "Unspecified" => Ok(Unspecified)
      | _ => Error("failed to decode enum GeneralVehicleType")
      }
    })
  }

  let decodeGeneralVehicleType = data => {
    decodeGeneralVehicleTypeEnumResult(Some(data))
  }

  let decodeGeneralVehicleTypeResult = (dict, key): result<generalVehicleType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeGeneralVehicleTypeEnumResult
  }

  let generalVehicleTypeToString = enumValue => {
    switch enumValue {
    | Bus => "Bus"
    | MetroRail => "MetroRail"
    | Walk => "Walk"
    | Subway => "Subway"
    | Unspecified => "Unspecified"
    }
  }
}
module UserType = {
  @genType
  type userType = OLD | NEW

  let decodeUserTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to UserType type"), str => {
      switch str {
      | "OLD" => Ok(OLD)
      | "NEW" => Ok(NEW)
      | _ => Error("failed to decode enum UserType")
      }
    })
  }

  let decodeUserType = data => {
    decodeUserTypeEnumResult(Some(data))
  }

  let decodeUserTypeResult = (dict, key): result<userType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeUserTypeEnumResult
  }

  let userTypeToString = enumValue => {
    switch enumValue {
    | OLD => "OLD"
    | NEW => "NEW"
    }
  }
}
module RideShareOptions = {
  @genType
  type rideShareOptions = ALWAYS_SHARE | SHARE_WITH_TIME_CONSTRAINTS | NEVER_SHARE

  let decodeRideShareOptionsEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideShareOptions type"), str => {
      switch str {
      | "ALWAYS_SHARE" => Ok(ALWAYS_SHARE)
      | "SHARE_WITH_TIME_CONSTRAINTS" => Ok(SHARE_WITH_TIME_CONSTRAINTS)
      | "NEVER_SHARE" => Ok(NEVER_SHARE)
      | _ => Error("failed to decode enum RideShareOptions")
      }
    })
  }

  let decodeRideShareOptions = data => {
    decodeRideShareOptionsEnumResult(Some(data))
  }

  let decodeRideShareOptionsResult = (dict, key): result<rideShareOptions, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideShareOptionsEnumResult
  }

  let rideShareOptionsToString = enumValue => {
    switch enumValue {
    | ALWAYS_SHARE => "ALWAYS_SHARE"
    | SHARE_WITH_TIME_CONSTRAINTS => "SHARE_WITH_TIME_CONSTRAINTS"
    | NEVER_SHARE => "NEVER_SHARE"
    }
  }
}
module PublicTransportDataCity = {
  @genType
  type publicTransportDataCity =
    | Bangalore
    | Kolkata
    | Paris
    | Kochi
    | Delhi
    | Hyderabad
    | Mumbai
    | Chennai
    | TamilNaduCities
    | Mysore
    | Pondicherry
    | Pune
    | Tumakuru
    | Noida
    | Gurugram
    | Tirunelveli
    | Thanjavur
    | Vellore
    | Madurai
    | Salem
    | Hosur
    | Trichy
    | Minneapolis
    | Trivandrum
    | Thrissur
    | Kozhikode
    | Chandigarh
    | Jaipur
    | Siliguri
    | Asansol
    | Durgapur
    | Petrapole
    | Gangtok
    | Darjeeling
    | Davanagere
    | Shivamogga
    | Hubli
    | Mangalore
    | Udupi
    | Gulbarga
    | Vijayawada
    | Vishakapatnam
    | Guntur
    | Tirupati
    | Kurnool
    | Khammam
    | Karimnagar
    | Nizamabad
    | Mahbubnagar
    | Suryapet
    | Nalgonda
    | Siddipet
    | Rourkela
    | Bhubaneshwar
    | Cuttack
    | Puri
    | Warangal
    | Pudukkottai
    | Bidar
    | Srinagar
    | AnyCity
    | Alapuzha
    | Idukki
    | Kasarkode
    | Wayanad
    | Kannur
    | Kottayam
    | Palakkad
    | Kolam
    | Pathanamthitta
    | Shillong
    | Cherrapunji
    | Pulwama
    | Jammu
    | Anantnag
    | Berhampur
    | Bardhaman
    | Ballari
    | Birbhum

  let decodePublicTransportDataCityEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PublicTransportDataCity type"), str => {
      switch str {
      | "Bangalore" => Ok(Bangalore)
      | "Kolkata" => Ok(Kolkata)
      | "Paris" => Ok(Paris)
      | "Kochi" => Ok(Kochi)
      | "Delhi" => Ok(Delhi)
      | "Hyderabad" => Ok(Hyderabad)
      | "Mumbai" => Ok(Mumbai)
      | "Chennai" => Ok(Chennai)
      | "TamilNaduCities" => Ok(TamilNaduCities)
      | "Mysore" => Ok(Mysore)
      | "Pondicherry" => Ok(Pondicherry)
      | "Pune" => Ok(Pune)
      | "Tumakuru" => Ok(Tumakuru)
      | "Noida" => Ok(Noida)
      | "Gurugram" => Ok(Gurugram)
      | "Tirunelveli" => Ok(Tirunelveli)
      | "Thanjavur" => Ok(Thanjavur)
      | "Vellore" => Ok(Vellore)
      | "Madurai" => Ok(Madurai)
      | "Salem" => Ok(Salem)
      | "Hosur" => Ok(Hosur)
      | "Trichy" => Ok(Trichy)
      | "Minneapolis" => Ok(Minneapolis)
      | "Trivandrum" => Ok(Trivandrum)
      | "Thrissur" => Ok(Thrissur)
      | "Kozhikode" => Ok(Kozhikode)
      | "Chandigarh" => Ok(Chandigarh)
      | "Jaipur" => Ok(Jaipur)
      | "Siliguri" => Ok(Siliguri)
      | "Asansol" => Ok(Asansol)
      | "Durgapur" => Ok(Durgapur)
      | "Petrapole" => Ok(Petrapole)
      | "Gangtok" => Ok(Gangtok)
      | "Darjeeling" => Ok(Darjeeling)
      | "Davanagere" => Ok(Davanagere)
      | "Shivamogga" => Ok(Shivamogga)
      | "Hubli" => Ok(Hubli)
      | "Mangalore" => Ok(Mangalore)
      | "Udupi" => Ok(Udupi)
      | "Gulbarga" => Ok(Gulbarga)
      | "Vijayawada" => Ok(Vijayawada)
      | "Vishakapatnam" => Ok(Vishakapatnam)
      | "Guntur" => Ok(Guntur)
      | "Tirupati" => Ok(Tirupati)
      | "Kurnool" => Ok(Kurnool)
      | "Khammam" => Ok(Khammam)
      | "Karimnagar" => Ok(Karimnagar)
      | "Nizamabad" => Ok(Nizamabad)
      | "Mahbubnagar" => Ok(Mahbubnagar)
      | "Suryapet" => Ok(Suryapet)
      | "Nalgonda" => Ok(Nalgonda)
      | "Siddipet" => Ok(Siddipet)
      | "Rourkela" => Ok(Rourkela)
      | "Bhubaneshwar" => Ok(Bhubaneshwar)
      | "Cuttack" => Ok(Cuttack)
      | "Puri" => Ok(Puri)
      | "Warangal" => Ok(Warangal)
      | "Pudukkottai" => Ok(Pudukkottai)
      | "Bidar" => Ok(Bidar)
      | "Srinagar" => Ok(Srinagar)
      | "AnyCity" => Ok(AnyCity)
      | "Alapuzha" => Ok(Alapuzha)
      | "Idukki" => Ok(Idukki)
      | "Kasarkode" => Ok(Kasarkode)
      | "Wayanad" => Ok(Wayanad)
      | "Kannur" => Ok(Kannur)
      | "Kottayam" => Ok(Kottayam)
      | "Palakkad" => Ok(Palakkad)
      | "Kolam" => Ok(Kolam)
      | "Pathanamthitta" => Ok(Pathanamthitta)
      | "Shillong" => Ok(Shillong)
      | "Cherrapunji" => Ok(Cherrapunji)
      | "Pulwama" => Ok(Pulwama)
      | "Jammu" => Ok(Jammu)
      | "Anantnag" => Ok(Anantnag)
      | "Berhampur" => Ok(Berhampur)
      | "Bardhaman" => Ok(Bardhaman)
      | "Ballari" => Ok(Ballari)
      | "Birbhum" => Ok(Birbhum)
      | _ => Error("failed to decode enum PublicTransportDataCity")
      }
    })
  }

  let decodePublicTransportDataCity = data => {
    decodePublicTransportDataCityEnumResult(Some(data))
  }

  let decodePublicTransportDataCityResult = (dict, key): result<
    publicTransportDataCity,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePublicTransportDataCityEnumResult
  }

  let publicTransportDataCityToString = enumValue => {
    switch enumValue {
    | Bangalore => "Bangalore"
    | Kolkata => "Kolkata"
    | Paris => "Paris"
    | Kochi => "Kochi"
    | Delhi => "Delhi"
    | Hyderabad => "Hyderabad"
    | Mumbai => "Mumbai"
    | Chennai => "Chennai"
    | TamilNaduCities => "TamilNaduCities"
    | Mysore => "Mysore"
    | Pondicherry => "Pondicherry"
    | Pune => "Pune"
    | Tumakuru => "Tumakuru"
    | Noida => "Noida"
    | Gurugram => "Gurugram"
    | Tirunelveli => "Tirunelveli"
    | Thanjavur => "Thanjavur"
    | Vellore => "Vellore"
    | Madurai => "Madurai"
    | Salem => "Salem"
    | Hosur => "Hosur"
    | Trichy => "Trichy"
    | Minneapolis => "Minneapolis"
    | Trivandrum => "Trivandrum"
    | Thrissur => "Thrissur"
    | Kozhikode => "Kozhikode"
    | Chandigarh => "Chandigarh"
    | Jaipur => "Jaipur"
    | Siliguri => "Siliguri"
    | Asansol => "Asansol"
    | Durgapur => "Durgapur"
    | Petrapole => "Petrapole"
    | Gangtok => "Gangtok"
    | Darjeeling => "Darjeeling"
    | Davanagere => "Davanagere"
    | Shivamogga => "Shivamogga"
    | Hubli => "Hubli"
    | Mangalore => "Mangalore"
    | Udupi => "Udupi"
    | Gulbarga => "Gulbarga"
    | Vijayawada => "Vijayawada"
    | Vishakapatnam => "Vishakapatnam"
    | Guntur => "Guntur"
    | Tirupati => "Tirupati"
    | Kurnool => "Kurnool"
    | Khammam => "Khammam"
    | Karimnagar => "Karimnagar"
    | Nizamabad => "Nizamabad"
    | Mahbubnagar => "Mahbubnagar"
    | Suryapet => "Suryapet"
    | Nalgonda => "Nalgonda"
    | Siddipet => "Siddipet"
    | Rourkela => "Rourkela"
    | Bhubaneshwar => "Bhubaneshwar"
    | Cuttack => "Cuttack"
    | Puri => "Puri"
    | Warangal => "Warangal"
    | Pudukkottai => "Pudukkottai"
    | Bidar => "Bidar"
    | Srinagar => "Srinagar"
    | AnyCity => "AnyCity"
    | Alapuzha => "Alapuzha"
    | Idukki => "Idukki"
    | Kasarkode => "Kasarkode"
    | Wayanad => "Wayanad"
    | Kannur => "Kannur"
    | Kottayam => "Kottayam"
    | Palakkad => "Palakkad"
    | Kolam => "Kolam"
    | Pathanamthitta => "Pathanamthitta"
    | Shillong => "Shillong"
    | Cherrapunji => "Cherrapunji"
    | Pulwama => "Pulwama"
    | Jammu => "Jammu"
    | Anantnag => "Anantnag"
    | Berhampur => "Berhampur"
    | Bardhaman => "Bardhaman"
    | Ballari => "Ballari"
    | Birbhum => "Birbhum"
    }
  }
}

module PublicTransportDataVehicleType = {
  @genType
  type publicTransportDataVehicleType = METRO | SUBWAY | BUS

  let decodePublicTransportDataVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PublicTransportDataVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum PublicTransportDataVehicleType")
      }
    })
  }

  let decodePublicTransportDataVehicleType = data => {
    decodePublicTransportDataVehicleTypeEnumResult(Some(data))
  }

  let decodePublicTransportDataVehicleTypeResult = (dict, key): result<
    publicTransportDataVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePublicTransportDataVehicleTypeEnumResult
  }

  let publicTransportDataVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}

module PublicTransportVehicleDataVehicleTypeVehicleNumberVehicleType = {
  @genType
  type publicTransportVehicleDataVehicleTypeVehicleNumberVehicleType = METRO | SUBWAY | BUS

  let decodePublicTransportVehicleDataVehicleTypeVehicleNumberVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(
      Error(
        "failed to decode to PublicTransportVehicleDataVehicleTypeVehicleNumberVehicleType type",
      ),
      str => {
        switch str {
        | "METRO" => Ok(METRO)
        | "SUBWAY" => Ok(SUBWAY)
        | "BUS" => Ok(BUS)
        | _ =>
          Error(
            "failed to decode enum PublicTransportVehicleDataVehicleTypeVehicleNumberVehicleType",
          )
        }
      },
    )
  }

  let decodePublicTransportVehicleDataVehicleTypeVehicleNumberVehicleType = data => {
    decodePublicTransportVehicleDataVehicleTypeVehicleNumberVehicleTypeEnumResult(Some(data))
  }

  let decodePublicTransportVehicleDataVehicleTypeVehicleNumberVehicleTypeResult = (
    dict,
    key,
  ): result<publicTransportVehicleDataVehicleTypeVehicleNumberVehicleType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePublicTransportVehicleDataVehicleTypeVehicleNumberVehicleTypeEnumResult
  }

  let publicTransportVehicleDataVehicleTypeVehicleNumberVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}

module PayoutStatus = {
  @genType
  type payoutStatus = Processing | Success | Failed | ManualReview

  let decodePayoutStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PayoutStatus type"), str => {
      switch str {
      | "Processing" => Ok(Processing)
      | "Success" => Ok(Success)
      | "Failed" => Ok(Failed)
      | "ManualReview" => Ok(ManualReview)
      | _ => Error("failed to decode enum PayoutStatus")
      }
    })
  }

  let decodePayoutStatus = data => {
    decodePayoutStatusEnumResult(Some(data))
  }

  let decodePayoutStatusResult = (dict, key): result<payoutStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePayoutStatusEnumResult
  }

  let payoutStatusToString = enumValue => {
    switch enumValue {
    | Processing => "Processing"
    | Success => "Success"
    | Failed => "Failed"
    | ManualReview => "ManualReview"
    }
  }
}
module ExotelDirection = {
  @genType
  type exotelDirection = INBOUND | OUTBOUND_DIAL | OUTBOUND_API

  let decodeExotelDirectionEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to ExotelDirection type"), str => {
      switch str {
      | "INBOUND" => Ok(INBOUND)
      | "OUTBOUND_DIAL" => Ok(OUTBOUND_DIAL)
      | "OUTBOUND_API" => Ok(OUTBOUND_API)
      | _ => Error("failed to decode enum ExotelDirection")
      }
    })
  }

  let decodeExotelDirection = data => {
    decodeExotelDirectionEnumResult(Some(data))
  }

  let decodeExotelDirectionResult = (dict, key): result<exotelDirection, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeExotelDirectionEnumResult
  }

  let exotelDirectionToString = enumValue => {
    switch enumValue {
    | INBOUND => "INBOUND"
    | OUTBOUND_DIAL => "OUTBOUND_DIAL"
    | OUTBOUND_API => "OUTBOUND_API"
    }
  }
}
module ExotelCallStatus = {
  @genType
  type exotelCallStatus =
    | QUEUED
    | RINGING
    | IN_PROGRESS
    | COMPLETED
    | FAILED
    | BUSY
    | NO_ANSWER
    | CANCELED
    | INVALID_STATUS
    | CONNECTED
    | NOT_CONNECTED
    | MISSED
    | ATTEMPTED

  let decodeExotelCallStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to ExotelCallStatus type"), str => {
      switch str {
      | "QUEUED" => Ok(QUEUED)
      | "RINGING" => Ok(RINGING)
      | "IN_PROGRESS" => Ok(IN_PROGRESS)
      | "COMPLETED" => Ok(COMPLETED)
      | "FAILED" => Ok(FAILED)
      | "BUSY" => Ok(BUSY)
      | "NO_ANSWER" => Ok(NO_ANSWER)
      | "CANCELED" => Ok(CANCELED)
      | "INVALID_STATUS" => Ok(INVALID_STATUS)
      | "CONNECTED" => Ok(CONNECTED)
      | "NOT_CONNECTED" => Ok(NOT_CONNECTED)
      | "MISSED" => Ok(MISSED)
      | "ATTEMPTED" => Ok(ATTEMPTED)
      | _ => Error("failed to decode enum ExotelCallStatus")
      }
    })
  }

  let decodeExotelCallStatus = data => {
    decodeExotelCallStatusEnumResult(Some(data))
  }

  let decodeExotelCallStatusResult = (dict, key): result<exotelCallStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeExotelCallStatusEnumResult
  }

  let exotelCallStatusToString = enumValue => {
    switch enumValue {
    | QUEUED => "QUEUED"
    | RINGING => "RINGING"
    | IN_PROGRESS => "IN_PROGRESS"
    | COMPLETED => "COMPLETED"
    | FAILED => "FAILED"
    | BUSY => "BUSY"
    | NO_ANSWER => "NO_ANSWER"
    | CANCELED => "CANCELED"
    | INVALID_STATUS => "INVALID_STATUS"
    | CONNECTED => "CONNECTED"
    | NOT_CONNECTED => "NOT_CONNECTED"
    | MISSED => "MISSED"
    | ATTEMPTED => "ATTEMPTED"
    }
  }
}
module AckResponseMessageAckStatus = {
  @genType
  type ackResponseMessageAckStatus = ACK

  let decodeAckResponseMessageAckStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to AckResponseMessageAckStatus type"), str => {
      switch str {
      | "ACK" => Ok(ACK)
      | _ => Error("failed to decode enum AckResponseMessageAckStatus")
      }
    })
  }

  let decodeAckResponseMessageAckStatus = data => {
    decodeAckResponseMessageAckStatusEnumResult(Some(data))
  }

  let decodeAckResponseMessageAckStatusResult = (dict, key): result<
    ackResponseMessageAckStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeAckResponseMessageAckStatusEnumResult
  }

  let ackResponseMessageAckStatusToString = enumValue => {
    switch enumValue {
    | ACK => "ACK"
    }
  }
}
module CallStatus = {
  @genType
  type callStatus =
    | QUEUED
    | RINGING
    | IN_PROGRESS
    | COMPLETED
    | FAILED
    | BUSY
    | NO_ANSWER
    | CANCELED
    | INVALID_STATUS
    | CONNECTED
    | NOT_CONNECTED
    | ATTEMPTED
    | MISSED

  let decodeCallStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CallStatus type"), str => {
      switch str {
      | "QUEUED" => Ok(QUEUED)
      | "RINGING" => Ok(RINGING)
      | "IN_PROGRESS" => Ok(IN_PROGRESS)
      | "COMPLETED" => Ok(COMPLETED)
      | "FAILED" => Ok(FAILED)
      | "BUSY" => Ok(BUSY)
      | "NO_ANSWER" => Ok(NO_ANSWER)
      | "CANCELED" => Ok(CANCELED)
      | "INVALID_STATUS" => Ok(INVALID_STATUS)
      | "CONNECTED" => Ok(CONNECTED)
      | "NOT_CONNECTED" => Ok(NOT_CONNECTED)
      | "ATTEMPTED" => Ok(ATTEMPTED)
      | "MISSED" => Ok(MISSED)
      | _ => Error("failed to decode enum CallStatus")
      }
    })
  }

  let decodeCallStatus = data => {
    decodeCallStatusEnumResult(Some(data))
  }

  let decodeCallStatusResult = (dict, key): result<callStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCallStatusEnumResult
  }

  let callStatusToString = enumValue => {
    switch enumValue {
    | QUEUED => "QUEUED"
    | RINGING => "RINGING"
    | IN_PROGRESS => "IN_PROGRESS"
    | COMPLETED => "COMPLETED"
    | FAILED => "FAILED"
    | BUSY => "BUSY"
    | NO_ANSWER => "NO_ANSWER"
    | CANCELED => "CANCELED"
    | INVALID_STATUS => "INVALID_STATUS"
    | CONNECTED => "CONNECTED"
    | NOT_CONNECTED => "NOT_CONNECTED"
    | ATTEMPTED => "ATTEMPTED"
    | MISSED => "MISSED"
    }
  }
}
module RideBookingFavouritesListStatus = {
  @genType
  type rideBookingFavouritesListStatus =
    NEW | CONFIRMED | AWAITING_REASSIGNMENT | REALLOCATED | COMPLETED | CANCELLED | TRIP_ASSIGNED

  let decodeRideBookingFavouritesListStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideBookingFavouritesListStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "CONFIRMED" => Ok(CONFIRMED)
      | "AWAITING_REASSIGNMENT" => Ok(AWAITING_REASSIGNMENT)
      | "REALLOCATED" => Ok(REALLOCATED)
      | "COMPLETED" => Ok(COMPLETED)
      | "CANCELLED" => Ok(CANCELLED)
      | "TRIP_ASSIGNED" => Ok(TRIP_ASSIGNED)
      | _ => Error("failed to decode enum RideBookingFavouritesListStatus")
      }
    })
  }

  let decodeRideBookingFavouritesListStatus = data => {
    decodeRideBookingFavouritesListStatusEnumResult(Some(data))
  }

  let decodeRideBookingFavouritesListStatusResult = (dict, key): result<
    rideBookingFavouritesListStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideBookingFavouritesListStatusEnumResult
  }

  let rideBookingFavouritesListStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | CONFIRMED => "CONFIRMED"
    | AWAITING_REASSIGNMENT => "AWAITING_REASSIGNMENT"
    | REALLOCATED => "REALLOCATED"
    | COMPLETED => "COMPLETED"
    | CANCELLED => "CANCELLED"
    | TRIP_ASSIGNED => "TRIP_ASSIGNED"
    }
  }
}
module RideBookingListStatus = {
  @genType
  type rideBookingListStatus =
    NEW | CONFIRMED | AWAITING_REASSIGNMENT | REALLOCATED | COMPLETED | CANCELLED | TRIP_ASSIGNED

  let decodeRideBookingListStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideBookingListStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "CONFIRMED" => Ok(CONFIRMED)
      | "AWAITING_REASSIGNMENT" => Ok(AWAITING_REASSIGNMENT)
      | "REALLOCATED" => Ok(REALLOCATED)
      | "COMPLETED" => Ok(COMPLETED)
      | "CANCELLED" => Ok(CANCELLED)
      | "TRIP_ASSIGNED" => Ok(TRIP_ASSIGNED)
      | _ => Error("failed to decode enum RideBookingListStatus")
      }
    })
  }

  let decodeRideBookingListStatus = data => {
    decodeRideBookingListStatusEnumResult(Some(data))
  }

  let decodeRideBookingListStatusResult = (dict, key): result<rideBookingListStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideBookingListStatusEnumResult
  }

  let rideBookingListStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | CONFIRMED => "CONFIRMED"
    | AWAITING_REASSIGNMENT => "AWAITING_REASSIGNMENT"
    | REALLOCATED => "REALLOCATED"
    | COMPLETED => "COMPLETED"
    | CANCELLED => "CANCELLED"
    | TRIP_ASSIGNED => "TRIP_ASSIGNED"
    }
  }
}
module RideBookingListV2RideStatus = {
  @genType
  type rideBookingListV2RideStatus =
    NEW | CONFIRMED | AWAITING_REASSIGNMENT | REALLOCATED | COMPLETED | CANCELLED | TRIP_ASSIGNED

  let decodeRideBookingListV2RideStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideBookingListV2RideStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "CONFIRMED" => Ok(CONFIRMED)
      | "AWAITING_REASSIGNMENT" => Ok(AWAITING_REASSIGNMENT)
      | "REALLOCATED" => Ok(REALLOCATED)
      | "COMPLETED" => Ok(COMPLETED)
      | "CANCELLED" => Ok(CANCELLED)
      | "TRIP_ASSIGNED" => Ok(TRIP_ASSIGNED)
      | _ => Error("failed to decode enum RideBookingListV2RideStatus")
      }
    })
  }

  let decodeRideBookingListV2RideStatus = data => {
    decodeRideBookingListV2RideStatusEnumResult(Some(data))
  }

  let decodeRideBookingListV2RideStatusResult = (dict, key): result<
    rideBookingListV2RideStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideBookingListV2RideStatusEnumResult
  }

  let rideBookingListV2RideStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | CONFIRMED => "CONFIRMED"
    | AWAITING_REASSIGNMENT => "AWAITING_REASSIGNMENT"
    | REALLOCATED => "REALLOCATED"
    | COMPLETED => "COMPLETED"
    | CANCELLED => "CANCELLED"
    | TRIP_ASSIGNED => "TRIP_ASSIGNED"
    }
  }
}
module RideBookingListV2JourneyStatus = {
  @genType
  type rideBookingListV2JourneyStatus =
    NEW | INITIATED | CONFIRMED | INPROGRESS | CANCELLED | FEEDBACK_PENDING | COMPLETED | EXPIRED

  let decodeRideBookingListV2JourneyStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RideBookingListV2JourneyStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "INITIATED" => Ok(INITIATED)
      | "CONFIRMED" => Ok(CONFIRMED)
      | "INPROGRESS" => Ok(INPROGRESS)
      | "CANCELLED" => Ok(CANCELLED)
      | "FEEDBACK_PENDING" => Ok(FEEDBACK_PENDING)
      | "COMPLETED" => Ok(COMPLETED)
      | "EXPIRED" => Ok(EXPIRED)
      | _ => Error("failed to decode enum RideBookingListV2JourneyStatus")
      }
    })
  }

  let decodeRideBookingListV2JourneyStatus = data => {
    decodeRideBookingListV2JourneyStatusEnumResult(Some(data))
  }

  let decodeRideBookingListV2JourneyStatusResult = (dict, key): result<
    rideBookingListV2JourneyStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRideBookingListV2JourneyStatusEnumResult
  }

  let rideBookingListV2JourneyStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | INITIATED => "INITIATED"
    | CONFIRMED => "CONFIRMED"
    | INPROGRESS => "INPROGRESS"
    | CANCELLED => "CANCELLED"
    | FEEDBACK_PENDING => "FEEDBACK_PENDING"
    | COMPLETED => "COMPLETED"
    | EXPIRED => "EXPIRED"
    }
  }
}
module PaymentCollector = {
  @genType
  type paymentCollector = BAP | BPP

  let decodePaymentCollectorEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PaymentCollector type"), str => {
      switch str {
      | "BAP" => Ok(BAP)
      | "BPP" => Ok(BPP)
      | _ => Error("failed to decode enum PaymentCollector")
      }
    })
  }

  let decodePaymentCollector = data => {
    decodePaymentCollectorEnumResult(Some(data))
  }

  let decodePaymentCollectorResult = (dict, key): result<paymentCollector, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePaymentCollectorEnumResult
  }

  let paymentCollectorToString = enumValue => {
    switch enumValue {
    | BAP => "BAP"
    | BPP => "BPP"
    }
  }
}
module CardType = {
  @genType
  type cardType = DefaultCardType

  let decodeCardTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to CardType type"), str => {
      switch str {
      | "DefaultCardType" => Ok(DefaultCardType)
      | _ => Error("failed to decode enum CardType")
      }
    })
  }

  let decodeCardType = data => {
    decodeCardTypeEnumResult(Some(data))
  }

  let decodeCardTypeResult = (dict, key): result<cardType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeCardTypeEnumResult
  }

  let cardTypeToString = enumValue => {
    switch enumValue {
    | DefaultCardType => "DefaultCardType"
    }
  }
}
module WalletType = {
  @genType
  type walletType = DefaultWalletType

  let decodeWalletTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to WalletType type"), str => {
      switch str {
      | "DefaultWalletType" => Ok(DefaultWalletType)
      | _ => Error("failed to decode enum WalletType")
      }
    })
  }

  let decodeWalletType = data => {
    decodeWalletTypeEnumResult(Some(data))
  }

  let decodeWalletTypeResult = (dict, key): result<walletType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeWalletTypeEnumResult
  }

  let walletTypeToString = enumValue => {
    switch enumValue {
    | DefaultWalletType => "DefaultWalletType"
    }
  }
}
module PaymentType = {
  @genType
  type paymentType = ON_FULFILLMENT | POSTPAID

  let decodePaymentTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PaymentType type"), str => {
      switch str {
      | "ON_FULFILLMENT" => Ok(ON_FULFILLMENT)
      | "POSTPAID" => Ok(POSTPAID)
      | _ => Error("failed to decode enum PaymentType")
      }
    })
  }

  let decodePaymentType = data => {
    decodePaymentTypeEnumResult(Some(data))
  }

  let decodePaymentTypeResult = (dict, key): result<paymentType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePaymentTypeEnumResult
  }

  let paymentTypeToString = enumValue => {
    switch enumValue {
    | ON_FULFILLMENT => "ON_FULFILLMENT"
    | POSTPAID => "POSTPAID"
    }
  }
}
module GateType = {
  @genType
  type gateType = Pickup | Drop

  let decodeGateTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to GateType type"), str => {
      switch str {
      | "Pickup" => Ok(Pickup)
      | "Drop" => Ok(Drop)
      | _ => Error("failed to decode enum GateType")
      }
    })
  }

  let decodeGateType = data => {
    decodeGateTypeEnumResult(Some(data))
  }

  let decodeGateTypeResult = (dict, key): result<gateType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeGateTypeEnumResult
  }

  let gateTypeToString = enumValue => {
    switch enumValue {
    | Pickup => "Pickup"
    | Drop => "Drop"
    }
  }
}
module SubPlaceType = {
  @genType
  type subPlaceType = Venue | Terminal | Dock | Screen | Hall | Platform

  let decodeSubPlaceTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to SubPlaceType type"), str => {
      switch str {
      | "Venue" => Ok(Venue)
      | "Terminal" => Ok(Terminal)
      | "Dock" => Ok(Dock)
      | "Screen" => Ok(Screen)
      | "Hall" => Ok(Hall)
      | "Platform" => Ok(Platform)
      | _ => Error("failed to decode enum SubPlaceType")
      }
    })
  }

  let decodeSubPlaceType = data => {
    decodeSubPlaceTypeEnumResult(Some(data))
  }

  let decodeSubPlaceTypeResult = (dict, key): result<subPlaceType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeSubPlaceTypeEnumResult
  }

  let subPlaceTypeToString = enumValue => {
    switch enumValue {
    | Venue => "Venue"
    | Terminal => "Terminal"
    | Dock => "Dock"
    | Screen => "Screen"
    | Hall => "Hall"
    | Platform => "Platform"
    }
  }
}
module OAuthProvider = {
  @genType
  type oAuthProvider = Google | IOS

  let decodeOAuthProviderEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to OAuthProvider type"), str => {
      switch str {
      | "Google" => Ok(Google)
      | "IOS" => Ok(IOS)
      | _ => Error("failed to decode enum OAuthProvider")
      }
    })
  }

  let decodeOAuthProvider = data => {
    decodeOAuthProviderEnumResult(Some(data))
  }

  let decodeOAuthProviderResult = (dict, key): result<oAuthProvider, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeOAuthProviderEnumResult
  }

  let oAuthProviderToString = enumValue => {
    switch enumValue {
    | Google => "Google"
    | IOS => "IOS"
    }
  }
}
module TicketBookingsStatus = {
  @genType
  type ticketBookingsStatus = Pending | Failed | Booked | Cancelled

  let decodeTicketBookingsStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TicketBookingsStatus type"), str => {
      switch str {
      | "Pending" => Ok(Pending)
      | "Failed" => Ok(Failed)
      | "Booked" => Ok(Booked)
      | "Cancelled" => Ok(Cancelled)
      | _ => Error("failed to decode enum TicketBookingsStatus")
      }
    })
  }

  let decodeTicketBookingsStatus = data => {
    decodeTicketBookingsStatusEnumResult(Some(data))
  }

  let decodeTicketBookingsStatusResult = (dict, key): result<ticketBookingsStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTicketBookingsStatusEnumResult
  }

  let ticketBookingsStatusToString = enumValue => {
    switch enumValue {
    | Pending => "Pending"
    | Failed => "Failed"
    | Booked => "Booked"
    | Cancelled => "Cancelled"
    }
  }
}
module TicketBookingStatus = {
  @genType
  type ticketBookingStatus = Pending | Failed | Booked | Cancelled | RefundInitiated

  let decodeTicketBookingStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TicketBookingStatus type"), str => {
      switch str {
      | "Pending" => Ok(Pending)
      | "Failed" => Ok(Failed)
      | "Booked" => Ok(Booked)
      | "Cancelled" => Ok(Cancelled)
      | "RefundInitiated" => Ok(RefundInitiated)
      | _ => Error("failed to decode enum TicketBookingStatus")
      }
    })
  }

  let decodeTicketBookingStatus = data => {
    decodeTicketBookingStatusEnumResult(Some(data))
  }

  let decodeTicketBookingStatusResult = (dict, key): result<ticketBookingStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTicketBookingStatusEnumResult
  }

  let ticketBookingStatusToString = enumValue => {
    switch enumValue {
    | Pending => "Pending"
    | Failed => "Failed"
    | Booked => "Booked"
    | Cancelled => "Cancelled"
    | RefundInitiated => "RefundInitiated"
    }
  }
}
module TicketVerificationStatus = {
  @genType
  type ticketVerificationStatus =
    | BookingSuccess
    | BookingExpired
    | BookingFuture
    | BookingAlreadyVerified
    | DifferentService
    | PaymentPending
    | InvalidBooking
    | CancelledBooking

  let decodeTicketVerificationStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TicketVerificationStatus type"), str => {
      switch str {
      | "BookingSuccess" => Ok(BookingSuccess)
      | "BookingExpired" => Ok(BookingExpired)
      | "BookingFuture" => Ok(BookingFuture)
      | "BookingAlreadyVerified" => Ok(BookingAlreadyVerified)
      | "DifferentService" => Ok(DifferentService)
      | "PaymentPending" => Ok(PaymentPending)
      | "InvalidBooking" => Ok(InvalidBooking)
      | "CancelledBooking" => Ok(CancelledBooking)
      | _ => Error("failed to decode enum TicketVerificationStatus")
      }
    })
  }

  let decodeTicketVerificationStatus = data => {
    decodeTicketVerificationStatusEnumResult(Some(data))
  }

  let decodeTicketVerificationStatusResult = (dict, key): result<
    ticketVerificationStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTicketVerificationStatusEnumResult
  }

  let ticketVerificationStatusToString = enumValue => {
    switch enumValue {
    | BookingSuccess => "BookingSuccess"
    | BookingExpired => "BookingExpired"
    | BookingFuture => "BookingFuture"
    | BookingAlreadyVerified => "BookingAlreadyVerified"
    | DifferentService => "DifferentService"
    | PaymentPending => "PaymentPending"
    | InvalidBooking => "InvalidBooking"
    | CancelledBooking => "CancelledBooking"
    }
  }
}
module ServiceStatus = {
  @genType
  type serviceStatus = Pending | Failed | Confirmed | Verified | Cancelled

  let decodeServiceStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to ServiceStatus type"), str => {
      switch str {
      | "Pending" => Ok(Pending)
      | "Failed" => Ok(Failed)
      | "Confirmed" => Ok(Confirmed)
      | "Verified" => Ok(Verified)
      | "Cancelled" => Ok(Cancelled)
      | _ => Error("failed to decode enum ServiceStatus")
      }
    })
  }

  let decodeServiceStatus = data => {
    decodeServiceStatusEnumResult(Some(data))
  }

  let decodeServiceStatusResult = (dict, key): result<serviceStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeServiceStatusEnumResult
  }

  let serviceStatusToString = enumValue => {
    switch enumValue {
    | Pending => "Pending"
    | Failed => "Failed"
    | Confirmed => "Confirmed"
    | Verified => "Verified"
    | Cancelled => "Cancelled"
    }
  }
}
module PlaceType = {
  @genType
  type placeType =
    | Museum
    | ThemePark
    | AmusementPark
    | WaterPark
    | WildLifeSanctuary
    | ArtGallery
    | HeritageSite
    | ReligiousSite
    | Boating
    | Other

  let decodePlaceTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PlaceType type"), str => {
      switch str {
      | "Museum" => Ok(Museum)
      | "ThemePark" => Ok(ThemePark)
      | "AmusementPark" => Ok(AmusementPark)
      | "WaterPark" => Ok(WaterPark)
      | "WildLifeSanctuary" => Ok(WildLifeSanctuary)
      | "ArtGallery" => Ok(ArtGallery)
      | "HeritageSite" => Ok(HeritageSite)
      | "ReligiousSite" => Ok(ReligiousSite)
      | "Boating" => Ok(Boating)
      | "Other" => Ok(Other)
      | _ => Error("failed to decode enum PlaceType")
      }
    })
  }

  let decodePlaceType = data => {
    decodePlaceTypeEnumResult(Some(data))
  }

  let decodePlaceTypeResult = (dict, key): result<placeType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePlaceTypeEnumResult
  }

  let placeTypeToString = enumValue => {
    switch enumValue {
    | Museum => "Museum"
    | ThemePark => "ThemePark"
    | AmusementPark => "AmusementPark"
    | WaterPark => "WaterPark"
    | WildLifeSanctuary => "WildLifeSanctuary"
    | ArtGallery => "ArtGallery"
    | HeritageSite => "HeritageSite"
    | ReligiousSite => "ReligiousSite"
    | Boating => "Boating"
    | Other => "Other"
    }
  }
}

module PlaceStatus = {
  @genType
  type placeStatus = Active | Inactive | ComingSoon

  let decodePlaceStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to PlaceStatus type"), str => {
      switch str {
      | "Active" => Ok(Active)
      | "Inactive" => Ok(Inactive)
      | "ComingSoon" => Ok(ComingSoon)
      | _ => Error("failed to decode enum PlaceStatus")
      }
    })
  }

  let decodePlaceStatus = data => {
    decodePlaceStatusEnumResult(Some(data))
  }

  let decodePlaceStatusResult = (dict, key): result<placeStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodePlaceStatusEnumResult
  }

  let placeStatusToString = enumValue => {
    switch enumValue {
    | Active => "Active"
    | Inactive => "Inactive"
    | ComingSoon => "ComingSoon"
    }
  }
}
module SpecialDayType = {
  @genType
  type specialDayType = Open | Closed

  let decodeSpecialDayTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to SpecialDayType type"), str => {
      switch str {
      | "Open" => Ok(Open)
      | "Closed" => Ok(Closed)
      | _ => Error("failed to decode enum SpecialDayType")
      }
    })
  }

  let decodeSpecialDayType = data => {
    decodeSpecialDayTypeEnumResult(Some(data))
  }

  let decodeSpecialDayTypeResult = (dict, key): result<specialDayType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeSpecialDayTypeEnumResult
  }

  let specialDayTypeToString = enumValue => {
    switch enumValue {
    | Open => "Open"
    | Closed => "Closed"
    }
  }
}
module TrackVehiclesPlatformType = {
  @genType
  type trackVehiclesPlatformType = MULTIMODAL | PARTNERORG | APPLICATION

  let decodeTrackVehiclesPlatformTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TrackVehiclesPlatformType type"), str => {
      switch str {
      | "MULTIMODAL" => Ok(MULTIMODAL)
      | "PARTNERORG" => Ok(PARTNERORG)
      | "APPLICATION" => Ok(APPLICATION)
      | _ => Error("failed to decode enum TrackVehiclesPlatformType")
      }
    })
  }

  let decodeTrackVehiclesPlatformType = data => {
    decodeTrackVehiclesPlatformTypeEnumResult(Some(data))
  }

  let decodeTrackVehiclesPlatformTypeResult = (dict, key): result<
    trackVehiclesPlatformType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTrackVehiclesPlatformTypeEnumResult
  }

  let trackVehiclesPlatformTypeToString = enumValue => {
    switch enumValue {
    | MULTIMODAL => "MULTIMODAL"
    | PARTNERORG => "PARTNERORG"
    | APPLICATION => "APPLICATION"
    }
  }
}
module TrackVehiclesVehicleType = {
  @genType
  type trackVehiclesVehicleType = METRO | SUBWAY | BUS

  let decodeTrackVehiclesVehicleTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TrackVehiclesVehicleType type"), str => {
      switch str {
      | "METRO" => Ok(METRO)
      | "SUBWAY" => Ok(SUBWAY)
      | "BUS" => Ok(BUS)
      | _ => Error("failed to decode enum TrackVehiclesVehicleType")
      }
    })
  }

  let decodeTrackVehiclesVehicleType = data => {
    decodeTrackVehiclesVehicleTypeEnumResult(Some(data))
  }

  let decodeTrackVehiclesVehicleTypeResult = (dict, key): result<
    trackVehiclesVehicleType,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTrackVehiclesVehicleTypeEnumResult
  }

  let trackVehiclesVehicleTypeToString = enumValue => {
    switch enumValue {
    | METRO => "METRO"
    | SUBWAY => "SUBWAY"
    | BUS => "BUS"
    }
  }
}
module MessageSource = {
  @genType
  type messageSource = USER | TRUSTED_CONTACT

  let decodeMessageSourceEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to MessageSource type"), str => {
      switch str {
      | "USER" => Ok(USER)
      | "TRUSTED_CONTACT" => Ok(TRUSTED_CONTACT)
      | _ => Error("failed to decode enum MessageSource")
      }
    })
  }

  let decodeMessageSource = data => {
    decodeMessageSourceEnumResult(Some(data))
  }

  let decodeMessageSourceResult = (dict, key): result<messageSource, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMessageSourceEnumResult
  }

  let messageSourceToString = enumValue => {
    switch enumValue {
    | USER => "USER"
    | TRUSTED_CONTACT => "TRUSTED_CONTACT"
    }
  }
}

module RouteState = {
  @genType
  type routeState = ConfirmedHigh | Alternate | All | Schedule | ConfirmedMed

  let decodeRouteStateEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to RouteState type"), str => {
      switch str {
      | "ConfirmedHigh" => Ok(ConfirmedHigh)
      | "Alternate" => Ok(Alternate)
      | "All" => Ok(All)
      | "Schedule" => Ok(Schedule)
      | "ConfirmedMed" => Ok(ConfirmedMed)
      | _ => Error("failed to decode enum RouteState")
      }
    })
  }

  let decodeRouteState = data => {
    decodeRouteStateEnumResult(Some(data))
  }

  let decodeRouteStateResult = (dict, key): result<routeState, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeRouteStateEnumResult
  }

  let routeStateToString = enumValue => {
    switch enumValue {
    | ConfirmedHigh => "ConfirmedHigh"
    | Alternate => "Alternate"
    | All => "All"
    | Schedule => "Schedule"
    | ConfirmedMed => "ConfirmedMed"
    }
  }
}

module TrackingStatus = {
  @genType
  type trackingStatus =
    InPlan | Arriving | AlmostArrived | Arrived | Ongoing | Finishing | ExitingStation | Finished

  let decodeTrackingStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to TrackingStatus type"), str => {
      switch str {
      | "InPlan" => Ok(InPlan)
      | "Arriving" => Ok(Arriving)
      | "AlmostArrived" => Ok(AlmostArrived)
      | "Arrived" => Ok(Arrived)
      | "Ongoing" => Ok(Ongoing)
      | "Finishing" => Ok(Finishing)
      | "ExitingStation" => Ok(ExitingStation)
      | "Finished" => Ok(Finished)
      | _ => Error("failed to decode enum TrackingStatus")
      }
    })
  }

  let decodeTrackingStatus = data => {
    decodeTrackingStatusEnumResult(Some(data))
  }

  let decodeTrackingStatusResult = (dict, key): result<trackingStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeTrackingStatusEnumResult
  }

  let trackingStatusToString = enumValue => {
    switch enumValue {
    | InPlan => "InPlan"
    | Arriving => "Arriving"
    | AlmostArrived => "AlmostArrived"
    | Arrived => "Arrived"
    | Ongoing => "Ongoing"
    | Finishing => "Finishing"
    | ExitingStation => "ExitingStation"
    | Finished => "Finished"
    }
  }
}

module EstimateStatus = {
  @genType
  type estimateStatus =
    | NEW
    | DRIVER_QUOTE_REQUESTED
    | CANCELLED
    | GOT_DRIVER_QUOTE
    | DRIVER_QUOTE_CANCELLED
    | COMPLETED
    | RIDE_SEARCH_EXPIRED

  let decodeEstimateStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to EstimateStatus type"), str => {
      switch str {
      | "NEW" => Ok(NEW)
      | "DRIVER_QUOTE_REQUESTED" => Ok(DRIVER_QUOTE_REQUESTED)
      | "CANCELLED" => Ok(CANCELLED)
      | "GOT_DRIVER_QUOTE" => Ok(GOT_DRIVER_QUOTE)
      | "DRIVER_QUOTE_CANCELLED" => Ok(DRIVER_QUOTE_CANCELLED)
      | "RIDE_SEARCH_EXPIRED" => Ok(RIDE_SEARCH_EXPIRED)
      | "COMPLETED" => Ok(COMPLETED)
      | _ => Error("failed to decode enum EstimateStatus")
      }
    })
  }

  let decodeEstimateStatus = data => {
    decodeEstimateStatusEnumResult(Some(data))
  }

  let decodeEstimateStatusResult = (dict, key): result<estimateStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeEstimateStatusEnumResult
  }

  let estimateStatusToString = enumValue => {
    switch enumValue {
    | NEW => "NEW"
    | DRIVER_QUOTE_REQUESTED => "DRIVER_QUOTE_REQUESTED"
    | CANCELLED => "CANCELLED"
    | GOT_DRIVER_QUOTE => "GOT_DRIVER_QUOTE"
    | DRIVER_QUOTE_CANCELLED => "DRIVER_QUOTE_CANCELLED"
    | RIDE_SEARCH_EXPIRED => "RIDE_SEARCH_EXPIRED"
    | COMPLETED => "COMPLETED"
    }
  }
}
module FeedbackStatus = {
  @genType
  type feedbackStatus = FEEDBACK_PENDING

  let decodeFeedbackStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FeedbackStatus type"), str => {
      switch str {
      | "FEEDBACK_PENDING" => Ok(FEEDBACK_PENDING)
      | _ => Error("failed to decode enum FeedbackStatus")
      }
    })
  }

  let decodeFeedbackStatus = data => {
    decodeFeedbackStatusEnumResult(Some(data))
  }

  let decodeFeedbackStatusResult = (dict, key): result<feedbackStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFeedbackStatusEnumResult
  }

  let feedbackStatusToString = enumValue => {
    switch enumValue {
    | FEEDBACK_PENDING => "FEEDBACK_PENDING"
    }
  }
}

module InitialStatus = {
  @genType
  type initialStatus = BOOKING_PENDING

  let decodeInitialStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to InitialStatus type"), str => {
      switch str {
      | "BOOKING_PENDING" => Ok(BOOKING_PENDING)
      | _ => Error("failed to decode enum InitialStatus")
      }
    })
  }

  let decodeInitialStatus = data => {
    decodeInitialStatusEnumResult(Some(data))
  }

  let decodeInitialStatusResult = (dict, key): result<initialStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeInitialStatusEnumResult
  }

  let initialStatusToString = enumValue => {
    switch enumValue {
    | BOOKING_PENDING => "BOOKING_PENDING"
    }
  }
}

module MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus = {
  @genType
  type multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus =
    InPlan | Arriving | AlmostArrived | Arrived | Ongoing | Finishing | ExitingStation | Finished

  let decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(
      Error(
        "failed to decode to MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus type",
      ),
      str => {
        switch str {
        | "InPlan" => Ok(InPlan)
        | "Arriving" => Ok(Arriving)
        | "AlmostArrived" => Ok(AlmostArrived)
        | "Arrived" => Ok(Arrived)
        | "Ongoing" => Ok(Ongoing)
        | "Finishing" => Ok(Finishing)
        | "ExitingStation" => Ok(ExitingStation)
        | "Finished" => Ok(Finished)
        | _ =>
          Error(
            "failed to decode enum MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus",
          )
        }
      },
    )
  }

  let decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus = data => {
    decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatusEnumResult(
      Some(data),
    )
  }

  let decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatusResult = (
    dict,
    key,
  ): result<
    multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus,
    string,
  > => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatusEnumResult
  }

  let multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatusToString = enumValue => {
    switch enumValue {
    | InPlan => "InPlan"
    | Arriving => "Arriving"
    | AlmostArrived => "AlmostArrived"
    | Arrived => "Arrived"
    | Ongoing => "Ongoing"
    | Finishing => "Finishing"
    | ExitingStation => "ExitingStation"
    | Finished => "Finished"
    }
  }
}

module FRFSQuoteCategoryType = {
  @genType
  type fRFSQuoteCategoryType = ADULT | CHILD | SENIOR_CITIZEN | STUDENT | FEMALE | MALE

  let decodeFRFSQuoteCategoryTypeEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to FRFSQuoteCategoryType type"), str => {
      switch str {
      | "ADULT" => Ok(ADULT)
      | "CHILD" => Ok(CHILD)
      | "SENIOR_CITIZEN" => Ok(SENIOR_CITIZEN)
      | "STUDENT" => Ok(STUDENT)
      | "FEMALE" => Ok(FEMALE)
      | "MALE" => Ok(MALE)
      | _ => Error("failed to decode enum FRFSQuoteCategoryType")
      }
    })
  }

  let decodeFRFSQuoteCategoryType = data => {
    decodeFRFSQuoteCategoryTypeEnumResult(Some(data))
  }

  let decodeFRFSQuoteCategoryTypeResult = (dict, key): result<fRFSQuoteCategoryType, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeFRFSQuoteCategoryTypeEnumResult
  }

  let fRFSQuoteCategoryTypeToString = enumValue => {
    switch enumValue {
    | ADULT => "ADULT"
    | CHILD => "CHILD"
    | SENIOR_CITIZEN => "SENIOR_CITIZEN"
    | STUDENT => "STUDENT"
    | FEMALE => "FEMALE"
    | MALE => "MALE"
    }
  }
}

module OfferListStatus = {
  @genType
  type offerListStatus = ELIGIBLE | INELIGIBLE

  let decodeOfferListStatusEnumResult = data => {
    data
    ->Option.flatMap(JSON.Decode.string)
    ->Option.mapOr(Error("failed to decode to OfferListStatus type"), str => {
      switch str {
      | "ELIGIBLE" => Ok(ELIGIBLE)
      | "INELIGIBLE" => Ok(INELIGIBLE)
      | _ => Error("failed to decode enum OfferListStatus")
      }
    })
  }

  let decodeOfferListStatus = data => {
    decodeOfferListStatusEnumResult(Some(data))
  }

  let decodeOfferListStatusResult = (dict, key): result<offerListStatus, string> => {
    dict
    ->Dict.get(key)
    ->Option.flatMap(Utils.jsonNullToOption)
    ->decodeOfferListStatusEnumResult
  }

  let offerListStatusToString = enumValue => {
    switch enumValue {
    | ELIGIBLE => "ELIGIBLE"
    | INELIGIBLE => "INELIGIBLE"
    }
  }
}
