import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star, Share2, ChevronLeft, ChevronRight, Truck, RefreshCw, Shield, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist, isInCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      trackView();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").eq("id", id).single();
    setProduct(data);
    if (data) {
      fetchRelated(data.category, data.id);
    }
    setLoading(false);
  };

  const fetchRelated = async (category: string, excludeId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", excludeId)
      .limit(8);
    setRelated(data || []);
  };

  const trackView = async () => {
    if (!id) return;
    // localStorage (offline support)
    const stored: string[] = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    const updated = [id, ...stored.filter(i => i !== id)].slice(0, 20);
    localStorage.setItem("recently_viewed", JSON.stringify(updated));

    // Server-side (if logged in)
    if (user) {
      await supabase.from("browsing_history").upsert(
        { user_id: user.id, product_id: id, viewed_at: new Date().toISOString() },
        { onConflict: "user_id,product_id" }
      );
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    setAdding(true);
    await addToCart(product, selectedSize, selectedColor);
    setAdding(false);
  };

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const images = product?.images?.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="shimmer aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="shimmer h-6 w-1/3 rounded" />
              <div className="shimmer h-8 w-full rounded" />
              <div className="shimmer h-6 w-1/2 rounded" />
              <div className="shimmer h-12 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="font-brand text-2xl">Product not found</h2>
          <Button onClick={() => navigate("/products")} className="mt-4 font-body">Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-body mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-16 shrink-0">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`rounded-lg overflow-hidden aspect-square border-2 transition-all ${i === currentImage ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-secondary aspect-square">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {discount > 0 && (
                <Badge className="absolute top-4 left-4 gradient-brand text-primary-foreground border-0 text-sm">
                  {discount}% OFF
                </Badge>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(prev => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-card/80 rounded-full flex items-center justify-center shadow-sm hover:bg-card transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-card/80 rounded-full flex items-center justify-center shadow-sm hover:bg-card transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="font-body">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{product.brand}</p>
                <h1 className="font-brand text-2xl md:text-3xl font-bold text-foreground mt-1 leading-tight">{product.name}</h1>
              </div>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 shrink-0
                  ${isInWishlist(product.id) ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground"}`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-success/10 text-success px-2.5 py-1 rounded-lg text-sm font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {product.rating}
                </div>
                {product.review_count && (
                  <span className="text-sm text-muted-foreground">
                    {product.review_count.toLocaleString()} Ratings & {Math.floor(product.review_count / 5).toLocaleString()} Reviews
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4 pb-4 border-b border-border">
              <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through">₹{product.original_price.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className="text-base font-bold text-discount">({discount}% OFF)</span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">inclusive of all taxes</p>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">Select Size</p>
                  <button className="text-xs text-primary hover:underline">Size Guide</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border-2 text-sm font-semibold transition-all hover:border-primary
                        ${selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:text-primary"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mt-5">
                <p className="font-semibold text-foreground mb-2">Select Color</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all
                        ${selectedColor === color
                          ? "border-primary text-primary"
                          : "border-border text-foreground hover:border-primary"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddToCart}
                disabled={adding || !product.in_stock}
                className="flex-1 gradient-brand text-primary-foreground border-0 h-12 text-base font-bold rounded-xl"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {!product.in_stock ? "Out of Stock" : adding ? "Adding..." : isInCart(product.id) ? "Go to Bag" : "Add to Bag"}
              </Button>
              <Button
                onClick={() => toggleWishlist(product.id)}
                variant="outline"
                className="flex-1 h-12 text-base font-bold rounded-xl border-2"
              >
                <Heart className={`w-5 h-5 mr-2 ${isInWishlist(product.id) ? "fill-primary text-primary" : ""}`} />
                Wishlist
              </Button>
            </div>

            {/* Delivery info */}
            <div className="mt-6 space-y-3 bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Free Delivery</p>
                  <p className="text-muted-foreground text-xs">On orders above ₹999 • Arrives in 3-5 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Easy Returns</p>
                  <p className="text-muted-foreground text-xs">30-day easy return & exchange policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Secure Payment</p>
                  <p className="text-muted-foreground text-xs">100% secure payment gateway</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-5">
                <p className="font-semibold text-foreground mb-2">About this Product</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-brand text-2xl font-bold text-foreground mb-5">You May Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar scroll-snap-x">
              {related.map(p => (
                <div key={p.id} className="w-48 shrink-0 scroll-snap-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
