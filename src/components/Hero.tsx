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
      <section className="relative w-full aspect-[12/5] max-h-[600px] bg-gray-100 animate-pulse" />
    );
  }

  if (sliders.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 15000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        className="w-full aspect-[12/5] max-h-[600px]"
      >
        {sliders.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Link to={slide.link || '#'} className="block w-full h-full">
              <picture>
                {slide.mobileImage && <source media="(max-width: 768px)" srcSet={slide.mobileImage} />}
                <img 
                  src={slide.image} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </picture>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
