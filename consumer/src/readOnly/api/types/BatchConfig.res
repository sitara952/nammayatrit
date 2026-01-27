open Utils

@genType
type batchConfig = {
  batchTime: int,
  batchingExpireAt: string,
  batchingStartedAt: string,
  totalBatches: int,
}

let decodeBatchConfig = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          batchTime: getOptionInt(dict, "batchTime")->Option.getExn(~message="batchTime not found"),
          batchingExpireAt: getOptionString(dict, "batchingExpireAt")->Option.getExn(
            ~message="batchingExpireAt not found",
          ),
          batchingStartedAt: getOptionString(dict, "batchingStartedAt")->Option.getExn(
            ~message="batchingStartedAt not found",
          ),
          totalBatches: getOptionInt(dict, "totalBatches")->Option.getExn(
            ~message="totalBatches not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BatchConfig ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: batchConfig) => {
  req->asJson
}
