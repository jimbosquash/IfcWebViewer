
import { supabase } from '../supabase';
import * as OBC from "@thatopen/components";
import * as FRAG from "@thatopen/fragments";

const publicTeam = `52193435-a1f2-46d5-896f-39e72da8e5df`;

export interface IfcFile {
    id: string; // uuid 
    name: string;
    description: string;
    created_at: string;
}

export interface PublicFilesResponse {
    data: any[] | any | null; // Replace `any` with the actual type of your table rows if possible
    error: string | null;
}

export const fetchPublicFiles = async (): Promise<PublicFilesResponse> => {
    try {
        const { data, error } = await supabase
            .from('data_table') // Replace with your table name
            .select('*');

        if (error) {
            // If there's an error, return it as a string
            return { data: null, error: error.message };
        }

        // Return data if successful
        return { data, error: null };
    } catch (err: any) {
        // Catch unexpected errors and return them
        return { data: null, error: err.message || 'An unknown error occurred' };
    }
};

const fetchDataTableRowById = async (id: string, columnId: string) => {
    try {
        const { data, error } = await supabase
            .from('data_table') // Replace with your table name
            .select('*') // Specify columns or use '*' for all
            .eq(columnId, id) // Match the UUID
            .single(); // Ensure exactly one row is returned

        if (error) {
            console.error('Error fetching row:', error.message);
            return null;
        }

        console.log('Row data:', data);
        return data;
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};



export async function fetchFragment(
    fileData: IfcFile,
    components: OBC.Components
): Promise<FRAG.FragmentsGroup | null> {
    try {
        // Fetch metadata for the file from your table
        const data = await fetchDataTableRowById(fileData.id, 'id');
        if (!data) {
            console.error('No data found for the given file ID:', fileData.id);
            return null;
        }

        console.log('Data found:', data);
        console.log('Fragments URL:', data.frag_file_url);
        console.log('Properties URL:', data.prop_file_url);

        // Download fragment file from Supabase storage
        const { data: listData, error } = await supabase.storage.from('fragments-bucket').list('public'); // List all items

        if (error) throw error;

        console.log('list', listData)

        const trimmedFragmentPath = data.frag_file_url.split('/').slice(1).join('/');
        const trimmedPropertiesPath = data.prop_file_url.split('/').slice(1).join('/');
        const fragment = await supabase.storage.from('fragments-bucket').download(trimmedFragmentPath);
        const properties = await supabase.storage.from('fragments-bucket').download(trimmedPropertiesPath);

        if (fragment.error || properties.error) {
            console.error('Error downloading fragment file:', fragment.error?.message ?? properties.error?.message);
            return null;
        }

        if (fragment.data && properties.data) {
            // Convert Blob to ArrayBuffer and then to Uint8Array
            const arrayBuffer = await fragment.data.arrayBuffer();
            const rawData = new Uint8Array(arrayBuffer);

            // Load the fragments using the provided components
            const fragmentsManager = components.get(OBC.FragmentsManager);
            const loadedFragment = fragmentsManager.load(rawData);

            const json = transformToIfcProperties(await blobToJson(properties.data));
            console.log('properties', json)

            loadedFragment.setLocalProperties(json)

            console.log('Loaded fragment:', loadedFragment);

            // Return the loaded fragment group
            return loadedFragment;
        }

        console.error('No data available in the downloaded Blob');
        return null;
    } catch (error: any) {
        // Handle unexpected errors
        console.error('Unexpected error:', error.message || error);
        return null;
    }
}

async function blobToJson(blob: Blob): Promise<any> {
    const text = await blob.text(); // Convert Blob to string
    return JSON.parse(text);       // Parse string to JSON
}


function transformToIfcProperties(json: any): FRAG.IfcProperties {
    // Validate the top-level structure is an object
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
        throw new Error("Invalid JSON structure for IfcProperties.");
    }

    const result: FRAG.IfcProperties = {};

    for (const key in json) {
        // Validate each key is a valid number (expressID)
        if (!Number.isInteger(Number(key))) {
            throw new Error(`Invalid expressID: ${key}`);
        }

        const expressID = Number(key);
        const attributes = json[key];

        // Validate each value is an object (attribute structure)
        if (typeof attributes !== 'object' || attributes === null || Array.isArray(attributes)) {
            throw new Error(`Invalid attributes for expressID ${expressID}`);
        }

        // Ensure attributes conform to the expected structure
        result[expressID] = attributes; // TypeScript will enforce this
    }

    return result;
}


export async function uploadFragment(fragmentsGroup: FRAG.FragmentsGroup, components: OBC.Components): Promise<PublicFilesResponse> {
    const fragments = components.get(OBC.FragmentsManager);

    const properties = fragmentsGroup.getLocalProperties();
    if (!properties) {
        return { data: undefined, error: null };
    }

    try {
        const auth = await supabase.auth?.getUser();
        if (!auth) {
            return { data: undefined, error: null };
        }
        const fragData = fragments.export(fragmentsGroup);
        const fileName = fragmentsGroup.name + ".frag";
        const filePath = `public/` + fileName;

        const fragFile = new File([new Blob([fragData])], filePath);

        // upload frag file
        const { data, error } = await supabase.storage.from('fragments-bucket').upload(filePath, fragFile)

        if (error) {
            // If there's an error, return it as a string
            return { data: null, error: error.message };
        }
        console.log('uploaded fragment to bucket', data.fullPath)

        // upload frag properties file

        const jsonFileName = fragmentsGroup.name + ".json";
        const propFile = new File([JSON.stringify(properties)], jsonFileName);
        const jsonFilePath = `public/` + jsonFileName;

        const { data: propData, error: propError } = await supabase.storage.from('fragments-bucket').upload(jsonFilePath, propFile)
        if (propError) {
            // If there's an error, return it as a string
            return { data: null, error: propError.message };
        }

        // upload data table entry for referencing

        const { data: tableData, error: fragError } = await supabase.from('data_table') // Replace with your storage bucket name
            .insert([{
                file_name: fileName,
                frag_file_url: data.fullPath,
                prop_file_url: propData?.fullPath,
                file_size: fragFile.size,
                created_by: auth.data.user?.id,
                team_id: publicTeam
            }]);

        if (fragError) {
            console.log('error', fragError)
            throw fragError;
        }

        console.log('uploaded entry to data_table', tableData)
        // Return data if successful
        return { data, error: null };
    } catch (err: any) {
        // Catch unexpected errors and return them
        console.log('error', err.message)
        return { data: null, error: err.message || 'An unknown error occurred' };
    }

}
