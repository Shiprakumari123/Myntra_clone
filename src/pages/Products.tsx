import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, ChevronDown, X, SlidersHorizontal, Grid2X2, LayoutList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = ["Men", "Women", "Kids", "Beauty"];
const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "New Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("recommended");
  const [gridCols, setGridCols] = useState<2 | 3>(2);

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && !selectedCategories.includes(cat)) {
      setSelectedCategories([cat]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, priceRange, sortBy, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .gte("price", priceRange[0])
      .lte("price", priceRange[1]);

    if (selectedCategories.length > 0) {
      query = query.in("category", selectedCategories);
    }
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
    }
    if (sortBy === "newest") query = query.order("created_at", { ascending: false });
    else if (sortBy === "price_asc") query = query.order("price", { ascending: true });
    else if (sortBy === "price_desc") query = query.order("price", { ascending: false });
    else if (sortBy === "rating") query = query.order("rating", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, count } = await query.limit(48);
    setProducts(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSortBy("recommended");
    setSearchParams({});
  };

  const activeFilterCount = selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6 font-body">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={cat}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <label htmlFor={cat} className="text-sm cursor-pointer text-foreground">{cat}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">
          Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
        </h3>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mt-2"
        />
      </div>

      <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {searchQuery ? (
              <h1 className="font-brand text-2xl font-bold">
                Results for "<span className="text-primary">{searchQuery}</span>"
              </h1>
            ) : selectedCategories.length === 1 ? (
              <h1 className="font-brand text-2xl font-bold">{selectedCategories[0]}</h1>
            ) : (
              <h1 className="font-brand text-2xl font-bold">All Products</h1>
            )}
            <p className="text-sm text-muted-foreground mt-1 font-body">
              {loading ? "Loading..." : `${totalCount.toLocaleString()} items`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Grid toggle */}
            <div className="hidden md:flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={gridCols === 2 ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-9 w-9"
                onClick={() => setGridCols(2)}
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>
              <Button
                variant={gridCols === 3 ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-9 w-9"
                onClick={() => setGridCols(3)}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {selectedCategories.map(cat => (
              <Badge key={cat} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleCategory(cat)}>
                {cat} <X className="w-3 h-3" />
              </Badge>
            ))}
            <button onClick={clearFilters} className="text-xs text-primary hover:underline font-body">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-28 bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground font-brand text-lg">Filters</h2>
                {activeFilterCount > 0 && (
                  <Badge className="gradient-brand text-primary-foreground border-0">{activeFilterCount}</Badge>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Sort + Filter bar */}
            <div className="flex items-center justify-between gap-3 mb-5">
              {/* Mobile filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-1.5 font-body">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && <Badge className="gradient-brand text-primary-foreground border-0 ml-1">{activeFilterCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="font-brand">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <span className="text-sm text-muted-foreground font-body hidden sm:block">Sort by:</span>
                <div className="flex gap-1 flex-wrap">
                  {SORT_OPTIONS.slice(0, 3).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-body transition-all
                        ${sortBy === opt.value
                          ? "gradient-brand text-primary-foreground border-transparent"
                          : "border-border text-foreground hover:border-primary hover:text-primary"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className={`grid gap-4 ${gridCols === 2 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <div className="shimmer aspect-[3/4]" />
                    <div className="p-3 space-y-2">
                      <div className="shimmer h-3 w-1/2 rounded" />
                      <div className="shimmer h-3 w-full rounded" />
                      <div className="shimmer h-3 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-brand text-xl font-semibold mb-2">No Products Found</h3>
                <p className="text-muted-foreground text-sm font-body mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={clearFilters} variant="outline" className="font-body">Clear Filters</Button>
              </div>
            ) : (
              <div className={`grid gap-4 ${gridCols === 2 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
