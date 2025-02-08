// src/components/HistoryDisplay.js
import React, { useMemo } from 'react';

const HistoryDisplay = ({ history, theme, user }) => {
    const memoizedHistory = useMemo(() => {
        return history.map((entry, index) => (
            <div key={index}>
                <div>
                    <span className={`${theme.rootColor}`}>{user}</span>
                    <span className={`${theme.promptColor}`}>{entry.command}</span>
                </div>
                <div className={`${theme.textColor} whitespace-pre-wrap ml-3`}>{entry.output}</div>
            </div>
        ));
    }, [history, theme, user]);

    return <div>{memoizedHistory}</div>;
};

export default HistoryDisplay;