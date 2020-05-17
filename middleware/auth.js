var connection = require('../koneksi');
var mysql = require('mysql');
var md5 = require('md5');
var response = require('../res');
var jwt = require('jsonwebtoken');
var config = require('../config/secret');
var ip = require('ip');

//controller untuk register
exports.registrasi = function(req,res){
    var post = {
        username: req.body.username,
        email: req.body.email,
        password: md5(req.body.password),
        role: req.body.role,
        tanggal_daftar: new Date()
    }

    var query = "SELECT email FROM ?? WHERE ??=?";
    var table = ["t_user","email", post.email];

    query = mysql.format(query,table);

    connection.query(query, function(error, rows) {
        if(error){
            console.log(error);

        }else {
            if(rows.length == 0){
                var query = "INSERT INTO ?? SET ?";
                var table = ["t_user"];
                query = mysql.format(query,table);
                connection.query(query, post, function(error, rows){
                    if(error){
                        console.log(error);
                        
                    }else {
                        response.ok("Berhasil Menambahkan data user baru",res);

                    }
                });
            }else {
                response.ok("Email sudah tedaftar!",res);
            }
        }
    })
}
//controller untuk login
exports.login = function (req, res) {
    var post = {
        password: req.body.password,
        email: req.body.email
    }

    var query = "SELECT * FROM ?? WHERE ??=? AND ??=?";
    var table = ["t_user", "password", md5(post.password), "email", post.email];

    query = mysql.format(query, table);
    connection.query(query, function (error, rows) {
        if (error) {
            console.log(error);
        } else {
            if (rows.length == 1) {
                var token = jwt.sign({ rows }, config.secret, {
                    expiresIn: 1440
                });
                id_user = rows[0].id_user;

                var data = {
                    id_user: id_user,
                    access_token: token,
                    ip_address: ip.address()
                }

                var query = "INSERT INTO ?? SET ?";
                var table = ["access_token"];

                query = mysql.format(query, table);
                connection.query(query, data, function (error, rows) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.json({
                            success: true,
                            message: "Token JWT Tergenerate!",
                            token: token,
                            currUser: data.id_user
                        });
                    }
                });
            } else {
                res.json({ "Error": true, "Message": "Email atau password salah!" });
            }
        }
    });
}


exports.halamanrahasia = function(req,res){
    response.ok("Access Denied! Halaman ini hanya untuk user  dengan role 2",res);
}
exports.halamanrahasia1 = function(req,res){
    response.ok("Maaf,Halaman ini hanya untuk user  dengan role 1 ",res);
}

//menambahkan data service
exports.tambahdataservice = function (req, res) {
    var post = {
     tgl_service: new Date(),
     id_user: req.body.id_user,
     id_montir: req.body.id_montir,
     jumlah_sparepart: req.body.jumlah_sparepart,	
     id_sparepart: req.body.id_sparepart,
     jam_service: req.body.jam_service
     
    }
    var query = "INSERT INTO ?? SET ?";
    var table = ["t_service"];
 
    query = mysql.format(query, table);
     connection.query(query, post, function (error, rows) {
             if (error) {
                 console.log(error);
             } else {
                 response.ok("Berhasil Menambahkan Data", res)
             }
         });
 };

 //mengehitung harga total service
exports.totalservice = function (req, res) {
    connection.query('SELECT t_user.nama_user, t_service.tgl_service, t_montir.nama_montir, t_sparepart.nama_sparepart, t_sparepart.harga_sparepart, t_service.jumlah_sparepart, (harga_perjam + jumlah_sparepart * harga_sparepart) AS total_service FROM t_service JOIN t_user JOIN t_montir JOIN t_sparepart WHERE t_service.id_user = t_user.id_user AND t_service.id_montir = t_montir.id_montir AND t_service.id_sparepart = t_sparepart.id_sparepart ORDER BY t_user.id_user ',
        function (error, rows, fields) {
            if (error) {
                console.log(error);
            } else {
                response.oknested(rows, res);
            }
        }
    )

}