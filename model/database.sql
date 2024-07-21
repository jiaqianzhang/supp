-- drop table account;

create table account(
    account_email varchar(200) primary key,
    account_password varchar(100) not null
);

create table post(
    post_title varchar(50),
    post_description varchar(200),
    post_file varchar(200),
);