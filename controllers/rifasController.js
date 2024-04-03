const admin = require("firebase-admin");
const credentials = require("../key.json");
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();

const postInfos = async (req, res) =>
{
    const id = req.body.email;
    
    try
    {
        await db.collection("rifasToBeConfirmed").doc(id).set({
            name: req.body.name,
            cpf: req.body.cpf,
            email: req.body.email,
            phone: req.body.phone,
            numbers: req.body.numbers
        });

        res.status(201).json({ message: 'Dados inseridos com sucesso!' });
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({ message: 'Erro ao inserir dados no Firestore' });
    }
}

const postConfirmPaid = async (req, res) =>
{
    const id = req.body.email;
    
    try
    {
        await db.collection("rifasConfirmed").doc(id).set({
            name: req.body.name,
            cpf: req.body.cpf,
            email: req.body.email,
            phone: req.body.phone,
            numbers: req.body.numbers,
            valuePaid: req.body.valuePaid,
        });

        res.status(201).json({ message: 'Dados inseridos com sucesso!' });
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({ message: 'Erro ao inserir dados no Firestore' });
    }
}

const getNumbersSelectedPaid = async (req, res) =>
{
    try
    {
        const snapshot = await db.collection("rifasConfirmed").get();

        if (snapshot.empty)
        {
            console.log('Coleção vazia.');
            return res.status(404).json({ message: 'Coleção vazia.' });
        }

        const data = [];
        snapshot.forEach((doc) => {
            data.push(doc.data());
        });

        return res.status(200).json(data);
    }
    catch (error)
    {
        console.error('Erro ao buscar documento:', error);
        return res.status(500).json({ message: 'Erro ao buscar documento.' });
    }
}

const getNumbersSelected = async (req, res) =>
{
    const email = req.query.email;

    try
    {
        const doc = await db.collection("rifasToBeConfirmed").doc(email).get();

        if (!doc.exists)
        {
            console.log('Documento não encontrado.');
            return res.status(404).json({ message: 'Documento não encontrado.' });
        }

        const data = doc.data();
        return res.status(200).json(data);
    }
    catch (error)
    {
        console.error('Erro ao buscar documento:', error);
        return res.status(500).json({ message: 'Erro ao buscar documento.' });
    }
}

const randomNumber = async (req, res) =>
{
    try
    {
        const numberSortedDoc = await db.collection("numbersSorted").doc("bikeRifa").get();
        if (numberSortedDoc.exists)
        {
            const numberDrawn = numberSortedDoc.data().numberDrawn;
            return res.status(200).json({ numberDrawn });
        }

        const numberDrawn = Math.floor(Math.random() * 501);

        await db.collection("numbersSorted").doc("bikeRifa").set({
            numberDrawn: numberDrawn
        });
        return res.status(200).json({ numberDrawn });
    }
    catch (error)
    {
        return res.status(500).json({ message: 'Erro ao gerar o número aleatório.' });
    }
}

const deleteInfos = async (req, res) =>
{
    const email = req.query.email;

    try
    {
        await db.collection("rifasToBeConfirmed").doc(email).delete();

        return res.status(200).json({ message: 'Documento deletado com sucesso.' });
    }
    catch (error)
    {
        console.error('Erro ao buscar documento:', error);
        return res.status(500).json({ message: 'Erro ao buscar documento.' });
    }
}

module.exports = { postInfos, postConfirmPaid, getNumbersSelected, getNumbersSelectedPaid, randomNumber, deleteInfos }