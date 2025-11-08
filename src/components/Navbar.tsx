import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-transparent backdrop-blur-sm text-white absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img src="/logo-removebg-preview.png" alt="Noon Talks" className="h-10" />
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="hover:text-gray-300 transition-colors px-3 py-2"
            >
              Home
            </Link>
            <Link
              to="/admin"
              className="hover:text-gray-300 transition-colors px-3 py-2"
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