/*
  # Enhance database schema with shop categories and car models

  1. New Tables
    - `car_models`: Store car makes and models
    - `shop_categories`: Junction table for shop-category relationships
    - `product_car_models`: Junction table for product-car model compatibility

  2. Changes
    - Add brand and model fields to car compatibility
    - Add direct category relationships to shops
    - Add status field to products
    - Add rating and review count to shops
    - Add price history tracking

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create car_models table
CREATE TABLE IF NOT EXISTS car_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year_start integer NOT NULL,
  year_end integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(make, model, year_start)
);

-- Create shop_categories junction table
CREATE TABLE IF NOT EXISTS shop_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, category_id)
);

-- Create product_car_models junction table
CREATE TABLE IF NOT EXISTS product_car_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products ON DELETE CASCADE NOT NULL,
  car_model_id uuid REFERENCES car_models ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, car_model_id)
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products ON DELETE CASCADE NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  changed_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
DO $$ 
BEGIN
  -- Add status to products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'out_of_stock', 'discontinued'));
  END IF;

  -- Add rating and review_count to shops
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shops' AND column_name = 'rating'
  ) THEN
    ALTER TABLE shops ADD COLUMN rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shops' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE shops ADD COLUMN review_count integer DEFAULT 0 CHECK (review_count >= 0);
  END IF;
END $$;

-- Drop old product_compatibility table
DROP TABLE IF EXISTS product_compatibility;

-- Enable RLS on new tables
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Policies for car_models
CREATE POLICY "Allow public read access to car models"
  ON car_models
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage car models"
  ON car_models
  USING (auth.role() = 'authenticated');

-- Policies for shop_categories
CREATE POLICY "Allow public read access to shop categories"
  ON shop_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow shop owners to manage their shop categories"
  ON shop_categories
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_categories.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policies for product_car_models
CREATE POLICY "Allow public read access to product car models"
  ON product_car_models
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow shop owners to manage their product car models"
  ON product_car_models
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN shops ON shops.id = products.shop_id
      WHERE products.id = product_car_models.product_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policies for price_history
CREATE POLICY "Allow public read access to price history"
  ON price_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow shop owners to manage their product price history"
  ON price_history
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN shops ON shops.id = products.shop_id
      WHERE products.id = price_history.product_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Create trigger to track price history
CREATE OR REPLACE FUNCTION track_price_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS DISTINCT FROM OLD.price THEN
    INSERT INTO price_history (product_id, price)
    VALUES (NEW.id, NEW.price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_product_price_changes
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION track_price_history();