import { RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";

const cartsFilePath = path.join(__dirname, "../data/carts.json");

interface CartItem {
  id: string;
  dressId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  addedAt: string;
}

interface UserCart {
  userId: string;
  items: CartItem[];
}

const readCartsFile = (): UserCart[] => {
  try {
    const data = fs.readFileSync(cartsFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeCartsFile = (carts: UserCart[]) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

export const handleAddToCart: RequestHandler = (req, res) => {
  try {
    const { userId, dressId, name, price, image, size } = req.body;

    if (!userId || !dressId || !name || !price || !size) {
      return res.status(400).json({ 
        error: "Missing required fields: userId, dressId, name, price, size" 
      });
    }

    const carts = readCartsFile();
    let userCart = carts.find((c) => c.userId === userId);

    if (!userCart) {
      userCart = {
        userId,
        items: [],
      };
      carts.push(userCart);
    }

    // Check if item with same dress and size already exists
    const existingItem = userCart.items.find(
      (item) => item.dressId === dressId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        dressId,
        name,
        price,
        image,
        quantity: 1,
        size,
        addedAt: new Date().toISOString(),
      };
      userCart.items.push(newItem);
    }

    writeCartsFile(carts);

    res.json({
      success: true,
      message: "Item added to cart",
      cartItem: userCart.items[userCart.items.length - 1],
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ 
      error: "Server error while adding to cart" 
    });
  }
};

export const handleGetUserCart: RequestHandler = (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const carts = readCartsFile();
    const userCart = carts.find((c) => c.userId === userId);

    if (!userCart) {
      return res.json({
        success: true,
        items: [],
      });
    }

    res.json({
      success: true,
      items: userCart.items,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ 
      error: "Server error while fetching cart" 
    });
  }
};

export const handleRemoveFromCart: RequestHandler = (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ 
        error: "userId and itemId are required" 
      });
    }

    const carts = readCartsFile();
    const userCart = carts.find((c) => c.userId === userId);

    if (!userCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    userCart.items = userCart.items.filter((item) => item.id !== itemId);

    writeCartsFile(carts);

    res.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ 
      error: "Server error while removing from cart" 
    });
  }
};

export const handleUpdateCartItemQuantity: RequestHandler = (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;

    if (!userId || !itemId || quantity === undefined) {
      return res.status(400).json({ 
        error: "userId, itemId, and quantity are required" 
      });
    }

    if (quantity < 0) {
      return res.status(400).json({ error: "Quantity must be non-negative" });
    }

    const carts = readCartsFile();
    const userCart = carts.find((c) => c.userId === userId);

    if (!userCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const item = userCart.items.find((i) => i.id === itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    if (quantity === 0) {
      userCart.items = userCart.items.filter((i) => i.id !== itemId);
    } else {
      item.quantity = quantity;
    }

    writeCartsFile(carts);

    res.json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ 
      error: "Server error while updating cart" 
    });
  }
};

export const handleClearCart: RequestHandler = (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const carts = readCartsFile();
    const userCartIndex = carts.findIndex((c) => c.userId === userId);

    if (userCartIndex === -1) {
      return res.status(404).json({ error: "Cart not found" });
    }

    carts[userCartIndex].items = [];
    writeCartsFile(carts);

    res.json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ 
      error: "Server error while clearing cart" 
    });
  }
};
