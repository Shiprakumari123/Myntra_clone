import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ChevronRight, ArrowLeft, BookmarkPlus, Archive } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, saveForLater, moveToCart, loading } = useCart();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const activeItems = cartItems.filter(i => !i.saved_for_later);
  const savedItems = cartItems.filter(i => i.saved_for_later);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "MYNTRA50") {
      setDiscount(Math.round(cartTotal * 0.5));
      setAppliedCoupon(coupon.toUpperCase());
    } else if (coupon.toUpperCase() === "SAVE200") {
      setDiscount(200);
      setAppliedCoupon(coupon.toUpperCase());
    } else {
      setDiscount(0);
      setAppliedCoupon("");
      alert("Invalid coupon code");
    }
    setCoupon("");
  };

  const finalTotal = Math.max(0, cartTotal - discount);
  const savings = cartItems.reduce((sum, i) => {
    const orig = i.products?.original_price || i.products?.price || 0;
    return sum + (orig - (i.products?.price || 0)) * (i.saved_for_later ? 0 : i.quantity);
  }, 0) + discount;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="font-brand text-3xl font-bold mb-3">Your Bag is Waiting!</h2>
          <p className="text-muted-foreground font-body mb-6">Login to view your cart and checkout</p>
          <Button onClick={() => navigate("/auth")} className="gradient-brand text-primary-foreground border-0 rounded-full px-8 font-body font-semibold">
            Login / Register
          </Button>
        </div>
      </div>
    );
  }

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="font-brand text-3xl font-bold mb-3">Your Bag is Empty</h2>
          <p className="text-muted-foreground font-body mb-6">Add items you love to your bag. Explore our latest collection!</p>
          <Button onClick={() => navigate("/products")} className="gradient-brand text-primary-foreground border-0 rounded-full px-8 font-body font-semibold">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-body mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {/* Active items */}
            {activeItems.length > 0 && (
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="font-brand text-xl font-bold">My Bag ({activeItems.length} items)</h2>
                    <Badge variant="secondary" className="font-body">
                      {cartItems.length - savedItems.length} active
                    </Badge>
                  </div>
                </div>

                {activeItems.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <Separator />}
                    <div className="p-4 flex gap-4 animate-fade-in">
                      {/* Image */}
                      <div
                        className="w-24 h-28 rounded-xl overflow-hidden bg-secondary shrink-0 cursor-pointer"
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      >
                        <img
                          src={item.products?.images?.[0] || PLACEHOLDER}
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 font-body">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{item.products?.brand}</p>
                        <p
                          className="text-sm font-medium text-foreground mt-0.5 line-clamp-2 cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/product/${item.product_id}`)}
                        >
                          {item.products?.name}
                        </p>

                        {/* Size/Color */}
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {item.size && (
                            <Badge variant="secondary" className="text-xs">Size: {item.size}</Badge>
                          )}
                          {item.color && (
                            <Badge variant="secondary" className="text-xs">Color: {item.color}</Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-bold text-foreground">₹{((item.products?.price || 0) * item.quantity).toLocaleString()}</span>
                          {item.products?.original_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{((item.products.original_price) * item.quantity).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {/* Quantity */}
                          <div className="flex items-center border border-border rounded-full overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => saveForLater(item.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-semibold"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" /> Save for Later
                          </button>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-1 text-xs text-destructive hover:opacity-80 transition-colors font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-muted-foreground" />
                    <h2 className="font-brand text-lg font-bold">Saved for Later ({savedItems.length})</h2>
                  </div>
                  <p className="text-xs text-muted-foreground font-body mt-1">These items won't affect your total</p>
                </div>
                {savedItems.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <Separator />}
                    <div className="p-4 flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                      <div
                        className="w-20 h-24 rounded-xl overflow-hidden bg-secondary shrink-0 cursor-pointer"
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      >
                        <img
                          src={item.products?.images?.[0] || PLACEHOLDER}
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                        />
                      </div>
                      <div className="flex-1 font-body">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{item.products?.brand}</p>
                        <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-2">{item.products?.name}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-bold text-foreground">₹{(item.products?.price || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => moveToCart(item.id)}
                            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-1 text-xs text-destructive font-semibold hover:opacity-80"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {activeItems.length > 0 && (
            <div className="lg:w-80 shrink-0">
              <div className="bg-card rounded-2xl shadow-card p-5 sticky top-28 font-body">
                <h3 className="font-brand text-lg font-bold mb-4">Order Summary</h3>

                {/* Coupon */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Input
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      placeholder="Enter coupon code"
                      className="text-sm rounded-xl"
                    />
                    <Button
                      onClick={applyCoupon}
                      variant="outline"
                      size="sm"
                      className="shrink-0 font-semibold"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-success font-semibold">
                      <Tag className="w-3 h-3" /> {appliedCoupon} applied! Saved ₹{discount.toLocaleString()}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Try: MYNTRA50 or SAVE200</p>
                </div>

                <Separator className="mb-4" />

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({activeItems.length} items)</span>
                    <span className="text-foreground font-semibold">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-success text-xs">
                      <span>You Save</span>
                      <span className="font-semibold">−₹{savings.toLocaleString()}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-success text-xs">
                      <span>Coupon ({appliedCoupon})</span>
                      <span className="font-semibold">−₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={finalTotal >= 999 ? "text-success font-semibold" : "text-foreground font-semibold"}>
                      {finalTotal >= 999 ? "FREE" : "₹49"}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-baseline mb-5">
                  <span className="font-bold text-foreground text-base">Total Amount</span>
                  <span className="font-bold text-foreground text-xl">
                    ₹{(finalTotal + (finalTotal < 999 ? 49 : 0)).toLocaleString()}
                  </span>
                </div>

                {savings > 0 && (
                  <p className="text-xs text-success font-semibold text-center mb-3">
                    🎉 You're saving ₹{savings.toLocaleString()} on this order!
                  </p>
                )}

                <Button
                  className="w-full gradient-brand text-primary-foreground border-0 h-12 text-base font-bold rounded-xl font-body"
                  onClick={() => navigate("/checkout")}
                >
                  Place Order <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Safe & Secure Payments. 100% Authentic Products.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
