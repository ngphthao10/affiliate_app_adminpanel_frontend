import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiBox, FiShoppingBag, FiPackage, FiUsers, FiSettings, FiMessageSquare } from 'react-icons/fi'

const Sidebar = () => {
    return (
        <div className='w-[18%] min-h-screen bg-white border-r'>
            <div className='flex flex-col gap-2 py-6 px-4'>
                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/products"
                >
                    <FiBox className="w-5 h-5" />
                    <p className='hidden md:block'>Products</p>
                </NavLink>

                <NavLink
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                    to="/orders"
                >
                    <FiShoppingBag className="w-5 h-5" />
                    <p className='hidden md:block'>Orders</p>
                </NavLink>

                {/* These links are just for UI completeness, they don't need to be functional for this example */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                    <FiUsers className="w-5 h-5" />
                    <p className='hidden md:block'>Customers</p>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                    <FiMessageSquare className="w-5 h-5" />
                    <p className='hidden md:block'>Reviews</p>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                    <FiSettings className="w-5 h-5" />
                    <p className='hidden md:block'>Settings</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar