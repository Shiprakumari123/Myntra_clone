import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  category: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  saved_for_later: boolean;
  products: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistIds: Set<string>;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (product: Product, size?: string, color?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
  refetchCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCartItems((data as any) || []);
    setLoading(false);
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistIds(new Set()); return; }
    const { data } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", user.id);
    setWishlistIds(new Set(data?.map(i => i.product_id) || []));
  }, [user]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const addToCart = async (product: Product, size?: string, color?: string) => {
    if (!user) { toast.error("Please login to add items to cart"); return; }
    const { error } = await supabase.from("cart_items").upsert({
      user_id: user.id,
      product_id: product.id,
      quantity: 1,
      size: size || null,
      color: color || null,
      saved_for_later: false,
    }, { onConflict: "user_id,product_id,size,color,saved_for_later" });
    if (!error) {
      toast.success("Added to bag!");
      fetchCart();
    }
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  const saveForLater = async (itemId: string) => {
    await supabase.from("cart_items").update({ saved_for_later: true }).eq("id", itemId);
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, saved_for_later: true } : i));
    toast.success("Saved for later");
  };

  const moveToCart = async (itemId: string) => {
    await supabase.from("cart_items").update({ saved_for_later: false }).eq("id", itemId);
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, saved_for_later: false } : i));
    toast.success("Moved to bag");
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) { toast.error("Please login to add to wishlist"); return; }
    if (wishlistIds.has(productId)) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
      setWishlistIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
      setWishlistIds(prev => new Set([...prev, productId]));
      toast.success("Added to wishlist ❤️");
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.has(productId);
  const isInCart = (productId: string) => cartItems.some(i => i.product_id === productId && !i.saved_for_later);

  const activeCartItems = cartItems.filter(i => !i.saved_for_later);
  const cartCount = activeCartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = activeCartItems.reduce((sum, i) => sum + (i.products?.price || 0) * i.quantity, 0);

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems, wishlistIds, cartCount, cartTotal, loading,
      addToCart, removeFromCart, updateQuantity, saveForLater, moveToCart,
      toggleWishlist, isInWishlist, isInCart, refetchCart: fetchCart, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
