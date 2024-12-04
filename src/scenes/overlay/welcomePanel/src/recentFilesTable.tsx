import React, { useContext, useEffect, useState } from 'react';
import { fetchFragment, fetchPublicFiles, IfcFile } from '../../../../utilities/supabaseUtilities';
import { AuthContext } from '../../../../context/AuthProvider';
import FileCards from './FileCards';
import { supabase } from '../../../../supabase';
import { useComponentsContext } from '../../../../context/ComponentsContext';
import * as FRAG from "@thatopen/fragments";
import { ModelCache } from '../../../../bim-components/modelCache';

const PublicFilesComponent: React.FC = () => {
    const [files, setFiles] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const Auth = useContext(AuthContext);
    const components = useComponentsContext();

    useEffect(() => {
        const fetchFiles = async () => {
            const response = await fetchPublicFiles();

            if (response.error) {
                setError(response.error);
            } else {
                setFiles(response.data);
            }
        };

        const getUser = async () => {

            const user = await supabase.auth?.getUser();
            if (user.data === undefined) {
            }
            console.log('fetch user session:', user.data)
            setLoggedIn(user.data !== null)
        };

        try {
            getUser();
            fetchFiles();
        }
        catch {

        }



    }, []);

    useEffect(() => {
        console.log('files found', files)
    }, [files]);

    if (error) return <div>Error: {error}</div>;
    if (!files) return <div>Loading...</div>;

    const onOpenFile = async (file: IfcFile): Promise<FRAG.FragmentsGroup | null> => {
        console.log('Opening file:', file.name);
        // Add your logic for opening the file (e.g., displaying in an IFC viewer)
        const loadedFrag = await fetchFragment(file, components)
        if (loadedFrag) {
            // then add to file
            await components.get(ModelCache).add(loadedFrag, new Uint8Array());
        }
        return loadedFrag;
    };

    const onInspectProperties = (file: IfcFile) => {
        // setSelectedFile(file);
        console.log('inspect file:', file.name);

    };

    return (
        <div>
            <h4>Public Files</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loggedIn && <h3>Welcome back {Auth?.user?.email}</h3>}
            {!loggedIn && <h3>login/ signup</h3>}

            {/* {!loggedIn && <Login />} */}
            <FileCards files={files} onOpenFile={onOpenFile} onInspectProperties={onInspectProperties} />
            {/* 
            <Grid container spacing={2} margin={'8px'}>
                {files.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{item.file_name}</Typography>
                                <Typography variant="body2">{item.description}</Typography>
                                <Typography variant="caption">{item.created_at}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid> */}
        </div >
    );
};

export default PublicFilesComponent;
