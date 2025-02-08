import { useState, useEffect } from 'react';
import { getSystemInfo } from './api';

const useSystemInfo = () => {
    const [fontSize, setFontSizeState] = useState('clamp(0.75rem, 2vw, 1rem)');
    const [theme, setThemeState] = useState({});
    const [username, setUsername] = useState('');
    const [user, setUser] = useState('connecting...');
    const [systemInfo, setSystemInfo] = useState(null);

    useEffect(() => {
        getSystemInfo()
            .then(data => {
                setSystemInfo(data);
                const username = data.system_info?.users?.[0]?.username || 'unknown user';
                setUsername(username);
            })
            .catch(error => console.error('Error fetching system info:', error));
    }, []);

    return { fontSize, setFontSizeState, theme, setThemeState, username, user, setUser, systemInfo };
};

export default useSystemInfo;
