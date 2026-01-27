open ConfigManager
open Utils
type locale = {
  en: string,
  kn: string,
  hi: string,
  ta: string,
  te: string,
}

@genType
type config = {
  duration: int,
  texts: locale,
  zoomLevel: float,
}

let decodeLocale = (dict): locale => {
  {
    en: getOptionString(dict, "en")->Option.getExn,
    kn: getOptionString(dict, "kn")->Option.getExn,
    hi: getOptionString(dict, "hi")->Option.getExn,
    ta: getOptionString(dict, "ta")->Option.getExn,
    te: getOptionString(dict, "te")->Option.getExn,
  }
}

let defaultLocale = {
  en: "Searching for an awesome ride...",
  kn: "ಒಂದು ಅದ್ಭುತ ಸವಾರಿ ಹುಡುಕುತ್ತಿದೆ...",
  hi: "एक शानदार सवारी की तलाश में...",
  ta: "ஒரு அற்புதமான சவாரியைத் தேடுகிறது...",
  te: "ఒక అద్భుతమైన రైడ్ కోసం వెతుకుతోంది...",
}

let defaultRotatingData: array<config> = [
  {
    duration: 10,
    texts: {
      en: "Finding drivers in close radius.",
      kn: "ಹತ್ತಿರದ ತ್ರಿಜ್ಯದಲ್ಲಿ ಚಾಲಕರನ್ನು ಹುಡುಕುತ್ತಿದೆ.",
      hi: "आस-पास के क्षेत्र में ड्राइवर ढूंढ रहे हैं।",
      ta: "அருகில் உள்ள பகுதியில் டிரைவர்களைக் கண்டுபிடிக்கிறது.",
      te: "సమీప ప్రాంతంలో డ్రైవర్లను కనుగొంటోంది.",
    },
    zoomLevel: 18.0,
  },
  {
    duration: 10,
    texts: {
      en: "Drivers received your request.",
      kn: "ಚಾಲಕರು ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ.",
      hi: "ड्राइवरों को आपका अनुरोध मिल गया है।",
      ta: "டிரைவர்கள் உங்கள் கோரிக்கையைப் பெற்றனர்.",
      te: "డ్రైవర్లు మీ అభ్యర్థనను స్వీకరించారు.",
    },
    zoomLevel: 18.0,
  },
  {
    duration: 10,
    texts: {
      en: "Waiting for drivers to accept.",
      kn: "ಚಾಲಕರು ಸ್ವೀಕರಿಸಲು ಕಾಯುತ್ತಿದೆ.",
      hi: "ड्राइवरों के स्वीकार करने की प्रतीक्षा कर रहे हैं।",
      ta: "டிரைவர்கள் ஏற்றுக்கொள்ள காத்திருக்கிறது.",
      te: "డ్రైవర్లు అంగీకరించడానికి వేచి ఉంది.",
    },
    zoomLevel: 18.0,
  },
  {
    duration: 20,
    texts: {
      en: "Boost your search for quick acceptance.",
      kn: "ತ್ವರಿತ ಸ್ವೀಕಾರಕ್ಕಾಗಿ ನಿಮ್ಮ ಹುಡುಕಾಟವನ್ನು ಹೆಚ್ಚಿಸಿ.",
      hi: "त्वरित स्वीकृति के लिए अपनी खोज को बढ़ावा दें।",
      ta: "விரைவான ஏற்புக்கு உங்கள் தேடலை அதிகரிக்கவும்.",
      te: "త్వరిత అంగీకారం కోసం మీ శోధనను పెంచండి.",
    },
    zoomLevel: 18.0,
  },
  {
    duration: 20,
    texts: {
      en: "Expanding the search radius",
      kn: "ಹುಡುಕಾಟ ವ್ಯಾಪ್ತಿಯನ್ನು ವಿಸ್ತರಿಸುತ್ತಿದೆ",
      hi: "खोज की त्रिज्या का विस्तार कर रहे हैं",
      ta: "தேடல் ஆரத்தை விரிவுபடுத்துகிறது",
      te: "శోధన పరిధిని విస్తరిస్తోంది",
    },
    zoomLevel: 16.0,
  },
  {
    duration: 10,
    texts: {
      en: "More drivers received your request.",
      kn: "ಹೆಚ್ಚಿನ ಚಾಲಕರು ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ.",
      hi: "अधिक ड्राइवरों को आपका अनुरोध मिल गया है।",
      ta: "மேலும் டிரைவர்கள் உங்கள் கோரிக்கையைப் பெற்றனர்.",
      te: "మరింత మంది డ్రైవర్లు మీ అభ్యర్థనను స్వీకరించారు.",
    },
    zoomLevel: 16.0,
  },
  {
    duration: 10,
    texts: {
      en: "Waiting for drivers to accept.",
      kn: "ಚಾಲಕರು ಸ್ವೀಕರಿಸಲು ಕಾಯುತ್ತಿದೆ.",
      hi: "ड्राइवरों के स्वीकार करने की प्रतीक्षा कर रहे हैं।",
      ta: "டிரைவர்கள் ஏற்றுக்கொள்ள காத்திருக்கிறது.",
      te: "డ్రైవర్లు అంగీకరించడానికి వేచి ఉంది.",
    },
    zoomLevel: 16.0,
  },
  {
    duration: 10,
    texts: {
      en: "Wait a moment, found more drivers.",
      kn: "ಒಂದು ಕ್ಷಣ ಕಾಯಿರಿ, ಹೆಚ್ಚಿನ ಚಾಲಕರನ್ನು ಕಂಡುಕೊಂಡಿದೆ.",
      hi: "एक क्षण प्रतीक्षा करें, अधिक ड्राइवर मिले हैं।",
      ta: "சற்று பொறுங்கள், மேலும் டிரைவர்களைக் கண்டுபிடித்துள்ளது.",
      te: "ఒక క్షణం వేచి ఉండండి, మరిన్ని డ్రైవర్లను కనుగొన్నాము.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Sending request to the drivers.",
      kn: "ಚಾಲಕರಿಗೆ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.",
      hi: "ड्राइवरों को अनुरोध भेज रहे हैं।",
      ta: "டிரைவர்களுக்கு கோரிக்கையை அனுப்புகிறது.",
      te: "డ్రైవర్లకు అభ్యర్థనను పంపుతోంది.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Waiting for them to accept.",
      kn: "ಅವರು ಸ್ವೀಕರಿಸಲು ಕಾಯುತ್ತಿದೆ.",
      hi: "उनके स्वीकार करने की प्रतीक्षा कर रहे हैं।",
      ta: "அவர்கள் ஏற்றுக்கொள்ள காத்திருக்கிறது.",
      te: "వారు అంగీకరించడానికి వేచి ఉంది.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Checking with drivers who are getting free.",
      kn: "ಮುಕ್ತವಾಗುತ್ತಿರುವ ಚಾಲಕರೊಂದಿಗೆ ಪರಿಶೀಲಿಸುತ್ತಿದೆ.",
      hi: "जो ड्राइवर्स फ्री हो रहे हैं उनसे जांच कर रहे हैं।",
      ta: "விடுபடும் டிரைவர்களுடன் சரிபார்க்கிறது.",
      te: "ఖాళీగా ఉన్న డ్రైవర్లతో సంప్రదిస్తున్నాము.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Sending request to the drivers.",
      kn: "ಚಾಲಕರಿಗೆ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.",
      hi: "ड्राइवरों को अनुरोध भेज रहे हैं।",
      ta: "டிரைவர்களுக்கு கோரிக்கையை அனுப்புகிறது.",
      te: "డ్రైవర్లకు అభ్యర్థనను పంపుతోంది.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Waiting for them to accept.",
      kn: "ಅವರು ಸ್ವೀಕರಿಸಲು ಕಾಯುತ್ತಿದೆ.",
      hi: "उनके स्वीकार करने की प्रतीक्षा कर रहे हैं।",
      ta: "அவர்கள் ஏற்றுக்கொள்ள காத்திருக்கிறது.",
      te: "వారు అంగీకరించడానికి వేచి ఉంది.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Checking with drivers for one last time.",
      kn: "ಕೊನೆಯದಾಗಿ ಚಾಲಕರೊಂದಿಗೆ ಪರಿಶೀಲಿಸುತ್ತಿದೆ.",
      hi: "आखिरी बार ड्राइवरों से जांच कर रहे हैं।",
      ta: "கடைசி முறையாக டிரைவர்களிடம் சரிபார்க்கிறது.",
      te: "చివరిసారిగా డ్రైవర్లతో చెక్ చేస్తోంది.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Drivers received your request.",
      kn: "ಚಾಲಕರು ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ.",
      hi: "ड्राइवरों को आपका अनुरोध मिल गया है।",
      ta: "டிரைவர்கள் உங்கள் கோரிக்கையைப் பெற்றனர்.",
      te: "డ్రైవర్లు మీ అభ్యర్థనను స్వీకరించారు.",
    },
    zoomLevel: 15.0,
  },
  {
    duration: 10,
    texts: {
      en: "Waiting for drivers to accept.",
      kn: "ಚಾಲಕರು ಸ್ವೀಕರಿಸಲು ಕಾಯುತ್ತಿದೆ.",
      hi: "ड्राइवरों के स्वीकार करने की प्रतीक्षा कर रहे हैं।",
      ta: "டிரைவர்கள் ஏற்றுக்கொள்ள காத்திருக்கிறது.",
      te: "డ్రైవర్లు అంగీకరించడానికి వేచి ఉంది.",
    },
    zoomLevel: 15.0,
  },
]

let getTexts = (dict: Core__Dict.t<Core__JSON.t>, key) => {
  let a = dict->Js.Dict.get(key)

  let b = switch a {
  | Some(data) =>
    // decodeLocale(data)
    switch Js.Json.decodeObject(data) {
    | Some(dict) => decodeLocale(dict)
    | None => defaultLocale
    }
  | None => defaultLocale
  }
  b
}

let decodeToConfig = (dict: Core__Dict.t<Core__JSON.t>) => {
  try {
    Some({
      duration: getOptionInt(dict, "duration")->Option.getExn,
      texts: getTexts(dict, "texts"),
      zoomLevel: getOptionFloat(dict, "zoomLevel")->Option.getExn,
    })
  } catch {
  | _ => None
  }
}

let getConfigFromRC = (city: string): option<array<config>> => {
  let data = try {
    Some(
      ConfigManager.getString("rotating_text")
      ->JSON.parseExn
      ->Utils.getDictFromJson
      ->Dict.get(city)
      ->Option.flatMap(JSON.Decode.array)
      ->Option.getOr([])
      ->Array.filterMap(JSON.Decode.object)
      ->Array.map(dict => {
        let res = decodeToConfig(dict)
        switch res {
        | Some(data) => data
        | None => {duration: 0, texts: defaultLocale, zoomLevel: 18.0}
        }
      }),
    )
  } catch {
  | _ => None
  }
  data
}

let getTextsForDuration = (configs: array<config>, duration: int): locale => {
  switch configs->Array.find(config => duration <= config.duration) {
  | Some(config) => config.texts
  | None => defaultLocale
  }
}

let functionToRotate = defaultData => {
  defaultData->Array.map(text => text)
}

let createRotatingText = (texts: locale, locale): array<string> => {
  switch locale {
  | "kn" => functionToRotate([texts.kn])
  | "hi" => functionToRotate([texts.hi])
  | "ta" => functionToRotate([texts.ta])
  | "te" => functionToRotate([texts.te])
  | _ => functionToRotate([texts.en])
  }
}

let getRotatingData = (city: string, duration: int, locale: string): array<string> => {
  switch getConfigFromRC(city) {
  | Some(configs) => {
      let texts = getTextsForDuration(configs, duration)
      createRotatingText(texts, locale)
    }
  | None => {
      let defaultTexts = defaultLocale
      createRotatingText(defaultTexts, locale)
    }
  }
}

let getRotatingDataFromConfig = (city: string): array<config> => {
  switch getConfigFromRC(city) {
  | Some(configs) => configs
  | None => defaultRotatingData
  }
}
