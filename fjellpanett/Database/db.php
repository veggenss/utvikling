<?php

use Dotenv\Dotenv;

require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

function dbConnection(){
    $mysql = mysqli_connect(
        $_ENV['DB_SERVER'],
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        $_ENV['DB_NAME'],
    );

    if(!$mysql){
        die("Connection failed " . mysqli_connect_error());
    }

    return $mysql;
}