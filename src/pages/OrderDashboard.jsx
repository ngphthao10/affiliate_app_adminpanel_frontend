import React, { useState, useEffect } from 'react';
import OrderManagement from '../components/OrderManagement/OrderManagement';
import OrderDetailsModal from '../components/OrderManagement/OrderDetailsModal';
import OrderDateSlider from '../components/OrderManagement/OrderDateSlider';
import orderService from '../services/orderService';
import { toast } from 'react-toastify';

const OrderDashboard = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [orders, setOrders] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger

    // Fetch initial orders when component mounts or refreshTrigger changes
    useEffect(() => {
        fetchOrdersForDate(selectedDate);
    }, [selectedDate, refreshTrigger]);

    const handleOrderClick = async (orderId) => {
        try {
            setIsLoading(true);
            const response = await orderService.getOrderDetails(orderId);
            if (response.success) {
                setSelectedOrder(response.order);
                setIsModalOpen(true);
            } else {
                toast.error(response.message || 'Failed to load order details');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while loading order details');
            console.error('Error loading order details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // This function will be called when an order is updated
    const handleOrderUpdated = (updatedOrder) => {
        // Update the order in the orders array
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === updatedOrder.order_id ?
                    { ...order, status: updatedOrder.status } :
                    order
            )
        );

        // Also update the selected order
        setSelectedOrder(updatedOrder);

        // Force a refresh of the data by incrementing the refreshTrigger
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const fetchOrdersForDate = async (date) => {
        try {
            setIsLoading(true);
            // Format date to YYYY-MM-DD for API
            const formattedDate = date.toISOString().split('T')[0];

            const response = await orderService.getOrdersByDate(formattedDate);
            if (response.success) {
                setOrders(response.orders);
            } else {
                toast.error(response.message || 'Failed to load orders');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while loading orders');
            console.error('Error loading orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <OrderDateSlider
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
            />

            <OrderManagement
                orders={orders}
                onOrderClick={handleOrderClick}
                isLoading={isLoading}
                selectedDate={selectedDate}
                refreshTrigger={refreshTrigger} // Pass the refresh trigger to OrderManagement
            />

            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                onOrderUpdated={handleOrderUpdated} // Pass the update handler
            />
        </div>
    );
};

export default OrderDashboard;