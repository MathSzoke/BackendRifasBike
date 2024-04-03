const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

// Configurar para fazer parsing do corpo das requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = require('./router.js');

app.use(router);

module.exports = {app};