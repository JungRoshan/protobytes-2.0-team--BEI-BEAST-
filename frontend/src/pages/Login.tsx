import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Loader2 } from "lucide-react";

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

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const googleBtnRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(username, password);
            navigate("/");
        } catch (err: any) {
            const msg =
                err.response?.data?.non_field_errors?.[0] ||
                err.response?.data?.detail ||
                "Login failed. Please check your credentials.";
            setError(msg);
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
        // Load Google Identity Services script
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
                    text: "signin_with",
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
                    <LogIn className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Sign In</h1>
                </div>
                <p className="text-muted-foreground mb-6">
                    Welcome back! Sign in to your account.
                </p>

                {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Google Sign-In Button */}
                <div className="mb-4">
                    <div ref={googleBtnRef} className="flex justify-center" />
                </div>

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
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
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
