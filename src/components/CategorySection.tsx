import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function CategorySection() {
  const { categories, categoriesLoaded } = useStore();

  if (!categoriesLoaded) {
    return null;
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-6 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
      <div className="container">
        <div className="mb-6 px-4">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">All Categories</h2>
          <div className="w-12 h-1 bg-red-600 mt-2"></div>
        </div>
        <div className="flex items-center justify-start lg:justify-center space-x-6 lg:space-x-12 min-w-max px-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/category/${category.slug}`}
                className="group flex flex-col items-center space-y-3"
              >
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 overflow-hidden rounded-full border-2 border-red-100 group-hover:border-red-500 transition-all p-1">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
