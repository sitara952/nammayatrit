import { location } from '../../../../src/helpers/utils/Location/LocationTypes.gen';

/**
 * Extracts a concise location description for pickup instructions.
 * Uses the location title (main name) as the primary identifier.
 *
 * @param location - The location object containing title and other properties
 * @returns A short descriptive text for the location, or fallback if not available
 *
 * @example
 * getLocationInstructionText({ title: "Indoor Stadium", ... }) => "Indoor Stadium"
 * getLocationInstructionText({ title: "821, 80 Feet Rd", ... }) => "821, 80 Feet Rd"
 * getLocationInstructionText({ title: undefined, ... }) => "Audio Note"
 */
export function getLocationInstructionText(location: location | undefined): string {
    console.info('🎯 getLocationInstructionText - Input location:', {
        location,
        hasLocation: !!location,
        title: location?.title,
        subtitle: location?.subtitle,
        formattedAddress: location?.formattedAddress,
        lat: location?.lat,
        lng: location?.lng,
        placeId: location?.placeId,
        addressComponents: location?.addressComponents,
    });

    // Extract location components
    const title = location?.title?.trim();
    const subtitle = location?.subtitle?.trim();
    const area = location?.addressComponents?.area?.trim();

    console.info('🎯 getLocationInstructionText - Extracted components:', {
        title,
        subtitle,
        area,
        titleLength: title?.length || 0,
        titleWordCount: title?.split(' ').length || 0,
    });

    const result = (() => {
        if (!title) {
            console.info('🎯 getLocationInstructionText - No title available, using fallback:', {
                result: 'Audio Note',
                reason: 'no_title',
            });
            return 'Audio Note';
        }

        // Always try to use title + area format when area is available
        if (area) {
            const enhanced = `${title}, ${area}`;
            console.info('🎯 getLocationInstructionText - Using title + area:', {
                result: enhanced,
                reason: 'title_plus_area',
            });
            return enhanced;
        } else {
            // Use just title if no area available
            console.info('🎯 getLocationInstructionText - Using title only:', {
                result: title,
                reason: 'title_only_no_area',
            });
            return title;
        }
    })();

    console.info('🎯 getLocationInstructionText - Final result:', {
        result,
        usedTitle: !!title,
        usedFallback: result === 'Audio Note',
        enhanced: result !== title && title !== undefined,
    });

    return result;
}
