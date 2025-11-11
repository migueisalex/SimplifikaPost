import React, { useState, useEffect } from 'react';
import { StaffMember, AccessLog } from '../../types';

interface AccessLogsModalProps {
    staffMember: StaffMember;
    onClose: () => void;
}

const formatDuration = (start: string, end?: string): string => {
    if (!end) return 'Sessão ativa';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();

    if (diffMs < 0) return 'N/A';
    
    let diffSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSecs / 86400);
    diffSecs -= days * 86400;
    const hours = Math.floor(diffSecs / 3600) % 24;
    diffSecs -= hours * 3600;
    const minutes = Math.floor(diffSecs / 60) % 60;

    let durationString = '';
    if (days > 0) durationString += `${days}d `;
    if (hours > 0) durationString += `${hours}h `;
    durationString += `${minutes}m`;
    
    return durationString.trim() || '0m';
};

const AccessLogsModal: React.FC<AccessLogsModalProps> = ({ staffMember, onClose }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
    const [isExportEnabled, setIsExportEnabled] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const logsForToday = staffMember.accessLogs.filter(log => {
            const logDate = new Date(log.loginTime).toISOString().split('T')[0];
            return logDate === today;
        });
        setFilteredLogs(logsForToday.slice().reverse());
    }, [staffMember.accessLogs, today]);

    const handleFilter = () => {
        setError('');
        if (!startDate || !endDate) {
            setError('Por favor, selecione um período de início e fim.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
            setError('A data de início não pode ser posterior à data de fim.');
            return;
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 360) {
            setError('O período de busca não pode exceder 360 dias.');
            return;
        }

        const logs = staffMember.accessLogs.filter(log => {
            const logDate = new Date(log.loginTime);
            return logDate >= start && logDate <= end;
        });

        setFilteredLogs(logs.slice().reverse());
        setIsExportEnabled(true);
    };

    const handleExport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Não foi possível abrir a janela de impressão. Por favor, desabilite o bloqueador de pop-ups.');
            return;
        }

        const tableRows = filteredLogs.map(log => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${new Date(log.loginTime).toLocaleDateString('pt-BR')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${new Date(log.loginTime).toLocaleTimeString('pt-BR')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${log.logoutTime ? new Date(log.logoutTime).toLocaleTimeString('pt-BR') : 'Sessão ativa'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDuration(log.loginTime, log.logoutTime)}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <html>
                <head>
                    <title>Logs de Acesso - ${staffMember.email}</title>
                    <style>
                        body { font-family: sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { text-align: left; }
                        h1, h2 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>Relatório de Logs de Acesso</h1>
                    <h2>Usuário: ${staffMember.email}</h2>
                    <h3>Período: ${new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px;">Data</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Login</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Logout</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Duração</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows.length > 0 ? tableRows : '<tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhum registro encontrado para este período.</td></tr>'}
                        </tbody>
                    </table>
                    <script>
                        window.onafterprint = () => window.close();
                        window.print();
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[80] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Logs de Acesso: {staffMember.email}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-dark-border flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-grow flex flex-col sm:flex-row items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">De:</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-dark-border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Até:</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-dark-border" />
                            </div>
                        </div>
                        <button onClick={handleFilter} className="w-full sm:w-auto py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition">
                            Buscar
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                </div>
                
                <div className="flex-grow px-6 pb-6 overflow-y-auto">
                    <div className="border dark:border-dark-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="p-3 font-semibold">Data</th>
                                    <th className="p-3 font-semibold">Login</th>
                                    <th className="p-3 font-semibold">Logout</th>
                                    <th className="p-3 font-semibold">Duração</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                    <tr key={log.loginTime} className="border-t dark:border-dark-border">
                                        <td className="p-3">{new Date(log.loginTime).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-3">{new Date(log.loginTime).toLocaleTimeString('pt-BR')}</td>
                                        <td className="p-3">{log.logoutTime ? new Date(log.logoutTime).toLocaleTimeString('pt-BR') : <span className="text-yellow-500 font-semibold">Ativa</span>}</td>
                                        <td className="p-3 font-semibold">{formatDuration(log.loginTime, log.logoutTime)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-8 text-gray-500">Nenhum registro encontrado para o período selecionado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                 <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
                    <button 
                        onClick={handleExport}
                        disabled={!isExportEnabled}
                        className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!isExportEnabled ? "Faça uma busca por período para habilitar a exportação" : "Exportar dados filtrados"}
                    >
                        Exportar (PDF)
                    </button>
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessLogsModal;