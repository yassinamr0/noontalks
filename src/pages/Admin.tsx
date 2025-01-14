import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ADMIN_CREDENTIALS = {
  username: "noontalksadmin",
  password: "Noontalks1377"
};

interface User {
  name: string;
  email: string;
  phone?: string;
  code: string;
  registeredAt: string;
  qrCode: string;
  validated?: boolean;
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem("adminLoggedIn");
    return stored === "true";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn) {
      try {
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers);
          setUsers(Array.isArray(parsedUsers) ? parsedUsers : []);
        }
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      }
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      try {
        localStorage.setItem("adminLoggedIn", "true");
        setIsLoggedIn(true);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } catch (error) {
        console.error("Login error:", error);
        toast({
          title: "Error",
          description: "Failed to save login state",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("adminLoggedIn");
      setIsLoggedIn(false);
      setUsername("");
      setPassword("");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <img src="/logo-removebg-preview.png" alt="Noon Talks Logo" className="mx-auto h-24 w-auto mb-4" />
              <h2 className="text-3xl font-bold text-[#542c6a]">Admin Login</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#542c6a] hover:bg-opacity-90 text-white"
              >
                Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center">
              <img src="/logo-removebg-preview.png" alt="Noon Talks Logo" className="mx-auto h-24 w-auto mb-4" />
              <h2 className="text-3xl font-bold text-[#542c6a]">Admin Dashboard</h2>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-[#542c6a] hover:bg-opacity-90 text-white"
            >
              Logout
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Registered Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-[#3a1f49] text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Code</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{user.code}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded ${user.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.validated ? 'Validated' : 'Not Validated'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}