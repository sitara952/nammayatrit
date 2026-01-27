// Define JSON-compatible types
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
    [key: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

export const convertToTargetType = <T extends JSONObject>(input: JSONObject, target: T): T | null => {
    for (const key in target) {
        if (!(key in input)) {
            console.error(`Key "${key}" is missing.`);
            return null;
        }
        if (typeof input[key] !== typeof target[key]) {
            console.error(
                `Key "${key}" has invalid type. Expected "${typeof target[key]}", got "${typeof input[key]}".`,
            );
            return null;
        }
    }
    return input as T;
};
