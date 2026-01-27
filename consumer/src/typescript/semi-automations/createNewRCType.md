# Step-by-Step Guide for Adding a New Configuration Type

## Overview
This guide outlines the steps to add a new configuration type to the remote config setup. As an example, we will create a configuration type called `city_onboarding_video_configs`.

## Step 1: Define the New Type
1. **Create a New Type Interface**:
   - In `consumer/src-v2/systems/configs/types.ts`, define the new type interface that represents the configuration structure.
   - Ensure it includes all necessary properties.

   ```typescript
   // consumer/src-v2/systems/configs/types.ts
   export type CityOnboardingVideoConfig = {
       videoUrl: string; // URL of the onboarding video
       duration: number; // Duration of the video in seconds
   };
   ```

## Step 2: Update the Configs Interface
2. **Add the New Type to the Configs Interface**:
   - In the same `types.ts` file, update the `Configs` interface to include the new configuration type.

   ```typescript
   // consumer/src-v2/systems/configs/types.ts
   export interface Configs {
       // ... existing configurations ...
       city_onboarding_video_configs: Record<City, CityOnboardingVideoConfig>; // Add this line
   }
   ```

## Step 3: Create Default Configurations
3. **Define Default Values**:
   - Create a new file `defaultCityOnboardingVideoConfigs.ts` in the `defaults` directory.
   - Define default values for the new configuration based on the cities.

   ```typescript
   // consumer/src-v2/systems/configs/defaults/defaultCityOnboardingVideoConfigs.ts
   import { City } from 'libs/config-types/dist/domain/factors/city';
   import { CityOnboardingVideoConfig } from '../types';

   const defaultCityOnboardingVideoConfig: CityOnboardingVideoConfig = {
       videoUrl: 'https://example.com/default_video.mp4',
       duration: 60,
   };

   export const defaultCityOnboardingVideoConfigs: Record<City, CityOnboardingVideoConfig> = {
       default: defaultCityOnboardingVideoConfig,
       bangalore: defaultCityOnboardingVideoConfig,
       // ... add other cities ...
   };
   ```

## Step 4: Update the Config Manager
4. **Modify the Config Manager**:
   - In `consumer/src-v2/systems/configs/configManager.ts`, parse the new configuration from the parameters.
   - Validate and set defaults for the new configuration.

   ```typescript
   // consumer/src-v2/systems/configs/configManager.ts
   const cityOnboardingVideoConfigs = safeJsonParse(allParams['city_onboarding_video_configs']?.asString(), {
       fallback: {},
       context: 'cityOnboardingVideoConfigs',
   });

   const partialConfigs = {
       // ... existing configs ...
       city_onboarding_video_configs: this.validateOrDefault(
           ConfigsSchema.fields.city_onboarding_video_configs,
           cityOnboardingVideoConfigs,
           defaultConfigs.city_onboarding_video_configs,
       ),
   };
   ```

## Step 5: Update the Schema
5. **Add to the Config Schema**:
   - In `consumer/src-v2/systems/configs/configSchema.ts`, define the schema for the new configuration type.

   ```typescript
   // consumer/src-v2/systems/configs/configSchema.ts
   const CityOnboardingVideoConfigSchema = Record({
       videoUrl: String,
       duration: Number,
   });

   const ConfigsSchema = Record({
       // ... existing schema ...
       city_onboarding_video_configs: Dictionary(CityOnboardingVideoConfigSchema, City),
   });
   ```

## Step 6: Document the Changes
6. **Add Documentation**:
   - Document the new configuration in relevant README files or internal documentation.
   - Include details about the properties and their expected values.

## Step 7: Test the Configuration
7. **Test the New Configuration**:
   - Ensure that the new configuration is correctly parsed and utilized in the application.
   - Write unit tests if necessary to validate the behavior.

## Conclusion
By following these steps, you can efficiently add new types and configurations to your remote config setup. This structured approach will help maintain consistency and reduce the time spent on similar tasks in the future.
