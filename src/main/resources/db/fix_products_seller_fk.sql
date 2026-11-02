
ALTER TABLE products DROP FOREIGN KEY FKbgw3lyxhsml3kfqnfr45o0vbj;


ALTER TABLE products
  ADD CONSTRAINT fk_products_seller
  FOREIGN KEY (seller_id) REFERENCES seller (id);
