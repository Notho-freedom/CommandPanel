import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSSTransition } from 'react-transition-group'; // Importer CSSTransition pour les animations

const ResourceMonitor = () => {
    const [activeTab, setActiveTab] = useState("cpu");
    const [systemStats, setSystemStats] = useState({
        cpu: { usage: 0, cores: [] },
        ram: { total: 0, used: 0 },
        gpu: { usage: 0 },
        processes: [],
    });
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // État pour le filtre de recherche
    const [selectedProcess, setSelectedProcess] = useState(null); // État pour le processus sélectionné

    const fetchStats = async () => {
        try {
            const response = await axios.get("http://192.168.10.9:5000/system-info");
            const data = response.data;

            setSystemStats({
                cpu: {
                    usage: data.system_info.cpu.usage,
                    cores: data.system_info.cpu.frequency ? [data.system_info.cpu.frequency.current] : [],
                },
                ram: {
                    total: data.system_info.memory.total / 1e9,
                    used: data.system_info.memory.used / 1e9,
                },
                gpu: {
                    usage: Math.random() * 100,
                },
                processes: data.system_info.processes.map((proc) => ({
                    id: proc.pid,
                    name: proc.name,
                    cpu: proc.cpu_percent,
                    ram: proc.memory_info[0] / 1024,
                })),
            });
        } catch (err) {
            setError("Failed to fetch system information");
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedProcess) {
            const interval = setInterval(() => {
                fetchStats(); // Met à jour les stats pour le processus sélectionné
            }, 2000); // Met à jour toutes les 2 secondes
            return () => clearInterval(interval);
        }
    }, [selectedProcess]);

    const filteredProcesses = systemStats.processes.filter(process =>
        process.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProcessClick = (process) => {
        setSelectedProcess(process);
    };

    const handleClosePopup = () => {
        setSelectedProcess(null);
    };

    const handleSuspendProcess = async () => {
        // Remplacez par l'appel API pour suspendre le processus
        console.log(`Suspending process: ${selectedProcess.name}`);
        handleClosePopup();
    };

    const handleRestartProcess = async () => {
        // Remplacez par l'appel API pour redémarrer le processus
        console.log(`Restarting process: ${selectedProcess.name}`);
        handleClosePopup();
    };

    if (error) return <p className="text-red-500">{error}</p>;
    if (!systemStats) return <p>Loading system information...</p>;

    return (
        <div className="overflow-x-hidden overflow-y-auto rounded shadow-2xl pt-1 w-full text-xs">
            <div className="flex space-x-4 mb-4 border-b w-full">
                {["cpu", "ram", "gpu", "processes"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium ${
                            activeTab === tab
                                ? "text-green-600 bold border-b-2 border-green-600"
                                : "text-white hover:text-blue-600"
                        }`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {activeTab === "cpu" && (
                    <CSSTransition in={activeTab === " cpu"} timeout={300} classNames="fade">
                        <div>
                            <h2 className="text-lg font-semibold">CPU Usage</h2>
                            <div className="mb-4">
                                <p>Total Usage: {systemStats.cpu.usage.toFixed(2)}%</p>
                                <div className="h-4 bg-gray-200 rounded-md overflow-hidden">
                                    <div
                                        className="h-4 bg-blue-600"
                                        style={{ width: `${systemStats.cpu.usage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <h3 className="text-md font-medium">Core Usage</h3>
                            {systemStats.cpu.cores.map((usage, index) => (
                                <div key={index} className="mb-2">
                                    <p>Core {index + 1}: {usage.toFixed(2)}%</p>
                                    <div className="h-4 bg-gray-200 rounded-md overflow-hidden">
                                        <div
                                            className="h-4 bg-green-500"
                                            style={{ width: `${usage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CSSTransition>
                )}

                {activeTab === "ram" && (
                    <CSSTransition in={activeTab === "ram"} timeout={300} classNames="fade">
                        <div>
                            <h2 className="text-lg font-semibold">RAM Usage</h2>
                            <p>Total: {systemStats.ram.total.toFixed(2)} GB</p>
                            <p>Used: {systemStats.ram.used.toFixed(2)} GB</p>
                            <div className="h-4 bg-gray-200 rounded-md overflow-hidden">
                                <div
                                    className="h-4 bg-purple-600"
                                    style={{
                                        width: `${(systemStats.ram.used / systemStats.ram.total) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </CSSTransition>
                )}

                {activeTab === "gpu" && (
                    <CSSTransition in={activeTab === "gpu"} timeout={300} classNames="fade">
                        <div>
                            <h2 className="text-lg font-semibold">GPU Usage</h2>
                            <p>Usage: {systemStats.gpu.usage.toFixed(2)}%</p>
                            <div className="h-4 bg-gray-200 rounded-md overflow-hidden">
                                <div
                                    className="h-4 bg-yellow-500"
                                    style={{ width: `${systemStats.gpu.usage}%` }}
                                ></div>
                            </div>
                        </div>
                    </CSSTransition>
                )}

                {activeTab === "processes" && (
                    <CSSTransition in={activeTab === "processes"} timeout={300} classNames="fade">
                        <div className="overflow-auto w-full">
                            <h2 className="text-lg font-semibold mb-2">Processes</h2>
                            <input
                                type="text"
                                placeholder="Search processes..."
                                className="border rounded p-2 mb-4 w-5/6 ml-2 text-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="w-full" style={{overflowY: "auto"}}>
                                <table className="table-data rounded shadow-2xl p-4 text-justify border-collapse border border-gray-200 text-black w-full">
                                    <thead className="bg-blue-600 text-white">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1">PID</th>
                                            <th className="border border-gray-300 px-2 py-1">Name</th>
                                            <th className="border border-gray-300 px-2 py-1">CPU (%)</th>
                                            <th className="border border-gray-300 px-2 py-1">RAM (MB)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProcesses.map((process, index) => {
                                            const ramInMB =
                                                process.ram && !isNaN(process.ram)
                                                    ? (process.ram / (1024 * 1024)).toFixed(2)
                                                    : "N/A";
                                            return (
                                                <tr
                                                    key={process.id}
                                                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                                    onClick={() => handleProcessClick(process)} // Ajout de l'événement de clic
                                                >
                                                    <td className="border border-gray -300 px-2 py-1">{process.id}</td>
                                                    <td className="border border-gray-300 px-2 py-1 truncate max-w-xs">
                                                        {process.name}
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1">
                                                        {process.cpu.toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-300 px-2 py-1">{ramInMB}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CSSTransition>
                )}
            </div>

            {selectedProcess && (
                <div className="fixed inset-0 flex items-center justify-cente bg-opacity-70">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 shadow-lg transform transition-all duration-300">
                        <button
                            onClick={handleClosePopup}
                            className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white"
                        >
                            ✖
                        </button>
                        <h2 className="text-lg font-semibold text-white mb-2">Process Options</h2>
                        <p className="text-white">Process: {selectedProcess.name}</p>
                        <p className="text-white">PID: {selectedProcess.id}</p>
                        <p className="text-white">CPU Usage: {selectedProcess.cpu.toFixed(2)}%</p>
                        <p className="text-white">RAM Usage: {(selectedProcess.ram / 1024).toFixed(2)} MB</p>
                        <div className="flex space-x-2 mt-4">
                            <button
                                onClick={handleSuspendProcess}
                                className="bg-yellow-500 text-white px-3 py-1 rounded transition-transform transform hover:scale-105"
                            >
                                Suspend
                            </button>
                            <button
                                onClick={handleRestartProcess}
                                className="bg-green-500 text-white px-3 py-1 rounded transition-transform transform hover:scale-105"
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceMonitor;