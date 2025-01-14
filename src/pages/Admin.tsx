import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  username: string;
  password: string;
}

interface RegistrationData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  qrCode: string;
  timestamp: number;
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      setIsLoggedIn(true);
      loadRegistrations();
    }
  }, []);

  const loadRegistrations = () => {
    const data = JSON.parse(localStorage.getItem("registrations") || "[]");
    setRegistrations(data);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSignup) {
      // Handle signup
      const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      const newAdmin: AdminUser = {
        username: credentials.username,
        password: credentials.password,
      };
      localStorage.setItem("admins", JSON.stringify([...admins, newAdmin]));
      toast({
        title: "Success",
        description: "Admin account created successfully!",
      });
      setShowSignup(false);
    } else {
      // Handle login
      const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      const admin = admins.find(
        (a: AdminUser) =>
          a.username === credentials.username && a.password === credentials.password
      );
      if (admin) {
        localStorage.setItem("adminToken", "true");
        setIsLoggedIn(true);
        loadRegistrations();
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  const downloadCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Phone", "Timestamp"];
    const csvData = registrations.map((reg) => [
      reg.id,
      reg.fullName,
      reg.email,
      reg.phone,
      new Date(reg.timestamp).toLocaleString(),
    ]);
    
    const csv = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              {showSignup ? "Create Admin Account" : "Admin Login"}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full p-2 border rounded"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90 transition-colors"
              >
                {showSignup ? "Sign Up" : "Login"}
              </button>
            </form>
            <button
              onClick={() => setShowSignup(!showSignup)}
              className="w-full mt-4 text-sm text-primary hover:underline"
            >
              {showSignup
                ? "Already have an account? Login"
                : "Need an account? Sign Up"}
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <div className="space-x-4">
                <button
                  onClick={() => navigate("/validate")}
                  className="bg-accent text-white px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Validate Tickets
                </button>
                <button
                  onClick={downloadCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Ticket ID</th>
                    <th className="p-2 text-left">Full Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b">
                      <td className="p-2">{reg.id}</td>
                      <td className="p-2">{reg.fullName}</td>
                      <td className="p-2">{reg.email}</td>
                      <td className="p-2">{reg.phone || "N/A"}</td>
                      <td className="p-2">
                        {new Date(reg.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;