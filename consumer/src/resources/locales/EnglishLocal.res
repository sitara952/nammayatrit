let englishLocal = (locale: LocaleStringType.localeString): LocaleStringType.textAndAccObj =>
  switch locale {
  | HEADING => {text: "Heading"}
  | NAME => {text: "Name"}
  | ADD_HOME => {text: "Add Home"}
  | ADD_WORK => {text: "Add Work"}
  | ADD_OTHER => {text: "Add Other"}
  | RECENT => {text: "Recent"}
  | FAVOURITES => {text: "Favourites"}
  | WHERE_ARE_YOU_GOING => {text: "Where are you going?"}
  | MY_RIDES => {text: "My Rides"}
  | Bookings => {text: "Bookings"}
  | SAFETY => {text: "Safety"}
  | HELP_AND_SUPPORT => {text: "Help & Support"}
  | APP_LANGUAGE => {text: "App Language"}
  | PAYMENT => {text: "Payment"}
  | REFER_AND_EARN => {text: "Refer & Earn"}
  | ABOUT => {text: "About"}
  | LOGOUT => {text: "Logout"}
  | PROFILE_COMPLETION => {text: "Profile Completion"}
  | BACK_TO_HOME => {text: "Back to Home"}
  | SPORTS_NEAR_ME => {text: "Sports Near Me"}
  | SET_PIN_ON_MAP => {text: "Set Pin on Map"}
  | NOW => {text: "Now"}
  | CONFIRM_PICKUP_LOCATION => {text: "Confirm Pickup Location"}
  | CONFIRM_DROP_LOCATION => {text: "Confirm Drop Location"}
  | SPECIAL_LOCATION_GATE => {
      text: "Select a designated pickup spot by choosing from the list or dragging the map",
    }
  | CONFIRM_LOCATION => {
      text: "Confirm Location",
    }
  | BOOK_A_RIDE_NOW => {text: "Book a Ride Now"}
  | CHOOSE_YOUR_RIDE => {text: "Choose Your Ride"}
  | BRIDGE_MINI => {text: "Bridge Mini"}
  | BRIDGE_PREMIER => {text: "Bridge Premier"}
  | BRIDGE_XL => {text: "Bridge XL"}
  | FINDING_RIDES_NEAR_YOU => {text: "Finding Rides Near You"}
  | BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE => {
      text: "Bridge is Built for the City by the People!",
    }
  | CANCEL_RIDE => {text: "Cancel Ride"}
  | CANCEL_SEARCH => {text: "Cancel Search"}
  | DONT_CANCEL => {text: "Don't Cancel"}
  | PLEASE_SELECT_A_REASON_FOR_CANCELLATION => {text: "Please Select a Reason for Cancellation"}
  | REQUESTED_WRONG_VEHICLE => {text: "Requested Wrong Vehicle"}
  | CHANGE_OF_PLANS => {text: "Change of Plans"}
  | LONGER_WAIT_TIME => {text: "Longer Wait Time"}
  | OTHER => {text: "Other"}
  | IS_ARRIVING_IN => {text: "Is Arriving In"}
  | RIDE_ACTIONS => {text: "Ride Actions"}
  | SHARE_RIDE => {text: "Share Ride"}
  | SAFETY_TOOLS => {text: "Safety Tools"}
  | RIDE_ESTIMATE => {text: "Ride Estimate"}
  | PAID_VIA => {text: "Paid Via"}
  | TRIP_DETAILS => {text: "Trip Details"}
  | EDIT_ADD => {text: "Edit Add"}
  | ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THE_RIDE => {text: "Are you sure you want to cancel the ride?"}
  | NO_CAR_AVAILABLE => {text: "No Cars available!"}
  | IT_APPEARS_YOU_RE_IN_A_HIGH_DEMAND_AREA => {
      text: "It appears you're in a high-demand area and no drivers are currently available.",
    }
  | GO_HOME => {text: "Go Home"}
  | CONTACT => {text: "Contact"}
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
  | CAB_IS_ARRIVING => {text: "is arriving!"}
  | COLOR => {text: "Color"}
  | VARIANT => {text: "Variant"}
  | REACT_NATIVE_ANIMATIONS => {text: "React Native Animations"}
  | RIDE_DETAILS_SCREEN => {text: "Ride Details Screen"}
  | ENTER_PERSONAL_DETAILS => {text: "Enter Personal Details"}
  | GIVE_PERMISSIONS => {text: "Give Permissions"}
  | CAROUSEL_DEMO => {text: "Carousel Demo"}
  | LOCATION_UNSERVICEABLE => {text: "Location unserviceable"}
  | OFFLINE => {text: "You’re offline"}
  | CHECK_INTERNET => {text: "Please check your internet connection and try again"}
  | TRY_AGAIN => {text: "Try Again"}
  | SOMETHING_WENT_WRONG_FETCHING_THE_RIDES => {
      text: "Something went wrong while fetching the rides.",
    }
  | WE_ARE_NOT_LIVE_IN_YOUR_AREA_ => {
      text: "We are not live in your area yet! \n You can access ride history and other settings from the menu on the top left.",
    }
  | FACING_PROBLEMS_WITH_THE_APP => {text: "Facing problems with the app?"}
  | TAP_HERE_TO_REPORT_ISSUE => {text: "Tap here to report issue"}
  | ENTER_OTP_SCREEN => {text: "Enter Otp Screen"}
  | UNHAPPY => {text: "Unhappy"}
  | HAPPY => {text: "Happy"}
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
  | TRY_ANOTHER_LOCATION => {text: "Try Another Location"}
  | ADD_CARD => {text: "Add Card"}
  | DELETE => {text: "Delete"}
  | DRIVER_MIGHT_BE_ON_HIS_WAY => {
      text: "Driver might be on his way. Do you really want to cancel the ride?",
    }
  | CHANGE_RIDE_TYPE => {text: "Change ride type"}
  | CHANGE_RIDE_TYPE_FOR_BETTER_RIDES => {text: "Change ride type for better rides"}
  | REFER_YOUR_FRIENDS => {text: "Refer your friends"}
  | YOUR_REFERRAL_CODE => {text: "Your Referral Code"}
  | SHARE_AND_REFER => {text: "Share & Refer"}
  | REFERRED_USERS => {text: "Referred Users"}
  | USERS_WHO_DOWNLOAD_THE_APP(appName) => {
      text: `Users who download the ${appName} App and complete their first ride using your referral code will count as a referred user. \n \nThe referral code can be entered at the time of signing up.`,
    }
  | GOT_IT => {text: "Got it"}
  | HAVE_A_REFERRAL_CODE => {text: "Have a Referral Code?"}
  | INVALID_CODE => {text: "Invalid Code!"}
  | APPLY => {text: "Apply"}
  | REFERRAL_CODE_APPLIED_SUCCESSFULLY => {text: "Referral code applied successfully!"}
  | WHAT_IS_THE_REFERRAL_PROGRAM => {text: "What is the Referral Program?"}
  | THE_REFERRAL_PROGRAM_INCENTIVISES(appName) => {
      text: `The referral program incentivises drivers to accept more rides, cancel less and serve you better by recognising and rewarding worthy drivers. \n \nYou can help out by entering the driver’s referral code and improve the quality of rides for the ${appName} Community! \n\nYou can get a referral code from a ${appName} Driver or User.`,
    }
  | ENTER_REFERRAL_CODE_BELOW => {text: "Enter 6 digit referral code below"}
  | DRIVER_IS_WAITING => {text: "Driver is waiting"}
  | DRIVER_ARRIVED => {text: "Driver arrived!"}
  | BRIDGE_TO_DESTINATION => {text: "You're on your way"}
  | APP_DESCRIPTION(appName) => {
      text: `${appName} is an open platform to connect riders with drivers. The app makes 
it convenient for riders to book a ride 
with meter rate hence minimal fare`,
    }
  | TERMS_AND_CONDITIONS => {text: "Terms & Conditions"}
  | PRIVACY_POLICY => {text: "Privacy Policy"}
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
  | BASE_FARE => {text: "Base Fare"}
  | CONGESTION_CHARGE => {text: "Congestion Charge"}
  | OPTIONAL_DRIVER_REQUEST => {text: "Optional Driver Request"}
  | DRIVER_ADDITIONS => {text: "Driver Additions"}
  | TOTAL_FARE => {text: "Total Fare"}
  | PICKUP_CHARGES => {text: "Pickup Charges"}
  | WAITING_CHARGES(star) => {text: `Waiting Charges ${star}`}
  | EARLY_RIDE_END_CHARGES => {text: "Early Ride End Charges"}
  | CUSTOMER_TIP => {text: "Customer Tip *"}
  | SERVICE_CHARGES => {text: "Service Charges"}
  | RIDE_GST => {text: "Ride GST (5%)"}
  | PLATFORM_FEE => {text: "Platform Fee"}
  | TAXES => {text: "Taxes (GST)"}
  | CANCELLATION_DUES => {text: "Cancellation Dues"}
  | TOLL_CHARGES => {text: "Toll Charges"}
  | DISTANCE_BASED_CHARGES => {text: "Distance Based Charges"}
  | TIME_BASED_CHARGES => {text: "Time Based Charges"}
  | EXTRA_TIME_CHARGES => {text: "Extra Time Charges"}
  | CUSTOMER_TIP_INFO => {
      text: "* Extra amount added by the customer for the service provided.",
    }
  | WAIT_CHARGE_INFO => {
      text: "* Waiting charge is zero for the first 3 minutes. You will be charged {Amount} per minute of wait time after that.",
    }
  | IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION => {
      text: "If you have inquiries about your transaction history, need corrections, or wish to dispute any information, please get in touch with us.",
    }
  | CALL_SUPPORT => {text: "Call Support"}
  | CALL_CUSTOMER_SUPPORT => {text: "Call Customer Support"}
  | YOUR_LATEST_LOCATION => {text: "Your latest Location"}
  | YOUR_VEHICLE_INFO => {text: "Your Vehicle Info"}
  | PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION => {
      text: "Please give the operator your location - The app doesn’t share the location automatically.",
    }
  | EMERGENCY_ASSISTANCE => {text: "Emergency Assistance"}
  | CALL(number) => {text: `Call ${number}`}
  | PRICING_BRIDGE_MINI => {text: "Pricing - Bridge Mini"}
  | PER_MILE_FARE => {text: "Per Mile Fare"}
  | PER_MINUTE_FARE => {text: "Per Minute Fare"}
  | OTHER_CHARGES => {text: "Other Charges"}
  | PER_MILE => {text: "/mi"}
  | PER_MIN => {text: "/min"}
  | DAYTIME_CHARGES_APPLICABLE_AT_NIGHT(multiplier, from, till) => {
      text: `${multiplier}x of daytime charges applicable at night from ${from} to ${till}`,
    }
  | ADDRESS => {text: "Address"}
  | CHOOSE_TAG => {text: "Choose Tag"}
  | CURRENT_LOCATION => {text: "Current Location"}
  | DELETE_ACCOUNT => {text: "Delete Account"}
  | ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT => {
      text: "Are you sure you want to delete the account?",
    }
  | CANCEL => {text: "Cancel"}
  | SORRY_TO_HEAR_YOU_GO => {text: "Sorry to hear you go!"}
  | YOUR_PREFERENCE_HAS_BEEN_NOTED => {
      text: "Your preference has been noted and will be actioned upon soon. We do hope to serve you again soon.",
    }
  | OKAY => {text: "Okay"}
  | OTHER_FAVOURITES => {text: "Other favourites"}
  | DELETE_FAVOURITE => {text: "Delete Favourite"}
  | TYPE_NAME_FOR_LOCATION => {text: "Type name for the location"}
  | ADD_FAVOURITE => {text: "Add favourite"}
  | EDIT_FAVOURITE => {text: "Edit favourite"}
  | NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE => {
      text: "No favourites to show. Add one to continue...",
    }
  | HOME => {text: "Home"}
  | WORK => {text: "Work"}
  | ADD_ADDRESS => {text: "Add address"}
  | INVOICE => {text: "Invoice"}
  | RIDE_DETAILS => {text: "Ride Details"}
  | YOUR_RECENT_RIDE => {text: "Your Recent Ride"}
  | ALL_TOPICS => {text: "All Topics"}
  | REPORT_AN_ISSUE_WITH_THIS_RIDE => {text: "Report an issue with this Ride"}
  | VIEW_ALL_RIDES => {text: "View All Rides"}
  | DESCRIBE_YOUR_ISSUE(appName) => {
      text: `Describe your issue. ${appName} will try to resolve it in under 24 hours.`,
    }
  | ENTER_YOUR_TEXT_HERE => {text: "Enter the text here"}
  | SEARCH => {text: "Search"}
  | SEARCH_FOR_AREA => {text: "Search for area, street name..."}
  | ALL_RIDES => {text: "All Rides"}
  | NO_RIDE_HISTORY_AVAILABLE => {text: "No ride history available"}
  | YOU_HAVE_NOT_TAKEN_A_RIDE_YET => {text: "You haven’t taken a ride yet"}
  | MESSAGE => {text: "Message"}
  | SUBMIT_ISSUE_DETAILS => {text: "Submit Issue Details"}
  | ARE_YOU_SURE_YOU_WANT_TO_LOGOUT => {text: "Are you sure you want to logout?"}
  | LOCATION_ACCESS_HEADER => {text: "Allow Location Access"}
  | LOCATION_ACCESS_INFO => {
      text: `To start booking rides, please allow us to find you!${"\n\n"}This permission is required to accurately capture the pickup location.`,
    }
  | ALLOW => {text: "Allow"}
  | DENY => {text: "Deny"}
  | NOTIFICATION_ACCESS_HEADER => {text: "Allow Bridge to Send Notifications"}
  | NOTIFICATION_ACCESS_INFO => {
      text: "Keep up to date with all the alerts and new feature updates!",
    }
  | RIDE_SHARE_INFO => {text: "Ride Share Info"}
  | ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS => {
      text: "Add contacts to share location and ride details with your emergency contacts",
    }
  | ADD_A_CONTACT => {text: "\uFF0B Add a contact"}
  | SHARE_RIDE_INFO => {text: "Share Ride Info"}
  | SHARE_LOCATION_AND_RIDE_DETAILS => {text: "Share Location & Ride Details"}
  | ADD_EMERGENCY_CONTACTS => {text: "Add Emergency Contacts"}
  | CONTACTS_SELECTED(selected, limit) => {text: `${selected}/${limit} Contacts Selected`}
  | SEARCH_CONTACTS => {text: "Search Contacts"}
  | CONFIRM_EMERGENCY_CONTACTS => {text: "Confirm Emergency Contacts"}
  | RIDE_VERIFICATION => {text: "Ride Verification"}
  | USE_PIN_TO_VERIFY_RIDE => {text: "Use PIN to verify ride"}
  | REQUIRES_YOU_TO_SHARE_A_RIDE_START_PIN_WITH_YOUR_DRIVER_TO_START_YOUR_RIDES => {
      text: "Requires you to share a ride start PIN with your driver to start your rides. This ensures you get connected with the right driver.",
    }
  | DONE => {text: "Done"}
  | TRUSTED_CONTACTS => {text: "Trusted Contacts"}
  | ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT => {text: "✨ Enables Live Tracking and In App Chat"}
  | TRUSTED_CONTACT_CAN_FOLLOW_YOUR_RIDE => {
      text: "Trusted contacts can follow your ride, chat on the app & support you in emergencies",
    }
  | SAFETY_SETUP => {text: "Safety Setup"}
  | COMPLETE(str) => {text: `${str} Complete`}
  | ALL_RIDES_SHARED_AUTOMATICALLY => {text: "All rides shared automatically"}
  | NIGHT_RIDES_SHARED_AUTOMATICALLY => {text: "Night rides shared automatically (6PM - 9AM)"}
  | I_WILL_SHARE_RIDES_MANUALLY => {text: "I will share rides manually"}
  | SHARE_RIDE_OPTIONS => {text: "Share Ride Options"}
  | LIVE_RIDE_TRACKING => {text: "Live Ride Tracking"}
  | YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS => {
      text: "You can set up automatic sharing of live tracking for your trusted contacts",
    }
  | YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON => {
      text: "You can also share manually with anybody using the share button",
    }
  | ADD_CONTACTS => {text: "Add Contact"}
  | ESTIMATES_HAS_BEEN_EXPIRED => {
      text: "Estimates has been expired.Fetching again, Please wait a moment and check again.",
    }
  | YAY_REACHED_DESTINATION_IN_JUST => {text: "Yay! Reached destination in just"}
  | RIDE_TIME => {text: "Ride Time"}
  | CAB_IS_LEAVING_SOON => {text: "is leaving soon!"}
  | WAITING_CHARGES_APPLY_NOW => {text: "Waiting charges apply now"}
  | CAB_IS_WAITING_FOR_YOU => {text: "is waiting for you…"}
  | CAB_HAS_ARRIVED => {text: "has arrived!"}
  | IS_ON_THE_WAY => {text: "is on the way!"}
  | IS_YOUR_DRIVER => {text: "is your driver "}
  }
