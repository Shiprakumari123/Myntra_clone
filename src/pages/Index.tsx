import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Flame, Sparkles, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { pushNotification } from "@/components/NotificationCenter";

const CATEGORIES = [
  {
    name: "Men",
    image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80",
    description: "Casual & Formal",
    color: "from-blue-600 to-blue-800",
  },
  {
    name: "Women",
    image: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&q=80",
    description: "Trendy & Ethnic",
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "Kids",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&q=80",
    description: "Fun & Comfortable",
    color: "from-orange-400 to-amber-500",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    description: "Skincare & Makeup",
    color: "from-purple-500 to-pink-500",
  },
];

const BANNERS = [
  {
    title: "End of Season Sale",
    subtitle: "Up to 70% off on top brands",
    cta: "Shop Now",
    link: "/products",
    bg: "from-pink-600 via-rose-500 to-orange-400",
    badge: "Limited Time",
  },
  {
    title: "New Arrivals — Summer 2025",
    subtitle: "Fresh styles for the new season",
    cta: "Explore",
    link: "/products?category=Women",
    bg: "from-violet-600 via-purple-500 to-pink-500",
    badge: "Just Dropped",
  },
  {
    title: "Premium Brands at Best Prices",
    subtitle: "Nike, Adidas, Puma & more",
    cta: "Browse All",
    link: "/products?category=Men",
    bg: "from-blue-700 via-blue-500 to-cyan-400",
    badge: "Top Brands",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Auto-slide banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetch = async () => {
      setLoadingProducts(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .limit(8)
        .order("created_at", { ascending: false });
      setFeaturedProducts(data || []);
      setLoadingProducts(false);
    };
    fetch();
  }, []);

  // Fetch recently viewed (server + localStorage fallback)
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      // Try from localStorage first (works offline)
      const localIds: string[] = JSON.parse(localStorage.getItem("recently_viewed") || "[]");

      if (user) {
        const { data } = await supabase
          .from("browsing_history")
          .select("product_id, products(*), viewed_at")
          .eq("user_id", user.id)
          .order("viewed_at", { ascending: false })
          .limit(10);
        const products = data?.map((d: any) => d.products).filter(Boolean) || [];
        setRecentlyViewed(products);
      } else if (localIds.length > 0) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .in("id", localIds.slice(0, 10));
        // Sort by order in localIds
        const sorted = localIds
          .map(id => data?.find(p => p.id === id))
          .filter(Boolean) as any[];
        setRecentlyViewed(sorted);
      }
    };
    fetchRecentlyViewed();

    // Trigger one-time welcome notification if not seen
    const seenWelcome = localStorage.getItem("seen_welcome_notif");
    if (!seenWelcome) {
      setTimeout(() => {
        pushNotification(
          "Welcome to Myntra! 🛍️",
          "Discover the latest trends in fashion and beauty. Exclusive 50% discount for you!",
          "promo"
        );
        localStorage.setItem("seen_welcome_notif", "true");
      }, 2000);
    }
  }, [user]);

  const banner = BANNERS[currentBanner];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* Hero Banner */}
        <section className="mt-4 rounded-2xl overflow-hidden relative">
          <div className={`bg-gradient-to-r ${banner.bg} min-h-[260px] md:min-h-[380px] flex items-center px-8 md:px-16 relative overflow-hidden transition-all duration-700`}>
            {/* Decorative circles */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute right-20 bottom-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3" />

            <div className="relative z-10 text-white max-w-lg">
              <Badge className="bg-white/20 text-white border-white/30 mb-3 text-xs backdrop-blur-sm">
                <Flame className="w-3 h-3 mr-1" />
                {banner.badge}
              </Badge>
              <h1 className="font-brand text-3xl md:text-5xl font-bold mb-3 leading-tight">{banner.title}</h1>
              <p className="text-white/80 text-base md:text-lg mb-6 font-body">{banner.subtitle}</p>
              <Button
                onClick={() => navigate(banner.link)}
                className="bg-white hover:bg-white/90 font-semibold rounded-full px-6 font-body"
                style={{ color: 'hsl(340, 82%, 52%)' }}
              >
                {banner.cta} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Banner dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? "bg-white w-5" : "bg-white/50"}`}
              />
            ))}
          </div>

          {/* Nav arrows */}
          <button
            onClick={() => setCurrentBanner(prev => (prev - 1 + BANNERS.length) % BANNERS.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentBanner(prev => (prev + 1) % BANNERS.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* Categories */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-brand text-2xl font-bold text-foreground">Shop by Category</h2>
            <Link to="/products" className="text-sm text-primary font-semibold hover:underline font-body flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 gradient-card" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-brand font-bold text-xl">{cat.name}</p>
                  <p className="text-white/80 text-xs font-body">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-brand text-2xl font-bold text-foreground">Recently Viewed</h2>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar scroll-snap-x">
              {recentlyViewed.map(product => (
                <div key={product.id} className="w-44 shrink-0 scroll-snap-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-brand text-2xl font-bold text-foreground">Trending Now</h2>
            </div>
            <Link to="/products" className="text-sm text-primary font-semibold hover:underline font-body flex items-center gap-1">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <div className="shimmer aspect-[3/4] rounded-xl" />
                  <div className="mt-2 space-y-2 p-1">
                    <div className="shimmer h-3 w-2/3 rounded" />
                    <div className="shimmer h-3 w-full rounded" />
                    <div className="shimmer h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 gradient-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-brand text-xl font-semibold text-foreground mb-2">No Products Yet</h3>
              <p className="text-muted-foreground text-sm font-body mb-4">Products will appear here once added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Offers strip */}
        <section className="mt-12 gradient-subtle rounded-2xl p-6 md:p-10 text-center">
          <Badge className="mb-3 gradient-brand text-primary-foreground border-0">
            <Flame className="w-3 h-3 mr-1" /> Hot Deals
          </Badge>
          <h2 className="font-brand text-2xl md:text-3xl font-bold text-foreground mb-2">
            Exclusive Offers Await You
          </h2>
          <p className="text-muted-foreground font-body mb-6 max-w-md mx-auto">
            Sign up and get ₹200 off on your first order. New collections dropping every week.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => navigate("/products")} className="gradient-brand text-primary-foreground border-0 rounded-full px-8 font-semibold font-body">
              Shop Now
            </Button>
            {!user && (
              <Button onClick={() => navigate("/auth")} variant="outline" className="rounded-full px-8 font-semibold font-body">
                Sign Up Free
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
