-- 1. Rezerve stoğu artıran fonksiyon
CREATE OR REPLACE FUNCTION increment_reserved_stock(variant_id UUID, qty INT)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET reserved_stock = reserved_stock + qty
  WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Ödeme başarılı olunca stoğu kalıcı düşen fonksiyon
CREATE OR REPLACE FUNCTION confirm_stock_deduction(variant_id UUID, qty INT)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET 
    stock = stock - qty,
    reserved_stock = reserved_stock - qty
  WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql;
