import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  images: string[];
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product);
    setAdding(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const imageUrl = !imgError && product.images?.[0]
    ? product.images[0]
    : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`;

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="product-card bg-card rounded-xl overflow-hidden shadow-card group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-secondary">
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {/* Discount badge */}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 gradient-brand text-primary-foreground border-0 text-xs font-semibold">
              {discount}% OFF
            </Badge>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110
              ${inWishlist ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>

          {/* Add to bag - shows on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={handleAddToCart}
              disabled={adding || !product.in_stock}
              size="sm"
              className="w-full gradient-brand text-primary-foreground border-0 font-semibold text-xs rounded-lg"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              {!product.in_stock ? "Out of Stock" : adding ? "Adding..." : "Add to Bag"}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide font-body line-clamp-1">
            {product.brand}
          </p>
          <p className="text-sm text-foreground font-body mt-0.5 line-clamp-2 leading-snug">
            {product.name}
          </p>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5 bg-success/10 text-success px-1.5 py-0.5 rounded text-[10px] font-bold">
                <Star className="w-2.5 h-2.5 fill-current" />
                {product.rating}
              </div>
              {product.review_count && (
                <span className="text-[10px] text-muted-foreground">({product.review_count.toLocaleString()})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-foreground text-sm">₹{product.price.toLocaleString()}</span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through">₹{product.original_price.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-xs text-discount font-semibold">({discount}% off)</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
