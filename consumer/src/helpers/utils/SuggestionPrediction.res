open ConfigManager
@genType
type suggestions = {
  key: string,
  value: array<string>,
}

@genType
type suggestionRecord = {
  message: string,
  key: string,
}

let getSuggestionFromRC = () => {
  let data = try {
    Some(
      ConfigManager.getString("chat_suggestions")
      ->JSON.parseExn
      ->Utils.getDictFromJson
      ->Dict.toArray
      ->Array.map(v => {
        let (key, value) = v
        {
          key,
          value: value
          ->Utils.getArrayFromJson([])
          ->Array.map(v => v->Utils.getStringFromJson("")),
        }
      }),
    )
  } catch {
  | _ => None
  }
  data
}

let getSuggestions: array<suggestions> = [
  {key: "customerInitialAP", value: ["cis1AP", "cis2AP", "cis3AP"]},
  {key: "cis1AP", value: ["cis1dr1AP", "cis1dr2AP"]},
  {key: "cis2AP", value: ["cis2dr1AP", "cis2dr2AP"]},
  {key: "cis3AP", value: ["cis3dr1AP", "cis3dr2AP"]},
  {key: "cis1dr1AP", value: ["cis1dr1cs1AP", "cis1dr1cs2AP"]},
  {key: "cis1dr2AP", value: ["cis1dr2cs1AP", "cis1dr2cs2AP"]},
  {key: "cis2dr1AP", value: ["cis2dr1cs1AP", "cis2dr1cs2AP"]},
  {key: "cis2dr2AP", value: ["cis2dr2cs1AP", "cis2dr2cs2AP"]},
  {key: "customerInitialBP", value: ["cis1BP", "cis2BP", "cis3BP", "cis4BP"]},
  {key: "cis1BP", value: ["cis1dr1BP", "cis1dr2BP", "cis1dr3BP", "cis1dr4BP"]},
  {key: "cis2BP", value: ["cis2dr1BP", "cis2dr2BP", "cis2dr3BP", "cis2dr4BP"]},
  {key: "cis3BP", value: ["cis3dr1BP", "cis3dr2BP", "cis3dr3BP", "cis3dr4BP"]},
  {key: "cis4BP", value: ["cis4dr1BP", "cis4dr2BP", "cis4dr3BP", "cis4dr4BP"]},
  {key: "cis1dr1BP", value: ["cis1dr1cs1BP", "cis1dr1cs2BP"]},
  {key: "cis1dr2BP", value: ["cis1dr2cs1BP", "cis1dr2cs2BP"]},
  {key: "cis1dr3BP", value: ["cis1dr3cs1BP", "cis1dr3cs2BP"]},
  {key: "cis1dr4BP", value: ["cis1dr4cs1BP", "cis1dr4cs2BP"]},
  {key: "cis2dr1BP", value: ["cis2dr1cs1BP", "cis2dr1cs2BP"]},
  {key: "cis2dr2BP", value: ["cis2dr2cs1BP", "cis2dr2cs2BP"]},
  {key: "cis2dr3BP", value: ["cis2dr3cs1BP", "cis2dr3cs2BP"]},
  {key: "cis2dr4BP", value: ["cis2dr4cs1BP", "cis2dr4cs2BP"]},
  {key: "cis3dr1BP", value: ["cis3dr1cs1BP", "cis3dr1cs2BP"]},
  {key: "cis3dr2BP", value: ["cis3dr2cs1BP", "cis3dr2cs2BP"]},
  {key: "cis3dr3BP", value: ["cis3dr3cs1BP", "cis3dr3cs2BP"]},
  {key: "cis3dr4BP", value: ["cis3dr4cs1BP", "cis3dr4cs2BP"]},
  {key: "cis4dr1BP", value: ["cis4dr1cs1BP", "cis4dr1cs2BP"]},
  {key: "cis4dr2BP", value: ["cis4dr2cs1BP", "cis4dr2cs2BP"]},
  {key: "cis4dr3BP", value: ["cis4dr3cs1BP", "cis4dr3cs2BP"]},
  {key: "cis4dr4BP", value: ["cis4dr4cs1BP", "cis4dr4cs2BP"]},
  {key: "customerDefaultAP", value: ["cds1AP", "cds2AP"]},
  {key: "customerDefaultBP", value: ["cds1BP", "cds2BP"]},
  {key: "driverInitialAP", value: ["dis1AP", "dis2AP", "dis3AP"]},
  {key: "dis1AP", value: ["dis1cr1AP", "dis1cr2AP", "dis1cr3AP"]},
  {key: "dis2AP", value: ["dis2cr1AP", "dis2cr2AP", "dis2cr3AP"]},
  {key: "dis3AP", value: ["dis3cr1AP", "dis3cr2AP"]},
  {key: "dis1cr1AP", value: ["dis1cr1ds1AP", "dis1cr1ds2AP"]},
  {key: "dis1cr2AP", value: ["dis1cr2ds1AP"]},
  {key: "dis1cr3AP", value: ["dis1cr3ds1AP", "dis1cr3ds2AP"]},
  {key: "dis2cr1AP", value: ["dis2cr1ds1AP", "dis2cr1ds2AP"]},
  {key: "dis2cr2AP", value: ["dis2cr2ds1AP"]},
  {key: "dis2cr3AP", value: ["dis2cr3ds1AP", "dis2cr3ds2AP"]},
  {key: "driverInitialBP", value: ["dis1BP", "dis2BP", "dis3BP", "dis4BP"]},
  {key: "dis1BP", value: ["dis1cr1BP", "dis1cr2BP", "dis1cr3BP"]},
  {key: "dis2BP", value: ["dis2cr1BP", "dis2cr2BP", "dis2cr3BP"]},
  {key: "dis3BP", value: ["dis3cr1BP", "dis3cr2BP", "dis3cr3BP"]},
  {key: "dis4BP", value: ["dis4cr1BP", "dis4cr2BP", "dis4cr3BP"]},
  {key: "dis1cr1BP", value: ["dis1cr1ds1BP", "dis1cr1ds2BP"]},
  {key: "dis1cr2BP", value: ["dis1cr2ds1BP", "dis1cr2ds2BP"]},
  {key: "dis1cr3BP", value: ["dis1cr3ds1BP", "dis1cr3ds2BP"]},
  {key: "dis2cr1BP", value: ["dis2cr1ds1BP", "dis2cr1ds2BP"]},
  {key: "dis2cr2BP", value: ["dis2cr2ds1BP", "dis2cr2ds2BP"]},
  {key: "dis2cr3BP", value: ["dis2cr3ds1BP", "dis2cr3ds2BP"]},
  {key: "dis3cr1BP", value: ["dis3cr1ds1BP", "dis3cr1ds2BP"]},
  {key: "dis3cr2BP", value: ["dis3cr2ds1BP", "dis3cr2ds2BP"]},
  {key: "dis3cr3BP", value: ["dis3cr3ds1BP", "dis3cr3ds2BP"]},
  {key: "dis4cr1BP", value: ["dis4cr1ds1BP", "dis4cr1ds2BP"]},
  {key: "dis4cr2BP", value: ["dis4cr2ds1BP", "dis4cr2ds2BP"]},
  {key: "dis4cr3BP", value: ["dis4cr3ds1BP", "dis4cr3ds2BP"]},
  {key: "driverOverlayDefaultAP", value: ["dols1AP", "dols2AP", "dols3AP"]},
  {key: "driverOverlayDefaultBP", value: ["dols1BP", "dols2BP", "dols3BP"]},
  {key: "driverDefaultAP", value: ["dds1AP", "dds2AP", "dds3AP"]},
  {key: "driverDefaultBP", value: ["dds1BP", "dds2BP", "dds3BP"]},
]
