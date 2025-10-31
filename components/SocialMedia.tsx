'use client';

const SocialMedia = () => {
  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com/ipay9wallet', icon: '/icons/facebook.png' },
    { name: 'Instagram', href: 'https://instagram.com/ipay9wallet', icon: '/icons/instagram.png' },
    { name: 'Telegram', href: 'https://t.me/ipay9wallet', icon: '/icons/telegram.png' },
    { name: 'TikTok', href: 'https://www.tiktok.com/@ipay9wallet', icon: '/icons/tiktok.png' },
  ];

  return (
    <section className="py-6 sm:py-12 lg:py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* ===== Heading ===== */}
        <h2 className="text-lg sm:text-2xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-['Orbitron']">
          <span className="block sm:inline">Follow iPay9</span>{' '}
          <span className="block sm:inline">Trusted Online Casino Wallet</span>
        </h2>

        {/* ===== Social Icons ===== */}
        <div className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {socialLinks.map((social, index) => (
            <a
              key={social.name}
              href={social.href}
              className={`group relative p-3 sm:p-4 lg:p-5 rounded-full backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/40 transition-all duration-500 hover:scale-110 hover:shadow-2xl`}
              style={{
                animationName: 'float',
                animationDuration: '4s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${index * 0.5}s`,
              }}
            >
              <img
                src={social.icon}
                alt={social.name}
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              <span className="sr-only">{social.name}</span>
            </a>
          ))}
        </div>

        {/* ===== Subtext ===== */}
        <p className="text-gray-600 text-xs sm:text-base lg:text-lg px-2 font-['Orbitron'] font-light">
          Stay connected with iPay9 Australia's most trusted casino review community
        </p>
      </div>

      {/* ===== Float Animation ===== */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(1deg); }
          50% { transform: translateY(-12px) rotate(0deg); }
          75% { transform: translateY(-6px) rotate(-1deg); }
        }
      `}</style>
    </section>
  );
};

export default SocialMedia;
