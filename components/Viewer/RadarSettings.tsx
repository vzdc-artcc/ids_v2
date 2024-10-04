'use client';
import React, {useEffect, useState} from 'react';
import {Radar} from "@prisma/client";
import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {toast} from "react-toastify";
import {socket} from "@/lib/socket";
import {fetchAllRadars, updateNotams, updateRadarSplit} from "@/actions/radar";

export default function RadarSettings() {

    const [allRadars, setAllRadars] = useState<Radar[]>();
    const [selectedRadar, setSelectedRadar] = useState<Radar | null>(null);
    const [radarSplit, setRadarSplit] = useState<string[]>(selectedRadar?.radarSplit || []);
    const [notams, setNotams] = useState<string[]>(selectedRadar?.notams || []);

    useEffect(() => {
        if (!allRadars) fetchAllRadars().then(setAllRadars);
        if (selectedRadar) {
            setRadarSplit(selectedRadar.radarSplit);
            setNotams(selectedRadar.notams);
        }
    }, [allRadars, selectedRadar]);

    const saveRadarSplit = async () => {
        const radar = await updateRadarSplit(selectedRadar?.id || '', radarSplit);

        toast.success('Radar Split updated successfully');
        socket.emit(`${radar.facilityId}-radar-split`, radar.radarSplit);
    }

    const saveNotams = async () => {
        const radar = await updateNotams(selectedRadar?.id || '', notams);

        toast.success('NOTAMs updated successfully');
        socket.emit(`${radar.facilityId}-notam`, radar.notams);
    }

    const handleRadarSplitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRadarSplit(event.target.value.split('\n'));
    };

    const handleNotamsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotams(event.target.value.split('\n'));
    };

    if (!allRadars) {
        return <CircularProgress/>;
    }

    return (
        <Stack direction="column" spacing={2} sx={{mx: 2}}>
            <Card>
                <CardContent>
                    <Autocomplete
                        options={allRadars}
                        getOptionLabel={(option) => option.facilityId}
                        value={selectedRadar}
                        onChange={(event, newValue) => setSelectedRadar(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Radar" variant="outlined"/>}
                    />
                    <Button variant="contained" size="small" sx={{mt: 2}} onClick={() => {
                        setSelectedRadar(null);
                        setAllRadars(undefined);
                    }}>Refresh Radars</Button>
                    <Typography>Use this if radar information is not in sync with what is in the IDS.</Typography>
                </CardContent>
            </Card>
            {selectedRadar && (
                <>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{selectedRadar.facilityId} Information</Typography>
                            <TextField
                                label="Radar Split"
                                placeholder="Separate each entry with a new line"
                                helperText="This will be communicated to all local controllers that are attached to this radar facility."
                                variant="outlined"
                                value={radarSplit.join('\n')}
                                onChange={handleRadarSplitChange}
                                fullWidth
                                multiline
                                sx={{mb: 1}}
                            />
                            <Button variant="contained" onClick={saveRadarSplit} sx={{mb: 2}}>Save Radar Split</Button>
                            <TextField
                                label="NOTAMs"
                                placeholder="Separate each NOTAM with a new line"
                                variant="outlined"
                                value={notams.join('\n')}
                                onChange={handleNotamsChange}
                                fullWidth
                                multiline
                                sx={{mb: 1}}
                            />
                            <Button variant="contained" onClick={saveNotams}>Save NOTAMs</Button>
                        </CardContent>
                    </Card>
                </>
            )}
        </Stack>
    );
}