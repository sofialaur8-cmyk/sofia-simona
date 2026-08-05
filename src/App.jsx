import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const LINKS = {
  superMashaPositioning: 'https://disk.yandex.ru/i/Ct3vBAFVfUk1wA',
  superMashaShow: 'https://disk.yandex.ru/i/O0z2QewJiuD-oA',
  allClips: 'https://disk.yandex.ru/d/dzkowxwHXSV5Mg',
  resume: 'https://disk.yandex.ru/d/e1H1-XX6ZGoAvQ',
};

function CursorTracking({ children, intensity = 1 }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setTilt({
        x: (e.clientX - (rect.left + rect.width / 2)) * 0.015 * intensity,
        y: (e.clientY - (rect.top + rect.height / 2)) * 0.015 * intensity,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);
  return (
    <div
      ref={ref}
      style={{
        transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
        transition: 'transform 0.35s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
}

function MagneticTile({ src, onOpen, className = '' }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.15,
      y: (e.clientY - rect.top - rect.height / 2) * 0.15,
    });
  };
  return (
    <button
      ref={ref}
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setIsHovered(false); setPos({ x: 0, y: 0 }); }}
      className={`overflow-hidden bg-white/5 hover:opacity-70 transition-opacity ${className}`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <img src={src} alt="" className="w-full h-full object-cover" />
    </button>
  );
}

function RevealOnScroll({ children, className = '', variant = 'up' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const variants = { up: 'translateY(48px)', left: 'translateX(-60px)', right: 'translateX(60px)', fade: 'none' };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0)' : variants[variant],
        transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
}

// Oversized display word that bleeds past the container edge
function BleedWord({ children, align = 'left', className = '' }) {
  return (
    <div className={`overflow-hidden ${align === 'right' ? 'text-right' : ''}`}>
      <span
        className={`display-thin block whitespace-nowrap ${className}`}
        style={{
          fontSize: 'clamp(3.5rem, 17vw, 13rem)',
          marginLeft: align === 'left' ? '-0.06em' : undefined,
          marginRight: align === 'right' ? '-0.06em' : undefined,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function SectionIndex({ number, label, align = 'left' }) {
  return (
    <div className={`flex items-baseline gap-4 sm:gap-6 mb-8 sm:mb-12 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <span className="text-[10px] sm:text-xs tracking-[0.3em] opacity-35">{number}</span>
      <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase opacity-60">{label}</span>
      <span className="flex-1 h-px bg-white/15" />
    </div>
  );
}

function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, images.length]);

  const next = () => { setIsAutoPlay(false); setDirection(1); setCurrentIndex((p) => (p + 1) % images.length); };
  const prev = () => { setIsAutoPlay(false); setDirection(-1); setCurrentIndex((p) => (p - 1 + images.length) % images.length); };

  return (
    <div className="relative w-full group">
      <div className="relative overflow-hidden aspect-video bg-white/5">
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            animation: direction >= 0
              ? 'slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <div className="absolute bottom-4 left-4 text-[10px] tracking-[0.2em] bg-black/60 px-2 py-1">
          {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white text-black opacity-0 group-hover:opacity-100 hover:opacity-60 transition-all duration-300">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white text-black opacity-0 group-hover:opacity-100 hover:opacity-60 transition-all duration-300">
        <ChevronRight size={20} />
      </button>
      <div className="flex gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setIsAutoPlay(false); setDirection(idx > currentIndex ? 1 : -1); setCurrentIndex(idx); }}
            className={`h-px transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-white' : 'w-6 bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

function RetouchCard({ before, after, onOpen }) {
  const [showAfter, setShowAfter] = useState(true);
  return (
    <div className="group">
      <button onClick={onOpen} className="block w-full aspect-square overflow-hidden bg-white/5">
        <img
          key={showAfter ? 'a' : 'b'}
          src={showAfter ? after : before}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      </button>
      <div className="flex gap-4 mt-3 text-[10px] tracking-[0.2em] uppercase">
        <button onClick={() => setShowAfter(false)} className={!showAfter ? 'opacity-100 border-b border-white pb-0.5' : 'opacity-40 hover:opacity-70 transition'}>до</button>
        <button onClick={() => setShowAfter(true)} className={showAfter ? 'opacity-100 border-b border-white pb-0.5' : 'opacity-40 hover:opacity-70 transition'}>после</button>
      </div>
    </div>
  );
}

function Lightbox({ item, onClose }) {
  const [showAfter, setShowAfter] = useState(true);
  useEffect(() => setShowAfter(true), [item]);
  if (!item) return null;
  const isPair = typeof item === 'object';
  const src = isPair ? (showAfter ? item.after : item.before) : item;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, animation: 'fadeIn 0.3s ease-out' }}
      className="bg-black/95 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:opacity-60 hover:rotate-90 transition-all duration-300">
        <X size={26} />
      </button>
      <div className="flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        <img key={src} src={src} alt="" className="max-w-4xl w-full max-h-[75vh] object-contain" style={{ animation: 'fadeIn 0.3s ease-out' }} />
        {isPair && (
          <div className="flex gap-6 text-xs tracking-[0.2em] uppercase">
            <button onClick={() => setShowAfter(false)} className={!showAfter ? 'border-b border-white pb-1' : 'opacity-40 hover:opacity-80'}>до</button>
            <button onClick={() => setShowAfter(true)} className={showAfter ? 'border-b border-white pb-1' : 'opacity-40 hover:opacity-80'}>после</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioDark() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [showAllCovers, setShowAllCovers] = useState(false);

  const scrollTo = (id) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const sections = [
    { id: 'about', num: '01', label: 'о себе' },
    { id: 'production', num: '02', label: 'продюсирование' },
    { id: 'design', num: '03', label: 'дизайн' },
    { id: 'retouching', num: '04', label: 'ретушь' },
    { id: 'contact', num: '05', label: 'контакты' },
  ];

  return (
    <div className="bg-[#0B0B0B] text-[#F2F0EC] min-h-screen overflow-x-hidden" style={{ fontFamily: "'Raleway', sans-serif" }}>
      <style>{`
        @font-face {
          font-family: 'Raleway';
          src: url('/fonts/Raleway-VariableFont_wght.ttf') format('truetype-variations');
          font-weight: 100 900;
          font-style: normal;
        }
        @font-face {
          font-family: 'Raleway';
          src: url('/fonts/Raleway-Italic-VariableFont_wght.ttf') format('truetype-variations');
          font-weight: 100 900;
          font-style: italic;
        }
        .display-thin {
          font-weight: 200;
          letter-spacing: -0.045em;
          line-height: 0.82;
        }
        .accent-italic {
          font-style: italic;
          font-weight: 300;
        }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes riseUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        .rise { animation: riseUp 1s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
      `}</style>

      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />

      {/* Nav — bracketed monogram, like [ml] in the reference */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0B0B]/90 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
          <button onClick={() => scrollTo('about')} className="accent-italic text-lg sm:text-xl hover:opacity-60 transition">
            [сс]
          </button>
          <div className="hidden md:flex gap-10">
            {sections.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className="group flex items-baseline gap-2 text-[11px] tracking-[0.15em] opacity-70 hover:opacity-100 transition">
                <span className="opacity-40 text-[9px]">{s.num}</span>
                <span className="relative">
                  {s.label}
                  <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-px bg-white transition-all duration-500" />
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden px-5 py-5 space-y-4 border-t border-white/10">
            {sections.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className="flex items-baseline gap-3 text-[11px] tracking-[0.15em] w-full text-left">
                <span className="opacity-40 text-[9px]">{s.num}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* 01 — ABOUT: giant bleeding words + small meta blocks in the corners */}
      <section id="about" className="min-h-screen flex flex-col justify-center pt-28 sm:pt-36 pb-16 px-5 sm:px-10 max-w-[1400px] mx-auto w-full">
        {/* name — wide-tracked, sits above everything */}
        <h1
          className="whitespace-nowrap mb-8 sm:mb-12 rise"
          style={{
            fontSize: 'clamp(1.4rem, 5.5vw, 4rem)',
            fontWeight: 200,
            letterSpacing: '0.06em',
          }}
        >
          СОФИЯ-СИМОНА
        </h1>

        {/* small italic accent, offset — the two roles */}
        <div className="mb-10 sm:mb-16 sm:pl-[8vw]">
          <p className="accent-italic text-xl sm:text-3xl leading-tight border-b border-white/30 pb-2 inline-block">
            креативный продюсер,<br />арт-директор
          </p>
          <p className="text-[10px] sm:text-xs opacity-50 mt-3 max-w-[220px] leading-relaxed">
            концепции артистов, съёмки полного цикла, арт-дирекшн и стилизация
          </p>
        </div>

        {/* the stacked, bleeding manifesto */}
        <CursorTracking intensity={0.5}>
          <div className="cursor-default select-none">
            <div className="rise" style={{ animationDelay: '0s' }}>
              <BleedWord align="left">вижу</BleedWord>
            </div>
            <div className="rise flex items-baseline justify-end gap-4 sm:gap-8" style={{ animationDelay: '0.12s' }}>
              <span className="accent-italic text-sm sm:text-xl opacity-60 whitespace-nowrap">(целиком)</span>
              <BleedWord align="right">идею</BleedWord>
            </div>
            <div className="rise" style={{ animationDelay: '0.24s' }}>
              <BleedWord align="left">и делаю</BleedWord>
            </div>
          </div>
        </CursorTracking>

        {/* meta row, tiny, spread to the edges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 sm:mt-24 text-[10px] sm:text-xs">
          <div>
            <p className="opacity-35 tracking-[0.25em] uppercase mb-2">возраст</p>
            <p className="opacity-80">20</p>
          </div>
          <div>
            <p className="opacity-35 tracking-[0.25em] uppercase mb-2">город</p>
            <p className="opacity-80">москва</p>
          </div>
          <div>
            <p className="opacity-35 tracking-[0.25em] uppercase mb-2">языки</p>
            <p className="opacity-80 leading-relaxed">рус · англ · фр<br />лит · швед</p>
          </div>
          <div>
            <p className="opacity-35 tracking-[0.25em] uppercase mb-2">софт</p>
            <p className="opacity-80 leading-relaxed">figma · photoshop<br />illustrator · capcut</p>
          </div>
        </div>
      </section>

      {/* description block, asymmetric — text pushed right */}
      <section className="px-5 sm:px-10 max-w-[1400px] mx-auto w-full pb-24 sm:pb-40">
        <RevealOnScroll className="sm:pl-[38%]">
          <p className="text-base sm:text-xl leading-relaxed opacity-75">
            каждый проект — это история, что бы это ни было: музыка, фотографии, страница в соцсетях. моя задача найти эту историю в нём, раскрыть её через визуал, символы, атмосферу. я верю, что творчество работает, только если за ним стоит система: идея, концепция, организация.
          </p>
        </RevealOnScroll>
      </section>

      {/* 02 — PRODUCTION: zigzag title/meta rows */}
      <section id="production" className="px-5 sm:px-10 max-w-[1400px] mx-auto w-full py-16 sm:py-24">
        <SectionIndex number="02" label="креативное продюсирование" />

        {/* MURANA — title left, meta right */}
        <RevealOnScroll className="mb-24 sm:mb-40" variant="left">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <h2 className="display-thin" style={{ fontSize: 'clamp(2.6rem, 9vw, 7rem)' }}>murana</h2>
            <span className="accent-italic text-sm sm:text-lg opacity-60">(грант пфки)</span>
          </div>
          <div className="grid sm:grid-cols-12 gap-8 sm:gap-12 items-start">
            <p className="sm:col-span-5 text-sm sm:text-base leading-relaxed opacity-70">
              разработала концепцию образа современной независимой героини, от первого инсайта до готового визуального языка. я стала личным менеджером и ассистентом артистки на площадке, сопровождала её на крупных проектах, включая съемки на телевидении, и стилизовала большинство образов для съемок.
            </p>
            <div className="sm:col-span-7">
              <ImageSlider images={Array.from({ length: 10 }, (_, i) => `/images/murana/murana-${i + 1}.jpg`)} />
            </div>
          </div>
        </RevealOnScroll>

        {/* СУПЕР МАША — reversed: meta left, title right, hyphenated break */}
        <RevealOnScroll className="mb-24 sm:mb-40" variant="right">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <span className="accent-italic text-sm sm:text-lg opacity-60 order-2 sm:order-1">(детский артист)</span>
            <h2 className="display-thin text-right order-1 sm:order-2" style={{ fontSize: 'clamp(2.6rem, 9vw, 7rem)' }}>
              супер<br className="sm:hidden" />&nbsp;маша
            </h2>
          </div>
          <div className="grid sm:grid-cols-12 gap-8 sm:gap-12 items-start">
            <div className="sm:col-span-7 order-2 sm:order-1">
              <ImageSlider images={Array.from({ length: 7 }, (_, i) => `/images/super-masha/super-masha-${i + 1}.jpg`)} />
              <p className="text-[10px] tracking-[0.25em] uppercase opacity-40 mt-3">клип «пёсик»</p>
            </div>
            <div className="sm:col-span-5 order-1 sm:order-2 sm:text-right">
              <p className="text-sm sm:text-base leading-relaxed opacity-70 mb-4">
                в первую очередь я разработала концепцию детского артиста, сильной, самостоятельной и современной девочки как альтернативу привычному образу принцессы. я оставила понятный всей аудитории розовый цвет, но добавила в её образ дерзости, крафтовости и жизни.
              </p>
              <p className="text-sm sm:text-base leading-relaxed opacity-70 mb-6">
                работа с детьми — намного более тонкая настройка коммуникации, причём не только с самим артистом, но и с его родителями.
              </p>
              <div className="flex flex-wrap sm:justify-end gap-5 text-[11px] tracking-[0.15em]">
                <a href={LINKS.superMashaPositioning} target="_blank" rel="noopener noreferrer" className="border-b border-white pb-1 hover:opacity-50 transition">позиционирование →</a>
                <a href={LINKS.superMashaShow} target="_blank" rel="noopener noreferrer" className="border-b border-white pb-1 hover:opacity-50 transition">смотреть шоу →</a>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* ТУР — hyphenated giant word, poster right */}
        <RevealOnScroll className="mb-24 sm:mb-40" variant="left">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <h2 className="display-thin" style={{ fontSize: 'clamp(2.2rem, 7vw, 5.5rem)' }}>
              электро-<br />слабость
            </h2>
            <span className="accent-italic text-sm sm:text-lg opacity-60">(тур, 3 города)</span>
          </div>
          <div className="grid sm:grid-cols-12 gap-8 sm:gap-12 items-start">
            <p className="sm:col-span-6 text-sm sm:text-base leading-relaxed opacity-70">
              курировала полную организацию тура по трём городам: логистику, размещение, питание, коммуникацию с командой. принимала решения по выбору площадок, количеству аудитории и условиям проведения концертов.
            </p>
            <button
              onClick={() => setLightboxItem('/images/tour/poster-1.jpg')}
              className="sm:col-span-6 aspect-[3/4] overflow-hidden bg-white/5 hover:opacity-80 transition sm:max-w-sm sm:ml-auto w-full"
            >
              <img src="/images/tour/poster-1.jpg" alt="афиша тура" className="w-full h-full object-cover" />
            </button>
          </div>
        </RevealOnScroll>

        {/* ИГОРЬ ЧЕХОВ — title right */}
        <RevealOnScroll className="mb-24 sm:mb-40" variant="right">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <span className="accent-italic text-sm sm:text-lg opacity-60 order-2 sm:order-1">(12 часов · 3 видео)</span>
            <h2 className="display-thin text-right order-1 sm:order-2" style={{ fontSize: 'clamp(2.6rem, 9vw, 7rem)' }}>игорь чехов</h2>
          </div>
          <div className="grid sm:grid-cols-12 gap-8 sm:gap-12 items-start">
            <div className="sm:col-span-7 order-2 sm:order-1">
              <ImageSlider images={Array.from({ length: 9 }, (_, i) => `/images/igor-chehov/igor-${i + 1}.jpg`)} />
            </div>
            <p className="sm:col-span-5 order-1 sm:order-2 text-sm sm:text-base leading-relaxed opacity-70 sm:text-right">
              игорь чехов — известный комик из дуэта «чехов и кукота». за двенадцать часов, включая подготовку, мы сняли три разные видео-работы. из-за максимально плотного графика артиста было необходимо сжать свои сроки и работать настолько быстро, насколько это вообще возможно.
            </p>
          </div>
        </RevealOnScroll>

        {/* ПОЖАР — title left */}
        <RevealOnScroll variant="left">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <h2 className="display-thin" style={{ fontSize: 'clamp(2.6rem, 9vw, 7rem)' }}>пожар</h2>
            <span className="accent-italic text-sm sm:text-lg opacity-60">(бюджет ×2 дешевле)</span>
          </div>
          <div className="grid sm:grid-cols-12 gap-8 sm:gap-12 items-start">
            <p className="sm:col-span-5 text-sm sm:text-base leading-relaxed opacity-70">
              для этого клипа я искала не просто локацию, а место с характером, и нашла его на предприятии по разработке пожарной техники. я выступила художником-постановщиком, стилизовала весь клип и провела съемочный день от начала до конца.
            </p>
            <div className="sm:col-span-7">
              <ImageSlider images={Array.from({ length: 8 }, (_, i) => `/images/pozhar/pozhar-${i + 1}.jpg`)} />
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="pt-16 sm:pt-24 text-center">
          <a
            href={LINKS.allClips}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-italic inline-block text-2xl sm:text-4xl border-b border-white pb-2 hover:opacity-50 transition"
          >
            смотреть все клипы
          </a>
        </RevealOnScroll>
      </section>

      {/* 03 — DESIGN */}
      <section id="design" className="px-5 sm:px-10 max-w-[1400px] mx-auto w-full py-16 sm:py-28">
        <div className="w-full">
          <div className="flex items-baseline gap-4 sm:gap-6 mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-xs tracking-[0.3em] opacity-35">03</span>
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase opacity-60">дизайн</span>
            <span className="flex-1 h-px bg-white/15" />
          </div>

          {/* two services, zigzag like studio / streetstyle */}
          <RevealOnScroll className="mb-16 sm:mb-24" variant="left">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
              <h3 className="display-thin" style={{ fontSize: 'clamp(2rem, 6.5vw, 4.5rem)' }}>обложки</h3>
              <span className="accent-italic text-sm sm:text-lg opacity-60">(30 работ)</span>
            </div>
            <p className="text-sm sm:text-base opacity-70 max-w-md mb-8 leading-relaxed">
              от идеи до съемки и финальной ретуши. создание обложек, которые работают на позиционирование артиста.
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
              {Array.from({ length: showAllCovers ? 30 : 6 }, (_, i) => i + 1).map((i) => (
                <MagneticTile
                  key={i}
                  src={`/images/covers/cover-${i}.jpg`}
                  onOpen={() => setLightboxItem(`/images/covers/cover-${i}.jpg`)}
                  className="aspect-square"
                />
              ))}
            </div>
            <button
              onClick={() => setShowAllCovers(!showAllCovers)}
              className="accent-italic text-lg sm:text-xl border-b border-white pb-1 hover:opacity-50 transition"
            >
              {showAllCovers ? 'скрыть' : 'показать все'}
            </button>
          </RevealOnScroll>

          <RevealOnScroll variant="right">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
              <span className="accent-italic text-sm sm:text-lg opacity-60 order-2 sm:order-1">(питчинги · пресс-киты)</span>
              <h3 className="display-thin text-right order-1 sm:order-2" style={{ fontSize: 'clamp(2rem, 6.5vw, 4.5rem)' }}>презентации</h3>
            </div>
            <p className="text-sm sm:text-base opacity-70 max-w-md mb-8 sm:ml-auto sm:text-right leading-relaxed">
              коммерческие предложения, портфолио, питчинги, пресс-киты. от стратегии до финального дизайна.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <button
                  key={i}
                  onClick={() => setLightboxItem(`/images/presentations/presentation-${i}.jpg`)}
                  className="aspect-video overflow-hidden bg-white/5 hover:opacity-70 transition"
                >
                  <img src={`/images/presentations/presentation-${i}.jpg`} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 04 — RETOUCHING */}
      <section id="retouching" className="px-5 sm:px-10 max-w-[1400px] mx-auto w-full py-16 sm:py-28">
        <SectionIndex number="04" label="ретушь" />
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
          <h2 className="display-thin" style={{ fontSize: 'clamp(2.6rem, 9vw, 7rem)' }}>ретушь</h2>
          <span className="accent-italic text-sm sm:text-lg opacity-60">(естественная)</span>
        </div>
        <p className="text-sm sm:text-base opacity-70 leading-relaxed max-w-xl mb-12 sm:mb-16">
          естественная, аккуратная ретушь портретных фотографий. работаю с фокусом на то, чтобы подчеркнуть достоинства и сохранить естественность.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => {
            const before = `/images/retouching/retouch-${i}-before.jpg`;
            const after = `/images/retouching/retouch-${i}-after.jpg`;
            return <RetouchCard key={i} before={before} after={after} onOpen={() => setLightboxItem({ before, after })} />;
          })}
        </div>
      </section>

      {/* 05 — CONTACT: giant bleeding word + italic underlined link */}
      <section id="contact" className="px-5 sm:px-10 max-w-[1400px] mx-auto w-full py-16 sm:py-28">
        <SectionIndex number="05" label="контакты" />

        <RevealOnScroll>
          <div className="mb-12 sm:mb-20">
            <BleedWord align="left">работаю</BleedWord>
            <div className="flex items-baseline gap-4 sm:gap-8">
              <span className="accent-italic text-sm sm:text-2xl opacity-60 whitespace-nowrap">(с артистами и брендами)</span>
              <BleedWord align="right">с вами</BleedWord>
            </div>
          </div>
        </RevealOnScroll>

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-10 mb-16">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-35 mb-3">telegram</p>
            <a href="https://t.me/simonasofija" target="_blank" rel="noopener noreferrer" className="text-lg sm:text-2xl hover:opacity-50 transition">@simonasofija</a>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-35 mb-3">instagram</p>
            <a href="https://instagram.com/sofijasimka" target="_blank" rel="noopener noreferrer" className="text-lg sm:text-2xl hover:opacity-50 transition">@sofijasimka</a>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-35 mb-3">телефон</p>
            <a href="tel:+79672127616" className="text-lg sm:text-2xl hover:opacity-50 transition">+7 967 212 7616</a>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6 pt-8 border-t border-white/10">
          <div>
            <a href="https://t.me/simonasofija" target="_blank" rel="noopener noreferrer" className="accent-italic text-3xl sm:text-5xl border-b border-white pb-2 hover:opacity-50 transition inline-block">
              напишите мне
            </a>
            <a
              href={LINKS.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-5 text-xs sm:text-sm tracking-[0.2em] opacity-50 hover:opacity-100 transition"
              style={{ fontWeight: 200 }}
            >
              скачать резюме ↓
            </a>
          </div>
          <p className="text-[10px] tracking-[0.25em] uppercase opacity-30">софия-симона © 2026</p>
        </div>
      </section>
    </div>
  );
}