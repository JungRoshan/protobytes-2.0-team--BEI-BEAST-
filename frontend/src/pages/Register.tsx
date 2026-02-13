import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Loader2 } from "lucide-react";

const GOOGLE_CLIENT_ID = "1095881933365-9q1n8p6uvaps0dta6a8vh7jie9jagb6p.apps.googleusercontent.com";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                };
            };
        };
    }
}

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();
    const googleBtnRef = useRef<HTMLDivElement>(null);

    const updateField = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await register({
                username: form.username,
                email: form.email,
                password: form.password,
                first_name: form.first_name,
                last_name: form.last_name,
            });
            navigate("/");
        } catch (err: any) {
            const data = err.response?.data;
            if (data) {
                const firstError =
                    Object.values(data).flat()[0] as string;
                setError(firstError || "Registration failed.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCallback = async (response: any) => {
        setError("");
        setLoading(true);
        try {
            await googleLogin(response.credential);
            navigate("/");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Google sign-in failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && googleBtnRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                });
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: "outline",
                    size: "large",
                    width: "100%",
                    text: "signup_with",
                    shape: "rectangular",
                });
            }
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="container mx-auto px-4 py-16 max-w-md">
            <div className="rounded-xl border bg-card p-8 card-shadow">
                <div className="flex items-center gap-3 mb-2">
                    <UserPlus className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Create Account</h1>
                </div>
                <p className="text-muted-foreground mb-6">
                    Register to track your complaints and get updates.
                </p>

                {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Google Sign-Up Button */}
                <div className="mb-4">
                    <div ref={googleBtnRef} className="flex justify-center" />
                </div>

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or register with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={form.first_name}
                                onChange={(e) => updateField("first_name", e.target.value)}
                                placeholder="First"
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={form.last_name}
                                onChange={(e) => updateField("last_name", e.target.value)}
                                placeholder="Last"
                                className="bg-background"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username *</Label>
                        <Input
                            id="username"
                            value={form.username}
                            onChange={(e) => updateField("username", e.target.value)}
                            placeholder="Choose a username"
                            required
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="your@email.com"
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            placeholder="At least 6 characters"
                            required
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) => updateField("confirmPassword", e.target.value)}
                            placeholder="Repeat your password"
                            required
                            className="bg-background"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full font-semibold"
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...</>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
