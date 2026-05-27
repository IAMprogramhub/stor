-- Ошибка 1452: seller_id ссылался на users вместо seller.
-- Выполните в MySQL (база shop), имя ограничения у вас может отличаться — проверьте SHOW CREATE TABLE products;

-- 1) Удалить неверное внешнее ключевое ограничение
ALTER TABLE products DROP FOREIGN KEY FKbgw3lyxhsml3kfqnfr45o0vbj;

-- 2) Привязать seller_id к таблице seller
ALTER TABLE products
  ADD CONSTRAINT fk_products_seller
  FOREIGN KEY (seller_id) REFERENCES seller (id);
