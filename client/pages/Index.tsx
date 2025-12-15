import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Heart, ShoppingCart, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Dress {
  id: string;
  category: "men" | "women" | "children";
  name: string;
  price: number;
  image: string;
  description: string;
  color: string;
  size: string[];
  stock: number;
}

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selectedSizeForCart, setSelectedSizeForCart] = useState<{
    [key: string]: string;
  }>({});
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [expandedFilters, setExpandedFilters] = useState({
    age: true,
    gender: true,
    size: true,
    cost: true,
  });

  // Filter states
  const [selectedAge, setSelectedAge] = useState<Set<string>>(
    new Set(["adults", "children"])
  );
  const [selectedGender, setSelectedGender] = useState<Set<string>>(
    new Set(["men", "women", "children"])
  );
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        if (data.success) {
          setDresses(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Get all unique sizes
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    dresses.forEach((dress) => {
      dress.size.forEach((s) => sizes.add(s));
    });
    return Array.from(sizes).sort();
  }, [dresses]);

  // Get max price
  const maxPrice = useMemo(() => {
    return Math.max(...dresses.map((d) => d.price));
  }, [dresses]);

  // Filter logic
  const filteredDresses = useMemo(() => {
    return dresses.filter((dress) => {
      // Age filter
      const isAdult = ["men", "women"].includes(dress.category);
      const isChild = dress.category === "children";

      let ageMatch = false;
      if (selectedAge.has("adults") && isAdult) ageMatch = true;
      if (selectedAge.has("children") && isChild) ageMatch = true;

      if (!ageMatch) return false;

      // Gender filter
      if (!selectedGender.has(dress.category)) return false;

      // Size filter
      if (selectedSizes.size > 0) {
        const hasSizeMatch = dress.size.some((s) => selectedSizes.has(s));
        if (!hasSizeMatch) return false;
      }

      // Price filter
      if (dress.price < priceRange[0] || dress.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [selectedAge, selectedGender, selectedSizes, priceRange, dresses]);

  const toggleWishlist = (id: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(id)) {
      newWishlist.delete(id);
    } else {
      newWishlist.add(id);
    }
    setWishlist(newWishlist);
  };

  const toggleFilter = (filterName: keyof typeof expandedFilters) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const toggleAge = (age: string) => {
    const newAge = new Set(selectedAge);
    if (newAge.has(age)) {
      newAge.delete(age);
    } else {
      newAge.add(age);
    }
    setSelectedAge(newAge);
  };

  const toggleGender = (gender: string) => {
    const newGender = new Set(selectedGender);
    if (newGender.has(gender)) {
      newGender.delete(gender);
    } else {
      newGender.add(gender);
    }
    setSelectedGender(newGender);
  };

  const toggleSize = (size: string) => {
    const newSizes = new Set(selectedSizes);
    if (newSizes.has(size)) {
      newSizes.delete(size);
    } else {
      newSizes.add(size);
    }
    setSelectedSizes(newSizes);
  };

  const resetFilters = () => {
    setSelectedAge(new Set(["adults", "children"]));
    setSelectedGender(new Set(["men", "women", "children"]));
    setSelectedSizes(new Set());
    setPriceRange([0, maxPrice]);
  };

  const handleAddToCart = async (dress: Dress) => {
    const userId = localStorage.getItem("userId");

    // Check if user is signed in
    if (!userId) {
      navigate("/signin");
      return;
    }

    // Check if size is selected
    const selectedSize = selectedSizeForCart[dress.id];
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(dress.id);

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          dressId: dress.id,
          name: dress.name,
          price: dress.price,
          image: dress.image,
          size: selectedSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      toast({
        title: "Added to cart!",
        description: `${dress.name} has been added to your cart`,
      });

      // Clear selected size for this dress
      setSelectedSizeForCart((prev) => {
        const newState = { ...prev };
        delete newState[dress.id];
        return newState;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Discover Our Collections
              </h1>
              <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Curated fashion for everyone. Find your perfect dress with our
                advanced filters.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-4 bg-white rounded-2xl shadow-md p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Filters</h2>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {/* Age Filter */}
                <div className="border-b border-border pb-4">
                  <button
                    onClick={() => toggleFilter("age")}
                    className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-foreground">Age Group</h3>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        expandedFilters.age ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFilters.age && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAge.has("adults")}
                          onChange={() => toggleAge("adults")}
                          className="w-4 h-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">Adults</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAge.has("children")}
                          onChange={() => toggleAge("children")}
                          className="w-4 h-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          Children
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Gender Filter */}
                <div className="border-b border-border pb-4">
                  <button
                    onClick={() => toggleFilter("gender")}
                    className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-foreground">Gender</h3>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        expandedFilters.gender ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFilters.gender && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedGender.has("men")}
                          onChange={() => toggleGender("men")}
                          className="w-4 h-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">Men</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedGender.has("women")}
                          onChange={() => toggleGender("women")}
                          className="w-4 h-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">Women</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedGender.has("children")}
                          onChange={() => toggleGender("children")}
                          className="w-4 h-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          Children
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Size Filter */}
                <div className="border-b border-border pb-4">
                  <button
                    onClick={() => toggleFilter("size")}
                    className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-foreground">Size</h3>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        expandedFilters.size ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFilters.size && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {allSizes.map((size) => (
                        <label
                          key={size}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSizes.has(size)}
                            onChange={() => toggleSize(size)}
                            className="w-4 h-4 rounded border-border accent-primary"
                          />
                          <span className="text-sm text-foreground">{size}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Filter */}
                <div>
                  <button
                    onClick={() => toggleFilter("cost")}
                    className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-foreground">Price</h3>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        expandedFilters.cost ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFilters.cost && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-foreground font-semibold">
                          Min: ₹{priceRange[0]}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max={maxPrice}
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              Number(e.target.value),
                              priceRange[1],
                            ])
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-foreground font-semibold">
                          Max: ₹{priceRange[1]}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              Number(e.target.value),
                            ])
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                      <div className="bg-accent/10 p-2 rounded text-sm text-foreground">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredDresses.length} product
                  {filteredDresses.length !== 1 ? "s" : ""}
                </p>
              </div>

              {filteredDresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {filteredDresses.map((dress) => (
                    <div
                      key={dress.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={dress.image}
                          alt={dress.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(dress.id)}
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 group-hover:scale-110"
                        >
                          <Heart
                            size={20}
                            className={`transition-colors duration-200 ${
                              wishlist.has(dress.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          />
                        </button>

                        {/* Add to Cart Section */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 space-y-3">
                          {/* Size Selector */}
                          <div className="flex flex-wrap gap-2 justify-center">
                            {dress.size.map((size) => (
                              <button
                                key={size}
                                onClick={() =>
                                  setSelectedSizeForCart((prev) => ({
                                    ...prev,
                                    [dress.id]: size,
                                  }))
                                }
                                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                                  selectedSizeForCart[dress.id] === size
                                    ? "bg-white text-primary"
                                    : "bg-white/30 text-white hover:bg-white/50"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => handleAddToCart(dress)}
                            disabled={addingToCart === dress.id}
                            className="w-full bg-white text-primary py-2 rounded font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={18} />
                            {addingToCart === dress.id ? "Adding..." : "Add to Cart"}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                          {dress.name}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {dress.description}
                        </p>

                        {/* Details */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Color
                            </p>
                            <p className="font-semibold text-foreground">
                              {dress.color}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Sizes
                            </p>
                            <p className="font-semibold text-foreground">
                              {dress.size.length} options
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-3 pt-4 border-t border-border">
                          <span className="text-3xl font-bold text-primary">
                            ₹{dress.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No dresses match your filters. Try adjusting your
                    selections.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
