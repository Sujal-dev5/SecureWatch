import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import api from "../Services/api";

import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();

    const { login } =
        useAuth();

    const [formData, setFormData] =
        useState({
            email: "",
            password: ""
        });

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response =
                await api.post(
                    "/auth/Login",
                    formData
                );

            const {
                token,
                user
            } = response.data;

            // Store authentication data
            // and update AuthContext
            login(
                token,
                user
            );

            // Go to dashboard
            navigate("/Dashboard");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>

            {error && (
                <p>{error}</p>
            )}

            <form
                onSubmit={
                    handleSubmit
                }
            >

                <div>
                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={
                            formData.email
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={
                            formData.password
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={
                        loading
                    }
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>

            </form>

            <p>
                Don't have an account?{" "}

                <Link to="/Register">
                    Create Account
                </Link>
            </p>
        </div>
    );
}

export default Login;