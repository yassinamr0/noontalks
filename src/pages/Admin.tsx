import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import QRScanner from "@/components/QRScanner";
import { addValidCodes, getUsers } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  name: string;
  email: string;
  code: string;
  entries: number;
  registeredAt: string;
}

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [codes, setCodes] = useState<string>("");
  const [showScanner, setShowScanner] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (isAdmin) {
      setIsLoggedIn(true);
      fetchUsers();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "noontalks2024") {
      setIsLoggedIn(true);
      sessionStorage.setItem("isAdmin", "true");
      fetchUsers();
    } else {
      toast.error("Invalid credentials");
    }
  };

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleAddCodes = async () => {
    try {
      const codeArray = codes.split(",").map((code) => code.trim()).filter(Boolean);
      if (codeArray.length === 0) {
        toast.error("Please enter valid codes");
        return;
      }

      await addValidCodes(codeArray);
      toast.success("Codes added successfully");
      setCodes("");
    } catch (error) {
      console.error("Error adding codes:", error);
      toast.error("Failed to add codes");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("isAdmin");
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <img 
                src="/logo-removebg-preview.png" 
                alt="Noon Talks Logo" 
                className="mx-auto h-24 w-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-[#542c6a]">Admin Login</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
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

              <Button type="submit" className="w-full bg-[#542c6a] hover:bg-opacity-90">
                Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#542c6a]">Admin Panel</h1>
            <Button 
              onClick={handleLogout}
              variant="destructive"
            >
              Logout
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Add Registration Codes</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codes">Enter codes separated by commas</Label>
                <Input
                  id="codes"
                  value={codes}
                  onChange={(e) => setCodes(e.target.value)}
                  placeholder="CODE1, CODE2, CODE3"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleAddCodes}
                className="bg-[#542c6a] hover:bg-opacity-90"
              >
                Add Codes
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">QR Scanner</h2>
            <Button 
              onClick={() => setShowScanner(!showScanner)}
              className="bg-[#542c6a] hover:bg-opacity-90"
            >
              {showScanner ? "Hide Scanner" : "Show Scanner"}
            </Button>
            {showScanner && <QRScanner />}
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entries
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.entries}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}