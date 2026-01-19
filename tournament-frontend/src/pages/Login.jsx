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
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 border rounded w-80">
        <input className="border p-2 w-full" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full mt-2" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white w-full mt-4 p-2" onClick={login}>Login</button>
      </div>
    </div>
  );
}
