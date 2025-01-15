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
}

export default function Admin() {
  const [codeCount, setCodeCount] = useState<number>(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
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

  const handleGenerateCodes = async () => {
    try {
      const result = await generateCodes(codeCount);
      setGeneratedCodes(result.codes);
      toast.success("Codes generated successfully");
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error generating codes:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate codes");
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login");
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
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Generate Registration Codes</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={codeCount}
                  onChange={(e) => setCodeCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  placeholder="Number of codes to generate"
                  className="w-48"
                />
                <Button 
                  onClick={handleGenerateCodes}
                  className="bg-[#542c6a] hover:bg-opacity-90"
                >
                  Generate Codes
                </Button>
              </div>

              {generatedCodes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Generated Codes:</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap break-all">
                      {generatedCodes.join(', ')}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">QR Scanner</h2>
            <QRScanner />
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}