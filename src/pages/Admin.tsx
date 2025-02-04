import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QRScanner from "@/components/QRScanner";
import { addUser, getUsers } from '@/lib/api';
import { sendWelcomeEmail } from '@/lib/email';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  entries: number;
  createdAt: string;
  lastEntry?: string;
}

export default function Admin() {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("adminToken");
      const isAdmin = sessionStorage.getItem("isAdmin") === "true";
      
      console.log('Admin auth check:', { token, isAdmin });
      
      if (!token || !isAdmin) {
        console.log('Not authenticated, redirecting to login');
        navigate("/admin/login");
        return false;
      }
      return true;
    };

    const initializeAdmin = async () => {
      if (checkAuth()) {
        try {
          console.log('Fetching users...');
          const fetchedUsers = await getUsers();
          console.log('Users fetched:', fetchedUsers);
          setUsers(fetchedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
          if (error instanceof Error && error.message === 'Unauthorized') {
            sessionStorage.removeItem('adminToken');
            sessionStorage.removeItem('isAdmin');
            navigate("/admin/login");
          } else {
            toast.error('Failed to fetch users');
          }
        }
      }
    };

    initializeAdmin();
  }, [navigate]);

  const handleAddUser = async () => {
    try {
      if (!newUser.email) {
        toast.error("Email is required");
        return;
      }

      // Add user to database
      const user = await addUser(newUser);
      
      // Send welcome email
      try {
        await sendWelcomeEmail({
          to_email: user.email,
          to_name: user.name,
        });
        toast.success("User added and welcome email sent!");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        toast.error("User added but failed to send welcome email");
      }
      
      // Reset form
      setNewUser({
        name: "",
        email: "",
        phone: ""
      });
      
      // Refresh user list
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error adding user:", error);
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('isAdmin');
          navigate("/admin/login");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to add user");
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

  const openTicket = (email: string) => {
    // Open ticket in new tab
    const ticketUrl = `/ticket?email=${encodeURIComponent(email)}`;
    window.open(ticketUrl, '_blank');
  };

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <Button 
              onClick={handleLogout}
              variant="destructive"
            >
              Logout
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Add New User</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Name (optional)"
                />
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email (required)"
                  required
                />
                <Input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone (optional)"
                />
              </div>
              <Button 
                onClick={handleAddUser}
                className="bg-black hover:bg-gray-700 w-full"
              >
                Add User
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Entries</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{user.name || '-'}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.phone || '-'}</td>
                      <td className="p-2">{user.entries}</td>
                      <td className="p-2">
                        <Button
                          onClick={() => openTicket(user.email)}
                          variant="outline"
                          size="sm"
                        >
                          View Ticket
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Scan QR Code</h2>
            <QRScanner />
          </div>
        </div>
      </div>
    </div>
  );
}