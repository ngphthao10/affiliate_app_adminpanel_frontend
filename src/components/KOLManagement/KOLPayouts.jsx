import React, { useState, useEffect } from 'react';
import kolPayoutService from '../../services/kolPayoutService';
import kolService from '../../services/kolService';
import { FiDownload, FiRefreshCw, FiSearch, FiFilter, FiPlus, FiEdit, FiCheck, FiX } from 'react-icons/fi';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
    const [generatingPayouts, setGeneratingPayouts] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal states
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [payoutDetails, setPayoutDetails] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');

    // Payout generation states
    const [genStartDate, setGenStartDate] = useState(dayjs().subtract(30, 'days'));
    const [genEndDate, setGenEndDate] = useState(dayjs());
    const [selectedInfluencer, setSelectedInfluencer] = useState('');
    const [influencers, setInfluencers] = useState([]);

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

    // Fetch influencers for the dropdown
    const fetchInfluencers = async () => {
        try {
            // Assuming you have an API to fetch influencers
            const response = await kolService.getKOLs();
            if (response.success) {
                setInfluencers(response.kols);
            }
        } catch (error) {
            console.error('Error fetching influencers:', error);
        }
    };

    useEffect(() => {
        fetchPayouts();
        fetchInfluencers();
        console.log(influencers)
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

    // Generate new payouts
    const handleGeneratePayouts = async () => {
        try {
            setGeneratingPayouts(true);
            const response = await kolPayoutService.generatePayouts({
                start_date: genStartDate?.format('YYYY-MM-DD'),
                end_date: genEndDate?.format('YYYY-MM-DD'),
                influencer_id: selectedInfluencer || undefined
            });

            if (response.success) {
                toast.success(response.message || 'Payouts generated successfully');
                setIsGenerateModalOpen(false);
                fetchPayouts(true);
            } else {
                toast.error(response.message || 'Failed to generate payouts');
            }
        } catch (error) {
            console.error('Generate payouts error:', error);
            toast.error(error.message || 'Failed to generate payouts');
        } finally {
            setGeneratingPayouts(false);
        }
    };

    // Update payout status
    const handleUpdateStatus = async () => {
        if (!selectedPayout || !newStatus) return;

        try {
            const response = await kolPayoutService.updatePayoutStatus(
                selectedPayout.payout_id,
                {
                    payment_status: newStatus,
                    notes: statusNotes
                }
            );

            if (response.success) {
                toast.success(`Payout status updated to ${newStatus}`);
                setIsStatusModalOpen(false);
                fetchPayouts();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    // View payout details
    const handleViewDetails = async (payout) => {
        try {
            setIsDetailsModalOpen(true);
            setSelectedPayout(payout);
            setPayoutDetails(null);

            const response = await kolPayoutService.getPayoutDetails(payout.payout_id);

            if (response.success) {
                setPayoutDetails(response.payout);
            } else {
                toast.error(response.message || 'Failed to fetch payout details');
            }
        } catch (error) {
            console.error('Fetch details error:', error);
            toast.error(error.message || 'Failed to fetch payout details');
        }
    };

    // Open status update modal
    const handleOpenStatusModal = (payout, status) => {
        setSelectedPayout(payout);
        setNewStatus(status);
        setStatusNotes('');
        setIsStatusModalOpen(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-semibold">KOL Payouts</h2>
                    <p className="text-gray-500 mt-1">Manage and track KOL payment status</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <FiPlus /> Generate Payouts
                    </button>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(payout)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <FiEdit />
                                            </button>

                                            {payout.payment_status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenStatusModal(payout, 'completed')}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Mark as Completed"
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenStatusModal(payout, 'failed')}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Mark as Failed"
                                                    >
                                                        <FiX />
                                                    </button>
                                                </>
                                            )}
                                        </div>
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

            {/* Generate Payouts Modal */}
            <Dialog
                open={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                maxWidth="md"
            >
                <DialogTitle>Generate KOL Payouts</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 mt-2">
                        <p className="text-gray-600">
                            Generate payouts for KOLs based on sales through their affiliate links within a date range.
                        </p>

                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-700">Date Range</label>
                                <div className="flex gap-2">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Start Date"
                                            value={genStartDate}
                                            onChange={setGenStartDate}
                                            slotProps={{ textField: { size: 'small', fullWidth: true }, field: { format: 'DD/MM/YYYY' } }}
                                        />
                                        <DatePicker
                                            label="End Date"
                                            value={genEndDate}
                                            onChange={setGenEndDate}
                                            minDate={genStartDate}
                                            slotProps={{ textField: { size: 'small', fullWidth: true }, field: { format: 'DD/MM/YYYY' } }}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    KOL (Optional)
                                </label>
                                <select
                                    value={selectedInfluencer}
                                    onChange={(e) => setSelectedInfluencer(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">All KOLs</option>
                                    {influencers.map((inf) => (
                                        <option key={inf.influencer_id} value={inf.influencer_id}>
                                            {inf.user?.first_name} {inf.user?.last_name} ({inf.user?.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        onClick={() => setIsGenerateModalOpen(false)}
                        disabled={generatingPayouts}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGeneratePayouts}
                        disabled={generatingPayouts}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {generatingPayouts ? 'Generating...' : 'Generate Payouts'}
                    </button>
                </DialogActions>
            </Dialog>

            {/* Update Status Modal */}
            <Dialog
                open={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
            >
                <DialogTitle>{`Mark Payout as ${newStatus?.charAt(0).toUpperCase() + newStatus?.slice(1)}`}</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 mt-2">
                        <p className="text-gray-600">
                            Are you sure you want to mark this payout as {newStatus}?
                        </p>

                        {selectedPayout && (
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p><span className="font-medium">KOL:</span> {selectedPayout.kol?.user?.first_name} {selectedPayout.kol?.user?.last_name}</p>
                                <p><span className="font-medium">Amount:</span> {parseFloat(selectedPayout.total_amount).toFixed(2)}</p>
                                <p><span className="font-medium">Payout Date:</span> {dayjs(selectedPayout.payout_date).format('YYYY-MM-DD')}</p>
                            </div>
                        )}

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows="3"
                                placeholder="Add any notes about this payment status change..."
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        onClick={() => setIsStatusModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateStatus}
                        className={`px-4 py-2 text-white rounded-md ${newStatus === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        Confirm
                    </button>
                </DialogActions>
            </Dialog>

            {/* Payout Details Modal */}
            <Dialog
                open={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Payout Details</DialogTitle>
                <DialogContent>
                    {!payoutDetails ? (
                        <div className="text-center py-10">
                            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                            <p className="text-gray-600">Loading details...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-gray-700 font-medium mb-2">KOL Information</h3>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p><span className="font-medium">Name:</span> {payoutDetails.kol_name}</p>
                                        <p><span className="font-medium">Username:</span> {payoutDetails.kol_username}</p>
                                        <p><span className="font-medium">Email:</span> {payoutDetails.kol_email}</p>
                                        <p><span className="font-medium">Tier:</span> {payoutDetails.tier_name}</p>
                                        <p><span className="font-medium">Commission Rate:</span> {payoutDetails.commission_rate}%</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-gray-700 font-medium mb-2">Payout Information</h3>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p><span className="font-medium">Amount:</span> {parseFloat(payoutDetails.total_amount).toFixed(2)}</p>
                                        <p><span className="font-medium">Status:</span>
                                            <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${payoutDetails.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                payoutDetails.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {payoutDetails.payment_status.charAt(0).toUpperCase() + payoutDetails.payment_status.slice(1)}
                                            </span>
                                        </p>
                                        <p><span className="font-medium">Payout Date:</span> {dayjs(payoutDetails.payout_date).format('YYYY-MM-DD')}</p>
                                        <p><span className="font-medium">Created At:</span> {dayjs(payoutDetails.created_at).format('YYYY-MM-DD HH:mm')}</p>
                                        {payoutDetails.notes && <p><span className="font-medium">Notes:</span> {payoutDetails.notes}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-700 font-medium mb-2">Related Orders</h3>
                                {payoutDetails.related_orders?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {payoutDetails.related_orders.map(order => (
                                                    <tr key={order.order_id}>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">#{order.order_id}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{parseFloat(order.total).toFixed(2)}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            <span className={`px-2 py-0.5 text-xs rounded-full ${order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{dayjs(order.creation_at).format('YYYY-MM-DD')}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{order.items_count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No related orders found for this payout period.</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    {payoutDetails && payoutDetails.payment_status === 'pending' && (
                        <>
                            <button
                                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    handleOpenStatusModal(selectedPayout, 'failed');
                                }}
                            >
                                Mark as Failed
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    handleOpenStatusModal(selectedPayout, 'completed');
                                }}
                            >
                                Mark as Completed
                            </button>
                        </>
                    )}
                    <button
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        onClick={() => setIsDetailsModalOpen(false)}
                    >
                        Close
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default KOLPayouts;