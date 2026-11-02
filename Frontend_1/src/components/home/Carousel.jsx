import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "../../context/RouterContext";

import Slider1 from "../../assets/Image/Home/carousel (1).png";
import Slider2 from "../../assets/Image/Home/carousel (2).png";
import Slider3 from "../../assets/Image/Home/carousel (3).png";
import Slider4 from "../../assets/Image/Home/carousel.png";

const slides = [
  {
    id: 1,
    image: Slider1,
    title: "Everyday upgrades, thoughtfully chosen.",
    text: "Discover modern essentials across tech, fashion and home.",
    action: "Shop collection",
    path: "/shop",
  },
  {
    id: 2,
    image: Slider2,

    title: "Make your space feel like yours.",
    text: "Quietly premium pieces for work, rest and everything between.",
    action: "Explore home",
    path: "/shop?category=home-decoration",
  },
  {
    id: 3,
    image: Slider3,

    title: "Style that works every day.",
    text: "Build a wardrobe around versatile, easy-to-wear essentials.",
    action: "Shop fashion",
    path: "/shop?category=mens-shirts",
  },
  {
    id: 4,
    image: Slider4,

    title: "Technology, made more useful.",
    text: "Audio, wearables and desk gear selected for modern routines.",
    action: "Shop electronics",
    path: "/shop?category=laptops",
  },
];


const SLIDE_DURATION = 1000; // ms, horizontal slide
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const TEXT_DURATION = 800; // ms, translateY + opacity
const TEXT_DELAY = 350; // ms, starts while the image is still settling
const TEXT_STAGGER = 90; // ms between heading → paragraph → buttons
const TEXT_OFFSET = 32; // px, how far the text travels upward

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD = 60;

const total = slides.length;

/*
  Infinite loop without a "rewind" jump:
  [last clone] [1] [2] [3] [4] [first clone]
  After sliding onto a clone we silently jump to the real slide.
*/
const extendedSlides = [slides[total - 1], ...slides, slides[0]];

export default function Carousel() {
  const { navigate } = useRouter();

  const [pos, setPos] = useState(1); // position inside extendedSlides
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false); // lets the first slide's text animate on load

  const posRef = useRef(1);
  const lockRef = useRef(false);
  const settleTimerRef = useRef(null);
  const touchRef = useRef(null);

  /* First load: play the text entrance once the page has painted */
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => () => clearTimeout(settleTimerRef.current), []);

  /* After a slide finishes: if we're on a clone, jump to the real slide
     with transitions disabled (visually identical, so no flicker). */
  const settle = useCallback(() => {
    const current = posRef.current;
    let target = null;

    if (current === 0) target = total;
    else if (current === total + 1) target = 1;

    if (target === null) {
      lockRef.current = false;
      return;
    }

    posRef.current = target;
    setAnimate(false);
    setPos(target);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        lockRef.current = false;
      })
    );
  }, []);

  const moveTo = useCallback(
    (target) => {
      if (lockRef.current) return; // one slide at a time
      lockRef.current = true;

      posRef.current = target;
      setAnimate(true);
      setPos(target);

      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(settle, SLIDE_DURATION + 30);
    },
    [settle]
  );

  const next = useCallback(() => moveTo(posRef.current + 1), [moveTo]);
  const prev = useCallback(() => moveTo(posRef.current - 1), [moveTo]);

  /* Auto play — timer restarts after every slide change */
  useEffect(() => {
    if (paused || dragging) return;

    const id = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [paused, dragging, pos, next]);

  /* Touch swipe — the track follows the finger, then snaps */
  const handleTouchStart = (e) => {
    if (lockRef.current) return;

    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      horizontal: null,
    };
  };

  const handleTouchMove = (e) => {
    const t = touchRef.current;
    if (!t) return;

    const dx = e.touches[0].clientX - t.x;
    const dy = e.touches[0].clientY - t.y;

    if (t.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      t.horizontal = Math.abs(dx) > Math.abs(dy);
    }

    if (!t.horizontal) return;

    setDragging(true);
    setDragX(dx);
  };

  const handleTouchEnd = (e) => {
    const t = touchRef.current;
    touchRef.current = null;

    if (!t || !t.horizontal) return;

    const dx = e.changedTouches[0].clientX - t.x;

    setDragging(false);
    setDragX(0);

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) next();
      else prev();
    }
  };

  /* Keyboard */
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  /* Same entrance for every slide: translateY + opacity, staggered by `order` */
  const reveal = (active, order) => ({
    opacity: active ? 1 : 0,
    transform: active
      ? "translate3d(0, 0, 0)"
      : `translate3d(0, ${TEXT_OFFSET}px, 0)`,
    transition: !animate
      ? "none"
      : active
        ? `opacity ${TEXT_DURATION}ms ${EASE} ${TEXT_DELAY + order * TEXT_STAGGER}ms, transform ${TEXT_DURATION}ms ${EASE} ${TEXT_DELAY + order * TEXT_STAGGER}ms`
        : // leaving: just fade, then reset the offset once the slide is off-screen
        `opacity 350ms ease-out 0ms, transform 0ms linear ${SLIDE_DURATION}ms`,
    willChange: "transform, opacity",
  });

  return (
    <section
      className="
        relative
        w-full
        touch-pan-y
        overflow-hidden
        bg-gray-200
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      {/* Hero */}
      <div
        className="
          relative
          h-[78svh]
          min-h-[620px]
          max-h-[900px]
          w-full
          sm:h-[82svh]
          lg:h-[calc(100svh-16px)]
        "
      >
        {/* Sliding track */}
        <div
          className="flex h-full w-full"
          style={{
            transform: `translate3d(calc(${-pos * 100}% + ${dragX}px), 0, 0)`,
            transition:
              animate && !dragging
                ? `transform ${SLIDE_DURATION}ms ${EASE}`
                : "none",
            willChange: "transform",
          }}
        >
          {extendedSlides.map((item, j) => {
            const isCurrent = j === pos;
            const isActive = isCurrent && ready;

            return (
              <div
                key={`${item.id}-${j}`}
                className="relative h-full w-full shrink-0 basis-full overflow-hidden"
                aria-hidden={!isCurrent}
                role="group"
                aria-roledescription="slide"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt=""
                  className="
                    h-full
                    w-full
                    object-cover
                    object-center
                  "
                  loading="eager"
                  decoding="async"
                  draggable="false"
                />

                {/* Editorial overlays */}
                <div className="absolute inset-0 bg-black/[0.08]" />

                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    h-[65%]
                    bg-gradient-to-t
                    from-black/55
                    via-black/20
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-40
                    bg-gradient-to-b
                    from-black/10
                    to-transparent
                  "
                />

                {/* Content */}
                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    z-10
                    mx-auto
                    w-full
                    max-w-[1560px]
                    px-6
                    pb-16
                    sm:px-10
                    sm:pb-20
                    lg:px-12
                    lg:pb-20
                  "
                >
                  <div
                    className="
                      max-w-[850px]
                      text-white
                    "
                  >
                    {/* Heading */}
                    <h1
                      style={{
                        fontFamily: "Satoshi-Regular",
                        ...reveal(isActive, 0),
                      }}
                      className="
                        max-w-[850px]
                        text-[69px]
                        leading-[0.92]
                        tracking-[-0.055em]
                        text-white
                        motion-reduce:!transition-none
                      "
                    >
                      {item.title}
                    </h1>

                    {/* Description */}
                    <p
                      style={reveal(isActive, 1)}
                      className="
                        mt-6
                        max-w-xl
                        text-sm
                        leading-6
                        text-white/95
                        sm:text-base
                        lg:text-2xl
                        motion-reduce:!transition-none
                      "
                    >
                      {item.text}
                    </p>

                    {/* Buttons */}
                    <div
                      style={reveal(isActive, 2)}
                      className="mt-7 flex flex-wrap gap-3 motion-reduce:!transition-none"
                    >
                      <button
                        style={{ fontFamily: "Satoshi-Medium" }}
                        onClick={() => navigate(item.path)}
                        tabIndex={isCurrent ? 0 : -1}
                        className="
                          rounded-full
                          bg-white
                          px-6
                          py-2.5
                          text-sm
                          font-semibold
                          text-gray-950
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-gray-100
                          hover:shadow-xl
                          sm:px-7
                        "
                      >
                        {item.action}
                      </button>

                      <button
                        style={{ fontFamily: "Satoshi-Medium" }}
                        onClick={() => navigate("/shop")}
                        tabIndex={isCurrent ? 0 : -1}
                        className="
                          rounded-full
                          border
                          border-white/50
                          bg-white/10
                          px-6
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          backdrop-blur-md
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-white
                          hover:text-gray-950
                          sm:px-7
                        "
                      >
                        Explore all
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>



        {/* Arrow controls: single pill, matches reference */}
        <div
          className="
    absolute bottom-5 right-4 z-20
    flex items-center gap-1
    rounded-full 
    border border-white/10
    bg-neutral-800/90 backdrop-blur-md
    shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.35)]
    sm:bottom-9 sm:right-10
  "
        >
          <button
            onClick={prev}

            aria-label="Previous slide"
            className="
      group flex h-9 w-9 items-center justify-center rounded-full
      text-white/95
      transition-all duration-300 ease-out
      hover:bg-white/10
      active:scale-90 active:bg-white/15
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
      disabled:pointer-events-none disabled:text-white/35
      sm:h-10 sm:w-10
    "
          >
            <ArrowLeft
              strokeWidth={1.5}
              className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-x-0.5 sm:h-5 sm:w-5"
            />
          </button>

          <button
            onClick={next}

            aria-label="Next slide"
            className="
      group flex h-9 w-9 items-center justify-center rounded-full
      text-white/95
      transition-all duration-300 ease-out
      hover:bg-white/10
      active:scale-90 active:bg-white/15
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
      disabled:pointer-events-none disabled:text-white/35
      sm:h-10 sm:w-10
    "
          >
            <ArrowRight
              strokeWidth={1.5}
              className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 sm:h-5 sm:w-5"
            />
          </button>
        </div>
      </div>
    </section>
  );
}