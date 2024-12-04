import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { IfcFile } from '../../../../utilities/supabaseUtilities';

interface FileCardsProps {
    files: IfcFile[];
    onOpenFile: (file: IfcFile) => void;
    onInspectProperties: (file: IfcFile) => void;
}

const FileCards: React.FC<FileCardsProps> = ({ files, onOpenFile, onInspectProperties }) => {
    return (
        <Grid container spacing={2} margin="8px">
            {files.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{item.name}</Typography>
                            {/* <Typography variant="body2">{item.description}</Typography> */}
                            {/* <Typography variant="caption">{new Date(item.created_at).toLocaleString()}</Typography> */}
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="text"
                                color="secondary"
                                size="small"
                                onClick={() => onOpenFile(item)}
                            >
                                Open File
                            </Button>
                            <Button
                                variant="text"
                                color="secondary"
                                size="small"
                                onClick={() => onInspectProperties(item)}
                            >
                                Properties
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default FileCards;
