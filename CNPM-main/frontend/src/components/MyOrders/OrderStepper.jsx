import React from 'react';
import { FaClipboardCheck, FaBox, FaShippingFast, FaCheckCircle, FaPaw } from 'react-icons/fa';

const steps = [
  { id: 'Pending', label: 'Đã đặt hàng', icon: FaClipboardCheck },
  { id: 'Processing', label: 'Đã xác nhận', icon: FaBox },
  { id: 'Shipping', label: 'Đang vận chuyển', icon: FaShippingFast },
  { id: 'Delivered', label: 'Thành công', icon: FaCheckCircle },
];

export default function OrderStepper({ status }) {
  // Map status to step index
  const statusToStep = {
    'Pending': 0,
    'Processing': 1,
    'Shipping': 2,
    'Đang giao': 2,
    'Delivered': 3,
    'Hoàn thành': 3,
    'Canceled': -1,
    'Đã hủy': -1
  };

  const currentStep = statusToStep[status] ?? 0;

  if (status === 'Canceled' || status === 'Đã hủy') {
    return (
      <div className="py-4 text-center text-red-500 font-bold bg-red-50 rounded-xl">
        Đơn hàng này đã bị hủy.
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between">
        {/* Progress Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 transform -translate-y-1/2 z-0 rounded-full" />
        
        {/* Progress Line Active */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-orange-400 transform -translate-y-1/2 z-0 transition-all duration-1000 ease-out rounded-full" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                  isActive 
                  ? 'bg-white border-orange-400 text-orange-500' 
                  : 'bg-white border-gray-200 text-gray-300'
                } ${isCurrent ? 'ring-4 ring-orange-100 shadow-lg scale-110' : ''}`}
              >
                {isCurrent && (status === 'Shipping' || status === 'Đang giao') ? (
                  <FaPaw className="animate-bounce" />
                ) : (
                  <Icon />
                )}
              </div>
              <span className={`mt-3 text-[10px] md:text-xs font-bold uppercase tracking-tighter md:tracking-normal ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              
              {/* Pet Icon Indicator for Shipping Step */}
              {isCurrent && (status === 'Shipping' || status === 'Đang giao') && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                   <div className="bg-orange-500 text-white text-[8px] py-1 px-2 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                      <FaPaw size={8}/> Ship đang tới!
                   </div>
                   <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-orange-500 mx-auto" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
