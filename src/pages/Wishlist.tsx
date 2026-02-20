import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist, addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && wishlistIds.size > 0) {
      fetchWishlistProducts();
    } else {
      setLoading(false);
      setProducts([]);
    }
  }, [user, wishlistIds]);

  const fetchWishlistProducts = async () => {
    setLoading(true);
    const ids = Array.from(wishlistIds);
    const { data } = await supabase.from("products").select("*").in("id", ids);
    setProducts(data || []);
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <Heart className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="font-brand text-3xl font-bold mb-3">Your Wishlist</h2>
          <p className="text-muted-foreground font-body mb-6">Login to view and manage your wishlist</p>
          <Button onClick={() => navigate("/auth")} className="gradient-brand text-primary-foreground border-0 rounded-full px-8 font-body font-semibold">
            Login / Register
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-body mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-brand text-3xl font-bold">My Wishlist</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">{products.length} items saved</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="shimmer aspect-[3/4]" />
                <div className="p-3 space-y-2">
                  <div className="shimmer h-3 w-1/2 rounded" />
                  <div className="shimmer h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-primary mx-auto mb-4 opacity-30" />
            <h2 className="font-brand text-2xl font-bold mb-3">Your wishlist is empty</h2>
            <p className="text-muted-foreground font-body mb-6">Save items you love to your wishlist</p>
            <Button onClick={() => navigate("/products")} className="gradient-brand text-primary-foreground border-0 rounded-full px-8 font-body font-semibold">
              Explore Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gradient-brand text-primary-foreground border-0 text-xs font-semibold"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingBag className="w-3 h-3 mr-1" /> Add to Bag
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2 text-destructive hover:text-destructive"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
