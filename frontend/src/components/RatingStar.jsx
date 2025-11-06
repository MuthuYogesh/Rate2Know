import { useState } from "react";
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';

export default function RatingStars({ value = 0, editable = false, onChange }) {
    return (
        <Stack spacing={1}>
            <Rating name="rating" defaultValue={0} precision={0.5} />
        </Stack>
    );
}