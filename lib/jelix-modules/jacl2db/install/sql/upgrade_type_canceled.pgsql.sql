ALTER table %%PREFIX%%jacl2_rights add column canceled2 smallint not null default '0';
update %%PREFIX%%jacl2_rights set canceled2=0 where canceled= 'f';
ALTER TABLE %%PREFIX%%jacl2_rights drop canceled;
ALTER TABLE %%PREFIX%%jacl2_rights RENAME canceled2  TO canceled;