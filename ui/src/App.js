// src/App.js
import React from 'react';
import Sidebar from './components/Sidebar';
import TerminalContainer from './components/TerminalContainer';

const App = () => {
    return (
        <div className="flex">
            
            <Sidebar />
            <TerminalContainer />
        </div>
    );
};

export default App;

