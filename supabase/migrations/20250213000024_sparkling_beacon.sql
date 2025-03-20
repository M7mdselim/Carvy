/*
  # Initial Schema for Car Parts Marketplace

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `icon` (text)
      - `created_at` (timestamp)
    
    - `shops`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `logo` (text)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, references shops)
      - `category_id` (uuid, references categories)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image` (text)
      - `stock` (integer)
      - `created_at` (timestamp)
    
    - `product_compatibility`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `car_model` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public read access to categories
      - Public read access to shops
      - Public read access to products
      - Public read access to product_compatibility
      - Authenticated shop owners can manage their own shops and products
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create shops table
CREATE TABLE shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  logo text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create product_compatibility table
CREATE TABLE product_compatibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products ON DELETE CASCADE NOT NULL,
  car_model text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage categories"
  ON categories
  USING (auth.role() = 'authenticated');

-- Shops Policies
CREATE POLICY "Allow public read access to shops"
  ON shops
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow shop owners to manage their shops"
  ON shops
  USING (auth.uid() = owner_id);

-- Products Policies
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow shop owners to manage their products"
  ON products
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Product Compatibility Policies
CREATE POLICY "Allow public read access to product compatibility"
  ON product_compatibility
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow shop owners to manage product compatibility"
  ON product_compatibility
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN shops ON shops.id = products.shop_id
      WHERE products.id = product_compatibility.product_id
      AND shops.owner_id = auth.uid()
    )
  );