// src/components/TitleBar.js
import React from 'react';
import Box from '@mui/material/Box';

const TitleBar = ({ onClose }) => {
    return (
        <Box
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#444',
                borderTopLeftRadius: '0.5rem',
                borderTopRightRadius: '0.5rem',
            }}
        >
            <Box style={{ display: 'flex', gap: '0.5rem' }}>
                <Box
                    style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        backgroundColor: '#FF605C',
                        borderRadius: '50%',
                        cursor: 'pointer',
                    }}
                    onClick={onClose}
                />
                <Box
                    style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        backgroundColor: '#FFBD44',
                        borderRadius: '50%',
                    }}
                />
                <Box
                    style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        backgroundColor: '#00CA4E',
                        borderRadius: '50%',
                    }}
                />
            </Box>
        </Box>
    );
};

export default TitleBar;
