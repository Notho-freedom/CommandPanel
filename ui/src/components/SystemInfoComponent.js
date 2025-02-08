import React, { useState, useEffect } from 'react';

const SystemInfoComponent = () => {
    const [systemInfo, setSystemInfo] = useState(null);

    // Use useEffect to retrieve system information from localStorage on first render
    useEffect(() => {
        const data = localStorage.getItem('systemInfo');

        // Parse the JSON string into an object if data exists
        if (data) {
            setSystemInfo(JSON.parse(data));
        }
    }, []);

    return (
        <div className="text-justify overflow-x-hidden overflow-y-auto">
            {systemInfo ? (
                <div>
                    <h1 className="text-xl font-bold mb-4">Host Data</h1>
                    
                    <h2 className="text-lg font-semibold mt-4">IP Addresses</h2>
                    <p><strong>Local IP:</strong> {systemInfo.ip_addresses}</p>
                    <p><strong>Public IP:</strong> {systemInfo.public_ip}</p>
                    <p><strong>Hostname:</strong> {systemInfo.system_info.hostname}</p>
                    <p><strong>Operating System:</strong> {systemInfo.system_info.os} {systemInfo.system_info.os_version}</p>
                    <p><strong>Kernel Version:</strong> {systemInfo.system_info.kernel_version}</p>

                    <h2 className="text-lg font-semibold mt-4">Architecture</h2>
                    <ul className="list-disc ml-6">
                        {systemInfo.system_info.architecture.map((arch, index) => (
                            <li key={index}>{arch}</li>
                        ))}
                    </ul>

                    <h2 className="text-lg font-semibold mt-4">CPU</h2>
                    <p><strong>Model:</strong> {systemInfo.system_info.cpu.model}</p>
                    <p><strong>Speed:</strong> {systemInfo.system_info.cpu.speed} GHz</p>
                    <p><strong>Number of Cores:</strong> {systemInfo.system_info.cpu.cores}</p>

                    <h2 className="text-lg font-semibold mt-4">Memory</h2>
                    <p><strong>Total RAM:</strong> {systemInfo.system_info.memory.total} GB</p>
                    <p><strong>Used RAM:</strong> {systemInfo.system_info.memory.used} GB</p>
                    <p><strong>Free RAM:</strong> {systemInfo.system_info.memory.free} GB</p>

                    <h2 className="text-lg font-semibold mt-4">Network Interfaces</h2>
                    {Object.entries(systemInfo.system_info.network).map(([interfaceName, addresses], index) => (
                        <div key={index}>
                            <h3 className="font-medium">{interfaceName}</h3>
                            <ul className="list-disc ml-6">
                                {addresses.map((address, addrIndex) => (
                                    <li key={addrIndex}>
                                        {address.address} ({address.family})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <h2 className="text-lg font-semibold mt-4">Users</h2>
                    <ul className="list-disc ml-6">
                        {systemInfo.system_info.users.map((user, index) => (
                            <li key={index}>{user.username}</li>
                        ))}
                    </ul>

                    <h2 className="text-lg font-semibold mt-4">Partitions</h2>
                    {systemInfo.system_info.partitions.length > 0 ? (
                        <ul className="list-disc ml-6">
                            {systemInfo.system_info.partitions.map((partition, index) => (
                                <li key={index}>{partition}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No partitions available.</p>
                    )}

                    <h2 className="text-lg font-semibold mt-4">Web Servers</h2>
                    {systemInfo.system_info.web_servers.length > 0 ? (
                        <ul className="list-disc ml-6">
                            {systemInfo.system_info.web_servers.map((server, index) => (
                                <li key={index}>{server}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No web servers available.</p>
                    )}
                </div>
            ) : (
                <p>Loading system information...</p>
            )}
        </div>
    );
};

export default SystemInfoComponent;