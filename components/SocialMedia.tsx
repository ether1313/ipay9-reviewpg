'use client';

const SocialMedia = () => {
  const socialLinks = [
    { name: 'TPA', href: 'https://t.me/tpaaustralia/', icon: '/SocialMediaIcons/ipay9-tpa.png' },
    { name: 'Facebook', href: 'https://www.facebook.com/IPay9.Entertainment?_rdc=1&_rdr#', icon: '/SocialMediaIcons/ipay9-fb.png' },
    { name: 'Telegram', href: 'https://t.me/IPAY9', icon: '/SocialMediaIcons/ipay9-tlg.png' },
    { name: 'WhatsApp', href: 'https://IPAY9.wasap.my', icon: '/SocialMediaIcons/ipay9-ws.png' },
  ];

  return (
    <section className="py-4 sm:py-10 lg:py-16 px-4">
      <div className="max-w-5xl mx-auto text-center">

        {/* ===== Heading ===== */}
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-10 text-gray-800 font-['Orbitron']">
          Join the iPay9 Community
        </h2>

        {/* ===== Social Icons ===== */}
        <div className="w-full flex justify-center">
          <div className="grid w-full max-w-5xl mx-auto gap-4 sm:gap-6 lg:gap-8 place-items-center [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative hover:scale-105 transition-transform duration-300 flex-shrink-0 w-full flex justify-center"
                style={{
                  animationName: 'float',
                  animationDuration: '4s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${index * 0.3}s`
                }}
              >
                <div className="w-full flex justify-center">
                  <img
                    src={social.icon}
                    alt={social.name}
                    className="w-64 h-28 sm:w-60 sm:h-32 lg:w-64 lg:h-36 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="sr-only">{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ===== Subtext ===== */}
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-2 font-['Orbitron'] font-light mt-6">
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
