import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QRScanner from "@/components/QRScanner";
import { generateCodes, getUsers } from '@/lib/api';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";

interface User {
  name: string;
  email: string;
  code: string;
  entries: number;
  registeredAt: string;
  lastEntry?: string;
}

export default function Admin() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (isAdmin) {
      fetchUsers().catch(error => {
        console.error("Error in initial fetch:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to fetch users");
        }
      });
    } else {
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch users");
      }
    }
  };

  const handleGenerateCode = async () => {
    try {
      const result = await generateCodes(1);
      setGeneratedCode(result.code);
      toast.success("Code generated successfully");
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error generating code:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate code");
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Generate Registration Code</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  value={generatedCode}
                  readOnly
                  placeholder="Generated code will appear here"
                  className="font-mono"
                />
                <Button 
                  onClick={handleGenerateCode}
                  className="bg-[#542c6a] hover:bg-[#3f1f4f]"
                >
                  Generate Code
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Entries</th>
                    <th className="text-left p-2">Registered</th>
                    <th className="text-left p-2">Last Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2 font-mono">{user.code}</td>
                      <td className="p-2">{user.entries}</td>
                      <td className="p-2">{formatDate(user.registeredAt)}</td>
                      <td className="p-2">{user.lastEntry ? formatDate(user.lastEntry) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Scan QR Code</h2>
            <QRScanner />
          </div>
        </div>
      </div>
    </div>
  );
}