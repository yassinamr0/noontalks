import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRScanner from '@/components/QRScanner';
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
  const [codes, setCodes] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const adminToken = sessionStorage.getItem('adminToken');

    if (!isAdmin || !adminToken) {
      navigate('/admin/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCodes = async () => {
    try {
      const codeArray = codes.split(',').map(code => code.trim()).filter(Boolean);
      if (codeArray.length === 0) {
        toast.error('Please enter valid codes');
        return;
      }

      await addValidCodes(codeArray);
      toast.success('Codes added successfully');
      setCodes('');
    } catch (error) {
      console.error('Error adding codes:', error);
      toast.error('Failed to add codes');
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add Registration Codes</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="codes">Enter codes separated by commas</Label>
              <Input
                id="codes"
                value={codes}
                onChange={(e) => setCodes(e.target.value)}
                placeholder="CODE1, CODE2, CODE3"
              />
            </div>
            <Button onClick={handleAddCodes}>Add Codes</Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">QR Scanner</h2>
          <Button onClick={() => setShowScanner(!showScanner)}>
            {showScanner ? 'Hide Scanner' : 'Show Scanner'}
          </Button>
          {showScanner && <QRScanner />}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Entries</th>
                  <th className="text-left p-2">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.code}</td>
                    <td className="p-2">{user.entries}</td>
                    <td className="p-2">{formatDate(user.registeredAt)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-4">
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
  );
}