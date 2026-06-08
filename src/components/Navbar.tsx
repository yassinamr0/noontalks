import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date("July 02, 2026 18:00:00").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar-glass backdrop-blur-lg text-white shadow-lg border-b border-purple-500/20 sticky top-0 z-50">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo-removebg-preview.png" alt="Noon Talks" className="h-10" />
          </Link>

          {/* Countdown in the middle */}
          <div className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-purple-900/40 backdrop-blur-md rounded-full border border-purple-500/30 text-xs sm:text-sm">
            <div className="flex gap-1 sm:gap-3 font-bold">
              <div className="text-center">
                <div className="text-cyan-400 text-sm sm:text-lg leading-none">{timeLeft.days}</div>
                <div className="text-purple-300 text-xs hidden sm:block">Days</div>
              </div>
              <div className="text-cyan-400 text-xs sm:text-base">:</div>
              <div className="text-center">
                <div className="text-cyan-400 text-sm sm:text-lg leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-purple-300 text-xs hidden sm:block">Hrs</div>
              </div>
              <div className="text-cyan-400 text-xs sm:text-base">:</div>
              <div className="text-center">
                <div className="text-cyan-400 text-sm sm:text-lg leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-purple-300 text-xs hidden sm:block">Min</div>
              </div>
              <div className="text-cyan-400 text-xs sm:text-base">:</div>
              <div className="text-center">
                <div className="text-cyan-400 text-sm sm:text-lg leading-none">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-purple-300 text-xs hidden sm:block">Sec</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link
              to="/"
              className="hover:text-gray-300 transition-colors px-3 py-2 text-sm"
            >
              Home
            </Link>
            <Link
              to="/admin"
              className="hover:text-gray-300 transition-colors px-3 py-2 text-sm"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
