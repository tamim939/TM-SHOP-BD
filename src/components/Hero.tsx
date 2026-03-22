import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';

export default function Hero() {
  const { sliders, slidersLoaded } = useStore();

  if (!slidersLoaded) {
    return (
      <section className="relative w-full px-4 lg:px-6 py-4">
        <div className="max-w-[1400px] mx-auto w-full bg-gray-100 animate-pulse aspect-[16/9] md:aspect-[21/9] rounded-3xl" />
      </section>
    );
  }

  if (sliders.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full px-4 lg:px-6 py-4">
      <div className="max-w-[1400px] mx-auto w-full overflow-hidden rounded-3xl shadow-xl shadow-black/5 border border-gray-100">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          modules={[Autoplay, Pagination]}
          className="w-full aspect-[16/9] md:aspect-[21/9] max-h-[700px]"
        >
          {sliders.map((slide) => (
            <SwiperSlide key={slide.id}>
              <Link to={slide.link || '#'} className="block w-full h-full relative group">
                <picture>
                  {slide.mobileImage && <source media="(max-width: 768px)" srcSet={slide.mobileImage} />}
                  <img 
                    src={slide.image} 
                    alt="Banner" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </picture>
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
