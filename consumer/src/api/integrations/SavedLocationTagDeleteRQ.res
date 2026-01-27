open APISuccess
open ReactQuery
open SavedLocationTagDelete

module Keys = {
  let all = ["savedLocationTagDelete"]
}
let useSavedLocationTagDelete = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (tag: string) => savedLocationTagDeleteApiCall((tag: string)),
  })
}
