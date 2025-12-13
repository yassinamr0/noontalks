import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QRScanner from "@/components/QRScanner";
import { addUser, getUsers, deleteUser } from '@/lib/api';
import { sendWelcomeEmail } from '@/lib/email';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";
import TicketsTab from "@/components/admin/TicketsTab";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  ticketType?: string;
  entries: number;
  createdAt: string;
  lastEntry?: string;
}

export default function Admin() {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    ticketType: "single"
  });
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tickets'>('users');
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
        phone: "",
        ticketType: "single"
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

  const handleDeleteUser = async (userId: string, email: string) => {
    if (window.confirm(`Are you sure you want to delete the user with email: ${email}?`)) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
        // Refresh the users list
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error deleting user:', error);
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to delete user');
        } else {
          toast.error('Failed to delete user');
        }
      }
    }
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'users'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Registered Users
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Unverified Tickets
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-black">Add New User</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <select
                          value={newUser.ticketType}
                          onChange={(e) => setNewUser(prev => ({ ...prev, ticketType: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="single">Single Ticket</option>
                          <option value="group">Group Ticket</option>
                        </select>
                      </div>
                      <Button 
                        onClick={handleAddUser}
                        className="bg-black hover:bg-gray-700 w-full"
                      >
                        Add User
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-black">Registered Users</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Phone</th>
                            <th className="text-left p-2">Ticket Type</th>
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
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  user.ticketType === 'group' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.ticketType === 'group' ? 'Group' : 'Single'}
                                </span>
                              </td>
                              <td className="p-2">{user.entries}</td>
                              <td className="p-2">
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => openTicket(user.email)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
                                  >
                                    View Ticket
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteUser(user._id, user.email)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-black">Scan QR Code</h2>
                    <QRScanner />
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <TicketsTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
