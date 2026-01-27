let hindiLocal = (locale: LocaleStringType.localeString): LocaleStringType.textAndAccObj =>
  switch locale {
  | HEADING => {text: "शीर्षक"}
  | NAME => {text: "नाम"}
  | ADD_HOME => {text: "घर जोड़ें"}
  | ADD_WORK => {text: "कार्य जोड़ें"}
  | ADD_OTHER => {text: "अन्य जोड़ें"}
  | RECENT => {text: "हाल का"}
  | FAVOURITES => {text: "पसंदीदा"}
  | WHERE_ARE_YOU_GOING => {text: "आप कहाँ जा रहे हैं?"}
  | MY_RIDES => {text: "मेरी सवारियाँ"}
  | Bookings => {text: "बुकिंग्स"}
  | SAFETY => {text: "सुरक्षा"}
  | HELP_AND_SUPPORT => {text: "मदद और समर्थन"}
  | APP_LANGUAGE => {text: "ऐप भाषा"}
  | PAYMENT => {text: "भुगतान"}
  | REFER_AND_EARN => {text: "संदर्भ और कमाई"}
  | ABOUT => {text: "बारे में"}
  | LOGOUT => {text: "लोगआउट"}
  | PROFILE_COMPLETION => {text: "प्रोफ़ाइल पूर्णता"}
  | BACK_TO_HOME => {text: "होम पर वापस जाएं"}
  | SPORTS_NEAR_ME => {text: "मेरे पास खेल"}
  | SET_PIN_ON_MAP => {text: "नक्शे पर पिन सेट करें"}
  | NOW => {text: "अब"}
  | CONFIRM_PICKUP_LOCATION => {
      text: "पिकअप स्थान की पुष्टि करें",
    }
  | CONFIRM_DROP_LOCATION => {
      text: "ड्रॉप स्थान की पुष्टि करें",
    }
  | SPECIAL_LOCATION_GATE => {
      text: "Select a designated pickup spot by choosing from the list or dragging the map",
    }
  | CONFIRM_LOCATION => {
      text: "অবস্থান নিশ্চিত করুন",
    }
  | BOOK_A_RIDE_NOW => {text: "अभी यात्रा बुक करें"}
  | CHOOSE_YOUR_RIDE => {text: "अपनी यात्रा चुनें"}
  | BRIDGE_MINI => {text: "ब्रिज मिनी"}
  | BRIDGE_PREMIER => {text: "ब्रिज प्रीमियर"}
  | BRIDGE_XL => {text: "ब्रिज एक्सएल"}
  | FINDING_RIDES_NEAR_YOU => {
      text: "के माध्यम से भुगतान किया",
    }
  | BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE => {
      text: "आपके पास सवारियां ढूंढ रहे हैं",
    }
  | CANCEL_RIDE => {
      text: "ब्रिज शहर के लिए लोगों द्वारा बनाया गया है!",
    }
  | CANCEL_SEARCH => {text: "यात्रा रद्द करें"}
  | DONT_CANCEL => {text: "रद्द न करें"}
  | PLEASE_SELECT_A_REASON_FOR_CANCELLATION => {
      text: "रद्दीकरण के लिए कृपया कारण चुनें",
    }
  | REQUESTED_WRONG_VEHICLE => {
      text: "गलत वाहन का अनुरोध किया गया",
    }
  | CHANGE_OF_PLANS => {text: "योजना में बदलाव"}
  | LONGER_WAIT_TIME => {text: "लंबी प्रतीक्षा समय"}
  | OTHER => {text: "अन्य"}
  | IS_ARRIVING_IN => {text: "आ रहा है"}
  | RIDE_ACTIONS => {text: "यात्रा क्रियाएँ"}
  | SHARE_RIDE => {text: "यात्रा साझा करें"}
  | SAFETY_TOOLS => {text: "सुरक्षा उपकरण"}
  | RIDE_ESTIMATE => {text: "यात्रा अनुमान"}
  | PAID_VIA => {text: "यात्रा विवरण"}
  | TRIP_DETAILS => {text: "संपादित जोड़ें"}
  | EDIT_ADD => {
      text: "क्या आप वाकई राइड को रद्द करना चाहते हैं?",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THE_RIDE => {
      text: "कोई कार उपलब्ध नहीं है!",
    }
  | NO_CAR_AVAILABLE => {
      text: "लगता है आप एक उच्च मांग वाले क्षेत्र में हैं} और वर्तमान में कोई ड्राइवर उपलब्ध नहीं हैं।",
    }
  | IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA => {
      text: "घर जाओ",
    }
  | GO_HOME => {text: "खोज रद्द करें"}
  | CONTACT => {text: "संपर्क करें"}
  | PICKUP => {text: "पिकअप"}
  | DESTINATION => {text: "गंतव्य"}
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
  | OFFLINE => {text: "आप ऑफ़लाइन हैं"}
  | CHECK_INTERNET => {
      text: "कृपया अपनी इंटरनेट कनेक्शन की जांच करें और पुनः प्रयास करें",
    }
  | TRY_AGAIN => {text: "पुनः प्रयास करें"}
  | SOMETHING_WENT_WRONG_FETCHING_THE_RIDES => {
      text: "यात्री प्राप्त करते समय कुछ गलत हो गया।",
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
  | TRY_ANOTHER_LOCATION => {text: "एक और स्थान प्रयास करें"}
  | ADD_CARD => {text: "Add Card"}
  | DELETE => {text: "Delete"}
  | DRIVER_MIGHT_BE_ON_HIS_WAY => {
      text: "ड्राइवर शायद अपने रास्ते पर होगा. क्या आप सचमुच यात्रा रद्द करना चाहते हैं?",
    }
  | CHANGE_RIDE_TYPE => {text: "राइड का प्रकार बदलें"}
  | CHANGE_RIDE_TYPE_FOR_BETTER_RIDES => {
      text: "बेहतर राइड्स के लिए राइड का प्रकार बदलें",
    }
  | REFER_YOUR_FRIENDS => {
      text: "अपने दोस्तों को रेफर करें",
    }
  | YOUR_REFERRAL_CODE => {text: "आपका रेफरल कोड"}
  | SHARE_AND_REFER => {text: "साझा करें और देखें"}
  | REFERRED_USERS => {text: "संदर्भित उपयोगकर्ता"}
  | USERS_WHO_DOWNLOAD_THE_APP(appName) => {
      text: `जो उपयोगकर्ता ${appName} ऐप डाउनलोड करते हैं और आपका रिफ़रल कोड का उपयोग करके अपनी पहली सवारी पूरी करते हैं, उन्हें एक रेफर किए गए उपयोगकर्ता के रूप में गिना जाएगा। \n \nरिफ़रल कोड साइन अप करते समय दर्ज किया जा सकता है।`,
    }
  | GOT_IT => {text: "समझ गया"}
  | HAVE_A_REFERRAL_CODE => {
      text: "क्या आपके पास रिफ़रल कोड है?",
    }
  | INVALID_CODE => {text: "अमान्य कोड!"}
  | APPLY => {text: "लागू करें"}
  | REFERRAL_CODE_APPLIED_SUCCESSFULLY => {
      text: "रेफरल कोड सफलतापूर्वक लागू हो गया!",
    }
  | WHAT_IS_THE_REFERRAL_PROGRAM => {
      text: "रेफ़रल प्रोग्राम क्या है?",
    }
  | THE_REFERRAL_PROGRAM_INCENTIVISES(appName) => {
      text: `रेफ़रल प्रोग्राम ड्राइवरों को अधिक सवारी स्वीकार करने, कम रद्द करने और योग्य ड्राइवरों को पहचानने और पुरस्कृत करके आपको बेहतर सेवा प्रदान करने के लिए प्रोत्साहित करता है। \n \nआप ड्राइवर का रिफ़रल कोड दर्ज करके और ${appName} समुदाय के लिए सवारी की गुणवत्ता में सुधार करके मदद कर सकते हैं! \n\nआप एक ${appName} ड्राइवर या उपयोगकर्ता से रिफ़रल कोड प्राप्त कर सकते हैं।`,
    }
  | ENTER_REFERRAL_CODE_BELOW => {
      text: "नीचे 6 अंकों का रिफ़रल कोड दर्ज करें",
    }
  | DRIVER_IS_WAITING => {text: "ड्राइवर इंतजार कर रहा है"}
  | DRIVER_ARRIVED => {text: "ड्राइवर पहुँच गया!"}
  | BRIDGE_TO_DESTINATION => {text: "गंतव्य के लिए पुल"}
  | APP_DESCRIPTION(appName) => {
      text: `${appName} राइडर्स को ड्राइवरों से जोड़ने के लिए एक खुला मंच है। यह ऐप राइडर्स के लिए मीटर दर पर राइड बुक करना सुविधाजनक बनाता है, इसलिए किराया न्यूनतम है`,
    }
  | TERMS_AND_CONDITIONS => {text: "नियम एवं शर्तें"}
  | PRIVACY_POLICY => {text: "गोपनीयता नीति"}
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
  | BASE_FARE => {text: "आधार भाड़ा"}
  | CONGESTION_CHARGE => {text: "संकुलन शुल्क"}
  | OPTIONAL_DRIVER_REQUEST => {
      text: "वैकल्पिक ड्राइवर अनुरोध",
    }
  | DRIVER_ADDITIONS => {text: "ड्राइवर जोड़ने"}
  | TOTAL_FARE => {text: "कुल भाड़ा"}
  | PICKUP_CHARGES => {text: "पिकअप शुल्क"}
  | WAITING_CHARGES(star) => {text: `प्रतीक्षा शुल्क ${star}`}
  | EARLY_RIDE_END_CHARGES => {text: "शीघ्र राइड समाप्ति दंड"}
  | CUSTOMER_TIP => {text: "ग्राहक सुझाव *"}
  | SERVICE_CHARGES => {text: "सेवा शुल्क"}
  | RIDE_GST => {text: "राइड जीएसटी (5%)"}
  | PLATFORM_FEE => {text: "प्लेटफ़ॉर्म शुल्क"}
  | TAXES => {text: "कर (जीएसटी)"}
  | CANCELLATION_DUES => {text: "रद्दीकरण शुल्क"}
  | TOLL_CHARGES => {text: "टोल शुल्क"}
  | DISTANCE_BASED_CHARGES => {text: "दूरी आधारित शुल्क"}
  | TIME_BASED_CHARGES => {text: "समय आधारित शुल्क"}
  | EXTRA_TIME_CHARGES => {text: "अतिरिक्त समय शुल्क"}
  | CUSTOMER_TIP_INFO => {
      text: "* ग्राहक द्वारा प्रदान की गई सेवा के लिए अतिरिक्त राशि।",
    }
  | WAIT_CHARGE_INFO => {
      text: "* पहले 3 मिनट के लिए इंतजार शुल्क शून्य है। उसके बाद प्रति मिनट {Amount} का शुल्क लिया जाएगा।",
    }
  | IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION => {
      text: "यदि आपको अपने लेनदेन इतिहास के बारे में कोई पूछताछ, सुधार की आवश्यकता, या किसी जानकारी पर विवाद करना है, तो कृपया हमसे संपर्क करें।",
    }
  | CALL_SUPPORT => {text: "सहायता कॉल करें"}
  | CALL_CUSTOMER_SUPPORT => {
      text: "ग्राहक सहायता को कॉल करें",
    }
  | YOUR_LATEST_LOCATION => {text: "आपका नवीनतम स्थान"}
  | YOUR_VEHICLE_INFO => {text: "आपके वाहन की जानकारी"}
  | PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION => {
      text: "कृपया ऑपरेटर को अपना स्थान बताएं - ऐप स्वचालित रूप से स्थान साझा नहीं करता है।",
    }
  | EMERGENCY_ASSISTANCE => {text: "आपातकालीन सहायता"}
  | CALL(number) => {text: `कॉल करें ${number}`}
  | PRICING_BRIDGE_MINI => {
      text: "मूल्य निर्धारण - ब्रिज मिनी",
    }
  | PER_MILE_FARE => {text: "प्रति मील किराया"}
  | PER_MINUTE_FARE => {text: "प्रति मिनट किराया"}
  | OTHER_CHARGES => {text: "अन्य शुल्क"}
  | PER_MILE => {text: "/मी"}
  | PER_MIN => {text: "/मिनट"}
  | DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(multiplier, from, till) => {
      text: `रात में ${from} से ${till} तक दिन का ${multiplier} गुना शुल्क लागू होता है`,
    }
  | DELETE_ACCOUNT => {text: "खाता हटाएं"}
  | ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT => {
      text: "क्या आप वाकई खाता हटाना चाहते हैं?",
    }
  | CANCEL => {text: "रद्द करें"}
  | SORRY_TO_HEAR_YOU_GO => {
      text: "आपके जाने का सुनकर खेद है!",
    }
  | YOUR_PREFERENCE_HAS_BEEN_NOTED => {
      text: "आपकी पसंद को नोट कर लिया गया है और जल्द ही कार्रवाई की जाएगी। हमें उम्मीद है कि हम जल्द ही आपको फिर से सेवा देने का अवसर प्राप्त करेंगे।",
    }
  | OKAY => {text: "ठीक है"}
  | ADDRESS => {text: "पता"}
  | CHOOSE_TAG => {text: "टैग चुनें"}
  | CURRENT_LOCATION => {text: "वर्तमान स्थान"}
  | SEARCH_FOR_AREA => {
      text: "क्षेत्र, सड़क का नाम खोजें...",
    }
  | OTHER_FAVOURITES => {text: "अन्य पसंदीदा"}
  | DELETE_FAVOURITE => {text: "पसंदीदा हटाएं"}
  | TYPE_NAME_FOR_LOCATION => {
      text: "स्थान के लिए नाम टाइप करें",
    }
  | ADD_FAVOURITE => {text: "पसंदीदा जोड़ें"}
  | EDIT_FAVOURITE => {text: "पसंदीदा संपादित करें"}
  | NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE => {
      text: "दिखाने के लिए कोई पसंदीदा नहीं है। जारी रखने के लिए एक जोड़ें...",
    }
  | HOME => {text: "घर"}
  | WORK => {text: "काम"}
  | ADD_ADDRESS => {text: "पता जोड़ें"}
  | INVOICE => {text: "चालान"}
  | RIDE_DETAILS => {text: "यात्रा विवरण"}
  | YOUR_RECENT_RIDE => {text: "आपकी हाल की सवारी"}
  | ALL_TOPICS => {text: "सभी विषय"}
  | REPORT_AN_ISSUE_WITH_THIS_RIDE => {
      text: "इस सवारी से संबंधित किसी समस्या की रिपोर्ट करें",
    }
  | VIEW_ALL_RIDES => {text: "सभी सवारी देखें"}
  | DESCRIBE_YOUR_ISSUE(appName) => {
      text: `अपनी समस्या का वर्णन करें। ${appName} इसे 24 घंटे के अंदर हल करने की कोशिश करेगा।`,
    }
  | ENTER_YOUR_TEXT_HERE => {text: "यहाँ अपना पाठ दर्ज करें"}
  | ALL_RIDES => {text: "सभी सवारी"}
  | NO_RIDE_HISTORY_AVAILABLE => {
      text: "कोई सवारी इतिहास उपलब्ध नहीं है",
    }
  | YOU_HAVE_NOT_TAKEN_A_RIDE_YET => {
      text: "आपने अभी तक कोई सवारी नहीं की है",
    }
  | SEARCH => {text: "खोज"}
  | MESSAGE => {text: "संदेश"}
  | SUBMIT_ISSUE_DETAILS => {
      text: "मुद्दे का विवरण जमा करें",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_LOGOUT => {
      text: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
    }
  | RIDE_SHARE_INFO => {text: "राइड शेयर जानकारी"}
  | ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS => {
      text: "आपातकालीन संपर्कों के साथ स्थान और राइड विवरण साझा करने के लिए संपर्क जोड़ें",
    }
  | ADD_A_CONTACT => {text: "\uFF0B एक संपर्क जोड़ें"}
  | SHARE_RIDE_INFO => {text: "राइड जानकारी साझा करें"}
  | SHARE_LOCATION_AND_RIDE_DETAILS => {
      text: "स्थान और राइड विवरण साझा करें",
    }
  | ADD_EMERGENCY_CONTACTS => {
      text: "आपातकालीन संपर्क जोड़ें",
    }
  | CONTACTS_SELECTED(selected, limit) => {
      text: `${selected}/${limit} संपर्क चुने गए`,
    }
  | SEARCH_CONTACTS => {text: "संपर्क खोजें"}
  | CONFIRM_EMERGENCY_CONTACTS => {
      text: "आपातकालीन संपर्कों की पुष्टि करें",
    }
  | LOCATION_ACCESS_HEADER => {
      text: "स्थान पहुँच अनुमति",
    }
  | LOCATION_ACCESS_INFO => {
      text: "आपके स्थान की जानकारी के लिए आपके डिवाइस की स्थान सेवाओं का उपयोग करें",
    }
  | NOTIFICATION_ACCESS_HEADER => {
      text: "अधिसूचना पहुँच अनुमति",
    }
  | NOTIFICATION_ACCESS_INFO => {
      text: "अधिसूचनाएँ आपको नवीनतम अपड",
    }
  | ALLOW => {
      text: "अनुमति दें",
    }
  | DENY => {
      text: "अस्वीकार करें",
    }
  | RIDE_VERIFICATION => {text: "राइड सत्यापन"}
  | USE_PIN_TO_VERIFY_RIDE => {
      text: "राइड सत्यापित करने के लिए पिन का उपयोग करें",
    }
  | REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES => {
      text: "आपको अपनी राइड शुरू करने के लिए अपने ड्राइवर के साथ एक राइड स्टार्ट पिन साझा करना होगा। यह सुनिश्चित करता है कि आप सही ड्राइवर के साथ जुड़े हैं।",
    }
  | DONE => {text: "समाप्त"}
  | TRUSTED_CONTACTS => {text: "विश्वसनीय संपर्क"}
  | ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT => {
      text: "✨ लाइव ट्रैकिंग और इन-ऐप चैट सक्षम करें",
    }
  | TRUSTED_CONTACT_CAN_FOLLOW_YOUR_RIDE => {
      text: "विश्वसनीय संपर्क आपकी राइड का अनुसरण कर सकता है, ऐप पर चैट कर सकता है और आपात स्थिति में आपका समर्थन कर सकता है",
    }
  | SAFETY_SETUP => {text: "सुरक्षा सेटअप"}
  | COMPLETE(str) => {text: `${str} पूर्ण`}
  | ALL_RIDES_SHARED_AUTOMATICALLY => {
      text: "सभी राइड्स स्वचालित रूप से साझा की गई",
    }
  | NIGHT_RIDES_SHARED_AUTOMATICALLY => {
      text: "रात्रि की राइड्स स्वचालित रूप से साझा की गई (6PM - 9AM)",
    }
  | I_WILL_SHARE_RIDES_MANUALLY => {
      text: "मैं मैन्युअल रूप से राइड्स साझा करूंगा",
    }
  | SHARE_RIDE_OPTIONS => {text: "राइड साझा करने के विकल्प"}
  | LIVE_RIDE_TRACKING => {text: "लाइव राइड ट्रैकिंग"}
  | YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS => {
      text: "आप अपने विश्वसनीय संपर्कों के लिए लाइव ट्रैकिंग के स्वचालित साझा करने को सेटअप कर सकते हैं",
    }
  | YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON => {
      text: "आप शेयर बटन का उपयोग करके किसी के साथ भी मैन्युअली साझा कर सकते हैं",
    }
  | ADD_CONTACTS => {text: "संपर्क जोड़ें"}
  | ESTIMATES_HAS_BEEN_EXPIRED => {
      text: "अनुमान समाप्त हो गया है। फिर से प्राप्त कर रहा है, कृपया एक क्षण प्रतीक्षा करें और फिर से जांचें।",
    }
  | YAY_REACHED_DESTINATION_IN_JUST => {
      text: "ये रहा गंतव्य! आपने इसे सिर्फ में पहुंच गया।",
    }
  | RIDE_TIME => {text: "राइड समय"}
  }
