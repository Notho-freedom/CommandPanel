import React, { useState, useEffect } from 'react';

const AutocompleteInput = ({ input, setInput, handleKeyDown, suggestions, theme, fontSize, handleInputChange, user }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (input) {
            const matches = suggestions.filter((command) => command.startsWith(input));
            if (matches.length !== filteredSuggestions.length) {
                setFilteredSuggestions(matches);
                setShowSuggestions(matches.length > 0);
            }
        } else {
            if (showSuggestions) {
                setShowSuggestions(false);
            }
        }
    }, [input, suggestions, filteredSuggestions.length, showSuggestions]);

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className="relative flex">
            <span className={`left-0 ${theme.rootColor}`}>{user}</span>
            <input
                aria-label="Terminal input"
                type="text"
                className={`bg-transparent terminal-input ml-1 outline-none word-wrap wrap ${theme.promptColor}`}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{ fontSize }}
            />
            {showSuggestions && (
                <ul className="absolute bg-gray-700 text-white rounded-lg mt-1 p-2 w-auto z-10" style={{
                    top: '100%',
                    left: '20%',
                    width: 'auto',
                    alignSelf: 'center',
                }}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className={`p-1 cursor-pointer hover:${theme.rootColor}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;
