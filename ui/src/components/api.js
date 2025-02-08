const API_BASE_URL = 'http://192.168.10.9:5000';  // URL de base pour les appels API
const AUTH_TOKEN = 'your-secret-token';  // Votre token d'authentification

// Fonction générique pour gérer les requêtes API avec authentification
const request = async (url, method = 'GET', data = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`, // Ajout du token d'authentification
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        return handleError(error);  // Gestion des erreurs
    }
};

// Fonction pour gérer les erreurs et fournir des messages plus clairs
const handleError = (error) => {
    console.error('Erreur API:', error);  // Vous pouvez aussi logguer l'erreur dans un service externe
    return { error: error.message || 'Une erreur est survenue lors de l\'appel API.' };
};

// Fonction pour récupérer les informations système
export const getSystemInfo = async () => {
    return await request('/system-info', 'GET');
};

// Fonction pour exécuter une commande (POST)
export const executeCommand = async (command) => {
    return await request('/execute', 'POST', { command });
};

// Fonction pour changer la taille de la police (POST)
export const setFontSize = async (size) => {
    return await request('/set-font-size', 'POST', { fontSize: size });
};

// Fonction pour changer le thème (POST)
export const setTheme = async (theme) => {
    return await request('/set-theme', 'POST', { theme });
};

// Fonction pour changer l'image de fond (POST)
export const setBackgroundImage = async (imageUrl) => {
    return await request('/set-background-image', 'POST', { imageUrl });
};

// Fonction pour ajuster l'opacité de l'image de fond (POST)
export const setImageOpacity = async (opacity) => {
    return await request('/set-image-opacity', 'POST', { opacity });
};

// Fonction pour obtenir les statistiques du serveur (GET)
export const getServerStats = async () => {
    return await request('/server-stats', 'GET');
};

// Fonction pour obtenir les connexions réseau (GET)
export const getConnections = async () => {
    return await request('/connections', 'GET');
};

// Fonction pour gérer la liste blanche (POST)
export const manageWhitelist = async (data) => {
    return await request('/manage-whitelist', 'POST', data);
};

// Fonction pour exécuter un script (POST)
export const runScript = async (script) => {
    return await request('/run-script', 'POST', { script });
};

// Fonction pour déconnecter les utilisateurs inactifs (POST)
export const disconnectInactive = async () => {
    return await request('/disconnect-inactive', 'POST');
};

// Fonction pour récupérer l'historique (GET)
export const getHistory = async () => {
    return await request('/history', 'GET');
};

// Fonction pour obtenir le thème actuel (POST)
export const getTheme = async () => {
    return await request('/get-theme', 'POST');
};

// Fonction pour obtenir les connexions réseau (GET)
export const getSettings = async () => {
    return await request('/settings', 'GET');
};

// Fonction pour obtenir le thème actuel (POST)
export const setShell = async (shell_type) => {
    return await request('/set-shell-type', 'POST', { shell_type: shell_type });
};

