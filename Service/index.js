import express from "express";
import cors from "cors";
import { korisnik } from './Models/userModel.js';
import { televisions } from './Models/televizijaModel.js';
import {microwaves} from './Models/mikrovalnaModel.js';
import {refrigerators} from './Models/hladnjakModel.js';
import {software} from './Models/softverModel.js';

const router = express.Router();
const app = express();
const port=3000;
const dataServiceBaseUrl = `http://127.0.0.1:${port}`;

app.use(cors())

app.get('/homepage', (req, res) => {
    res.sendFile(dataServiceBaseUrl);
    res.status(201).send()
});

app.get('/login', (req, res) => {
    res.sendFile(dataServiceBaseUrl + '/login/login.vue');
    res.status(201).send()
});

app.post('/register', (req, res) => {
    res.sendFile(dataServiceBaseUrl + '/register/register.vue');
    res.status(201).send()
});

app.get("/deals", (req, res)=>{
    let brand = req.query.brand
    let price = x.price
    if(brand){
     price = price.filter(e => {
        return e.brand.indexOf(brand) >= 0
     })
    }
    res.json(price)
});

app.get('/television', (req, res) => {

    let brand = req.query.brand
    let price = television.price
    if(brand){
     price = price.filter(e => {
        return e.brand.indexOf(brand) >= 0
     })
    }
    res.json(price)

    res.sendFile(dataServiceBaseUrl + '/televizija/televizije.vue');
    res.status(201).send()
});


app.get('/refrigerator', (req, res) => {

    let brand = req.query.brand
    let price = refrigerator.price
    if(brand){
     price = price.filter(e => {
        return e.brand.indexOf(brand) >= 0
     })
    }
    res.json(price)

    res.sendFile(dataServiceBaseUrl + '/hladnjak/hladnjaci.vue');
    res.status(201).send()

});

app.get('/mobile', (req, res) => {

    let brand = req.query.brand
    let price = mobile.price
    if(brand){
     price = price.filter(e => {
        return e.brand.indexOf(brand) >= 0
     })
    }
    res.json(price)

    res.sendFile(dataServiceBaseUrl + '/mobitel/mobiteli.vue');
    res.status(201).send()

});

app.get('/software', (req, res) => {

    let brand = req.query.brand
    let price = software.price
    if(brand){
     price = price.filter(e => {
        return e.brand.indexOf(brand) >= 0
     })
    }
    res.json(price)

    res.sendFile(dataServiceBaseUrl + '/softver/softveri.vue');
    res.status(201).send()

});

app.get('/microwave', (req, res) => {

    let brand = req.query.brand
    let price = microwave.price
    if(brand){
     price = price.filter(e => {
        return e.brand.indexOf(brand) >= 0
     })
    }
    res.json(price)

    res.sendFile(dataServiceBaseUrl + '/mikrovalna/mikrovalne.vue');
    res.status(201).send()

});

// ... Ostale rute (kategorije proizvoda)


app.listen(port, ()=> console.log('SluÅ¡am na portu: ${port}'));
console.log("Tip podatka storage:", typeof storage.posts);
