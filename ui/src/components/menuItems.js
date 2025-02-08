// src/components/menuItems.js
import HomeWidget from './HomeWidget';
import ProfileWidget from './ProfileWidget';
import SettingsWidget from './SettingsWidget';
import LogoutWidget from './LogoutWidget';
import SystemInfoComponent from './SystemInfoComponent';
import { faHome, faUser, faCog, faSignOutAlt, faAnchorCircleExclamation, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import ResourceMonitor from './ResourceMonitor';

const menuItems = [
    { 
        id: 1,
        icon: faHome,
        label: 'Home',
        widget: HomeWidget 
    },

    { 
        id: 5,
        icon: faAnchorCircleExclamation,
        label: 'System Info',
        widget: SystemInfoComponent 
    },

    { 
        id: 2,
        icon: faUser,
        label: 'Profile',
        widget: ProfileWidget 
    },

    { 
        id: 3,
        icon: faCog,
        label: 'Settings',
        widget: SettingsWidget 
    },

    { 
        id: 4,
        icon: faSignOutAlt,
        label: 'Logout',
        widget: LogoutWidget 
    },

    { 
        id: 6,
        icon: faCircleExclamation,
        label: 'Logout',
        widget: ResourceMonitor 
    },
];


export default menuItems;
