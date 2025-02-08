// src/components/TerminalContainer.js
import React from 'react';
import Terminal from './Terminal';
import TitleBar from './TitleBar';

const TerminalContainer = () => {
    return (
        <div className="w-full h-screen bg-gray-900 overflow-clip">
            <div className="flex justify-center items-center w-full h-full">
                
                <div className="w-full pt-6">
                    <TitleBar />
                    <Terminal />
                </div>
            </div>
        </div>
    );
};

export default TerminalContainer;
