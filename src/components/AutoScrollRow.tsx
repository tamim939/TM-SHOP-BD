import React, { useRef, useEffect } from 'react';

interface AutoScrollRowProps {
  children: React.ReactNode;
}

const AutoScrollRow: React.FC<AutoScrollRowProps> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let isPaused = false;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        const isMobile = window.innerWidth < 768;
        const itemWidth = isMobile ? 146 : 216; // card width + gap
        const currentScroll = scrollContainer.scrollLeft;
        
        // Calculate next scroll position to align with start of an item
        const nextScroll = Math.floor((currentScroll + itemWidth) / itemWidth) * itemWidth;
        
        if (nextScroll >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainer.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    };

    const intervalId = setInterval(scroll, 4000); // Scroll every 4 seconds

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('touchstart', handleMouseEnter);
    scrollContainer.addEventListener('touchend', handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('touchstart', handleMouseEnter);
      scrollContainer.removeEventListener('touchend', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-x-auto pb-2 gap-4 lg:gap-6 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {children}
    </div>
  );
};

export default AutoScrollRow;
