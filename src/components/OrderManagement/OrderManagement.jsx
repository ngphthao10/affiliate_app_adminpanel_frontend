import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import { currency } from '../../App';

const OrderManagement = ({
    orders: propOrders,
    onOrderClick,
    isLoading: parentLoading,
    selectedDate,
    refreshTrigger // Add the refreshTrigger prop
}) => {
    // State for filters and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [paymentFilter, setPaymentFilter] = useState('All Payment Statuses');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State for data
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect for prop orders changes
    useEffect(() => {
        if (propOrders) {
            setOrders(propOrders);
            setTotalOrders(propOrders.length);
            setTotalPages(Math.ceil(propOrders.length / itemsPerPage));
        }
    }, [propOrders, itemsPerPage]);

    // Effect for refreshTrigger changes - this ensures we refresh when an order is updated
    useEffect(() => {
        if (refreshTrigger > 0 && !selectedDate) {
            fetchOrders();
        }
    }, [refreshTrigger]);

    // Add effect for pagination changes
    useEffect(() => {
        if (!isLoading && !selectedDate) {
            fetchOrders();
        }
    }, [currentPage, itemsPerPage]);

    // Update fetchOrders to handle both prop updates and pagination
    const fetchOrders = async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Reset to page 1 if filters changed
            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            const queryParams = {
                page,
                limit: itemsPerPage,
                sort_by: 'creation_at',
                sort_order: 'DESC'
            };

            // Add filters
            if (searchTerm) queryParams.search = searchTerm;
            if (statusFilter !== 'All Statuses') queryParams.status = statusFilter;
            if (paymentFilter !== 'All Payment Statuses') queryParams.payment_status = paymentFilter;
            if (startDate) queryParams.start_date = startDate;
            if (endDate) queryParams.end_date = endDate;

            const response = await orderService.getOrders(queryParams);

            if (response.success) {
                setOrders(response.orders);
                setTotalOrders(response.pagination.total);
                setTotalPages(response.pagination.pages);
            } else {
                setError(response.message || 'Failed to load orders');
                setOrders([]);
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle filter application
    const handleApplyFilters = () => {
        fetchOrders(true);
    };

    // Handle filter reset
    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('All Statuses');
        setPaymentFilter('All Payment Statuses');
        setStartDate('');
        setEndDate('');
        fetchOrders(true);
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
            case 'returned':
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'processing':
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Rest of the component remains the same...

    return (
        <div className="bg-white rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-700">
                    Order Management
                    {totalOrders > 0 && (
                        <span className="text-sm text-gray-500 ml-2">({totalOrders})</span>
                    )}
                </h2>
                <button
                    onClick={() => fetchOrders()}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    disabled={isLoading}
                >
                    <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Filters section and table remain the same... */}

            {/* Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading orders</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchOrders()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No orders found</p>
                        <p className="text-sm mt-2">Try changing your filters</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORDER ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PAYMENT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onOrderClick(order.id)}
                                >
                                    <td className="p-4">#{order.id}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{order.customer.name}</div>
                                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                                    </td>
                                    <td className="p-4">{currency}{order.total.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.payment_status)}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Pagination */}
            {!isLoading && !error && orders.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <select
                            className="border rounded p-1"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                        <span className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                            {' '}to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * itemsPerPage, totalOrders)}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium">{totalOrders}</span>
                            {' '}orders
                        </span>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border rounded ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            Previous
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
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 border rounded ${currentPage === pageNum
                                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 border rounded ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;