let malayalamLocal = (locale: LocaleStringType.localeString): LocaleStringType.textAndAccObj =>
  switch locale {
  | HEADING => {text: "തലക്കെട്ട്"}
  | NAME => {text: "പേര്"}
  | ADD_HOME => {text: "വീട് ചേർക്കുക"}
  | ADD_WORK => {text: "ജോലി ചേർക്കുക"}
  | ADD_OTHER => {text: "മറ്റുള്ളവരെ ചേർക്കുക"}
  | RECENT => {text: "അടുത്തിടെ"}
  | FAVOURITES => {text: "ഇഷ്ടപ്പെട്ടവ"}
  | WHERE_ARE_YOU_GOING => {
      text: "നിങ്ങൾ എവിടെയാണ് പോകുന്നത്?",
    }
  | MY_RIDES => {text: "എന്റെ സവാരികൾ"}
  | Bookings => {text: "ബുക്കിംഗ്‌സ്"}
  | SAFETY => {text: "സുരക്ഷ"}
  | HELP_AND_SUPPORT => {text: "സഹായം കൂടുതൽ"}
  | APP_LANGUAGE => {text: "App Language"}
  | PAYMENT => {text: "പേയ്മെന്റ്"}
  | REFER_AND_EARN => {text: "റഫർ ആൻഡ് ഇർണ്"}
  | ABOUT => {text: "കുറിപ്പ്"}
  | LOGOUT => {text: "ലോഗൗട്ട്"}
  | PROFILE_COMPLETION => {text: "പ്രൊഫൈൽ പൂർണ്ണത"}
  | BACK_TO_HOME => {text: "വീട്ടിലേക്ക് മടങ്ങുക"}
  | SPORTS_NEAR_ME => {text: "എന്റെ അടുത്ത് കായിക"}
  | SET_PIN_ON_MAP => {text: "മാപ്പിൽ പിൻ സജ്ജമാക്കു"}
  | NOW => {text: "ഇപ്പോൾ"}
  | CONFIRM_PICKUP_LOCATION => {
      text: "പിക്കപ്പ് സ്ഥലം സ്ഥിരീകരിക്കുക",
    }
  | CONFIRM_DROP_LOCATION => {
      text: "ഡ്രോപ്പ് ലൊക്കേഷൻ സ്ഥിരീകരിക്കു",
    }
  | SPECIAL_LOCATION_GATE => {
      text: "Select a designated pickup spot by choosing from the list or dragging the map",
    }
  | CONFIRM_LOCATION => {
      text: "സ്ഥാനം സ്ഥിരീകരിക്കുക",
    }
  | BOOK_A_RIDE_NOW => {
      text: "ഇപ്പോൾ സവാരി ബുക്ക് ചെയ്യുക",
    }
  | CHOOSE_YOUR_RIDE => {
      text: "നിങ്ങളുടെ സവാരി തിരഞ്ഞെടുക്കുക",
    }
  | BRIDGE_MINI => {text: "ബ്രിഡ്ജ് മിനി"}
  | BRIDGE_PREMIER => {text: "ബ്രിഡ്ജ് പ്രിമിയർ"}
  | BRIDGE_XL => {text: "ബ്രിഡ്ജ് എക്സെൽ"}
  | FINDING_RIDES_NEAR_YOU => {text: "മൂലം പേയ്മെന്റ്"}
  | BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE => {
      text: "നിങ്ങളുടെ അടുത്ത് സവാരികൾ കണ്ടെത്തുന്നു",
    }
  | CANCEL_RIDE => {
      text: "പുരനഗരത്തിനായി പെരുമാറ്റിയിരിക്കുന്നു!",
    }
  | CANCEL_SEARCH => {text: "സവാരി റൈഡ് റദ്ദ് ചെയ്യുക"}
  | DONT_CANCEL => {text: "റദ്ദ് ചെയ്യരുത്"}
  | PLEASE_SELECT_A_REASON_FOR_CANCELLATION => {
      text: "റദ്ദ് ചെയ്യാൻ ഒരു കാരണം തിരഞ്ഞെടുക്കുക",
    }
  | REQUESTED_WRONG_VEHICLE => {
      text: "തെറ്റായ വാഹനം അഭ്യർഥിച്ചു",
    }
  | CHANGE_OF_PLANS => {text: "പ്ലാൻ മാറ്റം"}
  | LONGER_WAIT_TIME => {
      text: "നിരാശാകര കാത്തിരിക്കേണ്ട സമയം",
    }
  | OTHER => {text: "മറ്റ്"}
  | IS_ARRIVING_IN => {text: "വരുന്നു"}
  | RIDE_ACTIONS => {text: "സവാരി പ്രവർത്തനങ്ങൾ"}
  | SHARE_RIDE => {text: "റൈഡ് ഷെയർ ചെയ്യുക"}
  | SAFETY_TOOLS => {text: "സുരക്ഷ ഉപകരണങ്ങൾ"}
  | RIDE_ESTIMATE => {text: "റൈഡ് എസ്റ്റിമേറ്റ്"}
  | PAID_VIA => {text: "ട്രിപ്പ് വിവരങ്ങൾ"}
  | TRIP_DETAILS => {text: "എഡിറ്റ് ചേർക്കുക"}
  | EDIT_ADD => {text: "നിങ്ങൾ റൈഡ് റദ്ദ് ചെയ്യണോ?"}
  | ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THE_RIDE => {
      text: "യാതൊരു കാറുകളും ലഭ്യമല്ല!",
    }
  | NO_CAR_AVAILABLE => {
      text: "നിങ്ങൾ ഉയർന്ന ആവശ്യകതയുള്ള പ്രദേശത്ത് ആണെന്ന് തോന്നുന്നു, നിലവിൽ ഡ്രൈവർമാർ ലഭ്യമല്ല.",
    }
  | IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA => {
      text: "ഹോം പോകൂ",
    }
  | GO_HOME => {text: "തിരയൽ റദ്ദാക്കുക"}
  | CONTACT => {text: "ബന്ധപ്പെടുക"}
  | PICKUP => {text: "പിക്കപ്പ്"}
  | DESTINATION => {text: "ലക്ഷ്യസ്ഥാനം"}
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
  | OFFLINE => {text: "നിങ്ങൾ ഓഫ്‌ലൈൻ ആണ്"}
  | CHECK_INTERNET => {
      text: "ദയവായി നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക",
    }
  | TRY_AGAIN => {text: "വീണ്ടും ശ്രമിക്കുക"}
  | SOMETHING_WENT_WRONG_FETCHING_THE_RIDES => {
      text: "യാത്രകൾ കണ്ടെത്തുന്നതിൽ ചില പ്രശ്നങ്ങൾ നേരിട്ടു.",
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
      text: "മറ്റൊരു സ്ഥലം പരീക്ഷിക്കൂ",
    }
  | ADD_CARD => {text: "Add Card"}
  | DELETE => {text: "Delete"}
  | DRIVER_MIGHT_BE_ON_HIS_WAY => {
      text: "ಡ್ರೈವರ್ ದಾರಿಯಲ್ಲಿರಬಹುದು. ನೀವು ನಿಜವಾಗಿಯೂ ರೈಡ್ ಅನ್ನು ರದ್ದುಗೊಳಿಸಲು ಬಯಸುವಿರಾ?",
    }
  | CHANGE_RIDE_TYPE => {text: "റൈഡ് തരം മാറ്റുക"}
  | CHANGE_RIDE_TYPE_FOR_BETTER_RIDES => {
      text: "മികച്ച യാത്രകൾക്കായി റൈഡ് തരം മാറ്റുക",
    }
  | REFER_YOUR_FRIENDS => {
      text: "നിങ്ങളുടെ സുഹൃത്തുക്കളെ റഫർ ചെയ്യുക",
    }
  | YOUR_REFERRAL_CODE => {text: "നിങ്ങളുടെ റഫറൽ കോഡ്"}
  | SHARE_AND_REFER => {text: "ഷെയർ ചെയ്ത് റഫർ ചെയ്യുക"}
  | REFERRED_USERS => {text: "പരാമർശിച്ച ഉപയോക്താക്കൾ"}
  | USERS_WHO_DOWNLOAD_THE_APP(appName) => {
      text: `${appName} ആപ്പ് ഡൗൺലോഡ് ചെയ്ത് നിങ്ങളുടെ റഫറൽ കോഡ് ഉപയോഗിച്ച് അവരുടെ ആദ്യ യാത്ര പൂർത്തിയാക്കുന്ന ഉപയോക്താക്കളെ ഒരു റഫർ ചെയ്ത ഉപയോക്താവായി പരിഗണിക്കും. \n \nസൈൻ അപ്പ് ചെയ്യുമ്പോൾ റഫറൽ കോഡ് നൽകാം.`,
    }
  | GOT_IT => {text: "മനസ്സിലായി"}
  | HAVE_A_REFERRAL_CODE => {text: "റഫറൽ കോഡ് ഉണ്ടോ?"}
  | INVALID_CODE => {text: "അസാധുവായ കോഡ്!"}
  | APPLY => {text: "പ്രയോഗിക്കുക"}
  | REFERRAL_CODE_APPLIED_SUCCESSFULLY => {
      text: "റഫറൽ കോഡ് വിജയകരമായി പ്രയോഗിച്ചു!",
    }
  | WHAT_IS_THE_REFERRAL_PROGRAM => {
      text: "റഫറൽ പ്രോഗ്രാം എന്താണ്?",
    }
  | THE_REFERRAL_PROGRAM_INCENTIVISES(appName) => {
      text: `റഫറൽ പ്രോഗ്രാം ഡ്രൈവർമാരെ കൂടുതൽ യാത്രകൾ സ്വീകരിക്കാൻ, കുറവ് റദ്ദാക്കാൻ, മികച്ച രീതിയിൽ നിങ്ങൾക്ക് സേവനം നൽകാൻ പ്രോത്സാഹിപ്പിക്കുന്നു. \n \nഡ്രൈവർന്റെ റഫറൽ കോഡ് നൽകി ${appName} കമ്മ്യൂണിറ്റിയുടെ യാത്രയുടെ നിലവാരം മെച്ചപ്പെടുത്തുന്നതിലൂടെ നിങ്ങൾ സഹായിക്കാം! \n\nനിങ്ങൾക്ക് ഒരു ${appName} ഡ്രൈവർ അല്ലെങ്കിൽ ഉപയോക്താവിൽ നിന്ന് റഫറൽ കോഡ് നേടാം.`,
    }
  | ENTER_REFERRAL_CODE_BELOW => {
      text: "താഴെ 6 അക്ക റഫറൽ കോഡ് നൽകുക",
    }
  | DRIVER_IS_WAITING => {
      text: "ഡ്രൈവർ കാത്തിരിക്കുന്നു",
    }
  | DRIVER_ARRIVED => {text: "ഡ്രൈവർ എത്തി!"}
  | BRIDGE_TO_DESTINATION => {
      text: "ലക്ഷ്യസ്ഥാനത്തേക്കുള്ള പാലം",
    }
  | APP_DESCRIPTION(appName) => {
      text: `${appName} റൈഡർമാരെ ഡ്രൈവർമാരുമായി ബന്ധിപ്പിക്കുന്നതിനുള്ള ഒരു തുറന്ന പ്ലാറ്റ്ഫോമാണ്. ആപ്പ് ഉണ്ടാക്കുന്നു
റൈഡർമാർക്ക് റൈഡ് ബുക്ക് ചെയ്യാൻ സൗകര്യപ്രദമാണ്
മീറ്റർ നിരക്ക് അതിനാൽ കുറഞ്ഞ നിരക്ക്`,
    }
  | TERMS_AND_CONDITIONS => {
      text: "നിബന്ധനകളും വ്യവസ്ഥകളും",
    }
  | PRIVACY_POLICY => {text: "സ്വകാര്യതാ നയം"}
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
  | BASE_FARE => {text: "ബേസ് ഫെയർ"}
  | CONGESTION_CHARGE => {text: "കാത്തിരിക്കൽ ചാർജുകൾ"}
  | OPTIONAL_DRIVER_REQUEST => {
      text: "ഓപ്ഷണൽ ഡ്രൈവർ അഭ്യർത്ഥന",
    }
  | DRIVER_ADDITIONS => {text: "ഡ്രൈവർ ചേർക്കൽ"}
  | TOTAL_FARE => {text: "ആകെ ഫെയർ"}
  | PICKUP_CHARGES => {text: "പിക്കപ്പ് ചാർജുകൾ"}
  | WAITING_CHARGES(star) => {
      text: `കാത്തിരിക്കൽ ചാർജുകൾ ${star}`,
    }
  | EARLY_RIDE_END_CHARGES => {
      text: "ശീഘ്രമായി റൈഡ് അവസാനിപ്പിക്കൽ ശിക്ഷ",
    }
  | CUSTOMER_TIP => {text: "ഗ്രാഹക റിപ്പോർട്ട് *"}
  | SERVICE_CHARGES => {text: "സർവീസ് ചാർജുകൾ"}
  | RIDE_GST => {text: "റൈഡ് ജിഎസ്ടി (5%)"}
  | PLATFORM_FEE => {text: "പ്ലാറ്റ്ഫോം ഫീ"}
  | TAXES => {text: "നികുതികൾ (ജിഎസ്ടി)"}
  | CANCELLATION_DUES => {text: "റദ്ദാക്കൽ ചാർജുകൾ"}
  | TOLL_CHARGES => {text: "ടോൾ ചാർജുകൾ"}
  | DISTANCE_BASED_CHARGES => {
      text: "ദൂരം അടിയന്തിര ചാർജുകൾ",
    }
  | TIME_BASED_CHARGES => {text: "സമയ അടിയന്തിര ചാർജുകൾ"}
  | EXTRA_TIME_CHARGES => {text: "അതിരുകൾ സമയ ചാർജുകൾ"}
  | CUSTOMER_TIP_INFO => {
      text: "* കസ്റ്റമർ സർവീസ് നൽകുന്ന സേവനത്തിന് കൂടുതൽ തിരഞ്ഞെടുത്ത തുക ചേർക്കപ്പെടുന്നു.",
    }
  | WAIT_CHARGE_INFO => {
      text: "* താഴെ പ്രതി മിനിറ്റ് 3 മിനിറ്റിൽ കാത്തിരിക്കുന്ന വിശ്രമിക്കല്‍ ശുല്കം പ്രത്യേകം ആണ്. അതിനുശേഷം നിമിഷം വിശ്രമണ നിരീക്ഷണാ ശുല്കം {Amount} ലെ പ്രതിനിമിഷത്തിലുള്ള നാണയം പട്ടികയുടെ ശുല്കം പരിശോധിച്ചു.",
    }
  | IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION => {
      text: "നിങ്ങളുടെ ഇടപാട് ചരിത്രത്തെക്കുറിച്ച് നിങ്ങൾക്ക് സംശയങ്ങൾ ഉണ്ടെങ്കിൽ, തിരുത്തലുകൾ ആവശ്യമെങ്കിൽ അല്ലെങ്കിൽ ഏതെങ്കിലും വിവരങ്ങളെ ചൊല്ലി തർക്കിക്കാനാണെങ്കിൽ, ദയവായി ഞങ്ങളെ ബന്ധപ്പെടുക.",
    }
  | CALL_SUPPORT => {text: "സഹായത്തിനായി വിളിക്കുക"}
  | CALL_CUSTOMER_SUPPORT => {
      text: "വിലാപ ശുശ്രൂഷക്ക് വിളിക്കുക",
    }
  | YOUR_LATEST_LOCATION => {text: "നിങ്ങളുടെ പുതിയ സ്ഥാനം"}
  | YOUR_VEHICLE_INFO => {
      text: "നിങ്ങളുടെ വാഹനം വിവരങ്ങൾ",
    }
  | PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION => {
      text: "ദയവായി ഓപ്പറേറ്റർക്ക് നിങ്ങളുടെ സ്ഥാനം നൽകരുത് - ആപ്പ് സ്വയംസ്ഥിതി പങ്കിടുന്നില്ല.",
    }
  | EMERGENCY_ASSISTANCE => {text: "ആവശ്യമുള്ള സഹായം"}
  | CALL(number) => {text: `വിളിക്കുക ${number}`}
  | PRICING_BRIDGE_MINI => {
      text: "വിലനിർണ്ണയം - ബ്രിഡ്ജ് മിനി",
    }
  | PER_MILE_FARE => {text: "ഒരു മൈൽ നിരക്ക്"}
  | PER_MINUTE_FARE => {
      text: "ഒരു മിനിറ്റിനുള്ള നിരക്ക്",
    }
  | OTHER_CHARGES => {text: "മറ്റ് ചാർജുകൾ"}
  | PER_MILE => {text: "/മൈൽ"}
  | PER_MIN => {text: "/മിനിറ്റ്"}
  | DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(multiplier, from, till) => {
      text: `പകൽ സമയ നിരക്കുകളുടെ ${multiplier}x രാത്രിയിൽ ${from} മുതൽ ${till} വരെ ബാധകമാണ്`,
    }
  | DELETE_ACCOUNT => {text: "അക്കൗണ്ട് ഇല്ലാതാക്കുക"}
  | ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT => {
      text: "നിങ്ങൾക്ക് അക്കൗണ്ട് ഇല്ലാതാക്കാൻ ഉറപ്പാണോ?",
    }
  | CANCEL => {text: "റദ്ദാക്കുക"}
  | SORRY_TO_HEAR_YOU_GO => {
      text: "നിങ്ങളുടെ പോക്ക് കേട്ട് ഖേദിക്കുന്നു!",
    }
  | YOUR_PREFERENCE_HAS_BEEN_NOTED => {
      text: "നിങ്ങളുടെ മുൻഗണന ശ്രദ്ധയിൽപ്പെടുത്തിയിട്ടുണ്ട്, ഉടൻ തന്നെ നടപടിയെടുക്കും. നിങ്ങളെ വീണ്ടും സേവിക്കാൻ നമുക്ക് ഉടൻ തന്നെ പ്രതീക്ഷിക്കുന്നു.",
    }
  | OKAY => {text: "ശരി"}
  | ADDRESS => {text: "വിലാസം"}
  | CHOOSE_TAG => {text: "ടാഗ് തിരഞ്ഞെടുക്കുക"}
  | CURRENT_LOCATION => {text: "ഇപ്പോഴുള്ള സ്ഥലം"}
  | SEARCH_FOR_AREA => {
      text: "പ്രദേശം, തെരുവിൻ്റെ പേര് എന്നിവ തിരയുക...",
    }
  | OTHER_FAVOURITES => {text: "പുതിയ ഇഷ്ടങ്ങൾ"}
  | DELETE_FAVOURITE => {text: "ഇഷ്ടം നീക്കം ചെയ്യുക"}
  | TYPE_NAME_FOR_LOCATION => {
      text: "സ്ഥലത്തിനായി പേര് ടൈപ്പ് ചെയ്യുക",
    }
  | ADD_FAVOURITE => {text: "ഇഷ്ടം ചേർക്കുക"}
  | EDIT_FAVOURITE => {text: "ഇഷ്ടം തിരുത്തുക"}
  | NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE => {
      text: "കാണിക്കാൻ ഇഷ്ടങ്ങൾ ഇല്ല. തുടരുമെങ്കിൽ ഒന്നുകൂടി ചേർക്കൂ...",
    }
  | HOME => {text: "വീട്"}
  | WORK => {text: "ജോലി"}
  | ADD_ADDRESS => {text: "വിലാസം ചേർക്കുക"}
  | INVOICE => {text: "ഇൻവോയ്സ്"}
  | RIDE_DETAILS => {text: "യാത്രയുടെ വിശദാംശങ്ങൾ"}
  | YOUR_RECENT_RIDE => {
      text: "നിങ്ങളുടെ അടുത്തിടെയുളള യാത്ര",
    }
  | ALL_TOPICS => {text: "എല്ലാ വിഷയങ്ങളും"}
  | REPORT_AN_ISSUE_WITH_THIS_RIDE => {
      text: "ഈ യാത്രയിൽ ഒരു പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക",
    }
  | VIEW_ALL_RIDES => {text: "എല്ലാ യാത്രകളും കാണുക"}
  | DESCRIBE_YOUR_ISSUE(appName) => {
      text: `നിങ്ങളുടെ പ്രശ്നം വിശദീകരിക്കുക. ${appName} അത് 24 മണിക്കൂറിനുള്ളിൽ പരിഹരിക്കാൻ ശ്രമിക്കും.`,
    }
  | ENTER_YOUR_TEXT_HERE => {
      text: "ഇവിടെ നിങ്ങളുടെ വാചകം നൽകുക",
    }
  | ALL_RIDES => {text: "എല്ലാ യാത്രകളും"}
  | NO_RIDE_HISTORY_AVAILABLE => {
      text: "യാത്രാ ചരിത്രം ലഭ്യമല്ല",
    }
  | YOU_HAVE_NOT_TAKEN_A_RIDE_YET => {
      text: "നിങ്ങൾ ഇതുവരെ ഒരു യാത്രയും ചെയ്തിട്ടില്ല",
    }
  | SEARCH => {text: "തിരയുക"}
  | MESSAGE => {text: "സന്ദേശം"}
  | SUBMIT_ISSUE_DETAILS => {
      text: "പ്രശ്നത്തിന്റെ വിശദാംശങ്ങൾ സമർപ്പിക്കുക",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_LOGOUT => {
      text: "ലോഗ്ഔട്ട് ചെയ്യാൻ നിങ്ങൾക്കുറപ്പാണോ?",
    }
  | RIDE_SHARE_INFO => {text: "റൈഡ് ഷെയർ വിവരങ്ങൾ"}
  | ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS => {
      text: "സ്ഥാനം കൂടാതെ യാത്രാ വിവരങ്ങൾ അടിയന്തര ബന്ധങ്ങൾക്കൊപ്പം പങ്കിടാൻ കോൺടാക്ടുകൾ ചേർക്കുക",
    }
  | ADD_A_CONTACT => {
      text: "\uFF0B ഒരു കോൺടാക്റ്റ് ചേർക്കുക",
    }
  | SHARE_RIDE_INFO => {text: "റൈഡ് വിവരങ്ങൾ പങ്കിടുക"}
  | SHARE_LOCATION_AND_RIDE_DETAILS => {
      text: "സ്ഥലം കൂടാതെ യാത്രാ വിവരങ്ങൾ പങ്കിടുക",
    }
  | ADD_EMERGENCY_CONTACTS => {
      text: "അടിയന്തര കോൺടാക്ടുകൾ ചേർക്കുക",
    }
  | CONTACTS_SELECTED(selected, limit) => {
      text: `${selected}/${limit} കോൺടാക്ടുകൾ തിരഞ്ഞെടുക്കുക`,
    }
  | SEARCH_CONTACTS => {text: "കോൺടാക്ടുകൾ തിരയുക"}
  | CONFIRM_EMERGENCY_CONTACTS => {
      text: "അടിയന്തര കോൺടാക്ടുകൾ സ്ഥിരീകരിക്കുക",
    }
  | LOCATION_ACCESS_HEADER => {
      text: "സ്ഥലം ആക്സസ് അനുവദിക്കുക",
    }
  | LOCATION_ACCESS_INFO => {
      text: "നിങ്ങളുടെ സ്ഥലം കാണാൻ നമുക്ക് അനുവദിക്കുക",
    }
  | NOTIFICATION_ACCESS_HEADER => {
      text: "അറിയിപ്പ് ആക്സസ് അനുവദിക്കുക",
    }
  | NOTIFICATION_ACCESS_INFO => {
      text: "നിങ്ങളുടെ അറിയിപ്പ് കാണാൻ നമുക്ക് അനുവദിക്കുക",
    }
  | ALLOW => {
      text: "അനുവദിക്കുക",
    }
  | DENY => {
      text: "നിരസിക്കുക",
    }
  | RIDE_VERIFICATION => {text: "റൈഡ് സ്ഥിരീകരണം"}
  | USE_PIN_TO_VERIFY_RIDE => {
      text: "റൈഡ് സ്ഥിരീകരിക്കാൻ പിൻ ഉപയോഗിക്കുക",
    }
  | REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES => {
      text: "റൈഡുകൾ ആരംഭിക്കാൻ ഡ്രൈവറുമായി ഒരു റൈഡ് സ്റ്റാർട്ട് പിൻ പങ്കിടേണ്ടതുണ്ട്. നിങ്ങൾ ശരിയായ ഡ്രൈവറുമായി ബന്ധപ്പെടുന്നത് ഉറപ്പാക്കുന്നു.",
    }
  | DONE => {text: "പൂർത്തിയായി"}
  | TRUSTED_CONTACTS => {
      text: "വിശ്വസനീയമായ കോൺടാക്ടുകൾ",
    }
  | ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT => {
      text: "✨ ലൈവ് ട്രാക്കിംഗ്, ഇൻ-ആപ്പ് ചാറ്റ് പ്രാപ്തമാക്കുന്നു",
    }
  | TRUSTED_CONTACT_CAN_FOLLOW_YOUR_RIDE => {
      text: "വിശ്വസനീയമായ കോൺടാക്ടുകൾ നിങ്ങളുടെ റൈഡ് പിന്തുടരാനും, ആപ്പിൽ ചാറ്റ് ചെയ്യാനും, അടിയന്തരാവസ്ഥകളിൽ നിങ്ങളെ പിന്തുണയ്ക്കാനും കഴിയും",
    }
  | SAFETY_SETUP => {text: "സുരക്ഷാ ക്രമീകരണം"}
  | COMPLETE(str) => {text: `${str} പൂർത്തിയായി`}
  | ALL_RIDES_SHARED_AUTOMATICALLY => {
      text: "എല്ലാ റൈഡുകളും സ്വയമേവ പങ്കിട്ടു",
    }
  | NIGHT_RIDES_SHARED_AUTOMATICALLY => {
      text: "രാത്രി റൈഡുകൾ സ്വയമേവ പങ്കിട്ടു (6PM - 9AM)",
    }
  | I_WILL_SHARE_RIDES_MANUALLY => {
      text: "ഞാൻ റൈഡുകൾ കൈമാറ്റം ചെയ്യും",
    }
  | SHARE_RIDE_OPTIONS => {text: "റൈഡ് ഓപ്ഷനുകൾ പങ്കിടുക"}
  | LIVE_RIDE_TRACKING => {text: "ലൈവ് റൈഡ് ട്രാക്കിംഗ്"}
  | YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS => {
      text: "നിങ്ങളുടെ വിശ്വസനീയമായ കോൺടാക്ടുകൾക്കായി ലൈവ് ട്രാക്കിംഗ് സ്വയമേവ പങ്കിടാൻ ക്രമീകരിക്കാം",
    }
  | YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON => {
      text: "ഷെയർ ബട്ടൺ ഉപയോഗിച്ച് നിങ്ങൾക്ക് ആരുമായി വേണമെങ്കിലും കൈമാറ്റം ചെയ്യാം",
    }
  | ADD_CONTACTS => {text: "കോൺടാക്ടുകൾ ചേർക്കുക"}
  | ESTIMATES_HAS_BEEN_EXPIRED => {
      text: "എസ്റ്റിമേറ്റ് കാലഹരണപ്പെട്ടു. വീണ്ടും ലഭ്യമാക്കുന്നു, ഒരു നിമിഷം കാത്തിരുന്ന് വീണ്ടും പരിശോധിക്കുക.",
    }
  | YAY_REACHED_DESTINATION_IN_JUST => {
      text: "യേ! നിങ്ങൾ ലക്ഷ്യസ്ഥാനത്തേക്ക് എത്തിയിരിക്കുന്നു മാത്രം",
    }
  | RIDE_TIME => {text: "റൈഡ് സമയം"}
  }
