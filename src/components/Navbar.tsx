import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-primary text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Noon Talks
        </Link>
        <div className="flex gap-4">
          <Link to="/register" className="hover:text-accent">
            Register
          </Link>
          <Link to="/admin" className="hover:text-accent">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;