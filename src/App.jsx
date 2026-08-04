import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Inserts non-breaking spaces after short prepositions/conjunctions
// so they never get stranded alone at the end of a line
function fixTypography(text) {
  return text.replace(
    /(\s|^)(а|и|о|у|в|с|к|но|не|из|за|до|по|на|от|же|ли|для|со|во|ко|при|про|без|как|что|чтобы)\s/gi,
    (match, p1, p2) => `${p1}${p2}\u00A0`
  );
}

// Tilts its content in 3D based on cursor position anywhere on the page
function CursorTracking({ children, intensity = 1 }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) * 0.02 * intensity;
      const y = (e.clientY - centerY) * 0.02 * intensity;
      setTilt({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  return (
    <div
      ref={ref}
      style={{
        transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
        transition: 'transform 0.3s ease-out',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  );
}

function ImageSlider({ images, isDark }) {
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

  const next = () => {
    setIsAutoPlay(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setIsAutoPlay(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden aspect-video rounded-lg">
        <div
          key={currentIndex}
          className={`absolute inset-0 flex items-center justify-center ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-black'
          }`}
          style={{
            animation: direction >= 0
              ? 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <img
            src={images[currentIndex]}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <button
        onClick={prev}
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border transition hover:scale-110 hover:opacity-60 ${
          isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={next}
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border transition hover:scale-110 hover:opacity-60 ${
          isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
        }`}
      >
        <ChevronRight size={20} />
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsAutoPlay(false);
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-1 transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? (isDark ? 'w-8 bg-white' : 'w-8 bg-black')
                : (isDark ? 'w-1 bg-gray-600' : 'w-1 bg-gray-300')
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function RevealOnScroll({ children, className = '', variant = 'up' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const variants = {
    up: { hidden: 'translateY(40px)', shown: 'translateY(0)' },
    left: { hidden: 'translateX(-60px)', shown: 'translateX(0)' },
    right: { hidden: 'translateX(60px)', shown: 'translateX(0)' },
    scale: { hidden: 'scale(0.92)', shown: 'scale(1)' },
    fade: { hidden: 'none', shown: 'none' }
  };
  const v = variants[variant] || variants.up;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? v.shown : v.hidden,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)`
      }}
    >
      {children}
    </div>
  );
}

// Clickable gallery tile that opens a large view in a lightbox
function GalleryTile({ src, onOpen }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setPos({ x, y });
  };

  return (
    <button
      ref={ref}
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setPos({ x: 0, y: 0 });
      }}
      className="aspect-square bg-gray-100 border border-black overflow-hidden hover:opacity-70 transition-opacity cursor-pointer"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <img src={src} alt="" className="w-full h-full object-cover" />
    </button>
  );
}

function Lightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, animation: 'fadeIn 0.3s ease-out' }}
      className="bg-black/90 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white hover:opacity-60 transition-all duration-300 hover:rotate-90"
      >
        <X size={28} />
      </button>
      <img
        src={item}
        alt=""
        className="max-w-3xl w-full max-h-[85vh] object-contain"
        style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [lightboxItem, setLightboxItem] = useState(null);
  const [showAllCovers, setShowAllCovers] = useState(false);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const sections = [
    { id: 'about', label: 'обо мне' },
    { id: 'production', label: 'креативное продюсирование' },
    { id: 'design', label: 'дизайн' },
    { id: 'retouching', label: 'ретушь' },
    { id: 'contact', label: 'контакты' }
  ];

  return (
    <div className="bg-white text-black" style={{ fontFamily: "'Raleway', sans-serif" }}>
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
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes letterUp {
          from { opacity: 0; transform: translateY(100%) rotate(6deg); }
          to { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        .hero-word {
          display: inline-block;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        .hero-letter {
          animation: letterUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
      `}</style>

      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-black">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => scrollToSection('about')}
            className="hover:opacity-60 transition text-left leading-none"
          >
            <span className="block text-2xl sm:text-4xl font-black tracking-tighter">сс</span>
            <span className="block text-[7px] sm:text-[8px] font-medium tracking-[0.2em] sm:tracking-[0.25em] mt-0.5">
              софия-симона
            </span>
          </button>

          <div className="hidden md:flex gap-10">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`relative group text-sm font-medium transition-transform duration-200 whitespace-nowrap hover:scale-125 origin-center ${
                  activeSection === section.id ? 'font-bold' : ''
                }`}
              >
                {section.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-black transition-all duration-500 ${
                    activeSection === section.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            ))}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-black">
            <div className="px-6 py-6 space-y-4">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="block w-full text-left text-sm font-medium hover:opacity-60 transition"
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center pt-16 sm:pt-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-20 sm:py-32 w-full">
          <div className="mb-10 sm:mb-16">
            <CursorTracking intensity={0.6}>
              <h1
                className="text-5xl sm:text-7xl md:text-9xl font-black mb-6 sm:mb-8 leading-tight tracking-tighter cursor-default"
              >
                {['СОФИЯ-', 'СИМОНА'].map((word, wi) => (
                  <span key={wi} className="block overflow-hidden">
                    {word.split('').map((letter, li) => (
                      <span
                        key={li}
                      className="hero-letter inline-block"
                      style={{ animationDelay: `${(wi * word.length + li) * 0.04}s` }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            </CursorTracking>
            <p
              className="text-lg sm:text-2xl md:text-4xl font-light leading-relaxed mb-2 hero-word tracking-wide"
              style={{ animationDelay: '0.55s', display: 'block' }}
            >
              креативный продюсер
            </p>
            <p
              className="text-lg sm:text-2xl md:text-4xl font-light leading-relaxed mb-8 sm:mb-12 hero-word tracking-wide"
              style={{ animationDelay: '0.65s', display: 'block' }}
            >
              арт-директор
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8 text-base sm:text-lg leading-relaxed">
            <RevealOnScroll>
              <p className="font-bold mb-3 sm:mb-4 text-xl sm:text-2xl">обо мне</p>
              <p className="opacity-80">
                {fixTypography('я вижу идею целиком. музыку, артиста, аудиторию я воспринимаю как один живой организм. за день организую съемку тридцати человек, за неделю запускаю проект с нуля. я не просто продюсер, я архитектор образа. я собираю команды, пишу концепции, снимаю видео и довожу всё до результата, который работает.')}
              </p>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="pt-6 sm:pt-8 border-t border-black">
                <p className="font-bold mb-3 sm:mb-4 text-xl sm:text-2xl">основное</p>
                <p className="opacity-80">
                  {fixTypography('каждый артист — это история. моя задача найти эту историю в музыке и раскрыть её через визуал, символы, атмосферу. я верю, что творчество работает, только если за ним стоит система: идея, концепция, организация. мои проекты работают именно поэтому.')}
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm opacity-60 border-y border-black py-4">
                <span>20 лет</span>
                <span>·</span>
                <span>москва</span>
                <span>·</span>
                <span>русский, английский, французский, литовский, шведский</span>
                <span>·</span>
                <span>Figma, Photoshop, Illustrator, CapCut</span>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Creative Production Section */}
      <section id="production" className="min-h-screen bg-black text-white py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <RevealOnScroll>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-12 sm:mb-24 tracking-tighter">
              креативное<br />продюсирование
            </h2>
          </RevealOnScroll>

          {/* MURANA */}
          <RevealOnScroll className="mb-16 sm:mb-24" variant="left">
            <div className="pt-0">
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">MURANA</h3>
              <p className="text-base sm:text-lg opacity-80 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
                {fixTypography('разработала концепцию образа современной независимой героини, от первого инсайта до готового визуального языка. но моя роль здесь не ограничилась креативом: я стала личным менеджером и ассистентом артистки на площадке, сопровождала её на крупных проектах, включая съемки на телевидении, и стилизовала большинство образов для съемок. я решала операционные вопросы в моменте, чтобы мурана могла полностью сосредоточиться на творчестве. при моем содействии проект выиграл грант президентского фонда культурных инициатив.')}
              </p>

              <div className="mb-6 sm:mb-8">
                <ImageSlider
                  images={['/images/murana/murana-1.jpg', '/images/murana/murana-2.jpg', '/images/murana/murana-3.jpg', '/images/murana/murana-4.jpg', '/images/murana/murana-5.jpg', '/images/murana/murana-6.jpg', '/images/murana/murana-7.jpg', '/images/murana/murana-8.jpg', '/images/murana/murana-9.jpg', '/images/murana/murana-10.jpg']}
                  isDark={true}
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">визуальное позиционирование</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">личный менеджер и ассистент</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">стилизация съемок</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">грант пфки</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* СУПЕР МАША */}
          <RevealOnScroll className="mb-16 sm:mb-24" variant="right">
            <div className="border-t border-white pt-8 sm:pt-12">
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">СУПЕР МАША</h3>
              <p className="text-base sm:text-lg opacity-80 mb-4 max-w-3xl leading-relaxed">
                {fixTypography('в первую очередь я разработала концепцию детского артиста, сильной, самостоятельной и современной девочки как альтернативу привычному образу принцессы. я оставила понятный всей аудитории розовый цвет, но добавила в её образ дерзости, крафтовости и жизни. на фоне идеально сшитых детских артистов она выделяется своей самобытностью.')}
              </p>
              <p className="text-base sm:text-lg opacity-80 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
                {fixTypography('работа с детьми вообще занимает у меня отдельное место: это намного более тонкая настройка коммуникации, причём не только с самим артистом, но и с его родителями.')}
              </p>

              <div className="mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm tracking-widest opacity-60 mb-4">клип «пёсик»</p>
                <ImageSlider
                  images={['/images/super-masha/super-masha-1.jpg', '/images/super-masha/super-masha-2.jpg', '/images/super-masha/super-masha-3.jpg', '/images/super-masha/super-masha-4.jpg', '/images/super-masha/super-masha-5.jpg', '/images/super-masha/super-masha-6.jpg', '/images/super-masha/super-masha-7.jpg']}
                  isDark={true}
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">позиционирование артиста</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">архетип и визуальный язык</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">работа с юной аудиторией</span>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <a
                  href="#"
                  className="text-xs sm:text-sm bg-white text-black border border-white px-5 sm:px-6 py-3 rounded font-bold hover:opacity-60 transition"
                >
                  посмотреть позиционирование
                </a>
                <a
                  href="#"
                  className="text-xs sm:text-sm bg-black text-white border border-white px-5 sm:px-6 py-3 rounded font-bold hover:opacity-60 transition"
                >
                  посмотреть шоу
                </a>
              </div>
            </div>
          </RevealOnScroll>

          {/* Тур Электрослабость */}
          <RevealOnScroll className="mb-16 sm:mb-24" variant="left">
            <div className="border-t border-white pt-8 sm:pt-12">
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">ТУР ГРУППЫ «ЭЛЕКТРОСЛАБОСТЬ»</h3>
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
                <p className="text-base sm:text-lg opacity-80 leading-relaxed">
                  {fixTypography('курировала полную организацию тура по трём городам: логистику, размещение, питание, коммуникацию с командой. принимала решения по выбору площадок, количеству аудитории и условиям проведения концертов.')}
                </p>
                <button
                  onClick={() => setLightboxItem('/images/tour/poster-1.jpg')}
                  className="aspect-[3/4] rounded border border-gray-700 overflow-hidden hover:opacity-80 transition cursor-pointer"
                >
                  <img
                    src="/images/tour/poster-1.jpg"
                    alt="афиша тура"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Игорь Чехов */}
          <RevealOnScroll className="mb-16 sm:mb-24" variant="scale">
            <div className="border-t border-white pt-8 sm:pt-12">
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">ИГОРЬ ЧЕХОВ</h3>
              <p className="text-base sm:text-lg opacity-80 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
                {fixTypography('игорь чехов — известный комик из дуэта «чехов и кукота». за двенадцать часов, включая подготовку, мы сняли три разные видео-работы. из-за максимально плотного графика артиста было необходимо сжать свои сроки и работать настолько быстро, насколько это вообще возможно.')}
              </p>

              <div className="mb-6 sm:mb-8">
                <ImageSlider
                  images={['/images/igor-chehov/igor-1.jpg', '/images/igor-chehov/igor-2.jpg', '/images/igor-chehov/igor-3.jpg', '/images/igor-chehov/igor-4.jpg', '/images/igor-chehov/igor-5.jpg', '/images/igor-chehov/igor-6.jpg', '/images/igor-chehov/igor-7.jpg', '/images/igor-chehov/igor-8.jpg', '/images/igor-chehov/igor-9.jpg']}
                  isDark={true}
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">12 часов на 3 видео</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">сжатые сроки</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">полный цикл продакшена</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Клип Пожар */}
          <RevealOnScroll className="mb-12 sm:mb-16" variant="right">
            <div className="border-t border-white pt-8 sm:pt-12">
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">КЛИП «ПОЖАР»</h3>
              <p className="text-base sm:text-lg opacity-80 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
                {fixTypography('для этого клипа я искала не просто локацию, а место с характером, и нашла его на предприятии по разработке пожарной техники. дальше всё легло на меня: я выступила художником-постановщиком, стилизовала весь клип и провела съемочный день от начала до конца. локация оказалась не только визуально сильной, но и выгодной: благодаря ей бюджет проекта вышел вдвое дешевле, чем планировалось изначально.')}
              </p>

              <div className="mb-6 sm:mb-8">
                <ImageSlider
                  images={['/images/pozhar/pozhar-1.jpg', '/images/pozhar/pozhar-2.jpg', '/images/pozhar/pozhar-3.jpg', '/images/pozhar/pozhar-4.jpg', '/images/pozhar/pozhar-5.jpg', '/images/pozhar/pozhar-6.jpg', '/images/pozhar/pozhar-7.jpg', '/images/pozhar/pozhar-8.jpg']}
                  isDark={true}
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">художник-постановщик</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">стилизация</span>
                <span className="text-xs sm:text-sm border border-white px-3 sm:px-4 py-2 rounded">бюджет дешевле в 2 раза</span>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="text-center pt-6 sm:pt-8">
              <a
                href="#"
                className="inline-block text-xs sm:text-sm bg-white text-black border border-white px-6 sm:px-8 py-3 sm:py-4 rounded font-bold hover:opacity-60 transition"
              >
                смотреть все клипы
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Design Section */}
      <section id="design" className="min-h-screen bg-white py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <RevealOnScroll>
            <h2 className="text-4xl sm:text-7xl md:text-8xl font-black mb-12 sm:mb-24 tracking-tighter">
              дизайн
            </h2>
          </RevealOnScroll>

          <RevealOnScroll className="mb-16 sm:mb-24">
            <h3 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8">УСЛУГИ</h3>
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-3xl">
              <div>
                <p className="font-bold mb-3 sm:mb-4">оформление материалов</p>
                <p className="opacity-80 text-sm sm:text-base">
                  {fixTypography('коммерческие предложения, портфолио, питчинги, пресс-киты. от стратегии до финального дизайна.')}
                </p>
              </div>
              <div>
                <p className="font-bold mb-3 sm:mb-4">дизайн обложек</p>
                <p className="opacity-80 text-sm sm:text-base">
                  {fixTypography('от идеи до съемки и финальной ретуши. создание музыкальных обложек, которые работают на позиционирование артиста.')}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="mb-14 sm:mb-20" variant="fade">
            <h3 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8">обложки</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 mb-6">
              {Array.from({ length: showAllCovers ? 30 : 6 }, (_, idx) => idx + 1).map((i) => (
                <GalleryTile
                  key={i}
                  src={`/images/covers/cover-${i}.jpg`}
                  onOpen={() => setLightboxItem(`/images/covers/cover-${i}.jpg`)}
                />
              ))}
            </div>
            <button
              onClick={() => setShowAllCovers(!showAllCovers)}
              className="text-xs sm:text-sm border border-black px-5 sm:px-6 py-2.5 sm:py-3 rounded font-bold hover:bg-black hover:text-white transition"
            >
              {showAllCovers ? 'скрыть' : 'показать все'}
            </button>
          </RevealOnScroll>

          <RevealOnScroll variant="fade">
            <h3 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8">презентации</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <button
                  key={i}
                  onClick={() => setLightboxItem(`/images/presentations/presentation-${i}.jpg`)}
                  className="aspect-video bg-gray-100 border border-black overflow-hidden hover:opacity-70 transition cursor-pointer"
                >
                  <img
                    src={`/images/presentations/presentation-${i}.jpg`}
                    alt={`слайд ${i}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Retouching Section */}
      <section id="retouching" className="min-h-screen bg-black text-white py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <RevealOnScroll>
            <h2 className="text-4xl sm:text-7xl md:text-8xl font-black mb-12 sm:mb-24 tracking-tighter">
              ретушь
            </h2>
          </RevealOnScroll>

          <RevealOnScroll className="mb-16 sm:mb-24">
            <h3 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8">УСЛУГА</h3>
            <div className="max-w-3xl">
              <p className="text-base sm:text-lg opacity-80 leading-relaxed">
                {fixTypography('естественная, аккуратная ретушь портретных фотографий. работаю с фокусом на то, чтобы подчеркнуть достоинства и сохранить естественность.')}
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll variant="fade">
            <h3 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8">ПРИМЕРЫ РАБОТ</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="group border border-gray-700 hover:border-white transition-colors duration-300 overflow-hidden"
                >
                  <div className="grid grid-cols-2">
                    <div className="aspect-square overflow-hidden border-r border-gray-700">
                      <img
                        src={`/images/retouching/retouch-${i}-before.jpg`}
                        alt="до"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={`/images/retouching/retouch-${i}-after.jpg`}
                        alt="после"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 text-center text-[10px] sm:text-xs opacity-60 group-hover:opacity-100 transition-opacity py-1">
                    <span>до</span>
                    <span>после</span>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen bg-white py-20 sm:py-32 flex items-center">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 w-full text-center">
          <RevealOnScroll>
            <h2 className="text-4xl sm:text-7xl md:text-8xl font-black mb-12 sm:mb-24 tracking-tighter">
              контакты
            </h2>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
              <div>
                <p className="text-xs sm:text-sm opacity-60 tracking-widest mb-2">telegram</p>
                <a
                  href="https://t.me/simonasofija"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl sm:text-3xl font-bold hover:opacity-60 transition"
                >
                  @simonasofija
                </a>
              </div>

              <div>
                <p className="text-xs sm:text-sm opacity-60 tracking-widest mb-2">instagram</p>
                <a
                  href="https://instagram.com/sofijasimka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl sm:text-3xl font-bold hover:opacity-60 transition"
                >
                  @sofijasimka
                </a>
              </div>

              <div>
                <p className="text-xs sm:text-sm opacity-60 tracking-widest mb-2">телефон</p>
                <a
                  href="tel:+79672127616"
                  className="text-xl sm:text-3xl font-bold hover:opacity-60 transition"
                >
                  +7 967 212 7616
                </a>
              </div>
            </div>
          </RevealOnScroll>

          <div className="border-t border-black pt-10 sm:pt-12">
            <p className="text-xs sm:text-sm opacity-60">софия-симона © 2024</p>
          </div>
        </div>
      </section>
    </div>
  );
}