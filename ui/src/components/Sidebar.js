import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import menuItems from './menuItems';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { CssBaseline, Tooltip } from '@mui/material';

// Configuration du thème personnalisé
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#805AD5',
    },
    secondary: {
      main: '#6B46C1',
    },
    background: {
      default: '#322659',
      paper: '#44337A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E9D8FD',
    },
  },
});

const Sidebar = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [ActiveWidgetComponent, setActiveWidgetComponent] = useState(null);
    const [activeIcon, setActiveIcon] = useState(null);

    const handleMenuItemClick = (Widget, id) => {
        setActiveWidgetComponent(() => Widget);
        setActiveIcon(id);
    };


    const sidebarVariants = {
        hidden: { width: 0 },
        visible: { width: '2rem', transition: { duration: 0.3 } },
    };

    const buttonVariants = {
        initial: { x: 0 },
        moved: { x: -32, transition: { duration: 0.3 } },
    };

    const widgetVariants = {
        hidden: { opacity: 0, x: '10rem' },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    };

    const iconVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5 },
        }),
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box position="relative" height="100%" className="overflow-hidden">
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={sidebarVariants}
                            style={{
                                position: 'fixed',
                                top: '10%',
                                right: '1%',
                                height: '80%',
                                background: 'linear-gradient(to right, #805AD5, #6B46C1)',
                                borderRadius: '1rem',
                                borderImage: 'linear-gradient(to bottom, cyan 30%, rgba(255, 255, 255, 0)) 1 100%',
                                boxShadow: '0 0 1px 1px cyan, 0 0 10px rgba(0, 0, 0, 0.5)',
                            }}
                            className={`fixed pt-4 right-0 h-full ${isVisible ? 'w-8' : 'w-0'} ${theme} flex flex-col align-middle items-center py-2 space-y-4 overflow-hidden transition-all duration-300`}
                        >
                            {menuItems.map((item, index) => (
                                <Tooltip title={item.label} key={item.id} placement="right">
                                    <motion.div
                                        custom={index}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        variants={iconVariants}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '1.5rem',
                                            height: '1.5rem',
                                            borderRadius: '0.375rem',
                                            cursor: 'pointer',
                                            color: activeIcon === item.id ? 'cyan' : '#FFFFFF',
                                            marginBottom: '1rem', // Ajout d'espace entre les icônes
                                            backgroundColor: activeIcon === item.id ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
                                            '&:hover': {
                                                backgroundColor: 'cyan',
                                                color: '#000000',
                                            },
                                        }}
                                        onClick={() => handleMenuItemClick(item.widget, item.id)}
                                    >
                                        <FontAwesomeIcon icon={item.icon} size="sm" />
                                    </motion.div>
                                </Tooltip>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial="initial"
                    animate={isVisible ? 'moved' : 'initial'}
                    variants={buttonVariants}
                    style={{
                        position: 'fixed',
                        bottom: '1rem',
                        right: 0,
                        transform: isVisible ? 'translateX(-2rem)' : 'translateX(0)',
                        width: '1.5rem',
                        height: '1.5rem',
                        backgroundColor: '#6B46C1',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                    }}
                    onClick={() => setIsVisible(!isVisible)}
                >
                    <FontAwesomeIcon icon={isVisible ? faChevronRight : faChevronLeft} size="sm" />
                </motion.div>

                {ActiveWidgetComponent && (
                    <AnimatePresence>
                        {isVisible && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={widgetVariants}
                                style={{
                                    position: 'fixed',
                                    top: '5rem',
                                    right: '2.8rem',
                                    padding: '1rem',
                                    backgroundColor: '#322659',
                                    color: '#FFFFFF',
                                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                                    borderRadius: '0.5rem',
                                    height: '80%',
                                    width: '80%',
                                }}
                                className='text-xs overflow-y-clip'
                            >
                                    <ActiveWidgetComponent /> {/* Affiche le composant en utilisant PascalCase */}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default Sidebar;
