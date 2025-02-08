import { getSettings, setTheme } from './api';  // Importation des fonctions

const removeQuotesFromKeys = (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
    }, {});
};

const useLocalStorage = (setFontSizeState, setThemeState, setCommands) => {
    const loadFromLocalStorage = async () => {
        try {
            const savedCommands = JSON.parse(localStorage.getItem('commands')) || [];
            setCommands(savedCommands);

            const savedFontSize = localStorage.getItem('fontSize');
            if (savedFontSize) {
                setFontSizeState(savedFontSize);
            }

            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                const parsedTheme = removeQuotesFromKeys(JSON.parse(savedTheme));
                setThemeState(parsedTheme);
            } else {
                const settings = await getSettings();
                const themeData = await setTheme(settings.theme);
                setThemeState(themeData.theme);
                localStorage.setItem('theme', JSON.stringify(themeData.theme));
            }

            const savedImage = localStorage.getItem('backgroundImage');
            if (savedImage) {
                setThemeState((prevTheme) => ({ ...prevTheme, image: savedImage }));
            }
        } catch (error) {
            console.error('Error loading settings from localStorage or server:', error);
        }
    };

    return loadFromLocalStorage;
};

export default useLocalStorage;
