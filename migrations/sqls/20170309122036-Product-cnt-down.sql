/* Replace with your SQL commands */

alter table PRODUCTO drop column cnt;

drop procedure `update_producto_cnt`;

drop trigger after_prod_farm_insert;
drop trigger after_prod_farm_delete;