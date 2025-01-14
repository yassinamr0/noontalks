import { useState } from "react";

interface RegisterFormProps {
  onSubmit: (data: { fullName: string; email: string; phone: string }) => void;
}

const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Full Name *
        </label>
        <input
          type="text"
          required
          className="w-full p-2 border rounded"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Email Address *
        </label>
        <input
          type="email"
          required
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Phone Number (optional)
        </label>
        <input
          type="tel"
          className="w-full p-2 border rounded"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90 transition-colors"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;