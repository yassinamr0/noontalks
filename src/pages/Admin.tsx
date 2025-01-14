import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import QRScanner from "@/components/QRScanner";
import { addValidCodes, getUsers } from "@/lib/api";

interface RegistrationData {
  name: string;
  email: string;
  code: string;
  isValid: boolean;
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [registrationCode, setRegistrationCode] = useState("");
  const [users, setUsers] = useState<RegistrationData[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = sessionStorage.getItem("adminToken");
    if (adminToken) {
      setIsLoggedIn(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === "admin" && credentials.password === "noontalks2024") {
      sessionStorage.setItem("adminToken", "true");
      setIsLoggedIn(true);
      await fetchUsers();
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleAddCode = async () => {
    if (!registrationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a registration code",
        variant: "destructive",
      });
      return;
    }

    try {
      await addValidCodes([registrationCode]);
      toast({
        title: "Success",
        description: "Registration code added successfully",
      });
      setRegistrationCode("");
    } catch (error) {
      console.error("Error adding registration code:", error);
      toast({
        title: "Error",
        description: "Failed to add registration code",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#542c6a] to-[#c701a9] flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full bg-[#542c6a] hover:bg-opacity-90">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#542c6a] to-[#c701a9] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="bg-white hover:bg-opacity-90">
            Logout
          </Button>
        </div>

        <div className="grid gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Add Registration Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter registration code"
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value)}
                />
                <Button onClick={handleAddCode} className="bg-[#542c6a] hover:bg-opacity-90">
                  Add Code
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <QRScanner />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.code}</TableCell>
                      <TableCell>
                        {user.isValid ? (
                          <span className="text-green-600">Valid</span>
                        ) : (
                          <span className="text-red-600">Invalid</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}