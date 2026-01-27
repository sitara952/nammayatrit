let bengaliLocal = (locale: LocaleStringType.localeString): LocaleStringType.textAndAccObj =>
  switch locale {
  | HEADING => {text: "শিরোনাম"}
  | NAME => {text: "নাম"}
  | ADD_HOME => {text: "বাড়ি যোগ করুন"}
  | ADD_WORK => {text: "কাজ যোগ করুন"}
  | ADD_OTHER => {text: "অন্যান্য যোগ করুন"}
  | RECENT => {text: "সাম্প্রতিক"}
  | FAVOURITES => {text: "প্রিয়"}
  | WHERE_ARE_YOU_GOING => {text: "আপনি কোথায় যাচ্ছেন?"}
  | MY_RIDES => {text: "আমার রাইড"}
  | Bookings => {text: "বুকিংস"}
  | SAFETY => {text: "নিরাপত্তা"}
  | HELP_AND_SUPPORT => {text: "সাহায্য এবং সমর্থন"}
  | APP_LANGUAGE => {text: "App Language"}
  | PAYMENT => {text: "পেমেন্ট"}
  | REFER_AND_EARN => {text: "রেফার এবং আয়"}
  | ABOUT => {text: "সম্পর্কে"}
  | LOGOUT => {text: "প্রস্থান"}
  | PROFILE_COMPLETION => {text: "প্রোফাইল সমাপ্তি"}
  | BACK_TO_HOME => {text: "বাড়িতে ফিরে যান"}
  | SPORTS_NEAR_ME => {text: "আমার কাছে খেলা"}
  | SET_PIN_ON_MAP => {text: "ম্যাপে পিন সেট করুন"}
  | NOW => {text: "এখন"}
  | CONFIRM_PICKUP_LOCATION => {
      text: "পিকআপ স্থান নিশ্চিত করুন",
    }
  | CONFIRM_DROP_LOCATION => {
      text: "ড্রপ অবস্থান নিশ্চিত করুন",
    }
  | SPECIAL_LOCATION_GATE => {
      text: "Select a designated pickup spot by choosing from the list or dragging the map",
    }
  | CONFIRM_LOCATION => {
      text: "অবস্থান নিশ্চিত করুন",
    }
  | BOOK_A_RIDE_NOW => {text: "এখন একটি রাইড বুক করুন"}
  | CHOOSE_YOUR_RIDE => {text: "আপনার রাইড চয়ন করুন"}
  | BRIDGE_MINI => {text: "ব্রিজ মিনি"}
  | BRIDGE_PREMIER => {text: "ব্রিজ প্রিমিয়ার"}
  | BRIDGE_XL => {text: "ব্রিজ এক্সএল"}
  | FINDING_RIDES_NEAR_YOU => {text: "মাধ্যমে পরিশোধ করুন"}
  | BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE => {text: "আপনার কাছ"}
  | CANCEL_RIDE => {
      text: "সেতু শহরের জনগণের জন্য নির্মিত!",
    }
  | CANCEL_SEARCH => {text: "রাইড বাতিল করুন"}
  | DONT_CANCEL => {text: "বাতিল করবেন না"}
  | PLEASE_SELECT_A_REASON_FOR_CANCELLATION => {
      text: "বাতিলের জন্য একটি কারণ নির্বাচন করুন",
    }
  | REQUESTED_WRONG_VEHICLE => {
      text: "ভুল গাড়ি অনুরোধ করা হয়েছে",
    }
  | CHANGE_OF_PLANS => {text: "পরিকল্পনা পরিবর্তন"}
  | LONGER_WAIT_TIME => {text: "বেশি অপেক্ষা সময়"}
  | OTHER => {text: "অন্যান্য"}
  | IS_ARRIVING_IN => {text: "আসছে"}
  | RIDE_ACTIONS => {text: "রাইড অ্যাকশন"}
  | SHARE_RIDE => {text: "রাইড ভাগ করুন"}
  | SAFETY_TOOLS => {text: "নিরাপত্তা সরঞ্জাম"}
  | RIDE_ESTIMATE => {text: "রাইড আনুমান"}
  | PAID_VIA => {text: "ট্রিপ বিবরণ"}
  | TRIP_DETAILS => {text: "সম্পাদনা যোগ করুন"}
  | EDIT_ADD => {
      text: "আপনি কি নিশ্চিত রাইড বাতিল করতে চান?",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THE_RIDE => {
      text: "কোনো গাড়ি উপলব্ধ নেই!",
    }
  | NO_CAR_AVAILABLE => {
      text: "মনে হচ্ছে আপনি একটি উচ্চ চাহিদা সম্পন্ন এলাকায় আছেন, এবং বর্তমানে কোনো ড্রাইভার উপলব্ধ নেই।",
    }
  | IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA => {
      text: "বাড়ি যান",
    }
  | GO_HOME => {text: "অনুসন্ধান বাতিল করুন"}
  | CONTACT => {text: "যোগাযোগ"}
  | PICKUP => {text: "Pickup"}
  | DESTINATION => {text: "Destination"}
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
  | OFFLINE => {text: "আপনি অফলাইন আছেন"}
  | CHECK_INTERNET => {
      text: "অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন",
    }
  | TRY_AGAIN => {text: "আবার চেষ্টা করুন"}
  | SOMETHING_WENT_WRONG_FETCHING_THE_RIDES => {
      text: "যাত্রা পাওয়ার সময় কিছু ভুল হয়েছে।",
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
      text: "অন্য একটি স্থান চেষ্টা করুন",
    }
  | ADD_CARD => {text: "কার্ড যোগ করুন"}
  | DELETE => {text: "মুছে ফেলা"}
  | DRIVER_MIGHT_BE_ON_HIS_WAY => {
      text: "ড্রাইভার হয়তো তার পথে আছে। আপনি কি সত্যিই রাইড বাতিল করতে চান?",
    }
  | CHANGE_RIDE_TYPE => {text: "রাইডের ধরন পরিবর্তন করুন"}
  | CHANGE_RIDE_TYPE_FOR_BETTER_RIDES => {
      text: "আরও ভাল রাইডের জন্য রাইডের ধরন পরিবর্তন করুন",
    }
  | REFER_YOUR_FRIENDS => {
      text: "আপনার বন্ধুদের রেফার করুন",
    }
  | YOUR_REFERRAL_CODE => {text: "আপনার রেফারেল কোড"}
  | SHARE_AND_REFER => {
      text: "শেয়ার করুন এবং উল্লেখ করুন",
    }
  | REFERRED_USERS => {text: "উল্লেখিত ব্যবহারকারী"}
  | USERS_WHO_DOWNLOAD_THE_APP(appName) => {
      text: `যেসব ব্যবহারকারীরা ${appName} অ্যাপ ডাউনলোড করে এবং আপনার রেফারেল কোড ব্যবহার করে তাদের প্রথম যাত্রা সম্পন্ন করে তারা একটি রেফার করা ব্যবহারকারী হিসেবে গণ্য হবে। \n \nরেফারেল কোডটি সাইন আপ করার সময় প্রবেশ করা যেতে পারে।`,
    }
  | GOT_IT => {text: "বুঝেছি"}
  | HAVE_A_REFERRAL_CODE => {text: "রেফারেল কোড আছে?"}
  | INVALID_CODE => {text: "অবৈধ কোড!"}
  | APPLY => {text: "প্রয়োগ করুন"}
  | REFERRAL_CODE_APPLIED_SUCCESSFULLY => {
      text: "রেফারেল কোড সফলভাবে প্রয়োগ হয়েছে!",
    }
  | WHAT_IS_THE_REFERRAL_PROGRAM => {
      text: "রেফারেল প্রোগ্রাম কি?",
    }
  | THE_REFERRAL_PROGRAM_INCENTIVISES(appName) => {
      text: `রেফারেল প্রোগ্রামটি ড্রাইভারদের আরও বেশি যাত্রা গ্রহণ করতে, কম বাতিল করতে এবং যোগ্য ড্রাইভারদের স্বীকৃতি ও পুরস্কৃত করে আপনাকে আরও ভালভাবে পরিষেবা দিতে উৎসাহিত করে। \n \nআপনি ড্রাইভারের রেফারেল কোড প্রবেশ করে এবং ${appName} কমিউনিটির জন্য যাত্রার মান উন্নত করে সাহায্য করতে পারেন! \n\nআপনি একটি রেফারেল কোড একটি ${appName} ড্রাইভার বা ব্যবহারকারীর কাছ থেকে পেতে পারেন।`,
    }
  | ENTER_REFERRAL_CODE_BELOW => {
      text: "নীচে ৬ অঙ্কের রেফারেল কোড লিখুন",
    }
  | DRIVER_IS_WAITING => {text: "ড্রাইভার অপেক্ষা করছে"}
  | DRIVER_ARRIVED => {text: "ড্রাইভার পৌঁছে গেছে!"}
  | BRIDGE_TO_DESTINATION => {text: "গন্তব্যের সেতু"}
  | APP_DESCRIPTION(appName) => {
      text: `${appName} চালকদের সাথে রাইডারদের সংযোগ করার জন্য একটি উন্মুক্ত প্ল্যাটফর্ম। অ্যাপ তৈরি করে 
  রাইডারদের জন্য রাইড বুক করা সুবিধাজনক 
  মিটার হারের সাথে তাই ন্যূনতম ভাড়া।`,
    }
  | TERMS_AND_CONDITIONS => {text: "শর্তাবলী"}
  | PRIVACY_POLICY => {text: "গোপনীয়তা নীতি"}
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
  | BASE_FARE => {text: "বেস ভাড়া"}
  | CONGESTION_CHARGE => {text: "দুর্ঘটনা চার্জ"}
  | OPTIONAL_DRIVER_REQUEST => {text: "ঐচ্ছিক চালক অনুরোধ"}
  | DRIVER_ADDITIONS => {text: "চালক অতিরিক্ত"}
  | TOTAL_FARE => {text: "মোট ভাড়া"}
  | PICKUP_CHARGES => {text: "পিকআপ চার্জ"}
  | WAITING_CHARGES(star) => {text: `অপেক্ষা চার্জ ${star}`}
  | EARLY_RIDE_END_CHARGES => {
      text: "পূর্বমর্যাদার রাইড শেষ চার্জ",
    }
  | CUSTOMER_TIP => {text: "গ্রাহক টিপ *"}
  | SERVICE_CHARGES => {text: "সেবা চার্জ"}
  | RIDE_GST => {text: "রাইড জিএসটি (5%)"}
  | PLATFORM_FEE => {text: "প্ল্যাটফর্ম ফি"}
  | TAXES => {text: "কর (জিএসটি)"}
  | CANCELLATION_DUES => {text: "বাতিলকরণ শুল্ক"}
  | TOLL_CHARGES => {text: "টোল চার্জ"}
  | DISTANCE_BASED_CHARGES => {text: "দূরত্ব ভিত্তিক চার্জ"}
  | TIME_BASED_CHARGES => {text: "সময় ভিত্তিক চার্জ"}
  | EXTRA_TIME_CHARGES => {text: "অতিরিক্ত সময় চার্জ"}
  | CUSTOMER_TIP_INFO => {
      text: "* গ্রাহক সরবরাহের জন্য যোগ করা অতিরিক্ত পরিমাণ।",
    }
  | WAIT_CHARGE_INFO => {
      text: "* প্রথম 3 মিনিটের জন্য অপেক্ষা খরচ শূন্য। তারপরে প্রতি মিনিটে {Amount} টাকা পরিশোধ করতে হবে।",
    }
  | IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION => {
      text: "যদি আপনার লেনদেন ইতিহাস সম্পর্কে কোনও প্রশ্ন থাকে, সংশোধনের প্রয়োজন হয় বা কোনও তথ্য নিয়ে বিরোধ করতে চান, দয়া করে আমাদের সাথে যোগাযোগ করুন।",
    }
  | CALL_SUPPORT => {text: "সমর্থনে কল করুন"}
  | CALL_CUSTOMER_SUPPORT => {
      text: "গ্রাহক সহায়তায় কল করুন",
    }
  | YOUR_LATEST_LOCATION => {text: "আপনার সর্বশেষ অবস্থান"}
  | YOUR_VEHICLE_INFO => {text: "আপনার যানবাহনের তথ্য"}
  | PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION => {
      text: "অনুগ্রহ করে অপারেটরকে আপনার অবস্থান দিন - অ্যাপটি স্বয়ংক্রিয়ভাবে অবস্থান শেয়ার করে না।",
    }
  | EMERGENCY_ASSISTANCE => {text: "জরুরী সহায়তা"}
  | CALL(number) => {text: `কল করুন ${number}`}
  | PRICING_BRIDGE_MINI => {
      text: "মূল্য - ব্রিজ মিনি",
    }
  | PER_MILE_FARE => {text: "প্রতি মাইল ভাড়া"}
  | PER_MINUTE_FARE => {text: "প্রতি মিনিট ভাড়া"}
  | OTHER_CHARGES => {text: "অন্যান্য চার্জ"}
  | PER_MILE => {text: "/মাই"}
  | PER_MIN => {text: "/মিনিট"}
  | DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(multiplier, from, till) => {
      text: `${from} থেকে ${till} পর্যন্ত দিনে প্রযোজ্য দিনের চার্জের ${multiplier}x`,
    }
  | DELETE_ACCOUNT => {text: "অ্যাকাউন্ট মুছুন"}
  | ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT => {
      text: "আপনি কি সত্যিই অ্যাকাউন্টটি মুছতে চান?",
    }
  | CANCEL => {text: "বাতিল করুন"}
  | SORRY_TO_HEAR_YOU_GO => {
      text: "আপনার প্রস্থান শুনে দুঃখিত!",
    }
  | YOUR_PREFERENCE_HAS_BEEN_NOTED => {
      text: "আপনার পছন্দটি নোট করা হয়েছে এবং শীঘ্রই কার্যকর করা হবে। আমরা আশা করি আপনাকে শীঘ্রই আবার সেবা দেওয়ার সুযোগ পাব।",
    }
  | OKAY => {text: "ঠিক আছে"}
  | ADDRESS => {text: "ঠিকানা"}
  | CHOOSE_TAG => {text: "ট্যাগ নির্বাচন করুন"}
  | CURRENT_LOCATION => {text: "এখন যেখানে আছ"}
  | SEARCH_FOR_AREA => {
      text: "এলাকা, রাস্তার নাম অনুসন্ধান করুন...",
    }
  | OTHER_FAVOURITES => {text: "অন্যান্য প্রিয়"}
  | DELETE_FAVOURITE => {text: "প্রিয় মুছে ফেলুন"}
  | TYPE_NAME_FOR_LOCATION => {
      text: "অবস্থানের জন্য নাম টাইপ করুন",
    }
  | ADD_FAVOURITE => {text: "প্রিয় যুক্ত করুন"}
  | EDIT_FAVOURITE => {text: "প্রিয় সম্পাদনা করুন"}
  | NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE => {
      text: "দেখানোর মতো কোনো প্রিয় নেই। চালিয়ে যেতে একটি যোগ করুন...",
    }
  | HOME => {text: "বাড়ি"}
  | WORK => {text: "কাজ"}
  | ADD_ADDRESS => {text: "ঠিকানা যোগ করুন"}
  | INVOICE => {text: "চালান"}
  | RIDE_DETAILS => {text: "যাত্রার বিবরণ"}

  | YOUR_RECENT_RIDE => {text: "আপনার সাম্প্রতিক রাইড"}
  | ALL_TOPICS => {text: "সমস্ত বিষয়"}
  | REPORT_AN_ISSUE_WITH_THIS_RIDE => {
      text: "এই রাইডের সাথে একটি সমস্যা রিপোর্ট করুন",
    }
  | VIEW_ALL_RIDES => {text: "সমস্ত রাইড দেখুন"}
  | DESCRIBE_YOUR_ISSUE(appName) => {
      text: `আপনার সমস্যাটি বর্ণনা করুন। ${appName} এটি ২৪ ঘন্টার মধ্যে সমাধান করার চেষ্টা করবে।`,
    }
  | ENTER_YOUR_TEXT_HERE => {
      text: "এখানে আপনার পাঠ্য লিখুন",
    }
  | SEARCH => {text: "অনুসন্ধান"}
  | ALL_RIDES => {text: "সমস্ত রাইড"}
  | NO_RIDE_HISTORY_AVAILABLE => {
      text: "কোনো রাইড ইতিহাস উপলব্ধ নয়",
    }
  | YOU_HAVE_NOT_TAKEN_A_RIDE_YET => {
      text: "আপনি এখনও কোনো রাইড নেননি",
    }
  | MESSAGE => {text: "বার্তা"}
  | SUBMIT_ISSUE_DETAILS => {text: "ইস্যু বিবরণ জমা দিন"}
  | ARE_YOU_SURE_YOU_WANT_TO_LOGOUT => {
      text: "আপনি কি লগআউট করতে চান?",
    }
  | RIDE_SHARE_INFO => {text: "রাইড শেয়ার তথ্য"}
  | ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS => {
      text: "অবস্থান এবং রাইডের বিবরণ আপনার জরুরী পরিচিতিদের সাথে ভাগ করতে পরিচিতি যোগ করুন",
    }
  | ADD_A_CONTACT => {text: "\uFF0B একটি পরিচিতি যোগ করুন"}
  | SHARE_RIDE_INFO => {text: "রাইড তথ্য শেয়ার করুন"}
  | SHARE_LOCATION_AND_RIDE_DETAILS => {
      text: "অবস্থান এবং রাইডের বিবরণ শেয়ার করুন",
    }
  | ADD_EMERGENCY_CONTACTS => {text: "জরুরী পরিচিতি যোগ করুন"}
  | CONTACTS_SELECTED(selected, limit) => {
      text: `${selected}/${limit} পরিচিতি নির্বাচিত`,
    }
  | SEARCH_CONTACTS => {text: "পরিচিতি অনুসন্ধান"}
  | CONFIRM_EMERGENCY_CONTACTS => {
      text: "জরুরী পরিচিতি নিশ্চিত করুন",
    }
  | LOCATION_ACCESS_HEADER => {text: "অবস্থান অ্যাক্সেস"}
  | LOCATION_ACCESS_INFO => {
      text: "আপনার অবস্থান শেয়ার করার জন্য আমাদের অ্যাপ্লিকেশনে অবস্থান অ্যাক্সেস দিন।",
    }
  | NOTIFICATION_ACCESS_HEADER => {text: "বিজ্ঞপ্তি অ্যাক্সেস"}
  | NOTIFICATION_ACCESS_INFO => {
      text: "আপনার অবস্থান শেয়ার করার জন্য আমাদের অ্যাপ্লিকেশনে অবস্থান অ্যাক্সেস দিন।",
    }
  | ALLOW => {text: "অনুমতি দিন"}
  | DENY => {text: "অস্বীকার করুন"}
  | RIDE_VERIFICATION => {text: "যাত্রার যাচাই"}
  | USE_PIN_TO_VERIFY_RIDE => {
      text: "পিন ব্যবহার করে যাত্রা যাচাই করুন",
    }
  | REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES => {
      text: "আপনার যাত্রা শুরু করতে আপনাকে আপনার ড্রাইভারের সাথে একটি যাত্রা শুরুর পিন শেয়ার করতে হবে। এটি নিশ্চিত করে যে আপনি সঠিক ড্রাইভারের সাথে সংযুক্ত হয়েছেন।",
    }
  | DONE => {text: "সম্পন্ন"}
  | TRUSTED_CONTACTS => {text: "বিশ্বস্ত পরিচিতি"}
  | ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT => {
      text: "✨ লাইভ ট্র্যাকিং এবং ইন-অ্যাপ চ্যাট সক্রিয় করুন",
    }
  | TRUSTED_CONTACT_CAN_FOLLOW_YOUR_RIDE => {
      text: "বিশ্বস্ত পরিচিতি আপনার যাত্রা অনুসরণ করতে পারে, অ্যাপে চ্যাট করতে পারে এবং জরুরী অবস্থায় আপনাকে সমর্থন করতে পারে",
    }
  | SAFETY_SETUP => {text: "নিরাপত্তা সেটআপ"}
  | COMPLETE(str) => {text: `${str} সম্পূর্ণ`}
  | ALL_RIDES_SHARED_AUTOMATICALLY => {
      text: "সব যাত্রা স্বয়ংক্রিয়ভাবে শেয়ার করা হয়েছে",
    }
  | NIGHT_RIDES_SHARED_AUTOMATICALLY => {
      text: "রাতের যাত্রা স্বয়ংক্রিয়ভাবে শেয়ার করা হয়েছে (৬ টা - ৯ টা)",
    }
  | I_WILL_SHARE_RIDES_MANUALLY => {
      text: "আমি ম্যানুয়ালি যাত্রা শেয়ার করব",
    }
  | SHARE_RIDE_OPTIONS => {text: "যাত্রা শেয়ার বিকল্প"}
  | LIVE_RIDE_TRACKING => {text: "লাইভ যাত্রা ট্র্যাকিং"}
  | YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS => {
      text: "আপনি আপনার বিশ্বস্ত পরিচিতির জন্য লাইভ ট্র্যাকিং স্বয়ংক্রিয়ভাবে শেয়ার করার জন্য সেটআপ করতে পারেন",
    }
  | YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON => {
      text: "আপনি শেয়ার বোতাম ব্যবহার করে যেকোনো কারো সাথে ম্যানুয়ালি শেয়ার করতে পারেন",
    }
  | ADD_CONTACTS => {text: "পরিচিতি যোগ করুন"}
  | ESTIMATES_HAS_BEEN_EXPIRED => {
      text: "আনুমানিক মেয়াদ শেষ হয়েছে। আবার পুনরায় পেতে, একটু অপেক্ষা করুন এবং আবার পরীক্ষা করুন।",
    }
  | YAY_REACHED_DESTINATION_IN_JUST => {
      text: "ইহা! আপনি মাত্র {time} মিনিটে গন্তব্যে পৌঁছেছেন",
    }
  | RIDE_TIME => {text: "রাইড সময়"}
  }
