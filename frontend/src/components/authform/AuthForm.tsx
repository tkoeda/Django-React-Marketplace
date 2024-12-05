// src/components/Form.tsx
import { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import * as jwtDecode from "jwt-decode";
import "./AuthForm.css";
import { useAuth } from "../../context/AuthContext";
import Button from "../button/Button";

function AuthForm({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Add this

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                const decoded = jwtDecode.jwtDecode(res.data.access);
                login(res.data.access, res.data.refresh, decoded.user_id); // Use context login
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
                <Button
                    type="primary"
                    size="medium"
                    onClick={handleSubmit} 
                    disabled={loading} 
                >
                    {loading ? "Loading..." : name}
                </Button>
        </form>
    );
}

export default AuthForm;
