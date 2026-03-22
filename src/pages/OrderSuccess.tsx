import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  if (!order) {
    return (
      <div className="container py-32 text-center">
        <h2 className="text-2xl font-bold">Session Expired</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold">Go Back Home</button>
      </div>
    );
  }

  const orderId = order.id || Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const subtotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <div className="pt-4 pb-20 bg-gray-50 min-h-screen">
      <div className="container max-w-2xl mx-auto px-4">
        
        {/* Success Alert */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <div className="bg-green-500 text-white rounded-full p-1 mt-0.5">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <h3 className="text-green-800 font-bold text-sm">Order Placed Successfully!</h3>
            <p className="text-green-700 text-xs mt-0.5">Thank you for your order. We've received your order and will process it shortly.</p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          
          {/* Red Header */}
          <div className="bg-red-600 text-white py-3 px-6">
            <h2 className="font-bold text-lg">Order Details</h2>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Number</p>
                <p className="text-sm font-bold text-gray-900">CO{orderId}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Date</p>
                <p className="text-sm font-bold text-gray-900">{orderDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Status</p>
                <div className="mt-1">
                  <span className="bg-amber-100 text-amber-700 px-3 py-0.5 rounded-full text-[10px] font-bold">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Shipping Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Contact Person</p>
                  <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
                  <p className="text-sm font-bold text-gray-800">{order.customerPhone}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Shipping Address</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  {order.customerAddress}
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Order Items Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{item.name} x {item.quantity}</span>
                    <span className="font-bold text-gray-900">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Order Summary</h3>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">৳{subtotal.toLocaleString()}</span>
              </div>
              
              {order.paymentMethod !== 'cod' && (
                <>
                  <div className="flex justify-between text-xs text-green-600 font-bold">
                    <span>Advance Payment (70%)</span>
                    <span>৳{order.advanceAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-500 font-bold">
                    <span>Due Payment (30%)</span>
                    <span>৳{order.dueAmount.toLocaleString()}</span>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-gray-900 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Total Amount</span>
                <span className="text-lg font-black text-red-600">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Payment Method</p>
                  <p className="text-sm font-bold text-gray-800 capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Payment Status</p>
                  <div className="mt-1">
                    <span className="bg-amber-100 text-amber-700 px-3 py-0.5 rounded-full text-[10px] font-bold">
                      Awaiting Verification
                    </span>
                  </div>
                </div>
              </div>

              {order.paymentMethod !== 'cod' && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest border-b border-blue-200 pb-1 mb-2">
                    {order.paymentMethod.toUpperCase()} Payment:
                  </p>
                  <div className="flex items-center space-x-2 text-[11px] text-blue-800 font-bold">
                    <span className="text-green-600">✅</span>
                    <span>Advance Payment: ৳{order.advanceAmount} (Paid)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-blue-800 font-bold">
                    <span className="text-amber-600">⏳</span>
                    <span>Due Payment: ৳{order.dueAmount} (Pay on delivery)</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => navigate('/orders')}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-sm"
            >
              View Order History
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help with your order? <button onClick={() => navigate('/contact')} className="text-red-600 font-bold hover:underline">Contact our support team</button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
