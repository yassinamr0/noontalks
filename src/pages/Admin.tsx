import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QRScanner from "@/components/QRScanner";
import { addUser, getUsers } from '@/lib/api';
import { toast } from 'sonner';
import { sendWelcomeEmail } from '@/lib/email';
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
      await fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      if (error instanceof Error) {
        toast.error(error.message);
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
            <h1 className="text-2xl font-bold text-[#542c6a]">Admin Panel</h1>
            <Button 
              onClick={handleLogout}
              variant="destructive"
            >
              Logout
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Add New User</h2>
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
                className="bg-[#542c6a] hover:bg-[#3f1f4f] w-full"
              >
                Add User
              </Button>
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
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Entries</th>
                    <th className="text-left p-2">Registered</th>
                    <th className="text-left p-2">Last Entry</th>
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
                      <td className="p-2">{formatDate(user.createdAt)}</td>
                      <td className="p-2">{user.lastEntry ? formatDate(user.lastEntry) : '-'}</td>
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
            <h2 className="text-xl font-semibold mb-4 text-[#542c6a]">Scan QR Code</h2>
            <QRScanner />
          </div>
        </div>
      </div>
    </div>
  );
}