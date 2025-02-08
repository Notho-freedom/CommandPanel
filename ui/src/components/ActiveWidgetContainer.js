// src/components/ActiveWidgetContainer.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';

const ActiveWidgetContainer = ({ isVisible, ActiveWidgetComponent }) => {
    const widgetVariants = {
        hidden: { opacity: 0, x: '10rem' },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className='text-xs overflow-hidden'
                >
                    <Box style={{ padding: '1rem' }} className={`${isVisible ? 'right-10  fixed text-white top-20 p-4 shadow-2xl shadow-black rounded h-5/6  flex flex-col py-1 overflow-x-hidden overflow-y-auto transition-all duration-300 text-xs w-5/6' : 'w-0'}`}>
                        <ActiveWidgetComponent /> {/* Affiche le composant en utilisant PascalCase */}
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActiveWidgetContainer;
