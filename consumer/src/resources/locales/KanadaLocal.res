let kanadaLocal = (locale: LocaleStringType.localeString): LocaleStringType.textAndAccObj =>
  switch locale {
  | HEADING => {text: "ಶೀರ್ಷಿಕೆ"}
  | NAME => {text: "ಹೆಸರು"}
  | ADD_HOME => {text: "ಮನೆ ಸೇರಿಸಿ"}
  | ADD_WORK => {text: "ಕೆಲಸ ಸೇರಿಸಿ"}
  | ADD_OTHER => {text: "ಇತರರನ್ನು ಸೇರಿಸಿ"}
  | RECENT => {text: "ಇತ್ತೀಚಿನ"}
  | FAVOURITES => {text: "ಮೆಚ್ಚಿದವು"}
  | WHERE_ARE_YOU_GOING => {
      text: "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ?",
    }
  | Bookings => {text: "ಬುಕಿಂಗ್ಸ್"}

  | MY_RIDES => {text: "ನನ್ನ ಸವಾರಿಗಳು"}
  | SAFETY => {text: "ಭದ್ರತೆ"}
  | HELP_AND_SUPPORT => {text: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ"}
  | APP_LANGUAGE => {text: "App Language"}
  | PAYMENT => {text: "ಪಾವತಿ"}
  | REFER_AND_EARN => {text: "ಸೂಚಿಸಿ ಮತ್ತು ಗಳಿಸಿ"}
  | ABOUT => {text: "ಬಗ್ಗೆ"}
  | LOGOUT => {text: "ಲಾಗೌಟ್"}
  | PROFILE_COMPLETION => {text: "ಪ್ರೊಫೈಲ್ ಪೂರ್ಣತೆ"}
  | BACK_TO_HOME => {text: "ಮನೆಗೆ ಹಿಂದಿರುಗಿ"}
  | SPORTS_NEAR_ME => {text: "ನನ್ನ ಹತ್ತಿರ ಕ್ರೀಡೆ"}
  | SET_PIN_ON_MAP => {text: "ನಕ್ಷೆಯ ಮೇಲೆ ಪಿ"}
  | NOW => {text: "ಈಗ"}
  | CONFIRM_PICKUP_LOCATION => {
      text: "ಪಿಕಪ್ ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ",
    }
  | CONFIRM_DROP_LOCATION => {
      text: "ಡ್ರಾಪ್ ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ",
    }
  | CONFIRM_LOCATION => {
      text: "ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ",
    }
  | SPECIAL_LOCATION_GATE => {
      text: "Select a designated pickup spot by choosing from the list or dragging the map",
    }
  | BOOK_A_RIDE_NOW => {text: "ಈಗ ಸವಾರಿ ಬುಕ್ ಮಾಡಿ"}
  | CHOOSE_YOUR_RIDE => {
      text: "ನಿಮ್ಮ ಸವಾರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    }
  | BRIDGE_MINI => {text: "ಬ್ರಿಜ್ ಮಿನಿ"}
  | BRIDGE_PREMIER => {text: "ಬ್ರಿಜ್ ಪ್ರಿಮಿಯರ್"}
  | BRIDGE_XL => {text: "ಬ್ರಿಜ್ ಎಕ್ಸ್ಎಲ್"}
  | FINDING_RIDES_NEAR_YOU => {text: "ಮೂಲಕ ಪಾವತಿ"}
  | BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE => {
      text: "ನಿಮ್ಮ ಹತ್ತಿರ ಸವಾರಿಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದಾರೆ",
    }
  | CANCEL_RIDE => {
      text: "ಬ್ರಿಜ್ ನಗರಕ್ಕಾಗಿ ಜನರಿಂದ ನಿರ್ಮಿತವಾಗಿದೆ!",
    }
  | CANCEL_SEARCH => {text: "ಸವಾರಿ ರದ್ದುಮಾಡಿ"}
  | DONT_CANCEL => {text: "ರದ್ದು ಮಾಡಬೇಡಿ"}
  | PLEASE_SELECT_A_REASON_FOR_CANCELLATION => {
      text: "ರದ್ದುಗೊಳಿಸುವ ಕಾರಣವನ್ನು ದಯವಿಟ್ಟು ಆಯ್ಕೆಮಾಡಿ",
    }
  | REQUESTED_WRONG_VEHICLE => {
      text: "ತಪ್ಪಾಗಿ ವಾಹನವನ್ನು ಕೇಳಿದ್ದೀರಿ",
    }
  | CHANGE_OF_PLANS => {text: "ಯೋಜನೆಯ ಬದಲಾವಣೆ"}
  | LONGER_WAIT_TIME => {text: "ಹೆಚ್ಚು ಕಾಯಬೇಕಾದ ಸಮಯ"}
  | OTHER => {text: "ಇತರ"}
  | IS_ARRIVING_IN => {text: "ಬರುತ್ತಿದೆ"}
  | RIDE_ACTIONS => {text: "ಸವಾರಿ ಕ್ರಿಯೆಗಳು"}
  | SHARE_RIDE => {text: "ಸವಾರಿ ಹಂಚಿಕೊಳ್ಳಿ"}
  | SAFETY_TOOLS => {text: "ಭದ್ರತಾ ಉಪಕರಣಗಳು"}
  | RIDE_ESTIMATE => {text: "ಸವಾರಿ ಅಂಚು"}
  | PAID_VIA => {text: "ಪ್ರಯಾಣ ವಿವರಗಳು"}
  | TRIP_DETAILS => {text: "ಸಂಪಾದಿಸಿ ಸೇರಿಸಿ"}
  | EDIT_ADD => {
      text: "ನೀವು ನಿಜವಾಗಿಯೇ ಸವಾರಿಯನ್ನು ರದ್ದು ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THE_RIDE => {
      text: "ಯಾವುದೇ ಕಾರುಗಳು ಲಭ್ಯವಿಲ್ಲ!",
    }
  | NO_CAR_AVAILABLE => {
      text: "ನೀವು ಹೆಚ್ಚು ಬೇಡಿಕೆಯ ಪ್ರದೇಶದಲ್ಲಿದ್ದೀರಿ ಮತ್ತು ಪ್ರಸ್ತುತ ಯಾವುದೇ ಚಾಲಕರು ಲಭ್ಯವಿಲ್ಲ.",
    }
  | IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA => {
      text: "ಮನೆಗೆ ಹೋಗಿ",
    }
  | GO_HOME => {text: "ಹುಡುಕಾಟವನ್ನು ರದ್ದುಗೊಳಿಸಿ"}
  | CONTACT => {text: "ಸಂಪರ್ಕಿಸಿ"}
  | PICKUP => {text: "ಪಿಕಪ್"}
  | DESTINATION => {text: "ಗಮ್ಯಸ್ಥಾನ"}
  | CALL_DRIVER => {text: "Call Driver"}
  | RECOMMENDED => {text: "Recommended"}
  | DIRECT_CALL => {text: "Direct Call"}
  | YOUR_NUMBER_WILL_NOT_BE_SHOWN_ => {
      text: "Your number will not be shown to the driver The call will be recorded for compliance",
    }
  | YOUR_NUMBER_WILL_BE_VISIBLE_ => {
      text: "Your number will be visible to the driver Use if not calling from registered number",
    }
  | ANONYMOUS_CALL => {text: "Anonymous Call"}
  | CANCEL_ANYWAY => {text: "Cancel anyway"}
  | SUBMIT => {text: "Submit"}
  | MILES => {text: "Miles"}
  | CAB_IS_ARRIVING => {text: "Cab is arriving!"}
  | COLOR => {text: "Color"}
  | VARIANT => {text: "Variant"}
  | REACT_NATIVE_ANIMATIONS => {text: "React Native Animations"}
  | RIDE_DETAILS_SCREEN => {text: "Ride Details Screen"}
  | ENTER_PERSONAL_DETAILS => {text: "Enter Personal Details "}
  | GIVE_PERMISSIONS => {text: "Give Permissions "}
  | CAROUSEL_DEMO => {text: "Carousel Demo"}
  | LOCATION_UNSERVICEABLE => {text: "Location unserviceable"}
  | OFFLINE => {
      text: "ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಇದ್ದೀರಿ",
    }
  | CHECK_INTERNET => {
      text: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    }
  | TRY_AGAIN => {text: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ"}
  | SOMETHING_WENT_WRONG_FETCHING_THE_RIDES => {
      text: "ಯಾತ್ರೆ ಪಡೆಯುವಾಗ ಏನೋ ತಪ್ಪಾಗಿದೆ.",
    }
  | WE_ARE_NOT_LIVE_IN_YOUR_AREA_ => {
      text: "We are not live in your area yet! \n You can access ride history and other settings from the menu on the top left.",
    }
  | FACING_PROBLEMS_WITH_THE_APP => {text: "Facing problems with the app?"}
  | TAP_HERE_TO_REPORT_ISSUE => {text: "Tap here to report issue"}
  | ENTER_OTP_SCREEN => {text: "Enter Otp Screen"}
  | UNHAPPY => {text: "<< Unhappy"}
  | HAPPY => {text: "<< happy"}
  | THANK_YOU => {text: "Thank You!"}
  | RIDE_COMPLETED_SCREEN => {text: "Ride Completed Screen"}
  | EDIT => {text: "Edit"}
  | PAY_BY => {text: "Pay By"}
  | UPI => {text: "UPI"}
  | CUSTOM_TEXT(obj) => obj
  | THE_DRIVER_IS_ON_HIS_WAY_TO_YOUR_LOCATION_ => {
      text: "The driver is on his way to your location. If you cancel, there will be a cancellation fee of $4.50.",
    }
  | CANCELLING_MAY_RESULT_IN_LONGER_WAIT_TIME_ => {
      text: "Cancelling may result in longer wait time. Do you still want to cancel the ride?",
    }
  | LET_US_KNOW_THE_REASON_FOR_CANCELLATION => {text: "Let us know the reason for cancellation"}
  | INCREASE_WITH_ANIMATION => {text: "Increase width Animation"}
  | TRY_ANOTHER_LOCATION => {
      text: "ಬೇರೆ ಸ್ಥಳವನ್ನು ಪ್ರಯತ್ನಿಸಿ",
    }
  | ADD_CARD => {text: "Add Card"}
  | DELETE => {text: "Delete"}
  | DRIVER_MIGHT_BE_ON_HIS_WAY => {
      text: "ಡ್ರೈವರ್ ದಾರಿಯಲ್ಲಿರಬಹುದು. ನೀವು ನಿಜವಾಗಿಯೂ ರೈಡ್ ಅನ್ನು ರದ್ದುಗೊಳಿಸಲು ಬಯಸುವಿರಾ?",
    }
  | CHANGE_RIDE_TYPE => {
      text: "ಸವಾರಿ ಪ್ರಕಾರವನ್ನು ಬದಲಾಯಿಸಿ",
    }
  | CHANGE_RIDE_TYPE_FOR_BETTER_RIDES => {
      text: "ಉತ್ತಮ ಸವಾರಿಗಾಗಿ ಸವಾರಿ ಪ್ರಕಾರವನ್ನು ಬದಲಾಯಿಸಿ",
    }
  | REFER_YOUR_FRIENDS => {
      text: "ನಿಮ್ಮ ಸ್ನೇಹಿತರನ್ನು ಉಲ್ಲೇಖಿಸಿ",
    }
  | YOUR_REFERRAL_CODE => {text: "ನಿಮ್ಮ ರೆಫರಲ್ ಕೋಡ್"}
  | SHARE_AND_REFER => {
      text: "ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಉಲ್ಲೇಖಿಸಿ",
    }
  | REFERRED_USERS => {text: "ಉಲ್ಲೇಖಿತ ಬಳಕೆದಾರರು"}
  | USERS_WHO_DOWNLOAD_THE_APP(appName) => {
      text: `${appName} ಆಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ನಿಮ್ಮ ರಿಫರಲ್ ಕೋಡ್ ಬಳಸಿ ಮೊದಲ ಪ್ರಯಾಣವನ್ನು ಪೂರ್ಣಗೊಳಿಸುವ ಬಳಕೆದಾರರನ್ನು ರಿಫರ್ ಮಾಡಿದ ಬಳಕೆದಾರರಾಗಿ ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ. \n \nರಿಫರಲ್ ಕೋಡ್ ಅನ್ನು ಸೈನ್ ಅಪ್ ಮಾಡುವ ವೇಳೆ ನಮೂದಿಸಬಹುದು.`,
    }
  | GOT_IT => {text: "ಗೊತ್ತಾಗಿದೆ"}
  | HAVE_A_REFERRAL_CODE => {text: "ರಿಫರಲ್ ಕೋಡ್ ಇದೆಯಾ?"}
  | INVALID_CODE => {text: "ಅಮಾನ್ಯ ಕೋಡ್!"}
  | APPLY => {text: "ಅನ್ವಯಿಸು"}
  | REFERRAL_CODE_APPLIED_SUCCESSFULLY => {
      text: "ರೆಫರಲ್ ಕೋಡ್ ಯಶಸ್ವಿಯಾಗಿ ಅನ್ವಯಿಸಲಾಗಿದೆ!",
    }
  | WHAT_IS_THE_REFERRAL_PROGRAM => {
      text: "ರಿಫರಲ್ ಪ್ರೋಗ್ರಾಂ ಏನು?",
    }
  | THE_REFERRAL_PROGRAM_INCENTIVISES(appName) => {
      text: `ರಿಫರಲ್ ಪ್ರೋಗ್ರಾಂ ಡ್ರೈವರ್‌ಗಳಿಗೆ ಹೆಚ್ಚಿನ ಪ್ರಯಾಣಗಳನ್ನು ಸ್ವೀಕರಿಸಲು, ಕಡಿಮೆ ರದ್ದುಪಡಿಸಲು ಮತ್ತು ಅರ್ಹ ಡ್ರೈವರ್‌ಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಬಹುಮಾನ ನೀಡಿ ಉತ್ತಮವಾಗಿ ಸೇವೆ ನೀಡಲು ಪ್ರೇರೇಪಿಸುತ್ತದೆ. \n \nನೀವು ಡ್ರೈವರ್‌ನ ರಿಫರಲ್ ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ ${appName} ಸಮುದಾಯದ ಪ್ರಯಾಣದ ಗುಣಮಟ್ಟವನ್ನು ಸುಧಾರಿಸುವ ಮೂಲಕ ಸಹಾಯ ಮಾಡಬಹುದು! \n\nನೀವು ${appName} ಡ್ರೈವರ್ ಅಥವಾ ಬಳಕೆದಾರರಿಂದ ರಿಫರಲ್ ಕೋಡ್ ಅನ್ನು ಪಡೆಯಬಹುದು.`,
    }
  | ENTER_REFERRAL_CODE_BELOW => {
      text: "ಕೆಳಗಿನ 6 ಅಂಕೆಯ ರಿಫರಲ್ ಕೋಡ್ ನಮೂದಿಸಿ",
    }
  | DRIVER_IS_WAITING => {text: "ಚಾಲಕ ಕಾಯುತ್ತಿದ್ದಾರೆ"}
  | DRIVER_ARRIVED => {text: "ಚಾಲಕ ಬಂದಿದ್ದಾರೆ!"}
  | BRIDGE_TO_DESTINATION => {text: "ಗಮ್ಯಸ್ಥಾನಕ್ಕೆ ಸೇತುವೆ"}
  | APP_DESCRIPTION(appName) => {
      text: `${appName} ಚಾಲಕರನ್ನು ಚಾಲಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಲು ಮುಕ್ತ ವೇದಿಕೆಯಾಗಿದೆ. ಅಪ್ಲಿಕೇಶನ್ ಮಾಡುತ್ತದೆ
  ಸವಾರರಿಗೆ ರೈಡ್ ಬುಕ್ ಮಾಡಲು ಅನುಕೂಲವಾಗುತ್ತದೆ
  ಮೀಟರ್ ದರ ಆದ್ದರಿಂದ ಕನಿಷ್ಠ ದರದೊಂದಿಗೆ`,
    }
  | TERMS_AND_CONDITIONS => {text: "ನಿಯಮ ಮತ್ತು ಶರತ್ತುಗಳು"}
  | PRIVACY_POLICY => {text: "ಗೌಪ್ಯತಾ ನೀತಿ"}
  | THANK_YOU_FOR_PAYMENT_RATING => {text: "Thank you for payment & rating"}
  | PLEASE_ADD_TIP_TO_YOUR_DRIVER => {text: "Please add tip to your driver"}
  | SKIP => {text: "Skip"}
  | LET_US_KNOW_THE_ISSUES_YOU_FACED => {text: "Let us know the issues you faced"}
  | SORRY_FOR_UNDESIRED_EXPERIENCE => {text: "Sorry for undesired experience"}
  | ENDORSE_YOUR_DRIVER => {text: "Would you endorse your driver to fellow riders?"}
  | SWIPE_TO_RATE => {text: "Swipe to rate the ride & driver"}
  | SWIPE_RIGHT_TO_ENDORSE => {text: "Swipe right to endorse"}
  | REPORT_ISSUE => {text: "Report Issue"}
  | THANK_YOU_FOR_RIDING_WITH_BRIDGE => {text: "Thank you for riding with Bridge!"}
  | BASE_FARE => {text: "ಬೇಸ್ ಫೇರ್"}
  | CONGESTION_CHARGE => {text: "ಕಂಜೆಸ್ಟಿಯನ್ ಶುಲ್ಕ"}
  | OPTIONAL_DRIVER_REQUEST => {text: "ಐಚ್ಛಿಕ ಚಾಲಕ ಅರ್ಡರ್"}
  | DRIVER_ADDITIONS => {text: "ಚಾಲಕ ಸೇರಿಕೆಗಳು"}
  | TOTAL_FARE => {text: "ಒಟ್ಟು ಹಣ"}
  | PICKUP_CHARGES => {text: "ಪಿಕಪ್ ಶುಲ್ಕ"}
  | WAITING_CHARGES(star) => {text: `ನಿರೀಕ್ಷಣಾ ಶುಲ್ಕ ${star}`}
  | EARLY_RIDE_END_CHARGES => {
      text: "ಹೊರಗಡೆ ರೈಡ್ ಮುಗಿಯಲು ದಂಡ",
    }
  | CUSTOMER_TIP => {text: "ಗ್ರಾಹಕ ಸೂಚನೆ *"}
  | SERVICE_CHARGES => {text: "ಸೇವೆ ಶುಲ್ಕಗಳು"}
  | RIDE_GST => {text: "ರೈಡ್ ಜಿಎಸ್ಟಿ (5%)"}
  | PLATFORM_FEE => {text: "ಮಹಾಟಪ ಶುಲ್ಕ"}
  | TAXES => {text: "ತೆರಿಗೆಗಳು (ಜಿಎಸ್ಟಿ)"}
  | CANCELLATION_DUES => {text: "ರದ್ದು ಶುಲ್ಕಗಳು"}
  | TOLL_CHARGES => {text: "ಟೋಲ್ ಶುಲ್ಕಗಳು"}
  | DISTANCE_BASED_CHARGES => {
      text: "ದೂರವನ್ನು ಆಧರಿಸಿದ ಶುಲ್ಕಗಳು",
    }
  | TIME_BASED_CHARGES => {text: "ಸಮಯ ಆಧರಿಸಿದ ಶುಲ್ಕಗಳು"}
  | EXTRA_TIME_CHARGES => {text: "ಹೆಚ್ಚು ಸಮಯ ಶುಲ್ಕಗಳು"}
  | CUSTOMER_TIP_INFO => {
      text: "* ಗ್ರಾಹಕರು ಒದಗಿಸಿದ ಸೇವೆಗಾಗಿ ಹೆಚ್ಚು ಹಣ ಸೇರಿಸಲಾಗಿದೆ।",
    }
  | WAIT_CHARGE_INFO => {
      text: "* ಮೊದಲ ಮೂರು ನಿಮಿಷಗಳಲ್ಲಿ ನಿರೀಕ್ಷಣಾ ಶುಲ್ಕ ಸುಮಾರುವುದಿಲ್ಲ. ನಂತರ ಪ್ರತಿ ನಿಮಿಷದಲ್ಲಿ {Amount} ವೇಳಾಪಟ್ಟಿಗೆ ಶುಲ್ಕ ಒತ್ತಾಯಿತಾಯಿತು.",
    }
  | IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION => {
      text: "ನಿಮ್ಮ ವ್ಯವಹಾರ ಇತಿಹಾಸದ ಬಗ್ಗೆ ನಿಮಗೆ ಏನಾದರೂ ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ, ತಿದ್ದುಪಡಿ ಬೇಕಿದ್ದರೆ ಅಥವಾ ಯಾವುದೇ ಮಾಹಿತಿಯನ್ನು ವಾದಿಸಬೇಕಿದ್ದರೆ, ದಯವಿಟ್ಟು ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    }
  | CALL_SUPPORT => {text: "ಮಕ್ಕಳ ಸಹಾಯ"}
  | CALL_CUSTOMER_SUPPORT => {text: "ಗ್ರಾಹಕರ ಸಹಾಯ"}
  | YOUR_LATEST_LOCATION => {text: "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಸ್ಥಳ"}
  | YOUR_VEHICLE_INFO => {text: "ನಿಮ್ಮ ವಾಹನದ ಮಾಹಿತಿ"}
  | PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION => {
      text: "ದಯವಿಟ್ಟು ಆಪರೇಟರ್‌ಗೆ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಕೊಡಿ - ಆ್ಯಪ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.",
    }
  | EMERGENCY_ASSISTANCE => {text: "ತುರ್ತು ಸಹಾಯ"}
  | CALL(number) => {text: `ಕರೆ ಮಾಡಿ ${number}`}
  | PRICING_BRIDGE_MINI => {text: "ಬೆಲೆ - ಸೇತುವೆ ಮಿನಿ"}
  | PER_MILE_FARE => {text: "ಪ್ರತಿ ಮೈಲಿ ದರ"}
  | PER_MINUTE_FARE => {text: "ಪ್ರತಿ ನಿಮಿಷದ ದರ"}
  | OTHER_CHARGES => {text: "ಇತರೆ ಶುಲ್ಕಗಳು"}
  | PER_MILE => {text: "/ಮೈ"}
  | PER_MIN => {text: "/ನಿಮಿಷ"}
  | DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(multiplier, from, till) => {
      text: `${multiplier}x ಹಗಲಿನ ಶುಲ್ಕಗಳು ರಾತ್ರಿಯಲ್ಲಿ ${from} ನಿಂದ ${till} ವರೆಗೆ ಅನ್ವಯಿಸುತ್ತವೆ
  `,
    }
  | DELETE_ACCOUNT => {text: "ಖಾತೆಯನ್ನು ಅಳಿಸಿ"}
  | ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT => {
      text: "ನೀವು ಖಾತೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವುದರಲ್ಲಿ ನಿಮಗೆ ಖಚಿತವಿದೆಯೇ?",
    }
  | CANCEL => {text: "ರದ್ದುಮಾಡಿ"}
  | SORRY_TO_HEAR_YOU_GO => {
      text: "ನೀವು ಹೋಗುತ್ತಿರುವ ಸುದ್ದಿ ಕೇಳಿ ವಿಷಾದವಾಗಿದೆ!",
    }
  | YOUR_PREFERENCE_HAS_BEEN_NOTED => {
      text: "ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ಗಮನಿಸಲಾಗಿದೆ ಮತ್ತು ಶೀಘ್ರದಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗುತ್ತದೆ. ನಾವು ನಿಮ್ಮನ್ನು ಮತ್ತೆ ಸೇವಿಸಲು ಶೀಘ್ರದಲ್ಲೇ ನಿರೀಕ್ಷಿಸುತ್ತೇವೆ.",
    }
  | OKAY => {text: "ಸರಿ"}
  | ADDRESS => {text: "ವಿಳಾಸ"}
  | CHOOSE_TAG => {text: "ಟ್ಯಾಗ್ ಆಯ್ಕೆಮಾಡಿ"}
  | CURRENT_LOCATION => {text: "ಈಗಿನ ಸ್ಥಳ"}
  | SEARCH_FOR_AREA => {
      text: "ಪ್ರದೇಶ, ರಸ್ತೆ ಹೆಸರು ಹುಡುಕಿ...",
    }
  | OTHER_FAVOURITES => {text: "ಇತರೆ ಮೆಚ್ಚಿನವುಗಳು"}
  | DELETE_FAVOURITE => {text: "ಮೆಚ್ಚಿನವುಗಳನ್ನು ಅಳಿಸಿ"}
  | TYPE_NAME_FOR_LOCATION => {
      text: "ಸ್ಥಳಕ್ಕಾಗಿ ಹೆಸರನ್ನು টাইಪ್ ಮಾಡಿ",
    }
  | ADD_FAVOURITE => {text: "ಮೆಚ್ಚಿನವನ್ನು ಸೇರಿಸಿ"}
  | EDIT_FAVOURITE => {text: "ಮೆಚ್ಚಿನವನ್ನು ಸಂಪಾದಿಸಿ"}
  | NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE => {
      text: "ತೋರಿಸಲು ಯಾವುದೇ ಮೆಚ್ಚಿನವುಗಳಿಲ್ಲ. ಮುಂದುವರೆಯಲು ಒಂದು ಸೇರಿಸಿ...",
    }
  | HOME => {text: "ಮನೆ"}
  | WORK => {text: "ಕೆಲಸ"}
  | ADD_ADDRESS => {text: "ವಿಳಾಸವನ್ನು ಸೇರಿಸಿ"}
  | INVOICE => {text: "ರಸೀತಿ"}
  | RIDE_DETAILS => {text: "ಪ್ರಯಾಣದ ವಿವರ"}
  | YOUR_RECENT_RIDE => {text: "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಪ್ರಯಾಣ"}
  | ALL_TOPICS => {text: "ಎಲ್ಲಾ ವಿಷಯಗಳು"}
  | REPORT_AN_ISSUE_WITH_THIS_RIDE => {
      text: "ಈ ಪ್ರಯಾಣದ ಬಗ್ಗೆ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ",
    }
  | VIEW_ALL_RIDES => {text: "ಎಲ್ಲಾ ಪ್ರಯಾಣಗಳನ್ನು ನೋಡಿ"}
  | DESCRIBE_YOUR_ISSUE(appName) => {
      text: `ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ. ${appName} ಅದನ್ನು 24 ಗಂಟೆಗಳೊಳಗೆ ಪರಿಹರಿಸಲು ಪ್ರಯತ್ನಿಸಲಿದೆ.`,
    }
  | ENTER_YOUR_TEXT_HERE => {
      text: "ಇಲ್ಲಿ ನಿಮ್ಮ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ",
    }
  | ALL_RIDES => {text: "ಎಲ್ಲಾ ಪ್ರಯಾಣಗಳು"}
  | NO_RIDE_HISTORY_AVAILABLE => {
      text: "ಯಾವುದೇ ಪ್ರಯಾಣದ ಇತಿಹಾಸವಿಲ್ಲ",
    }
  | YOU_HAVE_NOT_TAKEN_A_RIDE_YET => {
      text: "ನೀವು ಇನ್ನೂ ಪ್ರಯಾಣ ನಡೆಸಿಲ್ಲ",
    }
  | SEARCH => {text: "ಹುಡುಕಿ"}
  | MESSAGE => {text: "ಸಂದೇಶ"}
  | SUBMIT_ISSUE_DETAILS => {
      text: "ಸಮಸ್ಯೆಯ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಿ",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_LOGOUT => {
      text: "ನೀವು ಲಾಗ್ ಔಟ್ ಮಾಡಬೇಕೆಂದು ಖಚಿತಪಡಿಸಿಕೊಂಡಿದ್ದೀರಾ?",
    }
  | RIDE_SHARE_INFO => {text: "ರೈಡ್ ಶೇರ್ ಮಾಹಿತಿ"}
  | ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS => {
      text: "ತುರ್ತು ಸಂಪರ್ಕಗಳೊಂದಿಗೆ ಸ್ಥಳ ಮತ್ತು ರೈಡ್ ವಿವರಗಳನ್ನು ಹಂಚಲು ಸಂಪರ್ಕಗಳನ್ನು ಸೇರಿಸಿ",
    }
  | ADD_A_CONTACT => {text: "\uFF0B ಸಂಪರ್ಕವನ್ನು ಸೇರಿಸಿ"}
  | SHARE_RIDE_INFO => {
      text: "ರೈಡ್ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    }
  | SHARE_LOCATION_AND_RIDE_DETAILS => {
      text: "ಸ್ಥಳ ಮತ್ತು ರೈಡ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    }
  | ADD_EMERGENCY_CONTACTS => {
      text: "ತುರ್ತು ಸಂಪರ್ಕಗಳನ್ನು ಸೇರಿಸಿ",
    }
  | CONTACTS_SELECTED(selected, limit) => {
      text: `${selected}/${limit} ಸಂಪರ್ಕಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ`,
    }
  | SEARCH_CONTACTS => {text: "ಸಂಪರ್ಕಗಳನ್ನು ಹುಡುಕಿ"}
  | CONFIRM_EMERGENCY_CONTACTS => {
      text: "ತುರ್ತು ಸಂಪರ್ಕಗಳನ್ನು ದೃಢೀಕರಿಸಿ",
    }
  | LOCATION_ACCESS_HEADER => {
      text: "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಅನುಮತಿಯನ್ನು ನೀಡಿ",
    }
  | LOCATION_ACCESS_INFO => {
      text: "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ನಮಗೆ ಅನುಮತಿ ನೀಡಿ. ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ನಾವು ನಿಮ್ಮ ಪ್ರಯಾಣದ ವೇಳೆ ಮತ್ತು ಸೇವೆಯ ಮೇಲೆ ಅನುಭವಿಸಲು ಮಾತ್ರ ಬಳಸುತ್ತೇವೆ.",
    }
  | NOTIFICATION_ACCESS_HEADER => {
      text: "ನೋಟಿಫಿಕೇಶನ್ ಅನುಮತಿಯನ್ನು ನೀಡಿ",
    }
  | NOTIFICATION_ACCESS_INFO => {
      text: "ನೋಟಿಫಿಕೇಶನ್ ಅನುಮತಿಯನ್ನು ನೀಡಿ ನಿಮ್ಮ ಪ್ರಯಾಣದ ವೇಳೆ ಮತ್ತು ಸೇವೆಯ ಮೇಲೆ ಅನುಭವಿಸಲು ಮಾತ್ರ ಬಳಸುತ್ತೇವೆ.",
    }
  | ALLOW => {
      text: "ಅನುಮತಿ ನೀಡಿ",
    }
  | DENY => {
      text: "ನಿರಾಕರಿಸಿ",
    }
  | RIDE_VERIFICATION => {text: "ರೈಡ್ ಪರಿಶೀಲನೆ"}
  | USE_PIN_TO_VERIFY_RIDE => {
      text: "ರೈಡ್ ಪರಿಶೀಲಿಸಲು ಪಿನ್ ಬಳಸಿ",
    }
  | REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES => {
      text: "ನೀವು ನಿಮ್ಮ ರೈಡ್‌ಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಚಾಲಕರೊಂದಿಗೆ ರೈಡ್ ಪ್ರಾರಂಭ ಪಿನ್ ಅನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಅಗತ್ಯವಿದೆ. ಇದು ನೀವು ಸರಿಯಾದ ಚಾಲಕನೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿದ್ದೀರಿ ಎಂಬುದನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
    }
  | DONE => {text: "ಮುಗಿಯಿತು"}
  | TRUSTED_CONTACTS => {text: "ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕಗಳು"}
  | ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT => {
      text: "✨ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಇನ್-ಆ್ಯಪ್ ಚಾಟ್ ಅನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ",
    }
  | TRUSTED_CONTACT_CAN_FOLLOW_YOUR_RIDE => {
      text: "ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕವು ನಿಮ್ಮ ರೈಡ್ ಅನ್ನು ಅನುಸರಿಸಬಹುದು, ಆ್ಯಪ್‌ನಲ್ಲಿ ಚಾಟ್ ಮಾಡಬಹುದು ಮತ್ತು ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ನಿಮಗೆ ಬೆಂಬಲ ನೀಡಬಹುದು",
    }
  | SAFETY_SETUP => {text: "ಭದ್ರತಾ ಸೆಟಪ್"}
  | COMPLETE(str) => {text: `${str} ಪೂರ್ಣ`}
  | ALL_RIDES_SHARED_AUTOMATICALLY => {
      text: "ಎಲ್ಲಾ ರೈಡ್ಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹಂಚಲ್ಪಟ್ಟಿವೆ",
    }
  | NIGHT_RIDES_SHARED_AUTOMATICALLY => {
      text: "ರಾತ್ರಿ ರೈಡ್ಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹಂಚಲ್ಪಟ್ಟಿವೆ (ಸಾಯಂಕಾಲ 6 - ಬೆಳಗ್ಗೆ 9)",
    }
  | I_WILL_SHARE_RIDES_MANUALLY => {
      text: "ನಾನು ರೈಡ್ಗಳನ್ನು ಕೈಯಾರೆ ಹಂಚಿಕೊಳ್ಳುತ್ತೇನೆ",
    }
  | SHARE_RIDE_OPTIONS => {text: "ರೈಡ್ ಹಂಚಿಕೆ ಆಯ್ಕೆಗಳು"}
  | LIVE_RIDE_TRACKING => {text: "ಲೈವ್ ರೈಡ್ ಟ್ರ್ಯಾಕಿಂಗ್"}
  | YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS => {
      text: "ನೀವು ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕಗಳಿಗಾಗಿ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್‌ನ ಸ್ವಯಂಚಾಲಿತ ಹಂಚಿಕೆಯನ್ನು ಸೆಟಪ್ ಮಾಡಬಹುದು",
    }
  | YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON => {
      text: "ನೀವು ಶೇರ್ ಬಟನ್ ಬಳಸಿ ಯಾರೊಂದಿಗೆ ಬೇಕಾದರೂ ಕೈಯಾರೆ ಹಂಚಿಕೊಳ್ಳಬಹುದು",
    }
  | ADD_CONTACTS => {text: "ಸಂಪರ್ಕವನ್ನು ಸೇರಿಸಿ"}
  | ESTIMATES_HAS_BEEN_EXPIRED => {
      text: "ಅಂದಾಜುಗಳ ಅವಧಿ ಮುಗಿದಿದೆ. ಮತ್ತೆ ಪಡೆಯಲಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ನಿರೀಕ್ಷಿಸಿ ಮತ್ತು ಮತ್ತೊಮ್ಮೆ ಪರಿಶೀಲಿಸಿ.",
    }
  | YAY_REACHED_DESTINATION_IN_JUST => {
      text: "ಯೇ! ನೀವು ಗುರಿಯತ್ತ ಸಫಲವಾಗಿ ಬಂದಿದ್ದೀರಿ ಮಾತ್ರ",
    }
  | RIDE_TIME => {text: "ರೈಡ್ ಸಮಯ"}
  }
