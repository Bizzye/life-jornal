-- Replace single photo_url with photo_urls array
alter table registros
  drop column if exists photo_url;

alter table registros
  add column photo_urls text[] not null default '{}';
