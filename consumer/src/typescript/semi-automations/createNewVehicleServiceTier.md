Adding a New Vehicle/Service Variant: Implementation Guide

1. Enum Definitions (consumer/src/readOnly/api/types/Enums.res)
-----------------------------------------------------------
A. Update ServiceTierType:
   - Add new variant to type definition
   - Modify decodeServiceTierTypeEnumResult
   - Update serviceTypeToString

Example:
```rescript
type t = 
  // ... existing variants
  | NEW_VARIANT_NAME
  | UNKNOWN_SERVICE_TYPE

let decodeServiceTierTypeEnumResult = data => {
  data
  |> Js.Json.decodeString
  |> Belt.Option.flatMap(_, str => {
    switch (str) {
    // ... existing cases
    | "NEW_VARIANT_NAME" => Ok(NEW_VARIANT_NAME)
    | _ => {
        Console.warn("Unknown service tier type received from backend, using UNKNOWN_SERVICE_TYPE as fallback")
        Ok(UNKNOWN_SERVICE_TYPE)
      }
    }
  })
}

let serviceTypeToString = fun
  // ... existing cases
  | NEW_VARIANT_NAME => "NEW_VARIANT_NAME"
  | UNKNOWN_SERVICE_TYPE => "DEFAULT_FALLBACK_NAME"
```

B. Update VehicleVariant:
   - Similar modifications as ServiceTierType
   - Add new variant
   - Implement fallback mechanism

2. Image Mappings (consumer/src/typescript/utils/vehicleImagesMapping.ts)
------------------------------------------------------------------------
```typescript
export const SERVICE_TYPE_MAP: Record<ServiceTierType_serviceTierType, ImageSource> = {
  // ... existing mappings
  NEW_VARIANT_NAME: mtIcAuto, // Use appropriate image
  UNKNOWN_SERVICE_TYPE: mtIcAuto,
};

export const VEHICLE_TYPE_AC_MAP: Record<
  ServiceTierType_serviceTierType,
  { ac: ImageSource; nonAc: ImageSource }
> = {
  // ... existing mappings
  NEW_VARIANT_NAME: { ac: mtIcAuto, nonAc: mtIcAuto },
  UNKNOWN_SERVICE_TYPE: { ac: mtIcAuto, nonAc: mtIcAuto },
};
```

3. Animated Map Pin (consumer/src/typescript/components/AnimatedMapPin.tsx)
--------------------------------------------------------------------------
A. Update getPin function:
```typescript
const getPin = (
  type: IconType,
  vehicleVariant: VehicleVariant_vehicleVariant | undefined,
  // ... other parameters
) => {
  switch (type) {
    // ... existing cases
    case 'NEW_VARIANT_NAME':
      return {
        image: (
          <View style={{ width: 40, height: 40 }}>
            <Image
              source={appropriateNavIcon}
              style={{ width: 40, height: 40 }}
              onLoadEnd={handleVehicleIconLoadEnd}
            />
          </View>
        ),
        anchorHeight: 2,
      };
  }
}
```

B. Update getVehicleImageKeyFromVariant:
```typescript
function getVehicleImageKeyFromVariant(variant: VehicleVariant_vehicleVariant | undefined): string {
  switch (variant) {
    // ... existing cases
    case 'NEW_VARIANT_NAME':
      return 'new_variant_key';
    default:
      return 'default_fallback';
  }
}
```

4. Checklist for Adding a New Variant
-------------------------------------
[ ] Identify new variant name
[ ] Prepare appropriate icons/images
[ ] Update Enums.res
[ ] Add fallback mechanism
[ ] Update image mappings
[ ] Modify AnimatedMapPin component
[ ] Test thoroughly

5. Common Pitfalls to Avoid
---------------------------
- Forgetting to update all relevant enum definitions
- Neglecting fallback mechanisms
- Omitting string conversion methods
- Skipping image mappings

6. Troubleshooting
-----------------
- Verify enum definitions are complete
- Check image mappings
- Confirm backend support
- Ensure all switch statements are updated

7. Example Integration
---------------------
```typescript
const vehicleType = 'NEW_VARIANT_NAME';
const pin = getPin(vehicleType); // Handles new variant
```

IMPORTANT NOTES:
- Always provide a fallback mechanism
- Include warning logs for unknown variants
- Ensure consistency across type definitions
- Perform comprehensive testing
