import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { QRScanner } from "@/components/QRScanner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  name: string;
  email: string;
  phone?: string;
  code: string;
  registeredAt: string;
  qrCode: string;
  validated?: boolean;
}

const ADMIN_CREDENTIALS = {
  username: "noontalksadmin",
  password: "Noontalks1377"
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("adminLoggedIn") === "true";
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn) {
      loadUsers();
    }
  }, [isLoggedIn]);

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(Array.isArray(parsedUsers) ? parsedUsers : []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please refresh the page.",
        variant: "destructive",
      });
      setUsers([]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        setIsLoggedIn(true);
        localStorage.setItem("adminLoggedIn", "true");
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    try {
      setIsLoggedIn(false);
      localStorage.removeItem("adminLoggedIn");
      setUsername("");
      setPassword("");
      setShowScanner(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const generateCode = () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(code);
      
      const validCodes = JSON.parse(localStorage.getItem("validCodes") || "[]");
      localStorage.setItem("validCodes", JSON.stringify([...validCodes, code]));
      
      toast({
        title: "Success",
        description: "Registration code generated successfully",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: "Failed to generate registration code",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    try {
      const updatedUsers = users.filter(u => u.email !== userToDelete.email);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleScanSuccess = (ticketCode: string) => {
    try {
      const user = users.find(u => u.qrCode === ticketCode);
      if (!user) {
        toast({
          title: "Error",
          description: "Invalid ticket code",
          variant: "destructive",
        });
        return;
      }

      if (user.validated) {
        toast({
          title: "Warning",
          description: "This ticket has already been validated",
          variant: "destructive",
        });
        return;
      }

      const updatedUsers = users.map(u => 
        u.qrCode === ticketCode ? { ...u, validated: true } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      toast({
        title: "Success",
        description: `Ticket validated for ${user.name}`,
      });
    } catch (error) {
      console.error("Error validating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to validate ticket",
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
              variant="outline"
              className="text-[#542c6a] border-[#542c6a] hover:bg-[#542c6a] hover:text-white"
            >
              Logout
            </Button>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Generate Registration Code</h3>
            <div className="flex gap-4 items-center flex-wrap">
              <Input
                value={generatedCode}
                readOnly
                className="bg-white flex-1 min-w-[200px]"
                placeholder="Generated code will appear here"
              />
              <Button
                onClick={generateCode}
                className="bg-[#542c6a] hover:bg-opacity-90 text-white whitespace-nowrap"
              >
                Generate Code
              </Button>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Scan Ticket QR Code</h3>
            <div className="flex flex-col items-center gap-4">
              {!showScanner ? (
                <Button
                  onClick={() => setShowScanner(true)}
                  className="bg-[#542c6a] hover:bg-opacity-90 text-white"
                >
                  Start Scanner
                </Button>
              ) : (
                <>
                  <QRScanner onScanSuccess={handleScanSuccess} />
                  <Button
                    onClick={() => setShowScanner(false)}
                    variant="outline"
                    className="mt-4"
                  >
                    Stop Scanner
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Registered Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-[#3a1f49] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Registered At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.phone || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-sm ${user.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {user.validated ? 'Validated' : 'Not Validated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(user.registeredAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and their ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}