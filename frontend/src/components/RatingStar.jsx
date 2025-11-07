// src/components/RatingStars.jsx
import React from 'react';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';

export default function RatingStar({
    value = 0,
    editable = false,
    precision = 1,
    onChange,
    size = 'medium'
}) {

    const numericValue = (typeof value === 'number' && !Number.isNaN(value)) ? value : 0;

    const handleChange = (event, newValue) => {
        const normalized = (typeof newValue === 'number') ? newValue : 0;
        if (onChange) onChange(normalized);
    };

    return (
        <Stack spacing={1}>
            <Rating
                name="rating-controlled"
                value={numericValue}
                precision={precision}
                readOnly={!editable}
                onChange={handleChange}
                size={size}
            />
        </Stack>
    );
}
