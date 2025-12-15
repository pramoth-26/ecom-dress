import { useState } from "react";
import Layout from "@/components/Layout";
import { Heart, ShoppingCart } from "lucide-react";
import dressesData from "@/data/dresses.json";

interface Dress {
  id: string;
  category: "men" | "women" | "children";
  name: string;
  price: number;
  image: string;
  description: string;
  color: string;
  size: string[];
}

export default function Women() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const dresses: Dress[] = dressesData.dresses.filter(
    (d) => d.category === "women"
  );

  const toggleWishlist = (id: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(id)) {
      newWishlist.delete(id);
    } else {
      newWishlist.add(id);
    }
    setWishlist(newWishlist);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Women's Collection
              </h1>
              <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Discover elegant and stylish dresses for every occasion.
              </p>
            </div>
          </div>
        </div>

        {/* Dresses Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {dresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dresses.map((dress) => (
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

                    {/* Add to Cart Button */}
                    <button className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-primary to-transparent text-primary-foreground py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 font-semibold">
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
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
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-semibold text-foreground">
                          {dress.color}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sizes</p>
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
                No dresses found in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
