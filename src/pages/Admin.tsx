import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import QRScanner from "@/components/QRScanner";
import { getUsers, addValidCodes } from "@/lib/api";

interface User {
  name: string;
  email: string;
  code: string;
  entries: number;
  registeredAt: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const handleAddCodes = async () => {
    try {
      const codeList = codes.split(",").map(code => code.trim());
      await addValidCodes(codeList);
      
      toast({
        title: "Success",
        description: "Registration codes added successfully",
      });
      
      setCodes("");
    } catch (error) {
      console.error("Error adding codes:", error);
      toast({
        title: "Error",
        description: "Failed to add registration codes",
        variant: "destructive",
      });
    }
  };

  const handleScanSuccess = async (code: string, user: User) => {
    toast({
      title: "Success",
      description: `Welcome ${user.name}!`,
    });
    await loadUsers(); // Reload users to get updated entries
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-[#542c6a] mb-4">Admin Panel</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Add Registration Codes</h3>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter codes separated by commas"
                  value={codes}
                  onChange={(e) => setCodes(e.target.value)}
                />
                <Button
                  onClick={handleAddCodes}
                  className="bg-[#542c6a] hover:bg-opacity-90 text-white"
                >
                  Add Codes
                </Button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">QR Scanner</h3>
              <Button
                onClick={() => setShowScanner(!showScanner)}
                className="bg-[#542c6a] hover:bg-opacity-90 text-white mb-4"
              >
                {showScanner ? "Hide Scanner" : "Show Scanner"}
              </Button>
              {showScanner && (
                <div className="mt-4">
                  <QRScanner onScanSuccess={handleScanSuccess} />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Registered Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.code}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.entries}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(user.registeredAt).toLocaleString()}
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