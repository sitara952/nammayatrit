/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import { api } from './../api';
import { uploadFiles } from 'react-native-fs';
import Config from 'react-native-config';
import { selectToken } from '../client/auth';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import type { RootState } from '../store';
import { setClosestPickupInstruction } from '../client/user';

// Utility function to format coordinates to exactly 9 decimal places for geohash precision
const formatCoordinate = (coord: number | undefined): string => {
    if (coord === undefined || coord === null) {
        return '';
    }
    return coord.toFixed(9);
};

// Local types for the pickup instructions API
export type ClosestPickupInstructionResp = {
    instruction: string | null;
    audioBase64: string | null | undefined;
};

export type APISuccess = {
    result: string;
};

export type pickupInstructionsClosestGetWithParams = {
    lat: number | undefined;
    lon: number | undefined;
};

export type pickupInstructionsPostWithParams = {
    lat: number;
    lon: number;
    instruction: string;
    file: string | undefined; // FilePath for audio file
};

export type DeleteTarget = 'Instruction' | 'Audio';

export type pickupInstructionsDeleteWithParams = {
    lat: number;
    lon: number;
    target: DeleteTarget;
};

export const pickupInstructionsApi = api.injectEndpoints({
    endpoints: build => ({
        // GET /pickupinstructions/closest - Get closest pickup instruction for location
        pickupInstructionsClosestGet: build.query<ClosestPickupInstructionResp, pickupInstructionsClosestGetWithParams>(
            {
                providesTags: ['PickupInstructions'],
                query: ({ lat, lon }) => {
                    // eslint-disable-next-line functional/no-let
                    let url = '/pickupinstructions/closest' + '?';
                    const formattedLat = formatCoordinate(lat);
                    const formattedLon = formatCoordinate(lon);
                    url += formattedLat ? 'lat=' + formattedLat + '&' : '';
                    url += formattedLon ? 'lon=' + formattedLon + '&' : '';
                    return {
                        url,
                        method: 'GET',
                    };
                },
                transformResponse(baseQueryReturnValue: unknown, _meta, _arg): ClosestPickupInstructionResp {
                    console.info('🚗 SAM_DEBUG: Closest pickup instruction response:', baseQueryReturnValue);
                    const response = baseQueryReturnValue as ClosestPickupInstructionResp;
                    // Return new object with trimmed instruction text if it exists
                    return {
                        ...response,
                        instruction: response.instruction ? response.instruction.trim() : response.instruction,
                    };
                },
                async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
                    try {
                        const { data } = await queryFulfilled;
                        console.info('🚗 SAM_DEBUG: Storing closest pickup instruction in Redux:', data);

                        // Get token and dispatch to Redux store
                        const state = getState() as RootState;
                        const token = selectToken(state);

                        dispatch(
                            setClosestPickupInstruction({
                                id: token,
                                payload: data,
                            }),
                        );
                    } catch (error) {
                        console.error('🚗 SAM_DEBUG: Failed to store closest pickup instruction:', error);
                    }
                },
            },
        ),

        // POST /pickupinstructions - Save pickup instructions (with optional media) - multipart
        pickupInstructionsPost: build.mutation<APISuccess, pickupInstructionsPostWithParams>({
            invalidatesTags: ['PickupInstructions'],
            queryFn: async ({ lat, lon, instruction, file }, queryApi) => {
                try {
                    console.info('🚗 SAM_DEBUG: Posting pickup instruction:', {
                        lat,
                        lon,
                        instruction,
                        hasFile: !!file,
                    });

                    // Get token from state using proper selector
                    const state = queryApi.getState() as RootState;
                    const token = selectToken(state);

                    if (!token) {
                        throw new Error('No authentication token available');
                    }

                    if (file) {
                        // Validate file exists and get proper filename
                        const fileParts = file.split('/');
                        const fileName = fileParts[fileParts.length - 1] || 'pickup-audio.mp3';

                        // Ensure the filename has .mp3 extension
                        const finalFileName = fileName.endsWith('.mp3') ? fileName : `${fileName}.mp3`;

                        console.info('🚗 SAM_DEBUG: Using uploadFiles for audio upload - filename:', finalFileName);
                        console.info('🚗 SAM_DEBUG: File path:', file);

                        // Find the actual file path using our improved detection
                        try {
                            const RNFS = require('react-native-fs');

                            // Check if the original file exists
                            const initialFileExists = await RNFS.exists(file);

                            console.info('🚗 SAM_DEBUG: Checking file existence:', {
                                originalPath: file,
                                exists: initialFileExists,
                            });

                            // Determine actual file path and existence
                            const { actualFilePath, fileExists } = await (async () => {
                                if (initialFileExists) {
                                    return { actualFilePath: file, fileExists: true };
                                }

                                // If original doesn't exist, try with double .mp3 extension (common issue)
                                if (!file.endsWith('.mp3.mp3')) {
                                    const doubleExtensionPath = file + '.mp3';
                                    const doubleExtensionExists = await RNFS.exists(doubleExtensionPath);
                                    console.info('🚗 SAM_DEBUG: Trying double extension path:', {
                                        doubleExtensionPath,
                                        exists: doubleExtensionExists,
                                    });

                                    if (doubleExtensionExists) {
                                        return { actualFilePath: doubleExtensionPath, fileExists: true };
                                    }
                                }

                                return { actualFilePath: file, fileExists: false };
                            })();

                            // List files in directory for debugging
                            try {
                                const directory = file.substring(0, file.lastIndexOf('/'));
                                const files = await RNFS.readDir(directory);
                                const audioFiles = files.filter((f: { name: string }) =>
                                    f.name.includes('pickup-instruction-audio'),
                                );
                                console.info(
                                    '🚗 SAM_DEBUG: Audio files in directory:',
                                    audioFiles.map((f: { name: string; path: string; size: number }) => ({
                                        name: f.name,
                                        path: f.path,
                                        size: f.size,
                                    })),
                                );
                            } catch (dirError) {
                                console.warn('🚗 SAM_DEBUG: Could not list directory:', dirError);
                            }

                            if (!fileExists) {
                                throw new Error(`File does not exist at any expected path: ${file} or ${file}.mp3`);
                            }

                            console.info('🚗 SAM_DEBUG: Using actual file path:', actualFilePath);

                            // Use uploadFiles with the correct file path
                            const files = [
                                {
                                    name: 'file',
                                    filename: finalFileName,
                                    filepath: actualFilePath,
                                    filetype: 'audio/mpeg',
                                },
                            ];

                            const uploadResult = await uploadFiles({
                                toUrl: `${Config['BASE_URL']}/pickupinstructions`,
                                files: files,
                                method: 'POST',
                                headers: {
                                    token: token,
                                },
                                fields: {
                                    lat: formatCoordinate(lat),
                                    lon: formatCoordinate(lon),
                                    instruction: instruction.trim(),
                                },
                            }).promise;

                            console.info('🚗 SAM_DEBUG: Upload result:', uploadResult);
                            console.info('🚗 SAM_DEBUG: Upload response body:', uploadResult.body);

                            if (uploadResult.statusCode === 200) {
                                // Try to parse the response body if it exists
                                if (uploadResult.body) {
                                    const parsedBody = safeJsonParse<APISuccess>(
                                        uploadResult.body,
                                        { result: 'fallback' },
                                        'pickup-instructions-upload',
                                    );
                                    if (parsedBody) {
                                        console.info('🚗 SAM_DEBUG: Parsed upload response:', parsedBody);
                                        return { data: parsedBody };
                                    } else {
                                        console.error('🚗 SAM_DEBUG: Failed to parse upload response');
                                        return { data: { result: 'success' } as APISuccess };
                                    }
                                }
                                return { data: { result: 'success' } as APISuccess };
                            } else {
                                console.error('🚗 SAM_DEBUG: Upload failed with body:', uploadResult.body);
                                throw new Error(`Upload failed with status: ${uploadResult.statusCode}`);
                            }
                        } catch (fileError) {
                            console.error('🚗 SAM_DEBUG: File handling error:', fileError);
                            throw new Error(
                                `File handling failed: ${fileError instanceof Error ? fileError.message : String(fileError)}`,
                            );
                        }
                    } else {
                        // For text-only instructions, use fetch with FormData (not JSON)
                        const formData = new FormData();
                        formData.append('lat', formatCoordinate(lat));
                        formData.append('lon', formatCoordinate(lon));
                        formData.append('instruction', instruction.trim());
                        console.info('🚗 SAM_DEBUG: Text-only FormData prepared:', {
                            lat: formatCoordinate(lat),
                            lon: formatCoordinate(lon),
                            instruction,
                        });
                        const response = await fetch(`${Config['BASE_URL']}/pickupinstructions`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                token: token,
                                // Don't set Content-Type - let browser set it with boundary for FormData
                            },
                            body: formData,
                        });

                        console.info('🚗 SAM_DEBUG: Text-only response status:', response.status);
                        console.info('🚗 SAM_DEBUG: Text-only response headers:', response.headers);

                        if (response.ok) {
                            const responseText = await response.text();
                            console.info('🚗 SAM_DEBUG: Text-only response body (raw):', responseText);

                            const data = safeJsonParse<APISuccess>(
                                responseText,
                                { result: 'fallback' },
                                'pickup-instructions-text',
                            );
                            if (data) {
                                console.info('🚗 SAM_DEBUG: Text-only response body (parsed):', data);
                                return { data };
                            } else {
                                console.error('🚗 SAM_DEBUG: Failed to parse JSON response');
                                console.error('🚗 SAM_DEBUG: Raw response text:', responseText);
                                throw new Error(`Invalid JSON response: ${responseText}`);
                            }
                        } else {
                            const errorText = await response.text();
                            console.error('🚗 SAM_DEBUG: Text-only error response:', errorText);
                            throw new Error(`Request failed with status: ${response.status}`);
                        }
                    }
                } catch (error) {
                    console.error('🚗 SAM_DEBUG: Error in pickup instructions post:', error);
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error: error instanceof Error ? error.message : String(error),
                        },
                    };
                }
            },
        }),

        // DELETE /pickupinstructions - Delete specific content from pickup instruction
        pickupInstructionsDelete: build.mutation<APISuccess, pickupInstructionsDeleteWithParams>({
            invalidatesTags: ['PickupInstructions'],
            query: ({ lat, lon, target }) => {
                // eslint-disable-next-line functional/no-let
                let url = '/pickupinstructions' + '?';
                url += 'lat=' + formatCoordinate(lat) + '&';
                url += 'lon=' + formatCoordinate(lon) + '&';
                url += 'target=' + JSON.stringify(target);
                return {
                    url,
                    method: 'DELETE',
                };
            },
            transformResponse(baseQueryReturnValue: unknown, _meta, _arg): APISuccess {
                console.info('🚗 SAM_DEBUG: Delete pickup instruction response:', baseQueryReturnValue);
                return baseQueryReturnValue as APISuccess;
            },
        }),
    }),
    overrideExisting: false,
});

export const {
    usePickupInstructionsClosestGetQuery,
    usePickupInstructionsPostMutation,
    usePickupInstructionsDeleteMutation,
} = pickupInstructionsApi;
