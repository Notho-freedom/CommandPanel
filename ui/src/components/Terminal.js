import React, { useState, useEffect, useRef, useCallback } from 'react';
import HistoryDisplay from './HistoryDisplay';
import AutocompleteInput from './AutocompleteInput';
import useLocalStorage from './useLocalStorage';
import useSystemInfo from './useSystemInfo';
import commandHandlers from './commandHandlers';

const Terminal = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [commands, setCommands] = useState([]);
    const terminalRef = useRef(null);

    // Custom hooks
    const { fontSize, setFontSizeState, theme, setThemeState, username, user, setUser, systemInfo } = useSystemInfo();
    const loadFromLocalStorage = useLocalStorage(setFontSizeState, setThemeState, setCommands);

    useEffect(() => {
        loadFromLocalStorage();
    }, []);

    useEffect(() => {
        if (systemInfo?.system_info?.users && user !== `[${username}]@${systemInfo.system_info.hostname}:~$`) {
            setUser(`[${username}]@${systemInfo.system_info.hostname}:~$`);
        }
    }, [systemInfo, username, user, setUser]);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    // Handle user input change
    const handleInputChange = (e) => setInput(e.target.value);

    // Clear the command history
    const clearHistory = () => setHistory([]);

    // Save the command to localStorage
    const saveCommand = useCallback((command) => {
        if (!commands.includes(command)) {
            const updatedCommands = [...commands, command];
            if (updatedCommands.length > 50) updatedCommands.shift();
            setCommands(updatedCommands);
            localStorage.setItem('commands', JSON.stringify(updatedCommands));
        }
    }, [commands]);

    const processCommand = useCallback(async (command) => {
        const [cmd, ...args] = command.split(' ');

        const updateHistory = (cmd, output) => {
            setHistory((prev) => [...prev, { command: cmd, output }]);
        };

        const handlers = commandHandlers(setFontSizeState, setThemeState, clearHistory);
        const handler = handlers[cmd];

        if (handler) {
            try {
                const output = await handler(args);
                updateHistory(command, output);
            } catch (error) {
                console.error(`Error executing local command "${cmd}":`, error);
                updateHistory(command, `Error: ${error.message}`);
            }
        } else {
            try {
                const response = await fetch('http://192.168.10.9:5000/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ command }),
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    const errorMessage = data.error || 'Unknown error from the server';
                    updateHistory(command, `Error: ${errorMessage}`);
                } else {
                    updateHistory(command, data.output || `Command not found: ${cmd}`);
                }
            } catch (error) {
                console.error(`Error executing command on server "${cmd}":`, error);
                updateHistory(command, `Error: Unable to communicate with the server.`);
            }
        }

        saveCommand(command);
    }, [saveCommand, setFontSizeState, setThemeState]);

    // Handle key press events
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            processCommand(input);
            setInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'ArrowUp') {
            setHistoryIndex((prevIndex) => {
                const newIndex = prevIndex + 1;
                return Math.min(newIndex, history.length - 1);
            });
            setInput(history[history.length - 1 - (historyIndex + 1)]?.command || '');
        } else if (e.key === 'ArrowDown') {
            setHistoryIndex((prevIndex) => {
                const newIndex = prevIndex - 1;
                return Math.max(newIndex, 0);
            });
            setInput(history[history.length - 1 - (historyIndex - 1)]?.command || '');
        }
    }, [history, input, historyIndex, processCommand]);

    const filteredCommands = commands.filter(cmd => cmd.startsWith(input));

    return (
        <div className="overflow-hidden overflow-y-auto">
            <div ref={terminalRef} className={`w-screen h-screen ${theme.background} ${theme.textColor} p-1 overflow-y-auto`} style={{
                fontSize,
                backgroundImage: theme.image,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                opacity: theme.imageOpacity
            }}>
                <HistoryDisplay history={history} theme={theme} user={user} fontSize={fontSize} />
                <AutocompleteInput
                    input={input}
                    setInput={setInput}
                    handleKeyDown={handleKeyDown}
                    suggestions={filteredCommands}
                    theme={theme}
                    fontSize={fontSize}
                    handleInputChange={handleInputChange}
                    user={user}
                />
            </div>
        </div>
    );
};

export default Terminal;
