import { useCallback, useEffect, useRef, useState } from "react";

import Banner1 from '../../assets/Image/banner/banner (1).png';
import Banner3 from '../../assets/Image/banner/banner (3).png';
import Banner4 from '../../assets/Image/banner/banner (4).png';
export default function BannerSlider({ interval = 1800 }) {

    const slides = [
        { src: Banner3, alt: 'Banner_3' },
        { src: Banner4, alt: 'Banner_4' },
        { src: Banner1, alt: 'Banner_1' },

    ]
    const count = slides.length;
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [dragX, setDragX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const startX = useRef(0);
    const width = useRef(1);
    const trackRef = useRef(null);

    const go = useCallback(
        (i) => setIndex(((i % count) + count) % count),
        [count]
    );
    const next = useCallback(() => go(index + 1), [go, index]);
    const prev = useCallback(() => go(index - 1), [go, index]);

    // Reduced motion
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduceMotion(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    // Pause when tab is hidden
    useEffect(() => {
        const onVis = () => setPaused(document.hidden);
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    // Autoplay (restarts whenever the slide changes, so the dot progress stays in sync)
    useEffect(() => {
        if (count < 2 || paused || dragging || reduceMotion) return;
        const t = setTimeout(next, interval);
        return () => clearTimeout(t);
    }, [index, paused, dragging, reduceMotion, count, interval, next]);

    // Drag / swipe
    const onPointerDown = (e) => {
        if (count < 2) return;
        startX.current = e.clientX;
        width.current = trackRef.current?.offsetWidth || 1;
        setDragging(true);
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
        if (!dragging) return;
        setDragX(e.clientX - startX.current);
    };
    const endDrag = () => {
        if (!dragging) return;
        const threshold = width.current * 0.15;
        if (dragX > threshold) prev();
        else if (dragX < -threshold) next();
        setDragging(false);
        setDragX(0);
    };

    const onKeyDown = (e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
    };

    if (!count) return null;

    const offsetPct = -index * 100;
    const dragPct = dragging ? (dragX / width.current) * 100 : 0;

    return (
        <section
            className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8"
            aria-roledescription="carousel"
            aria-label="Promotional banners"
        >
            <div
                className="group relative overflow-hidden rounded-2xl bg-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
                tabIndex={0}
                onKeyDown={onKeyDown}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
            >
                {/* Track */}
                <div
                    ref={trackRef}
                    className="flex touch-pan-y select-none"
                    style={{
                        transform: `translateX(${offsetPct + dragPct}%)`,
                        transition:
                            dragging || reduceMotion
                                ? "none"
                                : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                        cursor: count > 1 ? (dragging ? "grabbing" : "grab") : "default",
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                >
                    {slides.map((s, i) => {
                        const img = (
                            <img
                                src={s.src}
                                alt={s.alt || `Banner ${i + 1}`}
                                draggable={false}
                                loading={i === 0 ? "eager" : "lazy"}
                                className="block h-full w-full object-cover"
                            />
                        );
                        return (
                            <div
                                key={i}
                                className="w-full shrink-0"
                                role="group"
                                aria-roledescription="slide"
                                aria-label={`${i + 1} of ${count}`}
                                aria-hidden={i !== index}
                            >
                                {s.href ? (
                                    <a
                                        href={s.href}
                                        tabIndex={i === index ? 0 : -1}
                                        onClick={(e) => {
                                            // don't follow the link if the user was dragging
                                            if (Math.abs(dragX) > 6) e.preventDefault();
                                        }}
                                    >
                                        {img}
                                    </a>
                                ) : (
                                    img
                                )}
                            </div>
                        );
                    })}
                </div>

                {count > 1 && (
                    <>
                        

                        {/* Indicators: active one stretches and fills as autoplay progresses */}
                        <div className="absolute inset-x-0 bottom-3 flex justify-center">
                            <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
                                {slides.map((_, i) => {
                                    const active = i === index;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => go(i)}
                                            aria-label={`Go to banner ${i + 1}`}
                                            aria-current={active}
                                            className={`relative h-1.5 overflow-hidden rounded-full bg-white/50 transition-all duration-500 ${active ? "w-8" : "w-1.5 hover:bg-white/80"
                                                }`}
                                        >
                                            {active && (
                                                <span
                                                    key={`${index}-${paused}`}
                                                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                                                    style={{
                                                        width: reduceMotion ? "100%" : undefined,
                                                        animation:
                                                            reduceMotion || paused
                                                                ? "none"
                                                                : `bannerFill ${interval}ms linear forwards`,
                                                    }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Live region for screen readers */}
                <p className="sr-only" aria-live="polite">
                    Banner {index + 1} of {count}
                </p>
            </div>

            {/* Keyframes for the indicator fill */}
            <style>{`
        @keyframes bannerFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
        </section>
    );
}