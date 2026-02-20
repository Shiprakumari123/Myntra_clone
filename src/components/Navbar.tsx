import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Heart, Search, Sun, Moon, User, Menu, X, Bell } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationCenter from "./NotificationCenter";
import { useEffect } from "react";

export default function Navbar() {
  const { cartCount, wishlistIds } = useCart();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = () => {
      const saved = localStorage.getItem("user_notifications");
      if (saved) {
        const notifs = JSON.parse(saved);
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
      }
    };
    checkUnread();

    // Listen for updates
    const handleUpdate = () => checkUnread();
    window.addEventListener("add-notification", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Also listen for local "read" clicks which don't trigger storage event on same tab
    const interval = setInterval(checkUnread, 2000);

    return () => {
      window.removeEventListener("add-notification", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const categories = [
    { label: "Men", path: "/products?category=Men" },
    { label: "Women", path: "/products?category=Women" },
    { label: "Kids", path: "/products?category=Kids" },
    { label: "Beauty", path: "/products?category=Beauty" },
    { label: "New Arrivals", path: "/products" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-card">
      {/* Top strip */}
      <div className="gradient-brand py-1 px-4 text-center text-xs font-body text-primary-foreground tracking-wide">
        🎉 FREE SHIPPING on orders above ₹999 | Use code: MYNTRA50 for 50% OFF
      </div>

      {/* Main navbar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png"
              alt="Myntra Symbol"
              className="h-8 w-auto object-contain"
            />
            <img
              src="https://logos-download.com/wp-content/uploads/2016/10/Myntra_logo.png"
              alt="Myntra"
              className="h-4 w-auto object-contain mt-1 hidden sm:block"
            />
          </Link>

          {/* Category nav - desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {categories.map(cat => (
              <Link
                key={cat.label}
                to={cat.path}
                className={`text-sm font-semibold font-body tracking-wide transition-colors hover:text-primary
                  ${location.search.includes(cat.label) ? "text-primary border-b-2 border-primary pb-1" : "text-foreground"}`}
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands..."
              className="pl-10 bg-secondary border-0 text-sm rounded-full font-body"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search - mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => user ? navigate("/wishlist") : navigate("/auth")}
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 gradient-brand text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.size}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 gradient-brand text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold badge-pulse">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold badge-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 border-none bg-transparent shadow-none" align="end" sideOffset={12}>
                <NotificationCenter />
              </PopoverContent>
            </Popover>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user ? navigate("/profile") : navigate("/auth")}
            >
              <User className="w-5 h-5" />
            </Button>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden mt-3 flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="pl-10 bg-secondary border-0 text-sm rounded-full font-body"
            />
          </form>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-slide-up">
          <nav className="flex flex-col p-4 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold font-body py-2 px-3 rounded-lg hover:bg-secondary hover:text-primary transition-colors"
              >
                {cat.label}
              </Link>
            ))}
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "light" ? <><Moon className="w-4 h-4 mr-2" /> Dark</> : <><Sun className="w-4 h-4 mr-2" /> Light</>}
              </Button>
            </div>
            {user && (
              <Button variant="outline" size="sm" onClick={signOut} className="w-full mt-2">
                Sign Out
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
