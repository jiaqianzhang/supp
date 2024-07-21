-- drop table account;
-- drop table post;
create table account(
    account_email varchar(200) primary key,
    account_password varchar(100) not null
);

create table post(
    post_id serial primary key,
    post_title varchar(50),
    post_description varchar(200),
    post_file varchar(200),
    -- constraint foreign key account_email
);