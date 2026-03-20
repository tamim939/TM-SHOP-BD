import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Phone, FileDown } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, selectedSize, quantity, formData } = location.state || {};

  if (!product || !formData) {
    return (
      <div className="container py-32 text-center">
        <h2 className="text-2xl font-bold">Session Expired</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold">Go Back Home</button>
      </div>
    );
  }

  const orderId = Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const shippingCharge = 70;
  const subtotal = product.price * quantity;
  const total = subtotal + shippingCharge;

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('TSB SHOP BD', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Order Invoice', 105, 30, { align: 'center' });
    
    // Order Info
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderId}`, 20, 45);
    doc.text(`Date: ${orderDate}`, 20, 52);
    doc.text(`Payment Method: Cash On Delivery`, 20, 59);
    
    // Shipping Address
    doc.setFontSize(12);
    doc.text('Shipping Address:', 20, 75);
    doc.setFontSize(10);
    doc.text(formData.name, 20, 82);
    doc.text(formData.phone, 20, 89);
    doc.text(formData.address, 20, 96, { maxWidth: 100 });
    
    // Table
    autoTable(doc, {
      startY: 110,
      head: [['Product', 'Size', 'Price', 'Qty', 'Total']],
      body: [
        [product.name, selectedSize, `BDT ${product.price}`, quantity, `BDT ${subtotal}`]
      ],
      headStyles: { fillColor: [5, 150, 105] },
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: BDT ${subtotal}`, 140, finalY);
    doc.text(`Shipping: BDT ${shippingCharge}`, 140, finalY + 7);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: BDT ${total}`, 140, finalY + 15);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for shopping with TSB SHOP BD!', 105, finalY + 30, { align: 'center' });
    doc.text('Contact: 09613005566', 105, finalY + 37, { align: 'center' });
    
    doc.save(`invoice-${orderId}.pdf`);
  };

  return (
    <div className="pt-8 pb-20 bg-white min-h-screen">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center space-y-4 mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg"
          >
            <CheckCircle2 size={40} />
          </motion.div>
          <div className="space-y-1">
            <p className="text-lg">Thanks you, <span className="font-bold text-emerald-600">{formData.name}</span></p>
            <h1 className="text-2xl font-bold text-black-custom">Your Order has been received</h1>
          </div>
          <p className="text-sm text-gray-500 px-4">
            We will call you to confirm order as soon as possible. If you have any asking about order or shipping, feel free to let us know.
          </p>
          <div className="flex items-center justify-center space-x-2 text-black font-bold">
            <div className="bg-black text-white p-1.5 rounded-full">
              <Phone size={14} fill="white" />
            </div>
            <span>09613005566</span>
          </div>
        </div>

        {/* Order Details Header */}
        <div className="bg-gray-100 py-2 px-4 rounded mb-6">
          <h2 className="text-sm font-bold text-gray-700">Order Details</h2>
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8 px-2">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Order Id</p>
            <p className="text-sm font-bold">{orderId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Date:</p>
            <p className="text-sm font-bold leading-tight">{orderDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Total:</p>
            <p className="text-sm font-bold">BDT {total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Payment Method:</p>
            <p className="text-sm font-bold capitalize">Cash On Delivery</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Shipping Area:</p>
            <p className="text-sm font-bold"></p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-8 px-2">
          <h3 className="text-sm font-bold mb-2">Shipping address</h3>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>{formData.name}</p>
            <p>{formData.phone}</p>
            <p className="text-xs">{formData.address}</p>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-4 mb-8 px-2 border-t pt-4">
          <div className="flex justify-between items-start text-sm">
            <div className="flex-grow">
              <p className="font-medium text-gray-800">{product.name}</p>
              <p className="text-xs text-gray-400 mt-1">size: {selectedSize}</p>
            </div>
            <div className="flex space-x-8">
              <span className="text-gray-500">{quantity} x {product.price}</span>
              <span className="font-bold">{subtotal}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-2 border-t pt-4 mb-10 px-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal:</span>
            <span className="font-medium">BDT {subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping:</span>
            <span className="font-medium">BDT {shippingCharge}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount:</span>
            <span className="font-medium">BDT 0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">VAT:</span>
            <span className="font-medium">BDT 0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Method:</span>
            <span className="font-medium capitalize">Cash on delivery</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2">
            <span>Total</span>
            <span className="text-black">BDT {total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 px-2">
          <button 
            onClick={() => navigate('/')}
            className="flex-grow bg-gray-100 text-gray-700 py-3 rounded-md font-bold flex items-center justify-center space-x-2 text-sm hover:bg-gray-200 transition-colors"
          >
            <span>Continue Shopping</span>
          </button>
          <button 
            onClick={generatePDF}
            className="flex-grow bg-emerald-600 text-white py-3 rounded-md font-bold flex items-center justify-center space-x-2 text-sm hover:bg-emerald-700 transition-colors"
          >
            <FileDown size={18} />
            <span>Download Invoice (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
