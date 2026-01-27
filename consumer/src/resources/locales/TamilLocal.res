let tamilLocal = (locale: LocaleStringType.localeString): LocaleStringType.textAndAccObj =>
  switch locale {
  | HEADING => {text: "பெயர்"}
  | NAME => {text: "தலைப்பு"}
  | ADD_HOME => {text: "வீடு சேர்க்கவும்"}
  | ADD_WORK => {text: "வேலை சேர்க்கவும்"}
  | ADD_OTHER => {text: "மற்றவர்களை சேர்க்கவும்"}
  | RECENT => {text: "சமீபத்திய"}
  | FAVOURITES => {text: "பிடித்தவை"}
  | WHERE_ARE_YOU_GOING => {
      text: "நீங்கள் எங்கே போகிறீர்கள்?",
    }
  | MY_RIDES => {text: "என் இரவுகள்"}
  | SAFETY => {text: "பாதுகாப்பு"}
  | Bookings => {text: "புக்கிங்ஸ்"}

  | HELP_AND_SUPPORT => {text: "உதவி மற்றும் ஆதரவு"}
  | APP_LANGUAGE => {text: "App Language"}
  | PAYMENT => {text: "கட்டணம்"}
  | REFER_AND_EARN => {
      text: "பரிந்துரை மற்றும் சம்பாதிக்க",
    }
  | ABOUT => {text: "பற்றி"}
  | LOGOUT => {text: "வெளியேறு"}
  | PROFILE_COMPLETION => {text: "சுயவிவரம் முடிவு"}
  | BACK_TO_HOME => {
      text: "மீண்டும் வீட்டிற்கு செல்லுங்கள்",
    }
  | SPORTS_NEAR_ME => {text: "என் அருகில் விளையாட்டு"}
  | SET_PIN_ON_MAP => {
      text: "வரைபடத்தில் பின் அமைக்கவும்",
    }
  | NOW => {text: "இப்போ"}
  | CONFIRM_PICKUP_LOCATION => {
      text: "பிக்கப் இடத்தை உறுதிசெய்க",
    }
  | CONFIRM_DROP_LOCATION => {
      text: "டிராப் இடத்தை உறுதிசெய்க",
    }
  | CONFIRM_LOCATION => {
      text: "இருப்பிடத்தை உறுதிப்படுத்துங்கள்",
    }
  | SPECIAL_LOCATION_GATE => {
      text: "Select a designated pickup spot by choosing from the list or dragging the map",
    }
  | BOOK_A_RIDE_NOW => {
      text: "இப்போது ஒரு இரவு புத்தகம்",
    }
  | CHOOSE_YOUR_RIDE => {
      text: "உங்கள் இரவை தேர்ந்தெடுக்கவும்",
    }
  | BRIDGE_MINI => {text: "பாலம் மினி"}
  | BRIDGE_PREMIER => {text: "பாலம் முன்னேற்றம்"}
  | BRIDGE_XL => {text: "பாலம் எக்ஸ்எல்"}
  | FINDING_RIDES_NEAR_YOU => {text: "மூலம் கட்டணம்"}
  | BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE => {
      text: "உங்களுக்கு அருகில் இரவுகளைக் கண்டறியும்",
    }
  | CANCEL_RIDE => {
      text: "பாலம் நகரத்திற்கு மக்களால் உருவாக்கப்பட்டுள்ளது!",
    }
  | CANCEL_SEARCH => {text: "இரவு ரத்து செய்ய"}
  | DONT_CANCEL => {text: "ரத்து செய்ய வேண்டாம்"}
  | PLEASE_SELECT_A_REASON_FOR_CANCELLATION => {
      text: "ரத்து செய்ய காரணத்தை தேர்ந்தெடுக்கவும்",
    }
  | REQUESTED_WRONG_VEHICLE => {
      text: "தவறான வாகனத்தை கேட்டுக்கொள்கிறீர்கள்",
    }
  | CHANGE_OF_PLANS => {text: "திட்டம் மாற்றம்"}
  | LONGER_WAIT_TIME => {
      text: "நீளமான காத்திருப்பு நேரம்",
    }
  | OTHER => {text: "மற்ற"}
  | IS_ARRIVING_IN => {text: "வருகிறது"}
  | RIDE_ACTIONS => {text: "இரவு செயல்கள்"}
  | SHARE_RIDE => {
      text: "இரவை பகிர்ந்து கொள்ளுங்கள்",
    }
  | SAFETY_TOOLS => {text: "பாதுகாப்பு கருவிகள்"}
  | RIDE_ESTIMATE => {text: "இரவு மதிப்பீடு"}
  | PAID_VIA => {text: "பயண விவரங்கள்"}
  | TRIP_DETAILS => {text: "திருத்து சேர்க்க"}
  | EDIT_ADD => {text: "இரவை ரத்து செய்ய வேண்டுமா?"}
  | ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THE_RIDE => {
      text: "கார்கள் கிடைக்கவில்லை!",
    }
  | NO_CAR_AVAILABLE => {
      text: "It appears you're in a high-demand area, and no drivers are currently available.",
    }
  | IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA => {
      text: "வீட்டிற்கு செல்லுங்கள்",
    }
  | GO_HOME => {text: "தேடலை ரத்துசெய்"}
  | CONTACT => {text: "தொடர்பு"}
  | PICKUP => {text: "பிக்கப்"}
  | DESTINATION => {text: "இலக்கு"}
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
      text: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்",
    }
  | CHECK_INTERNET => {
      text: "தயவுசெய்து உங்கள் இன்டர்நெட் இணைப்பை சரிபார்த்து மீண்டும் முயற்சி செய்யவும்",
    }
  | TRY_AGAIN => {
      text: "மீண்டும் முயற்சி செய்யவும்",
    }
  | SOMETHING_WENT_WRONG_FETCHING_THE_RIDES => {
      text: "பயணங்களை பெறும்போது சில தவறுகள் ஏற்பட்டுள்ளன.",
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
      text: "மற்றொரு இடத்தை முயற்சிக்கவும்",
    }
  | ADD_CARD => {text: "அட்டை சேர்க்க"}
  | DELETE => {text: "நீக்கு"}
  | DRIVER_MIGHT_BE_ON_HIS_WAY => {
      text: "டிரைவர் வழியில் இருக்கலாம். நீங்கள் உண்மையில் பயணத்தை ரத்து செய்ய விரும்புகிறீர்களா?",
    }
  | CHANGE_RIDE_TYPE => {text: "சவாரி வகையை மாற்றவும்"}
  | CHANGE_RIDE_TYPE_FOR_BETTER_RIDES => {
      text: "சிறந்த சவாரிகளுக்காக சவாரி வகையை மாற்றவும்",
    }
  | REFER_YOUR_FRIENDS => {
      text: "உங்கள் நண்பர்களைப் பார்க்கவும்",
    }
  | YOUR_REFERRAL_CODE => {
      text: "உங்கள் பரிந்துரை குறியீடு",
    }
  | SHARE_AND_REFER => {
      text: "பகிரவும் மற்றும் பார்க்கவும்",
    }
  | REFERRED_USERS => {
      text: "குறிப்பிடப்பட்ட பயனர்கள்",
    }
  | USERS_WHO_DOWNLOAD_THE_APP(appName) => {
      text: `${appName} ஆப்பை பதிவிறக்கம் செய்து உங்கள் பரிந்துரை குறியீட்டை பயன்படுத்தி தங்களின் முதல் பயணத்தை முடிக்கின்ற பயனாளர்கள் பரிந்துரைக்கப்பட்ட பயனாளராக شمارிக்கப்படுவர். \n \nபரிந்துரை குறியீட்டை பதிவு செய்யும் பொழுது உள்ளிடலாம்.`,
    }
  | GOT_IT => {text: "புரிந்தது"}
  | HAVE_A_REFERRAL_CODE => {
      text: "பரிந்துரை குறியீடு உள்ளதா?",
    }
  | INVALID_CODE => {text: "தவறான குறியீடு!"}
  | APPLY => {text: "செயல்படுத்தவும்"}
  | REFERRAL_CODE_APPLIED_SUCCESSFULLY => {
      text: "பரிந்துரை குறியீடு வெற்றிகரமாக பயன்படுத்தப்பட்டது!",
    }
  | WHAT_IS_THE_REFERRAL_PROGRAM => {
      text: "பரிந்துரை திட்டம் என்ன?",
    }
  | THE_REFERRAL_PROGRAM_INCENTIVISES(appName) => {
      text: `பரிந்துரை திட்டம் ஓட்டுநர்கள் அதிக பயணங்களை ஏற்க, குறைவான பயணங்களை ரத்து செய்ய, மற்றும் சீரிய ஓட்டுநர்களை அங்கீகரித்து பரிசளிக்க ஊக்குவிக்கின்றது. \n \nநீங்கள் ஓட்டுநரின் பரிந்துரை குறியீட்டை உள்ளிடுவதன் மூலம் ${appName} சமூகத்தின் பயண தரத்தை மேம்படுத்த உதவலாம்! \n\n${appName} ஓட்டுநர் அல்லது பயனாளரிடம் இருந்து பரிந்துரை குறியீட்டை பெறலாம்.`,
    }
  | ENTER_REFERRAL_CODE_BELOW => {
      text: "கீழே 6 இலக்க பரிந்துரை குறியீட்டை உள்ளிடவும்",
    }
  | DRIVER_IS_WAITING => {
      text: "ஓட்டுநர் காத்திருக்கிறார்",
    }
  | DRIVER_ARRIVED => {text: "ஓட்டுநர் வந்துவிட்டார்!"}
  | BRIDGE_TO_DESTINATION => {text: "இலக்குக்கு பாலம்"}
  | APP_DESCRIPTION(appName) => {
      text: `${appName} ரைடர்களை டிரைவர்களுடன் இணைக்க ஒரு திறந்த தளம். பயன்பாடு செய்கிறது
  சவாரி செய்பவர்கள் சவாரி செய்ய முன்பதிவு செய்ய வசதியாக உள்ளது
  மீட்டர் வீதம் எனவே குறைந்த கட்டணம்`,
    }
  | TERMS_AND_CONDITIONS => {
      text: "விதிமுறைகளும் நிபந்தனைகளும்",
    }
  | PRIVACY_POLICY => {text: "தனியுரிமைக் கொள்கை"}
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
  | BASE_FARE => {text: "அடிப்படை கட்டணம்"}
  | CONGESTION_CHARGE => {text: "கொள்ளை கட்டணங்கள்"}
  | OPTIONAL_DRIVER_REQUEST => {
      text: "தேர்வு செய்யவும் இயலுமையான வாக்குப் பிரகடனம்",
    }
  | DRIVER_ADDITIONS => {text: "வாக்குப் பிரகடனங்கள்"}
  | TOTAL_FARE => {text: "மொத்த கட்டணம்"}
  | PICKUP_CHARGES => {text: "எதிர்வரும் கட்டணங்கள்"}
  | WAITING_CHARGES(star) => {
      text: `காத்திருக்கும் கட்டணங்கள் ${star}`,
    }
  | EARLY_RIDE_END_CHARGES => {
      text: "முன்னிட்டு வண்டி முடிவு கட்டணங்கள்",
    }
  | CUSTOMER_TIP => {text: "உறுதிப்படுத்தல் களம் *"}
  | SERVICE_CHARGES => {text: "சேவை கட்டணங்கள்"}
  | RIDE_GST => {text: "இயல்பு அரசு விகிதம் (5%)"}
  | PLATFORM_FEE => {text: "தள கட்டணம்"}
  | TAXES => {text: "வரி (ஜி.எஸ்.டி)"}
  | CANCELLATION_DUES => {
      text: "ரத்து செய்தல் கட்டணங்கள்",
    }
  | TOLL_CHARGES => {text: "டோல் கட்டணங்கள்"}
  | DISTANCE_BASED_CHARGES => {
      text: "இடம் அடியாத கட்டணங்கள்",
    }
  | TIME_BASED_CHARGES => {
      text: "நேரம் அடியாத கட்டணங்கள்",
    }
  | EXTRA_TIME_CHARGES => {text: "மீதியான நேர கட்டணங்கள்"}
  | CUSTOMER_TIP_INFO => {
      text: "* பாதுகாப்பு வழங்கப்படுகிறது உயர்வு தொகை.",
    }
  | WAIT_CHARGE_INFO => {
      text: "* முதல் 3 நிமிடங்களில் காத்திருப்பது காத்திருப்பு கடன் பெறாது. அதற்குப் பின் காத்திருப்பு நிமிடத்திற்கு {Amount} வேலைகடன் செலுத்தப்படும்.",
    }
  | IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION => {
      text: "உங்கள் பரிமாற்ற வரலாற்றைப் பற்றிய கேள்விகள் இருந்தால், திருத்தங்கள் தேவையெனில் அல்லது எந்த தகவலையும் விவாதிக்க விரும்பினால், தயவுசெய்து எங்களை தொடர்பு கொள்ளவும்.",
    }
  | CALL_SUPPORT => {text: "ஆதரவு அழைக்கவும்"}
  | CALL_CUSTOMER_SUPPORT => {
      text: "வாடிக்கையாளர் ஆதரவுக்கு அழைக்கவும்",
    }
  | YOUR_LATEST_LOCATION => {
      text: "உங்கள் சமீபத்திய இருப்பிடம்",
    }
  | YOUR_VEHICLE_INFO => {text: "உங்கள் வாகன விவரங்கள்"}
  | PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION => {
      text: "ஆபரேட்டருக்கு உங்கள் இருப்பிடத்தை கொடுக்கவும் - செயலி தானாகவே இடத்தை பகிராது.",
    }
  | EMERGENCY_ASSISTANCE => {text: "அவசர உதவி"}
  | CALL(number) => {text: `அழைக்க ${number}`}
  | PRICING_BRIDGE_MINI => {text: "விலை - பிரிட்ஜ் மினி"}
  | PER_MILE_FARE => {text: "ஒரு மைல் கட்டணம்"}
  | PER_MINUTE_FARE => {text: "நிமிடத்திற்கு கட்டணம்"}
  | OTHER_CHARGES => {text: "பிற கட்டணங்கள்"}
  | PER_MILE => {text: "/மை"}
  | PER_MIN => {text: "/நிமி"}
  | DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(multiplier, from, till) => {
      text: `பகல் நேரக் கட்டணத்தின் ${multiplier}x இரவில் ${from} முதல் ${till} வரை பொருந்தும்
  `,
    }
  | DELETE_ACCOUNT => {text: "கணக்கை நீக்கு"}
  | ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT => {
      text: "நீங்கள் கணக்கை நீக்க விரும்புகிறீர்கள் என்பதை உறுதியாகச் சொல்லவா?",
    }
  | CANCEL => {text: "ரத்து செய்"}
  | SORRY_TO_HEAR_YOU_GO => {
      text: "நீங்கள் செல்கிறீர்கள் என்பதை கேட்டு வருந்துகிறேன்!",
    }
  | YOUR_PREFERENCE_HAS_BEEN_NOTED => {
      text: "உங்கள் விருப்பம் பதிவு செய்யப்பட்டுள்ளது மற்றும் விரைவில் செயல்படுத்தப்படும். விரைவில் உங்களை மீண்டும் சேவை செய்ய நாங்கள் நம்புகிறோம்.",
    }
  | OKAY => {text: "சரி"}

  | ADDRESS => {text: "முகவரி"}
  | CHOOSE_TAG => {
      text: "குறிச்சொல்லைத் தேர்ந்தெடுக்கவும்",
    }
  | CURRENT_LOCATION => {text: "தற்போதைய இடம்"}
  | SEARCH_FOR_AREA => {
      text: "பகுதி, தெருவின் பெயரைத் தேடு...",
    }
  | OTHER_FAVOURITES => {text: "பிற பிடித்தவை"}
  | DELETE_FAVOURITE => {text: "பிடித்ததை நீக்கு"}
  | TYPE_NAME_FOR_LOCATION => {
      text: "இருப்பிடத்திற்கான பெயரை টাইப் செய்யவும்",
    }
  | ADD_FAVOURITE => {text: "பிடித்ததைச் சேர்"}
  | EDIT_FAVOURITE => {text: "பிடித்ததைத் திருத்து"}
  | NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE => {
      text: "காட்ட எதுவும் இல்லை. தொடர ஒன்றைச் சேர்க்கவும்...",
    }
  | HOME => {text: "வீடு"}
  | WORK => {text: "வேலை"}
  | ADD_ADDRESS => {text: "முகவரியைச் சேர்க்கவும்"}
  | INVOICE => {text: "விலைப்பட்டியல்"}
  | RIDE_DETAILS => {text: "பயண விவரங்கள்"}
  | YOUR_RECENT_RIDE => {text: "உங்கள் சமீபத்திய பயணம்"}
  | ALL_TOPICS => {text: "அனைத்து தலைப்புகளும்"}
  | REPORT_AN_ISSUE_WITH_THIS_RIDE => {
      text: "இந்த பயணத்தில் ஒரு சிக்கலைப் புகாரளிக்கவும்",
    }
  | VIEW_ALL_RIDES => {
      text: "அனைத்து பயணங்களையும் காண்க",
    }
  | DESCRIBE_YOUR_ISSUE(appName) => {
      text: `உங்கள் பிரச்சினையை விவரிக்கவும். ${appName} அதை 24 மணி நேரத்தில் தீர்க்க முயலும்.`,
    }
  | ENTER_YOUR_TEXT_HERE => {
      text: "உங்கள் உரையை இங்கே உள்ளிடவும்",
    }
  | ALL_RIDES => {text: "அனைத்து சவாரிகள்"}
  | NO_RIDE_HISTORY_AVAILABLE => {text: "சவாரி வரலாறு இல்லை"}
  | YOU_HAVE_NOT_TAKEN_A_RIDE_YET => {
      text: "நீங்கள் இன்னும் ஒரு சவாரி எடுக்கவில்லை",
    }
  | SEARCH => {text: "தேடு"}
  | MESSAGE => {text: "செய்தி"}
  | SUBMIT_ISSUE_DETAILS => {
      text: "பிரச்சினை விவரங்களை சமர்ப்பிக்கவும்",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_LOGOUT => {
      text: "நீங்கள் வெளியேற விரும்புகிறீர்களா?",
    }
  | RIDE_SHARE_INFO => {text: "பயணம் பகிர்வு தகவல்"}
  | ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS => {
      text: "அவசர தொடர்புகளுடன் இருப்பிடம் மற்றும் பயண விவரங்களை பகிர தொடர்புகளை சேர்க்கவும்",
    }
  | ADD_A_CONTACT => {
      text: "\uFF0B ஒரு தொடர்பு சேர்க்கவும்",
    }
  | SHARE_RIDE_INFO => {text: "பயண தகவலை பகிரவும்"}
  | SHARE_LOCATION_AND_RIDE_DETAILS => {
      text: "இருப்பிடம் மற்றும் பயண விவரங்களை பகிரவும்",
    }
  | ADD_EMERGENCY_CONTACTS => {
      text: "அவசர தொடர்புகளைச் சேர்க்கவும்",
    }
  | CONTACTS_SELECTED(selected, limit) => {
      text: `${selected}/${limit} தொடர்புகள் தேர்ந்தெடுக்கப்பட்டன`,
    }
  | SEARCH_CONTACTS => {text: "தொடர்புகளைத் தேடுங்கள்"}
  | CONFIRM_EMERGENCY_CONTACTS => {
      text: "அவசர தொடர்புகளை உறுதிப்படுத்தவும்",
    }
  | LOCATION_ACCESS_HEADER => {
      text: "உங்கள் இருப்பிடத்தை காண மற்றும் பகிர அனுமதிக்க",
    }
  | LOCATION_ACCESS_INFO => {
      text: "உங்கள் இருப்பிடத்தை காண மற்றும் பகிர அனுமதிக்க",
    }
  | NOTIFICATION_ACCESS_HEADER => {
      text: "அறிவிப்புகளை பெற அனுமதிக்க",
    }
  | NOTIFICATION_ACCESS_INFO => {
      text: "அறிவிப்புகளை பெற அனுமதிக்க",
    }
  | ALLOW => {
      text: "அனுமதிக்க",
    }
  | DENY => {
      text: "நிராகரிக்க",
    }
  | RIDE_VERIFICATION => {text: "சவாரி சரிபார்த்தல்"}
  | USE_PIN_TO_VERIFY_RIDE => {
      text: "சவாரியை சரிபார்க்க PIN ஐ பயன்படுத்தவும்",
    }
  | REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES => {
      text: "உங்கள் சவாரிகளை தொடங்க, உங்கள் டிரைவருடன் ஒரு சவாரி தொடக்க PIN ஐ பகிர்ந்துகொள்ள வேண்டியிருக்கும். இது நீங்கள் சரியான டிரைவருடன் இணைக்கப்பட்டுள்ளீர்கள் என்பதை உறுதிசெய்கிறது.",
    }
  | DONE => {text: "முடிந்தது"}
  | TRUSTED_CONTACTS => {text: "நம்பகமான தொடர்புகள்"}
  | ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT => {
      text: "✨ நேரடி கண்காணிப்பு மற்றும் செயலியில் உரையாடலை செயல்படுத்துங்கள்",
    }
  | TRUSTED_CONTACT_CAN_FOLLOW_YOUR_RIDE => {
      text: "நம்பகமான தொடர்புகள் உங்கள் சவாரியைப் பின்தொடரலாம், செயலியில் உரையாடலாம், அவசர நிலைகளில் உங்களை ஆதரிக்கலாம்",
    }
  | SAFETY_SETUP => {text: "பாதுகாப்பு அமைப்பு"}
  | COMPLETE(str) => {text: `${str} முடிந்தது`}
  | ALL_RIDES_SHARED_AUTOMATICALLY => {
      text: "அனைத்து சவாரிகளும் தானாகவே பகிரப்பட்டது",
    }
  | NIGHT_RIDES_SHARED_AUTOMATICALLY => {
      text: "இரவு சவாரிகள் தானாகவே பகிரப்பட்டது (6PM - 9AM)",
    }
  | I_WILL_SHARE_RIDES_MANUALLY => {
      text: "நான் சவாரிகளை கைமுறையாகப் பகிர்வேன்",
    }
  | SHARE_RIDE_OPTIONS => {
      text: "சவாரி பகிரும் விருப்பங்கள்",
    }
  | LIVE_RIDE_TRACKING => {
      text: "நேரடி சவாரி கண்காணிப்பு",
    }
  | YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS => {
      text: "நீங்கள் உங்கள் நம்பகமான தொடர்புகளுக்கு நேரடி கண்காணிப்பு தானாக பகிரும் வகையில் அமைக்கலாம்",
    }
  | YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON => {
      text: "பகிர் பொத்தானைப் பயன்படுத்தி நீங்கள் யாருடனும் கைமுறையாகப் பகிரலாம்",
    }
  | ADD_CONTACTS => {text: "தொடர்புகளைச் சேர்"}
  | ESTIMATES_HAS_BEEN_EXPIRED => {
      text: "மதிப்பீடுகள் காலாவதியாகிவிட்டன. மீண்டும் பெறுகிறது, சிறிது நேரம் காத்திருந்து மீண்டும் சரிபார்க்கவும்.",
    }
  | YAY_REACHED_DESTINATION_IN_JUST => {
      text: "யே! உங்கள் இலக்குக்கு வந்துவிட்டீர்கள் மட்டுமே",
    }
  | RIDE_TIME => {text: "சவாரி நேரம்"}
  }
