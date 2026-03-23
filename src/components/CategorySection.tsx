import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function CategorySection() {
  const { categories, categoriesLoaded } = useStore();

  if (!categoriesLoaded) return null;

  if (categories.length === 0) return null;

  return (
    <section className="pt-6 pb-2 bg-white border-b border-gray-100">
      <div className="container">
        <div className="mb-4 px-4">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">All Categories</h2>
          <div className="w-12 h-1 bg-red-600 mt-1"></div>
        </div>
        <div className="overflow-x-auto no-scrollbar pb-4">
          <div className="flex items-center justify-start space-x-6 min-w-max px-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="group flex flex-col items-center space-y-2"
                >
                  <div className="relative w-16 h-16 lg:w-20 lg:h-20 overflow-hidden rounded-full border-2 border-gray-100 group-hover:border-red-500 transition-all p-0.5">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] lg:text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors whitespace-nowrap uppercase tracking-tighter">
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
