import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, ShieldCheck, Truck, RotateCcw, Star, User as UserIcon, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, reviews, user, addReview, toggleWishlist, isInWishlist, addToCart } = useStore();
  const product = products.find(p => p.slug === slug);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold">Go Back Home</button>
      </div>
    );
  }

  const productReviews = reviews.filter(r => r.productId === product.id);
  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
    : 0;

  const handleOrderNow = () => {
    if (!user) {
      alert('অর্ডার করতে হলে আপনাকে লগইন করতে হবে।');
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
    <div className="pt-8 pb-12">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 border-transparent hover:border-primary transition-all">
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-black-custom mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center text-amber-500">
                  <Star size={18} fill="currentColor" />
                  <span className="ml-1 font-bold text-gray-900">{averageRating}</span>
                  <span className="ml-1 text-gray-400 text-sm">({productReviews.length} reviews)</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-emerald-600">Tk {product.price}</span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through">Tk {product.oldPrice}</span>
                )}
                {product.discount && (
                  <span className="bg-emerald-600 text-white px-2 py-1 rounded text-sm font-bold">-{product.discount}% OFF</span>
                )}
              </div>
            </div>

            <div className="border-t border-b py-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
              
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-2 rounded-md border-2 transition-all font-medium ${
                          selectedSize === size 
                            ? 'border-emerald-600 bg-emerald-600 text-white' 
                            : 'border-gray-200 hover:border-emerald-600 text-gray-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold min-w-[40px] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleOrderNow}
                  className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <ShoppingBag size={20} />
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
                  className="px-4 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-bold flex items-center space-x-2 hover:bg-emerald-50 transition-all"
                >
                  <ShoppingBag size={20} />
                  <span>Cart</span>
                </button>
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    isInWishlist(product.id)
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-600'
                  }`}
                >
                  <Heart size={24} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Truck className="text-emerald-600" size={24} />
                <span className="text-xs font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <ShieldCheck className="text-emerald-600" size={24} />
                <span className="text-xs font-medium">100% Authentic</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <RotateCcw className="text-emerald-600" size={24} />
                <span className="text-xs font-medium">7 Days Return</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Share:</span>
              <button className="text-gray-400 hover:text-emerald-600 transition-colors"><Share2 size={20} /></button>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-6">Give a Review</h2>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                    <textarea
                      required
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows={4}
                      placeholder="How was the product?"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                    {!submitting && <Send size={18} />}
                  </button>
                </form>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center">
                  <p className="text-amber-700 mb-4">You need to login to give a review.</p>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Review List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Customer Reviews ({productReviews.length})</h2>
                <div className="flex items-center text-amber-500">
                  <Star size={20} fill="currentColor" />
                  <span className="ml-1 font-bold text-lg">{averageRating}</span>
                </div>
              </div>

              <div className="space-y-6">
                {productReviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed">
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  productReviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-100 flex items-center justify-center bg-emerald-50 text-emerald-600 font-bold">
                            {review.userPhoto ? (
                              <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              review.userName[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{review.userName}</p>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US')}</p>
                          </div>
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {review.comment}
                      </p>

                      {review.adminReply && (
                        <div className="mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              A
                            </div>
                            <p className="text-xs font-bold text-emerald-700">Admin Reply</p>
                            <span className="text-[10px] text-emerald-400">
                              {review.adminReplyAt && new Date(review.adminReplyAt).toLocaleDateString('en-US')}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-800 italic">
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
