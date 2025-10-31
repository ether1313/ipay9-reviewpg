import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-10 lg:pb-12 px-4 relative">
      {/* 背景发光效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* 主卡片容器 */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-40"></div>

          {/* 版权区块 */}
          <div className="relative border-t border-gray-200/40 mt-4 pt-4 flex justify-center">
            <p className="text-gray-600 text-xs sm:text-sm text-center font-['Orbitron'] font-light">
              © 2025 iPay9 Trusted Online Casino Wallet
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
