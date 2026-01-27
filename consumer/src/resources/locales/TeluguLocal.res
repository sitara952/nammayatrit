let teluguLocal = (locale: LocaleStringType.localeString): LocaleStringType.textAndAccObj =>
  switch locale {
  | HEADING => {text: "శీర్షిక"}
  | NAME => {text: "పేరు"}
  | ADD_HOME => {text: "హోమ్ జోడించండి"}
  | ADD_WORK => {text: "వర్క్ జోడించండి"}
  | ADD_OTHER => {text: "ఇతరులను జోడించండి"}
  | RECENT => {text: "ఇటీవల"}
  | FAVOURITES => {text: "ఇష్టమైనవి"}
  | WHERE_ARE_YOU_GOING => {
      text: "మీరు ఎక్కడకు వెళ్ళుతున్నారు?",
    }
  | MY_RIDES => {text: "నా సవారులు"}
  | Bookings => {text: "బుకింగ్స్"}
  | SAFETY => {text: "భద్రత"}
  | HELP_AND_SUPPORT => {text: "సహాయం మరియు మద్దతు"}
  | APP_LANGUAGE => {text: "App Language"}
  | PAYMENT => {text: "చెల్లింపు"}
  | REFER_AND_EARN => {
      text: "సూచించండి మరియు సంపాదించండి",
    }
  | ABOUT => {text: "గురించి"}
  | LOGOUT => {text: "లాగౌట్"}
  | PROFILE_COMPLETION => {text: "ప్రొఫైల్ పూర్తి"}
  | BACK_TO_HOME => {text: "వింటికి తిరిగి వెళ్ళండి"}
  | SPORTS_NEAR_ME => {text: "నా సమీపంలో క్రీడల"}
  | SET_PIN_ON_MAP => {
      text: "మ్యాప్ పై పిన్ సెట్ చేయండి",
    }
  | NOW => {text: "ఇప్పుడు"}
  | CONFIRM_PICKUP_LOCATION => {
      text: "పికప్ స్థానాన్ని నిర్ధారించండి",
    }
  | CONFIRM_DROP_LOCATION => {
      text: "డ్రాప్ లొకేషన్ను నిర్ధారించండి",
    }
  | CONFIRM_LOCATION => {
      text: "ప్రాంతాన్ని నిర్ధారించండి",
    }
  | SPECIAL_LOCATION_GATE => {
      text: "Select a designated pickup spot by choosing from the list or dragging the map",
    }
  | BOOK_A_RIDE_NOW => {
      text: "ఇప్పుడే సవారి బుక్ చేయండి",
    }
  | CHOOSE_YOUR_RIDE => {text: "మీ సవారిని ఎంచుకోండి"}
  | BRIDGE_MINI => {text: "బ్రిడ్జ్ మిని"}
  | BRIDGE_PREMIER => {text: "బ్రిడ్జ్ ప్రిమియర్"}
  | BRIDGE_XL => {text: "బ్రిడ్జ్ ఎక్సెల్"}
  | FINDING_RIDES_NEAR_YOU => {text: "ద్వారా చెల్లింపు"}
  | BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE => {
      text: "మీ సమీపంలో సవారులను కనుగొనుటకు",
    }
  | CANCEL_RIDE => {
      text: "బ్రిడ్జ్ నగరం కోసం ప్రజల ద్వారా నిర్మించబడింది!",
    }
  | CANCEL_SEARCH => {text: "సవారి రైడ్ రద్దు చేయండి"}
  | DONT_CANCEL => {text: "రద్దు చేయకూడదు"}
  | PLEASE_SELECT_A_REASON_FOR_CANCELLATION => {
      text: "రద్దు చేయడానికి కారణాన్ని ఎంచుకోండి",
    }
  | REQUESTED_WRONG_VEHICLE => {
      text: "తప్పుడు వాహనం అభ్యర్థించారు",
    }
  | CHANGE_OF_PLANS => {text: "ప్లాన్ మార్చడం"}
  | LONGER_WAIT_TIME => {text: "ఎక్కువ వేచికల సమయం"}
  | OTHER => {text: "ఇతర"}
  | IS_ARRIVING_IN => {text: "వస్తున్నాడు"}
  | RIDE_ACTIONS => {text: "సవారి చర్యలు"}
  | SHARE_RIDE => {text: "రైడ్ షేర్ చేయండి"}
  | SAFETY_TOOLS => {text: "భద్రత సరఫరాలు"}
  | RIDE_ESTIMATE => {text: "రైడ్ అంచనా"}
  | PAID_VIA => {text: "ట్రిప్ వివరాలు"}
  | TRIP_DETAILS => {text: "సవరించు జోడించు"}
  | EDIT_ADD => {
      text: "మీరు ఖచ్చితంగా రైడ్ రద్దు చేయాలనుకుంటున్నారా?",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THE_RIDE => {
      text: "ఏ కార్లు కూడా లభ్యం లేవు!",
    }
  | NO_CAR_AVAILABLE => {
      text: "It appears you're in a high-demand area, and no drivers are currently available.",
    }
  | IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA => {
      text: "హోమ్‌కి వెళ్ళండి",
    }
  | GO_HOME => {text: "శోధనను రద్దు చేయి"}
  | CONTACT => {text: "సంప్రదించండి"}
  | PICKUP => {text: "పికప్"}
  | DESTINATION => {text: "గమ్యస్థానం"}
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
  | CAROUSEL_DEMO => {text: "Location unserviceable"}
  | LOCATION_UNSERVICEABLE => {text: "Carousel Demo"}
  | OFFLINE => {text: "మీరు ఆఫ్లైన్‌లో ఉన్నారు"}
  | CHECK_INTERNET => {
      text: "దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ను పరిశీలించి మరల ప్రయత్నించండి",
    }
  | TRY_AGAIN => {text: "మళ్ళీ ప్రయత్నించండి"}
  | SOMETHING_WENT_WRONG_FETCHING_THE_RIDES => {
      text: "సేపు పొందడంలో ఏదో తప్పు జరిగింది.",
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
      text: "మరొక స్థలాన్ని ప్రయత్నించండి",
    }
  | ADD_CARD => {text: "కార్డు జోడించండి"}
  | DELETE => {text: "తొలగించు"}
  | DRIVER_MIGHT_BE_ON_HIS_WAY => {
      text: "డ్రైవర్ తన దారిలో ఉండవచ్చు. మీరు నిజంగా రైడ్‌ని రద్దు చేయాలనుకుంటున్నారా?",
    }
  | CHANGE_RIDE_TYPE => {text: "రైడ్ రకం మార్చండి"}
  | CHANGE_RIDE_TYPE_FOR_BETTER_RIDES => {
      text: "మెరుగైన రైడ్స్ కోసం రైడ్ రకం మార్చండి",
    }
  | REFER_YOUR_FRIENDS => {
      text: "మీ స్నేహితులను సూచించండి",
    }
  | YOUR_REFERRAL_CODE => {text: "మీ రెఫరల్ కోడ్"}
  | SHARE_AND_REFER => {
      text: "భాగస్వామ్యం చేయండి మరియు సూచించండి",
    }
  | REFERRED_USERS => {
      text: "సూచించబడిన వినియోగదారులు",
    }
  | USERS_WHO_DOWNLOAD_THE_APP(appName) => {
      text: `${appName} యాప్ డౌన్‌లోడ్ చేసి మీ రిఫరల్ కోడ్ ఉపయోగించి తమ మొదటి ప్రయాణాన్ని పూర్తి చేసిన వినియోగదారులు రిఫర్ చేసిన వినియోగదారులుగా పరిగణించబడతారు. \n \nసైన్ అప్ చేసేటప్పుడు రిఫరల్ కోడ్‌ని నమోదు చేయవచ్చు.`,
    }
  | GOT_IT => {text: "అర్ధమైంది"}
  | HAVE_A_REFERRAL_CODE => {text: "రిఫరల్ కోడ్ ఉందా?"}
  | INVALID_CODE => {text: "చెల్లని కోడ్!"}
  | APPLY => {text: "దరఖాస్తు చేయండి"}
  | REFERRAL_CODE_APPLIED_SUCCESSFULLY => {
      text: "సూచన కోడ్ విజయవంతంగా వర్తింపజేయబడింది!",
    }
  | WHAT_IS_THE_REFERRAL_PROGRAM => {
      text: "రిఫరల్ ప్రోగ్రామ్ ఏమిటి?",
    }
  | THE_REFERRAL_PROGRAM_INCENTIVISES(appName) => {
      text: `రిఫరల్ ప్రోగ్రామ్ డ్రైవర్‌లను ఎక్కువ రైడ్‌లను అంగీకరించడానికి, తక్కువ రద్దు చేయడానికి మరియు మీకు మెరుగ్గా సేవ చేయడానికి ప్రోత్సహిస్తుంది. \n \nమీరు డ్రైవర్ యొక్క రిఫరల్ కోడ్‌ని నమోదు చేయడం ద్వారా మరియు ${appName} కమ్యూనిటీ కోసం రైడ్‌ల నాణ్యతను మెరుగుపరచడం ద్వారా సహాయం చేయవచ్చు! \n\nమీరు ${appName} డ్రైవర్ లేదా వినియోగదారు నుండి రిఫరల్ కోడ్‌ను పొందవచ్చు.`,
    }
  | ENTER_REFERRAL_CODE_BELOW => {
      text: "కింద 6 అంకెల రిఫరల్ కోడ్‌ని నమోదు చేయండి",
    }
  | DRIVER_IS_WAITING => {text: "డ్రైవర్ వేచి ఉన్నారు"}
  | DRIVER_ARRIVED => {text: "డ్రైవర్ చేరుకున్నారు!"}
  | BRIDGE_TO_DESTINATION => {text: "గమ్యస్థానానికి వంతెన"}
  | APP_DESCRIPTION(appName) => {
      text: `${appName} రైడర్‌లను డ్రైవర్‌లతో కనెక్ట్ చేయడానికి ఓపెన్ ప్లాట్‌ఫారమ్. యాప్ చేస్తుంది
  రైడర్లు రైడ్ బుక్ చేసుకోవడానికి ఇది సౌకర్యంగా ఉంటుంది
  మీటర్ రేటు కాబట్టి కనీస ఛార్జీలు`,
    }
  | TERMS_AND_CONDITIONS => {text: "నిబంధనలు & షరతులు"}
  | PRIVACY_POLICY => {text: "గోప్యతా విధానం"}
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
  | BASE_FARE => {text: "బేస్ ఫేర్"}
  | CONGESTION_CHARGE => {text: "కన్జెస్టియన్ ఛార్జెస్"}
  | OPTIONAL_DRIVER_REQUEST => {
      text: "ఐచ్ఛిక డ్రైవర్ అభ్యర్థన",
    }
  | DRIVER_ADDITIONS => {text: "డ్రైవర్ జోడింపులు"}
  | TOTAL_FARE => {text: "మొత్తం నిలువు"}
  | PICKUP_CHARGES => {text: "పికప్ ఛార్జెస్"}
  | WAITING_CHARGES(star) => {
      text: `ఎదురుచూస్తున్న ఛార్జెస్ ${star}`,
    }
  | EARLY_RIDE_END_CHARGES => {
      text: "ముందుగా సైకిల్ ముగిసిపోయే ఛార్జెస్",
    }
  | CUSTOMER_TIP => {text: "గ్రాహక సూచన *"}
  | SERVICE_CHARGES => {text: "సేవ ఛార్జెస్"}
  | RIDE_GST => {text: "రైడ్ జిఎస్టి (5%)"}
  | PLATFORM_FEE => {text: "ప్లాట్‌ఫారం ఫీ"}
  | TAXES => {text: "పన్నులు (జిఎస్టి)"}
  | CANCELLATION_DUES => {text: "రద్దు ఛార్జెస్"}
  | TOLL_CHARGES => {text: "టోల్ ఛార్జెస్"}
  | DISTANCE_BASED_CHARGES => {text: "దూరం ఆధారిత ఛార్జెస్"}
  | TIME_BASED_CHARGES => {text: "సమయం ఆధారిత ఛార్జెస్"}
  | EXTRA_TIME_CHARGES => {text: "అతిరించిన సమయ ఛార్జెస్"}
  | CUSTOMER_TIP_INFO => {
      text: "* గ్రాహకుడి సేవ అందించే అదనపు మొత్తం.",
    }
  | WAIT_CHARGE_INFO => {
      text: "* మొదటి 3 నిమిషాలలో వెలిపియునప్పుడు వెలిపియున ఛార్జ్ గర్లాంస్. అందువల్ల మినటు వేళ సమయం {Amount} అంశాలు వెలిపియున గడుపుతుంది.",
    }
  | IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION => {
      text: "మీ లావాదేవీల చరిత్ర గురించి ప్రశ్నలు ఉంటే, సవరణలు అవసరం ఉంటే లేదా ఏదైనా సమాచారం గురించి వాదన చేయాలనుకుంటే, దయచేసి మమ్మల్ని సంప్రదించండి.",
    }
  | CALL_SUPPORT => {text: "సపోర్ట్‌కి కాల్ చేయండి"}
  | CALL_CUSTOMER_SUPPORT => {
      text: "కస్టమర్ సపోర్ట్‌కి కాల్ చేయండి",
    }
  | YOUR_LATEST_LOCATION => {text: "మీ తాజా స్థానం"}
  | YOUR_VEHICLE_INFO => {text: "మీ వాహన సమాచారం"}
  | PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION => {
      text: "దయచేసి ఆపరేటర్‌కి మీ స్థానాన్ని ఇవ్వండి - యాప్ స్వయంచాలకంగా స్థానాన్ని పంచుకోదు.",
    }
  | EMERGENCY_ASSISTANCE => {text: "అత్యవసర సహాయం"}
  | CALL(number) => {text: `కాల్ చేయండి ${number}`}
  | PRICING_BRIDGE_MINI => {text: "ధర - బ్రిడ్జ్ మినీ"}
  | PER_MILE_FARE => {text: "ప్రతి మైలు ధర"}
  | PER_MINUTE_FARE => {text: "నిమిషానికి ధర"}
  | OTHER_CHARGES => {text: "ఇతర ఛార్జీలు"}
  | PER_MILE => {text: "/మై"}
  | PER_MIN => {text: "/మై"}
  | DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(multiplier, from, till) => {
      text: `పగటిపూట ${multiplier}x ఛార్జీలు రాత్రికి ${from} నుండి ${till} వరకు వర్తిస్తాయి`,
    }
  | DELETE_ACCOUNT => {text: "ఖాతాను తొలగించండి"}
  | ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT => {
      text: "మీరు ఖాతాను తొలగించాలనుకుంటున్నారని మీరు ఖచ్చితంగా భావిస్తున్నారా?",
    }
  | CANCEL => {text: "రద్దు చేయండి"}
  | SORRY_TO_HEAR_YOU_GO => {
      text: "మీరు వెళ్తున్నారని విని విచారం!",
    }
  | YOUR_PREFERENCE_HAS_BEEN_NOTED => {
      text: "మీరు చెప్పిన అంశాలు గమనించబడ్డాయి మరియు త్వరలో వాటిపై చర్యలు తీసుకుంటారు. మేము మిమ్మల్ని త్వరలో తిరిగి సేవించడానికి ఆశిస్తున్నాము.",
    }
  | OKAY => {text: "అలాగే"}
  | ADDRESS => {text: "చిరునామా"}
  | CHOOSE_TAG => {text: "ట్యాగ్ ఎంచుకోండి"}
  | CURRENT_LOCATION => {text: "ప్రస్తుత స్తలం"}
  | SEARCH_FOR_AREA => {
      text: "ప్రాంతం, వీధి పేరు కోసం శోధించండి...",
    }
  | OTHER_FAVOURITES => {text: "ఇతర ఫేవరైట్స్"}
  | DELETE_FAVOURITE => {text: "ఫేవరైట్ తొలగించండి"}
  | TYPE_NAME_FOR_LOCATION => {
      text: "స్థానానికి పేరు టైప్ చేయండి",
    }
  | ADD_FAVOURITE => {text: "ఫేవరైట్ జోడించండి"}
  | EDIT_FAVOURITE => {text: "ఫేవరైట్ ఎడిట్ చేయండి"}
  | NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE => {
      text: "చూపించడానికి ఫేవరైట్లు లేవు. కొనసాగించడానికి ఒకటి జోడించండి...",
    }
  | HOME => {text: "ఇల్లు"}
  | WORK => {text: "పని"}
  | ADD_ADDRESS => {text: "చిరునామా జోడించండి"}
  | INVOICE => {text: "ఇన్వాయిస్"}
  | RIDE_DETAILS => {text: "ప్రయాణ వివరాలు"}
  | YOUR_RECENT_RIDE => {text: "మీ తాజా ప్రయాణం"}
  | ALL_TOPICS => {text: "అన్ని అంశాలు"}
  | REPORT_AN_ISSUE_WITH_THIS_RIDE => {
      text: "ఈ ప్రయాణంతో ఒక సమస్యను నివేదించండి",
    }
  | VIEW_ALL_RIDES => {text: "అన్ని ప్రయాణాలను చూడండి"}
  | DESCRIBE_YOUR_ISSUE(appName) => {
      text: `మీ సమస్యను వివరించండి. ${appName} దానిని 24 గంటలలోపు పరిష్కరించడానికి ప్రయత్నిస్తుంది.`,
    }
  | ENTER_YOUR_TEXT_HERE => {
      text: "ఇక్కడ మీ వచనాన్ని నమోదు చేయండి",
    }
  | ALL_RIDES => {text: "అన్ని రైడ్‌లు"}
  | NO_RIDE_HISTORY_AVAILABLE => {
      text: "రైడ్ చరిత్ర అందుబాటులో లేదు",
    }
  | YOU_HAVE_NOT_TAKEN_A_RIDE_YET => {
      text: "మీరు ఇప్పటివరకు ఎటువంటి రైడ్ చేయలేదు",
    }
  | SEARCH => {text: "వెతకండి"}
  | MESSAGE => {text: "సందేశం"}
  | SUBMIT_ISSUE_DETAILS => {
      text: "సమస్య వివరాలను సమర్పించండి",
    }
  | ARE_YOU_SURE_YOU_WANT_TO_LOGOUT => {
      text: "మీరు లాగౌట్ చేయాలనుకుంటున్నారా?",
    }
  | RIDE_SHARE_INFO => {text: "రైడ్ షేర్ సమాచారం"}
  | ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS => {
      text: "తవాళ్ల సమీక్షలతో స్థానం మరియు రైడ్ వివరాలను పంచుకోవడానికి పరిచయాలను జోడించండి",
    }
  | ADD_A_CONTACT => {text: "\uFF0B పరిచయం జోడించండి"}
  | SHARE_RIDE_INFO => {
      text: "రైడ్ సమాచారాన్ని పంచుకోండి",
    }
  | SHARE_LOCATION_AND_RIDE_DETAILS => {
      text: "స్థానం మరియు రైడ్ వివరాలను పంచుకోండి",
    }
  | ADD_EMERGENCY_CONTACTS => {
      text: "అత్యవసర పరిచయాలను జోడించండి",
    }
  | CONTACTS_SELECTED(selected, limit) => {
      text: `${selected}/${limit} పరిచయాలు ఎంచుకోబడ్డాయి`,
    }
  | SEARCH_CONTACTS => {text: "పరిచయాలను శోధించండి"}
  | CONFIRM_EMERGENCY_CONTACTS => {
      text: "అత్యవసర పరిచయాలను నిర్ధారించండి",
    }
  | LOCATION_ACCESS_HEADER => {text: "స్థానం ప్రవేశం"}
  | LOCATION_ACCESS_INFO => {
      text: "మీ స్థానాన్ని పంచుకోవడానికి మా యాప్ కోసం స్థానం ప్రవేశం అవసరం.",
    }
  | NOTIFICATION_ACCESS_HEADER => {text: "నోటిఫికేషన్ ప్రవేశం"}
  | NOTIFICATION_ACCESS_INFO => {
      text: "మీకు నోటిఫికేషన్‌లు ప్రాప్తి చేయడానికి మా యాప్ కోసం నోటిఫికేషన్ ప్రవేశం అవసరం.",
    }
  | ALLOW => {text: "అనుమతించు"}
  | DENY => {text: "తప్పు"}
  | RIDE_VERIFICATION => {text: "రైడ్ నిర్ధారణ"}
  | USE_PIN_TO_VERIFY_RIDE => {
      text: "రైడ్‌ను నిర్ధారించడానికి పిన్‌ని ఉపయోగించండి",
    }
  | REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES => {
      text: "మీ రైడ్‌లను ప్రారంభించడానికి మీ డ్రైవర్‌తో రైడ్ ప్రారంభ పిన్‌ని పంచుకోవాలి. ఇది మీరు సరైన డ్రైవర్‌తో కనెక్ట్ అయ్యారని నిర్ధారిస్తుంది.",
    }
  | DONE => {text: "పూర్తయింది"}
  | TRUSTED_CONTACTS => {text: "నమ్మకమైన కాంటాక్ట్స్"}
  | ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT => {
      text: "✨ లైవ్ ట్రాకింగ్ మరియు ఇన్-యాప్ చాట్‌ను ప్రారంభించండి",
    }
  | TRUSTED_CONTACT_CAN_FOLLOW_YOUR_RIDE => {
      text: "నమ్మకమైన కాంటాక్ట్స్ మీ రైడ్‌ను అనుసరించవచ్చు, యాప్‌లో చాట్ చేయవచ్చు మరియు అత్యవసర పరిస్థితుల్లో మిమ్మల్ని సహాయం చేయవచ్చు",
    }
  | SAFETY_SETUP => {text: "సేఫ్టీ సెటప్"}
  | COMPLETE(str) => {text: `${str} పూర్తయింది`}
  | ALL_RIDES_SHARED_AUTOMATICALLY => {
      text: "అన్ని రైడ్‌లు స్వయంచాలకంగా పంచబడ్డాయి",
    }
  | NIGHT_RIDES_SHARED_AUTOMATICALLY => {
      text: "రాత్రి రైడ్‌లు స్వయంచాలకంగా పంచబడ్డాయి (సాయంత్రం 6 - ఉదయం 9)",
    }
  | I_WILL_SHARE_RIDES_MANUALLY => {
      text: "నేను రైడ్‌లను మాన్యువల్‌గా పంచుకుంటాను",
    }
  | SHARE_RIDE_OPTIONS => {text: "రైడ్ షేర్ ఎంపికలు"}
  | LIVE_RIDE_TRACKING => {text: "లైవ్ రైడ్ ట్రాకింగ్"}
  | YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS => {
      text: "మీ నమ్మకమైన కాంటాక్ట్స్ కోసం లైవ్ ట్రాకింగ్ యొక్క స్వయంచాలక పంచుకోవడం సెటప్ చేయవచ్చు",
    }
  | YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON => {
      text: "మీరు షేర్ బటన్ ఉపయోగించి ఎవరితోనైనా మాన్యువల్‌గా పంచుకోవచ్చు",
    }
  | ADD_CONTACTS => {text: "కాంటాక్ట్స్‌ని జోడించండి"}
  | ESTIMATES_HAS_BEEN_EXPIRED => {
      text: "అంచనాల గడువు ముగిసింది. మళ్లీ పొందుతోంది, దయచేసి ఒక క్షణం వేచి ఉండి, మళ్లీ తనిఖీ చేయండి.",
    }
  | YAY_REACHED_DESTINATION_IN_JUST => {
      text: "యే! మీ గమ్యస్థానం కేవలం {time} లో చేరింది",
    }
  | RIDE_TIME => {text: "రైడ్ సమయం"}
  }
