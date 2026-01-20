import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);

    if (res.data.role === "ADMIN") navigate("/admin");
    else navigate("/coordinator");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-3">
      <div className="p-6 md:p-8 border rounded w-full max-w-sm bg-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">🏆 Draws App</h1>
        
        <div className="space-y-4">
          <input 
            className="border p-2 md:p-3 w-full rounded text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Email" 
            onChange={e=>setEmail(e.target.value)} 
          />
          <input 
            className="border p-2 md:p-3 w-full rounded text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500" 
            type="password" 
            placeholder="Password" 
            onChange={e=>setPassword(e.target.value)} 
          />
          <button 
            className="bg-blue-500 text-white w-full mt-4 p-2 md:p-3 rounded text-sm md:text-base font-semibold hover:bg-blue-600 transition"
            onClick={login}
          >
            Login
          </button>
        </div>

        <p className="text-xs md:text-sm text-gray-600 text-center mt-6">
          Demo Credentials:<br/>
          Admin: anuraggoutam133@gmail.com<br/>
          Coordinator: anuraggoutam133+coord@gmail.com<br/>
          Password: password123
        </p>
      </div>
    </div>
  );
}
