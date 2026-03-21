import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, ShieldCheck, Truck, RotateCcw, Star, User as UserIcon, Send, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, reviews, user, addReview, toggleWishlist, isInWishlist, addToCart, settings } = useStore();
  const product = products.find(p => p.slug === slug);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(product?.image || '');
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Update currentImage when product changes
  React.useEffect(() => {
    if (product) {
      setCurrentImage(product.image);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold">Go Back Home</button>
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])].filter(img => img !== '');

  const productReviews = reviews.filter(r => r.productId === product.id);
  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
    : 0;

  const handleOrderNow = () => {
    if (!user) {
      alert('You need to login to place an order.');
      navigate('/profile', { state: { from: `/product/${product.slug}` } });
      return;
    }
    navigate('/checkout', { state: { product, selectedSize, quantity } });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You need to login to give a review.');
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await addReview({
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment
      });
      setComment('');
      setRating(5);
      alert('Your review has been submitted successfully!');
    } catch (error) {
      alert('There was an error submitting your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 pb-20 bg-gray-50 min-h-screen">
      <div className="container max-w-2xl px-0 sm:px-4">
        <div className="bg-white shadow-sm overflow-hidden sm:rounded-3xl">
          {/* Product Images */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <div className="aspect-square bg-white">
              <img 
                src={currentImage} 
                alt={product.name} 
                className="w-full h-full object-contain transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Thumbnails Grid */}
            {allImages.length > 1 && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-6 gap-2">
                  {allImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden bg-gray-50 cursor-pointer border-2 transition-all ${
                        currentImage === img ? 'border-red-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <div className="p-4 lg:p-6 space-y-6">
            <div className="space-y-4">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-gray-500">Wholesale Price</span>
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Ready to ship</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-red-600">Tk {product.price}</span>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-400 line-through font-medium">Tk {product.oldPrice}</span>
                  )}
                </div>
              </div>

              {/* Description Moved Here */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-2">Product Details</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2 rounded-lg border-2 transition-all font-bold text-sm ${
                        selectedSize === size 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-red-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleOrderNow}
                  className="bg-[#FF4D00] hover:bg-[#E64500] text-white py-4 rounded-full font-black text-lg shadow-lg active:scale-95 transition-all"
                >
                  Buy Now
                </button>
                <button 
                  onClick={() => {
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      quantity,
                      size: selectedSize
                    });
                    alert('Added to cart!');
                  }}
                  className="bg-white border-2 border-gray-200 hover:border-red-600 hover:text-red-600 text-gray-900 py-4 rounded-full font-black text-lg active:scale-95 transition-all"
                >
                  Add to Cart
                </button>
              </div>

              <button 
                onClick={() => window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`I want to order: ${product.name}\nPrice: Tk ${product.price}\nLink: ${window.location.href}`)}`, '_blank')}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-full font-black text-lg flex items-center justify-center space-x-3 shadow-lg active:scale-95 transition-all"
              >
                <Phone size={24} fill="currentColor" />
                <span>WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 transition-all font-bold ${
                    isInWishlist(product.id)
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-red-200'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                  <span>Save Product</span>
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 border-gray-100 bg-white text-gray-600 hover:border-red-200 transition-all font-bold"
                >
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Store Info Placeholder */}
            <div className="pt-8 border-t border-gray-100" />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white sm:rounded-3xl shadow-sm p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-black mb-6">Give a Review</h2>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 transition-colors ${rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Comment</label>
                    <textarea
                      required
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows={4}
                      placeholder="How was the product?"
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 outline-none resize-none font-medium"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-red-100"
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                    {!submitting && <Send size={18} />}
                  </button>
                </form>
              ) : (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center">
                  <p className="text-red-700 font-bold mb-4">You need to login to give a review.</p>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="bg-red-600 text-white px-8 py-3 rounded-xl font-black hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Review List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black">Customer Reviews ({productReviews.length})</h2>
                <div className="flex items-center text-amber-500 bg-amber-50 px-4 py-2 rounded-full">
                  <Star size={20} fill="currentColor" />
                  <span className="ml-2 font-black text-lg">{averageRating}</span>
                </div>
              </div>

              <div className="space-y-6">
                {productReviews.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  productReviews.map(review => (
                    <div key={review.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-red-100 text-red-600 font-black text-lg">
                            {review.userPhoto ? (
                              <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              review.userName[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{review.userName}</p>
                            <p className="text-xs text-gray-400 font-bold">{new Date(review.createdAt).toLocaleDateString('en-US')}</p>
                          </div>
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed">
                        {review.comment}
                      </p>

                      {review.adminReply && (
                        <div className="mt-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                              A
                            </div>
                            <p className="text-xs font-black text-red-700">Admin Reply</p>
                            <span className="text-[10px] text-gray-400 font-bold">
                              {review.adminReplyAt && new Date(review.adminReplyAt).toLocaleDateString('en-US')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 italic font-medium">
                            {review.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
