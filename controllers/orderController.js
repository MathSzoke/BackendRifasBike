const fs = require('fs');
const credentialGN = require("../gerenciaNet.json");
const https = require("https");
const axios = require("axios");
const randexp = require("randexp");

const oAuthGerencianet = async (req, res, next) =>
{
    try
    {
        const cert = fs.readFileSync("producao-558434-RifasJoyFox.p12"); // certified api

        const credentials = credentialGN.CLIENT_ID + ":" + credentialGN.CLIENT_SECRET;

        const auth = Buffer.from(credentials).toString('base64');

        const agent = https.Agent({
            pfx: cert,
            passphrase: '',
        });

        const data = JSON.stringify({
            "grant_type": "client_credentials"
        })

        res.locals.agent = agent;

        const config = {
            method: 'POST',
            url: 'https://api-pix.gerencianet.com.br/oauth/token',
            headers:{
                'authorization': 'Basic ' + auth,
                'Content-type': 'application/json'
            },
            httpsAgent: agent,
            data: data
        }

        axios(config)
            .then(response => {
                res.locals.accessToken = response.data.access_token;
                next();
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({error: error})
            })
    }
    catch(err)
    {
        res.status(500).send({error: err})
    }
}

const createPixBilling = async (req, res, next) =>
{
    try
    {
        const data = JSON.stringify({
            "calendario": {
              "expiracao": 3600
            },
            "devedor": {
              "cpf": req.body.payee.cpf,
              "nome": req.body.payee.name
            },
            "valor": {
              "original": req.body.value
            },
            "chave": credentialGN.PIX_KEY,
            "solicitacaoPagador": req.body.description
        });

        const txId = new randexp(/^[a-zA-Z0-9]{35}$/).gen();

        res.locals.txId = txId;

        const config = {
            method: 'PUT',
            url: `https://api-pix.gerencianet.com.br/v2/cob/${res.locals.txId}`,
            headers:{
                'authorization': 'Bearer ' + res.locals.accessToken,
                'Content-type': 'application/json'
            },
            httpsAgent: res.locals.agent,
            data: data
        }

        axios(config)
            .then(response => {
                res.locals.billing = response.data;
                next();
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({error: error})
            })
    }
    catch(err)
    {
        res.status(500).send({error: err})
    }
}

const getQrCode = async (req, res, next) =>
{
    try
    {
        const locId = res.locals.billing.loc.id;

        const config = {
            method: 'GET',
            url: `https://api-pix.gerencianet.com.br/v2/loc/${locId}/qrcode`,
            headers:{
                'authorization': 'Bearer ' + res.locals.accessToken,
                'Content-type': 'application/json'
            },
            httpsAgent: res.locals.agent
        }
        
        axios(config)
            .then(response => {
                const data = response.data;
                data.txId = res.locals.txId;
                res.status(200).send(data)
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({error: error})
            })
    }
    catch(err)
    {
        res.status(500).send({error: err})
    }
}

const checkPaymentStatus = async (req, res) =>
{
    const txId = req.body.txId;
    
    const config =
    {
        method: 'GET',
        url: `https://api-pix.gerencianet.com.br/v2/cob/${txId}`,
        headers:{
            'authorization': 'Bearer ' + res.locals.accessToken,
            'Content-type': 'application/json'
        },
        httpsAgent: res.locals.agent
    }

    try
    {
        axios(config)
            .then(response => {
                res.status(200).send(response.data)
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({error: error})
            })
    }
    catch (error)
    {
        console.error('Erro ao verificar status do pagamento:', error);
    }
};

module.exports = { oAuthGerencianet, createPixBilling, getQrCode, checkPaymentStatus }