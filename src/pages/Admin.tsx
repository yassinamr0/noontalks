import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { QRScanner } from "@/components/QRScanner";

interface User {
  name: string;
  email: string;
  code: string;
  ticketCode: string;
  entries: number;
  registeredAt: string;
}

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "noon2024",
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      loadUsers();
    }
  }, []);

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      const usersWithEntries = parsedUsers.map((user: User) => ({
        ...user,
        entries: user.entries || 0
      }));
      setUsers(usersWithEntries);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      localStorage.setItem("adminLoggedIn", "true");
      setIsLoggedIn(true);
      loadUsers();
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  const generateRegistrationCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingCodes = JSON.parse(localStorage.getItem("registrationCodes") || "[]");
    localStorage.setItem("registrationCodes", JSON.stringify([...existingCodes, code]));
    
    toast({
      title: "Success",
      description: `New registration code generated: ${code}`,
    });
  };

  const handleDeleteUser = (code: string) => {
    const updatedUsers = users.filter(user => user.code !== code);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowDeleteConfirm(null);
    toast({
      title: "Success",
      description: "User deleted successfully",
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
        title: "Success",
        description: `${user.name} - Entry #${user.entries}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid ticket code",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#542c6a]">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid gap-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Generate Registration Code</h3>
          <Button
            onClick={generateRegistrationCode}
            className="bg-[#542c6a] hover:bg-opacity-90"
          >
            Generate Code
          </Button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Scan QR Code</h3>
          <div className="flex flex-col items-center gap-4">
            {!showScanner ? (
              <Button
                onClick={() => setShowScanner(true)}
                className="bg-[#542c6a] hover:bg-opacity-90"
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

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Registered Users</h3>
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.code}
                className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">Entries: {user.entries}</p>
                  <p className="text-sm text-gray-600">
                    Registered: {new Date(user.registeredAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {showDeleteConfirm === user.code ? (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.code)}
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
                      onClick={() => setShowDeleteConfirm(user.code)}
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
  );
}