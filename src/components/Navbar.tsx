import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-[#542c6a] text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold font-serif">
          Noon Talks
        </Link>
        <div className="flex gap-4">
          <Link to="/register" className="hover:text-[#c701a9] transition-colors">
            Register
          </Link>
          <Link to="/admin" className="hover:text-[#c701a9] transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;