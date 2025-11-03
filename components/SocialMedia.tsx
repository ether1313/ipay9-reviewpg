'use client';

const SocialMedia = () => {
  const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/IPay9.Entertainment?_rdc=1&_rdr#', icon: '/icons/ipay9-fb.png' },
    { name: 'Telegram', href: 'https://t.me/IPAY9', icon: '/icons/ipay9-tlg.png' },
    { name: 'WhatsApp', href: 'https://IPAY9.wasap.my', icon: '/icons/ipay9-ws.png' }
  ];

  return (
    <section className="py-4 sm:py-10 lg:py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* ===== Heading ===== */}
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-['Orbitron']">
          Join the iPay9 Community
        </h2>

        {/* ===== Social Icons ===== */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-15 lg:gap-12 mb-6 sm:mb-8">
          {socialLinks.map((social, index) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative hover:scale-105 transition-transform duration-300"
              style={{
                animationName: 'float',
                animationDuration: '4s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${index * 0.3}s`,
              }}
            >
              <img
                src={social.icon}
                alt={social.name}
                className="w-62 h-24 sm:w-60 sm:h-28 lg:w-60 lg:h-28 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="sr-only">{social.name}</span>
            </a>
          ))}
        </div>

        {/* ===== Subtext ===== */}
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-2 font-['Orbitron'] font-light mt-3">
          Stay connected with iPay9 Australia's most trusted casino review community
        </p>
      </div>

      {/* ===== Float Animation ===== */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </section>
  );
};

export default SocialMedia;
