/* Replace with your SQL commands */


alter table PRODUCTO add column cnt int;

CREATE PROCEDURE `update_producto_cnt` ()
BEGIN
    update PRODUCTO P inner join (select P.id, count(PF.idF) cnt from PRODUCTO P left join PROD_FARM PF on P.id = PF.idP
	group by P.id) PC on P.id = PC.id
    set P.cnt = PC.cnt;
END;

CREATE TRIGGER after_prod_farm_insert 
    AFTER INSERT ON PROD_FARM
    FOR EACH ROW 
BEGIN
    update PRODUCTO set cnt = cnt + 1 where id = NEW.idP;
END;

CREATE TRIGGER after_prod_farm_delete
    AFTER DELETE ON PROD_FARM
    FOR EACH ROW 
BEGIN
    update PRODUCTO set cnt = cnt - 1 where id = OLD.idP;
END;

call update_producto_cnt();