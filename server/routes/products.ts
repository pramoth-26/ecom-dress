import { RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";

const productsFilePath = path.join(__dirname, "../data/products.json");

export interface Product {
  id: string;
  category: string;
  name: string;
  price: number;
  image: string;
  description: string;
  color: string;
  size: string[];
  stock: number;
}

const readProductsFile = (): Product[] => {
  try {
    const data = fs.readFileSync(productsFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeProductsFile = (products: Product[]) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

export const handleGetAllProducts: RequestHandler = (req, res) => {
  try {
    const products = readProductsFile();
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      error: "Server error while fetching products",
    });
  }
};

export const handleGetProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const products = readProductsFile();
    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      error: "Server error while fetching product",
    });
  }
};

export const handleAddProduct: RequestHandler = (req, res) => {
  try {
    const { name, category, price, description, color, size, image, stock } =
      req.body;

    if (
      !name ||
      !category ||
      !price ||
      !description ||
      !color ||
      !size ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        error: "Missing required fields: name, category, price, description, color, size, image, stock",
      });
    }

    const products = readProductsFile();

    // Generate new product ID
    const maxId = Math.max(
      ...products
        .map((p) => {
          const match = p.id.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        })
        .concat([0])
    );

    const newProduct: Product = {
      id: `p${maxId + 1}`,
      name,
      category,
      price: parseFloat(price),
      description,
      color,
      size: Array.isArray(size) ? size : [size],
      image,
      stock: parseInt(stock),
    };

    products.push(newProduct);
    writeProductsFile(products);

    res.json({
      success: true,
      product: newProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      error: "Server error while adding product",
    });
  }
};

export const handleUpdateProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, color, size, image, stock } =
      req.body;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const products = readProductsFile();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[productIndex];

    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = parseFloat(price);
    if (description) product.description = description;
    if (color) product.color = color;
    if (size) product.size = Array.isArray(size) ? size : [size];
    if (image) product.image = image;
    if (stock !== undefined) product.stock = parseInt(stock);

    products[productIndex] = product;
    writeProductsFile(products);

    res.json({
      success: true,
      product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      error: "Server error while updating product",
    });
  }
};

export const handleDeleteProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const products = readProductsFile();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    writeProductsFile(products);

    res.json({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "Server error while deleting product",
    });
  }
};

export const handleUpdateProductStock: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    if (stock === undefined) {
      return res.status(400).json({ error: "Stock value is required" });
    }

    const products = readProductsFile();
    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.stock = parseInt(stock);
    writeProductsFile(products);

    res.json({
      success: true,
      product,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      error: "Server error while updating stock",
    });
  }
};
