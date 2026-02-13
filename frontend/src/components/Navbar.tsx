import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Megaphone, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Complaints", to: "/complaints" },
    { label: "Report Issue", to: "/report" },
    { label: "Track Complaint", to: "/track" },
    ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Megaphone className="h-6 w-6" />
          HamroAwaj
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === l.to
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="ml-3 pl-3 border-l flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user?.username}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-card px-4 pb-4">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === l.to
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t mt-2 pt-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {user?.username}
                </div>
                <button
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 inline mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-primary hover:text-foreground">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
