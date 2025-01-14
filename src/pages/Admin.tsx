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
  entries: number;
  ticketCode: string;
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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
      // Ensure each user has an entries field
      const usersWithEntries = parsedUsers.map((user: User) => ({
        ...user,
        entries: user.entries || 0
      }));
      setUsers(Array.isArray(usersWithEntries) ? usersWithEntries : []);
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

  const handleDeleteUser = (ticketCode: string) => {
    const updatedUsers = users.filter(user => user.ticketCode !== ticketCode);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowDeleteConfirm(null);
    toast({
      title: "User Deleted",
      description: "User has been removed successfully",
    });
  };

  const handleScanSuccess = (ticketCode: string) => {
    const updatedUsers = users.map(user => {
      if (user.ticketCode === ticketCode) {
        return {
          ...user,
          entries: (user.entries || 0) + 1
        };
      }
      return user;
    });
    
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    const user = updatedUsers.find(u => u.ticketCode === ticketCode);
    if (user) {
      toast({
        title: "Valid Ticket",
        description: `${user.name} - Entry #${user.entries}`,
      });
    } else {
      toast({
        title: "Invalid Ticket",
        description: "This ticket code is not registered",
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
                  className="bg-[#542c6a] hover:bg-opacity-90 text-white w-full md:w-auto"
                >
                  Start Scanner
                </Button>
              ) : (
                <>
                  <div className="w-full">
                    <QRScanner onScanSuccess={handleScanSuccess} />
                  </div>
                  <Button
                    onClick={() => setShowScanner(false)}
                    variant="outline"
                    className="mt-4 w-full md:w-auto"
                  >
                    Stop Scanner
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Registered Users</h3>
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.ticketCode}
                  className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">Entries: {user.entries || 0}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {showDeleteConfirm === user.ticketCode ? (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.ticketCode)}
                          className="w-full md:w-auto"
                        >
                          Confirm Delete
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(null)}
                          className="w-full md:w-auto"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(user.ticketCode)}
                        className="w-full md:w-auto"
                      >
                        Delete User
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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