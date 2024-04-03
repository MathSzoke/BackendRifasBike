const express = require('express');
const router = express.Router();
const rifasController = require("../controllers/rifasController");
const orderController = require("../controllers/orderController");

// Rifa controller api area
router.post('/postInfos',  rifasController.postInfos);

router.post('/postConfirmPaid',  rifasController.postConfirmPaid);

router.get('/randomNumber', rifasController.randomNumber);

router.get('/getNumbersSelected', rifasController.getNumbersSelected);

router.get('/getNumbersSelectedPaid', rifasController.getNumbersSelectedPaid);

router.delete('/deleteInfos', rifasController.deleteInfos);

// Gerencia net API controller area
router.post('/order/pix/billing',    
    orderController.oAuthGerencianet,
    orderController.createPixBilling,
    orderController.getQrCode
)

router.post('/checkPaymentStatus',    
    orderController.oAuthGerencianet,
    orderController.checkPaymentStatus
)

module.exports = router;