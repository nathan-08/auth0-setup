insert into users (auth_id, first_name, last_name, img_url)
values($1, $2,$3, $4)
returning * 