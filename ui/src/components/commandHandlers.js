// commandHandlers.js
import { setFontSize, setTheme, setBackgroundImage, setImageOpacity, setShell } from './api';

const commandHandlers = (setFontSizeState, setThemeState, clearHistory) => ({
    help: () => `Available commands: help, fontsize [size], theme [dark|light], setImage [url], imageOpacity [value], cls, setShell [cmd|powershell]`,

    fontsize: async (args) => {
        if (args[0]) {
            try {
                const data = await setFontSize(args[0]);
                setFontSizeState(data.fontSize);
                localStorage.setItem('fontSize', data.fontSize);
                return `Font size set to ${args[0]}`;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        }
        return `Font size not specified. Please provide a size.`;
    },

    theme: async (args) => {
        if (args[0]) {
            try {
                const data = await setTheme(args[0]);
                setThemeState(data.theme);
                localStorage.setItem('theme', JSON.stringify(data.theme));
                return `Theme changed to ${args[0]}`;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        }
        return `Available themes: dark, light`;
    },

    setImage: async (args) => {
        if (args[0]) {
            try {
                const data = await setBackgroundImage(args[0]);
                setThemeState((prevTheme) => ({
                    ...prevTheme,
                    image: `url(${data.image})`,
                    imageOpacity: 1,
                }));
                localStorage.setItem('backgroundImage', `url(${data.image})`);
                return `Background image set to ${args[0]}`;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        }
        return `Please provide a valid image URL.`;
    },

    imageOpacity: async (args) => {
        const opacity = parseFloat(args[0]);
        if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
            try {
                const data = await setImageOpacity(opacity);
                setThemeState((prevTheme) => ({ ...prevTheme, imageOpacity: data.imageOpacity }));
                localStorage.setItem('theme', JSON.stringify(data));
                return `Image opacity set to ${opacity}`;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        }
        return `Please provide a valid opacity value between 0 and 1.`;
    },

    cls: () => {
        clearHistory();
        return '';
    },

    setShell: async (args) => {
        if (args[0] && (args[0] === 'cmd' || args[0] === 'powershell')) {
            try {
                const data = await setShell(args[0]);
                return `${data.message}`;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        }
        return `Please specify a valid shell type: cmd or powershell.`;
    }
});

export default commandHandlers;
