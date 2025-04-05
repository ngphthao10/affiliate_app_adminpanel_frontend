import React, { useState, useEffect } from 'react';
import kolPayoutService from '../../services/kolPayoutService';
import { FiDownload, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const KOLPayouts = () => {
    dayjs.locale('en-gb');
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState({
        total_payouts: 0,
        total_amount: 0,
        pending_count: 0,
        pending_amount: 0,
        completed_count: 0,
        completed_amount: 0,
        failed_count: 0,
        failed_amount: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days'));
    const [endDate, setEndDate] = useState(dayjs());

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch data
    const fetchPayouts = async (resetPage = false) => {
        try {
            setIsLoading(true);
            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            const response = await kolPayoutService.getPayouts({
                page,
                limit: itemsPerPage,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchTerm,
                start_date: startDate?.format('YYYY-MM-DD'),
                end_date: endDate?.format('YYYY-MM-DD')
            });

            console.log('API Response:', response);

            if (response.success) {
                setPayouts(response.payouts || []);
                setStats(response.stats || {
                    total_payouts: 0,
                    total_amount: 0,
                    pending_count: 0,
                    pending_amount: 0,
                    completed_count: 0,
                    completed_amount: 0,
                    failed_count: 0,
                    failed_amount: 0
                });
                setTotalPages(response.pagination?.pages || 1);
            } else {
                console.error('Failed response:', response);
                toast.error(response.message || 'Failed to fetch payouts');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, [currentPage, itemsPerPage]);

    // Export data
    const handleExport = async () => {
        try {
            const response = await kolPayoutService.exportPayoutReport({
                start_date: startDate?.format('YYYY-MM-DD'),
                end_date: endDate?.format('YYYY-MM-DD'),
                status: statusFilter
            });

            // Create download link for the blob
            const url = window.URL.createObjectURL(new Blob([response]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `kol-payouts-${startDate?.format('YYYY-MM-DD')}-to-${endDate?.format('YYYY-MM-DD')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export error:', error);
            toast.error(error.message || 'Export failed');
        }
    };

    // Apply filters
    const handleApplyFilters = () => {
        fetchPayouts(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">KOL Payouts</h2>
                    <p className="text-gray-500 mt-1">Manage and track KOL payment status</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <FiDownload /> Export
                    </button>
                    <button
                        onClick={() => fetchPayouts()}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-blue-700 text-lg font-semibold">Total Payouts</h3>
                    <p className="text-2xl font-bold">{stats.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{stats.total_payouts} payouts</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-yellow-700 text-lg font-semibold">Pending</h3>
                    <p className="text-2xl font-bold">{stats.pending_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{stats.pending_count} payouts</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-green-700 text-lg font-semibold">Completed</h3>
                    <p className="text-2xl font-bold">{stats.completed_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{stats.completed_count} payouts</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-red-700 text-lg font-semibold">Failed</h3>
                    <p className="text-2xl font-bold">{stats.failed_amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{stats.failed_count} payouts</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by KOL name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="w-48">
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            slotProps={{ textField: { size: 'small' }, field: { format: 'DD/MM/YYYY' } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                            minDate={startDate}
                            slotProps={{ textField: { size: 'small' }, field: { format: 'DD/MM/YYYY' } }}
                        />
                    </LocalizationProvider>
                </div>

                <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Apply Filters
                </button>
            </div>

            {/* Payouts Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p className="text-gray-600">Loading payouts...</p>
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-600">No payouts found for the selected criteria.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-50 ">
                            <tr className='border-b'>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    KOL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payout Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payouts.map((payout) => (
                                <tr key={payout.payout_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {payout.kol?.user?.first_name || ''} {payout.kol?.user?.last_name || ''}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {payout.kol?.user?.email || 'No email'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {parseFloat(payout.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payout.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                            payout.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {payout.payment_status ? payout.payment_status.charAt(0).toUpperCase() + payout.payment_status.slice(1) : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payout.payout_date ? dayjs(payout.payout_date).format('YYYY-MM-DD') : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border rounded-md px-2 py-1"
                    >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KOLPayouts;