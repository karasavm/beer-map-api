const express = require('express');
const router = express.Router();

const data = require('../db/data.js');

const path = require('path');
const uuidv1 = require('uuid/v1');

const fs = require('fs');

const TokenGenerator = require('uuid-token-generator');

const tokgen2 = new TokenGenerator(256, TokenGenerator.BASE62);

// -> 'x6GCX3aq9hIT8gjhvO96ObYj0W5HBVTsj64eqCuVc5X'



/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ title: 'Express' });
});

router.get('/brews', function(req, res, next) {
  res.json(data.rawData);
});

router.get('/areas', function(req, res, next) {
  res.json(data.areasData);
});

router.get('/spots', function(req, res, next) {
  res.json(data.spotsData);
});

router.get('/images/:img', function(req, res, next) {
  res.sendFile(path.resolve('db/images/'+req.params.img));
});

router.get('/images/pins/150x150cp/:img', function(req, res, next) {
  res.sendFile(path.resolve('db/images/pins/150x150cp/'+req.params.img));
});

router.get('/images/pins/compressed/:img', function(req, res, next) {
  res.sendFile(path.resolve('db/images/pins/compressed/'+req.params.img));
});


router.get('/beers', function(req, res, next) {

    let obj;
    fs.readFile('./db/beers.json', 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        res.json(obj)
    });
});

router.get('/tokens/:beerId', function (req, res, next) {

    fs.readFile('./db/tokens/'+req.params.beerId + '.json', 'utf8', function (err, data) {
        if (err) {res.status(404).json({error: "there is no such beer: " + req.params.beerId}); return;}
        let tokens = JSON.parse(data);

        res.json({tokens: tokens})

    });
})

router.get('/generate', function(req, res, next) {

    fs.readFile('./db/beers.json', 'utf8', function (err, data) {
        if (err) throw err;
        beers = JSON.parse(data);

        let results = {};

        for (let i=0; i < beers.length; i++) {
            let tokens = [];
            console.log(i);
            try {
                for (let j=0; j < 50; j++) {
                    tokens.push(
                        {
                            token: 'beer'+i.toString()+'id'+j.toString(),
                            used: false
                        });
                }
                let fname = "./db/tokens/" + beers[i].id.toString()+ ".json";

                fs.writeFileSync(fname, JSON.stringify(tokens), 'utf-8');
            } catch (e) {
                console.log(e)
            }
        }
        res.send('ok')
    });

});


router.get('/checkToken/:beerId/:token', function(req, res, next) {


    const path = './db/results/' + req.params.token + '.json';

    if (fs.existsSync(path)) {
        // Do something
        // already voted
        res.status(404).send({error: "already used token: " + req.params.token});
        return;
    }

    let data = fs.readFileSync('./db/beers.json', 'utf8');


    const beers = JSON.parse(data);
    for (let j=0; j < beers.length; j++) {
        if (beers[j].id === req.params.beerId) {
            res.json(beers[j]);
            return;
        }
    }

});

router.post('/vote/:token', function(req, res, next) {
    let data = {data: 'daaata'};

    const path = './db/results/' + req.params.token + '.json';

    if (fs.existsSync(path)) {
        // Do something
        // already voted
        res.status(404).send({error: "vote exists with token: " + req.params.token});
        return;
    }


    try {
        fs.writeFileSync(path, JSON.stringify(req.body), 'utf-8');
    } catch (e) {
        console.log(e)
        res.status(500).json({"error": e});
    }

    res.json({message: 'ok'});


});


module.exports = router;
