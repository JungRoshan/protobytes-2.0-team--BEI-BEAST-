import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * This page handles the redirect from the backend after Google OAuth.
 * URL: /auth/google/callback?access=...&refresh=...
 * It stores the JWT tokens and redirects to the home page.
 */
const GoogleCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const access = params.get("access");
        const refresh = params.get("refresh");

        if (!access || !refresh) {
            setError("Missing authentication tokens.");
            setTimeout(() => navigate("/login?error=missing_tokens"), 2000);
            return;
        }

        // Store tokens
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        // Fetch user info and redirect
        authApi
            .me()
            .then(() => {
                // Force a full page reload to update AuthContext
                window.location.href = "/";
            })
            .catch(() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setError("Authentication failed.");
                setTimeout(() => navigate("/login?error=auth_failed"), 2000);
            });
    }, [navigate]);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Signing you in with Google...</p>
        </div>
    );
};

export default GoogleCallback;
