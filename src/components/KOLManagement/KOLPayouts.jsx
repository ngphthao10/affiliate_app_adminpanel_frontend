import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiDollarSign, FiCheck, FiDownload, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

const KOLPayouts = ({ token, refreshTrigger }) => {
    // State for payouts data
    const [payouts, setPayouts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed', 'failed'
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'this_month', 'last_month', 'custom'
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    // State for sorting
    const [sortField, setSortField] = useState('payout_date');
    const [sortOrder, setSortOrder] = useState('DESC');

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State for payout processing
    const [processingPayout, setProcessingPayout] = useState(null);

    // Mock function to fetch payouts (replace with actual API call)
    const fetchPayouts = async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Reset to page 1 if filters changed
            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            // In a real implementation, this would be an API call
            // For now, let's mock some data
            setTimeout(() => {
                // This is mock data - replace with actual API call in production
                const mockPayouts = generateMockPayouts(25);
                let filteredPayouts = [...mockPayouts];

                // Apply search filter
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    filteredPayouts = filteredPayouts.filter(payout =>
                        payout.influencer.user.username.toLowerCase().includes(term)
                    );
                }

                // Apply status filter
                if (statusFilter !== 'all') {
                    filteredPayouts = filteredPayouts.filter(payout => payout.payment_status === statusFilter);
                }

                // Apply date filter
                if (dateFilter !== 'all') {
                    const now = new Date();
                    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

                    filteredPayouts = filteredPayouts.filter(payout => {
                        const payoutDate = new Date(payout.payout_date);

                        if (dateFilter === 'this_month') {
                            return payoutDate >= thisMonth;
                        } else if (dateFilter === 'last_month') {
                            return payoutDate >= lastMonth && payoutDate <= lastMonthEnd;
                        } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
                            const startDate = new Date(customDateRange.start);
                            const endDate = new Date(customDateRange.end);
                            endDate.setHours(23, 59, 59, 999); // Include the entire end day

                            return payoutDate >= startDate && payoutDate <= endDate;
                        }

                        return true;
                    });
                }

                // Sort
                filteredPayouts.sort((a, b) => {
                    let comparison = 0;

                    if (sortField === 'username') {
                        comparison = a.influencer.user.username.localeCompare(b.influencer.user.username);
                    } else if (sortField === 'amount') {
                        comparison = a.total_amount - b.total_amount;
                    } else if (sortField === 'payout_date') {
                        comparison = new Date(a.payout_date) - new Date(b.payout_date);
                    } else if (sortField === 'created_at') {
                        comparison = new Date(a.created_at) - new Date(b.created_at);
                    }

                    return sortOrder === 'ASC' ? comparison : -comparison;
                });

                // Pagination
                const total = filteredPayouts.length;
                const pages = Math.ceil(total / itemsPerPage);
                const start = (page - 1) * itemsPerPage;
                const paginatedPayouts = filteredPayouts.slice(start, start + itemsPerPage);

                setPayouts(paginatedPayouts);
                setTotalPayouts(total);
                setTotalPages(pages);
                setIsLoading(false);
            }, 500);

        } catch (error) {
            setError(error.message || 'An error occurred');
            setPayouts([]);
            setIsLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchPayouts();
    }, []);

    // Refresh when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchPayouts();
        }
    }, [refreshTrigger]);

    // Fetch payouts when filters, sorting or pagination changes
    useEffect(() => {
        fetchPayouts();
    }, [currentPage, itemsPerPage, sortField, sortOrder]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Apply filters when filter button is clicked
    const handleApplyFilters = () => {
        fetchPayouts(true);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        setCustomDateRange({ start: '', end: '' });
        setShowCustomDatePicker(false);
        fetchPayouts(true);
    };

    // Handle sorting changes
    const handleSortChange = (field) => {
        if (sortField === field) {
            // Toggle sort order if clicking the same field
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            // Set new sort field and default to DESC
            setSortField(field);
            setSortOrder('DESC');
        }
    };

    // Get sort indicator component
    const getSortIndicator = (field) => {
        if (sortField !== field) return null;
        return sortOrder === 'ASC' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />;
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle process payout
    const handleProcessPayout = async (payout) => {
        if (payout.payment_status !== 'pending') {
            toast.info('Only pending payouts can be processed');
            return;
        }

        setProcessingPayout(payout.payout_id);

        try {
            // In a real implementation, this would be an API call
            // For now, let's mock success after a delay
            setTimeout(() => {
                // Update the payout status in the local state
                const updatedPayouts = payouts.map(p =>
                    p.payout_id === payout.payout_id
                        ? { ...p, payment_status: 'completed' }
                        : p
                );

                setPayouts(updatedPayouts);
                toast.success(`Payout to ${payout.influencer.user.username} processed successfully`);
                setProcessingPayout(null);
            }, 1500);

        } catch (error) {
            console.error('Error processing payout:', error);
            toast.error(error.message || 'An error occurred');
            setProcessingPayout(null);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Generate mock payout data
    const generateMockPayouts = (count) => {
        const statuses = ['pending', 'completed', 'failed'];

        return Array(count).fill(0).map((_, index) => {
            const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
            const payoutDate = index % 3 === 0 ? null : new Date(createdAt.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);

            return {
                payout_id: index + 1,
                kol_id: 1000 + (index % 10), // Reuse same KOLs for multiple payouts
                influencer: {
                    influencer_id: 1000 + (index % 10),
                    user: {
                        user_id: 2000 + (index % 10),
                        username: `influencer${1 + (index % 10)}`,
                        first_name: `First${1 + (index % 10)}`,
                        last_name: `Last${1 + (index % 10)}`,
                        email: `influencer${1 + (index % 10)}@example.com`
                    },
                    tier: {
                        tier_id: 1 + (index % 4),
                        tier_name: ['Bronze', 'Silver', 'Gold', 'Platinum'][index % 4],
                        commission_rate: [5, 10, 15, 20][index % 4]
                    }
                },
                total_amount: Math.floor(Math.random() * 900) + 100,
                payment_status: statuses[index % 3],
                payout_date: payoutDate ? payoutDate.toISOString() : null,
                created_at: createdAt.toISOString(),
                modified_at: new Date(createdAt.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
            };
        });
    };

    // Calculate summary statistics
    const calculateSummary = () => {
        if (!payouts.length) return { total: 0, pending: 0, completed: 0 };

        return {
            total: payouts.reduce((sum, payout) => sum + payout.total_amount, 0),
            pending: payouts.filter(p => p.payment_status === 'pending')
                .reduce((sum, payout) => sum + payout.total_amount, 0),
            completed: payouts.filter(p => p.payment_status === 'completed')
                .reduce((sum, payout) => sum + payout.total_amount, 0)
        };
    };

    const summary = calculateSummary();

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header and Filter Section */}
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        KOL Payouts
                        {totalPayouts > 0 && <span className="text-sm text-gray-500 ml-2">({totalPayouts})</span>}
                    </h2>
                    <button
                        onClick={() => fetchPayouts()}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Refresh payouts"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center">
                        <div className="bg-blue-500 p-3 rounded-full mr-4">
                            <FiDollarSign className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-blue-700">Total Payouts</p>
                            <p className="text-xl font-bold text-blue-900">{formatCurrency(summary.total)}</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-center">
                        <div className="bg-yellow-500 p-3 rounded-full mr-4">
                            <FiCalendar className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-yellow-700">Pending</p>
                            <p className="text-xl font-bold text-yellow-900">{formatCurrency(summary.pending)}</p>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center">
                        <div className="bg-green-500 p-3 rounded-full mr-4">
                            <FiCheck className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-green-700">Completed</p>
                            <p className="text-xl font-bold text-green-900">{formatCurrency(summary.completed)}</p>
                        </div>
                    </div>
                </div>

                {/* Search and filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by KOL name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Date filter */}
                    <div className="relative">
                        <select
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setShowCustomDatePicker(e.target.value === 'custom');
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Dates</option>
                            <option value="this_month">This Month</option>
                            <option value="last_month">Last Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Export button */}
                    <div>
                        <button
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            <FiDownload className="mr-2" /> Export Report
                        </button>
                    </div>
                </div>

                {/* Custom date picker */}
                {showCustomDatePicker && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="start_date"
                                value={customDateRange.start}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="end_date"
                                value={customDateRange.end}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Filter buttons */}
                <div className="flex justify-end mt-4 space-x-3">
                    <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading payouts...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading payouts</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchPayouts()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No payouts found</p>
                        <p className="text-sm mt-2">Try changing your filters or create new payouts</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('username')}
                                >
                                    KOL {getSortIndicator('username')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('amount')}
                                >
                                    Amount {getSortIndicator('amount')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('payout_date')}
                                >
                                    Payout Date {getSortIndicator('payout_date')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('created_at')}
                                >
                                    Created {getSortIndicator('created_at')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payouts.map((payout) => (
                                <tr key={payout.payout_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payout.payout_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {payout.influencer.user.username}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Tier: {payout.influencer.tier.tier_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(payout.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payout.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                payout.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {payout.payment_status.charAt(0).toUpperCase() + payout.payment_status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payout.payout_date
                                            ? new Date(payout.payout_date).toLocaleDateString()
                                            : <span className="text-yellow-600">Scheduled</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(payout.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {payout.payment_status === 'pending' ? (
                                            <button
                                                onClick={() => handleProcessPayout(payout)}
                                                className={`text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md flex items-center justify-center ml-auto ${processingPayout === payout.payout_id ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                disabled={processingPayout === payout.payout_id}
                                            >
                                                {processingPayout === payout.payout_id ? (
                                                    <span className="flex items-center">
                                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></span>
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <FiDollarSign className="mr-1" />
                                                        Process
                                                    </span>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md flex items-center justify-center ml-auto"
                                                onClick={() => toast.info(`Viewing details for payout #${payout.payout_id}`)}
                                            >
                                                Details
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && payouts.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalPayouts)}
                        </span>{' '}
                        of <span className="font-medium">{totalPayouts}</span> payouts
                    </div>

                    <div className="flex items-center space-x-2">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-2 py-1 border rounded-md text-sm"
                        >
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                        </select>

                        <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPage === 1
                                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Previous</span>
                                &larr;
                            </button>

                            {/* Page numbers */}
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                if (pageNum > 0 && pageNum <= totalPages) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNum
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPage === totalPages
                                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Next</span>
                                &rarr;
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KOLPayouts;