-- drop table account;
-- drop table post;

create table account(
    account_id serial primary key,
    account_email varchar(200) not null,
    account_password varchar(100) not null
);

create table post(
    post_id serial primary key,
    post_title varchar(50),
    post_description varchar(200),
    post_file varchar(200),
    account_id varchar(200) references account(account_email)
);