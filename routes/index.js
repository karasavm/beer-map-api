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

//checked
router.post('/generate', function(req, res, next) {

    fs.readFile('./db/beers.json', 'utf8', function (err, data) {
        if (err) throw err;
        const beers = JSON.parse(data);

        let existedTokens = fs.readdirSync('./db/tokens/');
        let results = [];
        for (let i=0; i < beers.length; i++) {
            let fname = beers[i].id.toString()+ ".json";


            // if exists continue
            if (existedTokens.indexOf(fname) !== -1) {
                continue;
            }
            console.log(fname);

            let tokens = [];

            try {
                for (let j=0; j < 2000; j++) {
                    tokens.push(
                        {
                            // token: 'beer'+i.toString()+'id'+j.toString(),
                            token: uuidv1(),
                            used: false
                        });
                }
                beers[i]['tokens'] = tokens;
                results.push(beers[i]);
                let path = "./db/tokens/" + fname;
                console.log("write file with tokens", path);

                fs.writeFile(path, JSON.stringify(tokens), function(err) {
                    if(err) {
                        return console.log(err);
                    }

                    console.log("The file was saved!");
                });

                // fs.writeFileSync(path, JSON.stringify(tokens), 'utf-8');
            } catch (e) {
                console.log("unable to write fiel", e);
            }
        }
        res.json(results);
    });

});

// checked
router.get('/tokens/:beerId', function (req, res, next) {
    fs.readFile('./db/tokens/'+req.params.beerId + '.json', 'utf8', function (err, data) {
        if (err) {res.status(404).json({error: "there is no such beer: " + req.params.beerId}); return;}
        let tokens = JSON.parse(data);
        res.json({tokens: tokens})
    });
});

// checked
router.get('/checkToken/:beerId/:token', function(req, res, next) {


    fs.readFile('./db/tokens/'+req.params.beerId + '.json', 'utf8', function (err, data) {

        // wrong beer id
        if (err) {
            res.status(404).json({error: "there is no such beer: " + req.params.beerId});
            return;
        }

        let tokens = JSON.parse(data);

        let foundToken = false;
        for (let i=0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.token === req.params.token) {
                foundToken = true;
                console.log(token.token);
                if (token.used) {
                    res.status(404).json({error: `token '${req.params.token}' already used`});
                    return;
                } else {
                    let data = fs.readFileSync('./db/beers.json', 'utf8');
                    const beers = JSON.parse(data);
                    for (let j=0; j < beers.length; j++) {
                        if (beers[j].id === req.params.beerId) {
                            res.json(beers[j]);
                            return;
                        }
                    }
                }
            }
        }

        if (!foundToken) {
            res.status(404).json({error: `token '${req.params.token}' does not exist`});
        }

    });

});

// checked
router.post('/vote/:beerId/:token', function(req, res, next) {
    fs.readFile('./db/tokens/'+req.params.beerId + '.json', 'utf8', function (err, data) {

        // wrong beer id
        if (err) {
            res.status(404).json({error: "there is no such beer: " + req.params.beerId});
            return;
        }
        let tokens = JSON.parse(data);
        let foundToken = false;
        for (let i=0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.token === req.params.token) {
                foundToken = true;
                if (token.used) {
                    res.status(404).json({error: `token '${req.params.token}' already used`});
                    return;
                } else {
                    tokens[i].used = true;
                    // todo write file again
                    const path = './db/results/' + req.params.token + '.json';
                    try{
                        fs.writeFileSync(path, JSON.stringify(req.body), 'utf-8');
                        fs.writeFileSync('./db/tokens/'+req.params.beerId + '.json', JSON.stringify(tokens), 'utf-8');
                    } catch (e) {
                        return res.status(404).json({error: e})
                    }
                }   return res.json({message: 'ok'});
            }
        }
        if (!foundToken) {
            res.status(404).json({error: `token '${req.params.token}' does not exist`});
        }
    });
});

router.post('/resetTheTokens', function(req, res, next) {
    const fsex = require('fs-extra');
    try
    {

        let name = './db/resetTheTokens/' + Date.now();

        fsex.copySync('./db/tokens', name + '/tokens');

        fsex.copySync('./db/results', name + '/results');


        // remove tokens from results
        const results = fs.readdirSync('./db/results');
        for (let i=0 ; i < results.length; i++) {
            fs.unlinkSync('./db/results/'+results[i]);
        }

        // update tokens used=false
        const tokens = fs.readdirSync('./db/tokens');
        for (let i=0 ; i < tokens.length; i++) {
            console.log(tokens[i])
            let data = fs.readFileSync('./db/tokens/' + tokens[i], 'utf-8');
            let all = JSON.parse(data);
            for (let j=0; j < all.length; j++) {
                all[j].used = false;
            }
            // write the updated file
            fs.writeFileSync('./db/tokens/' + tokens[i], JSON.stringify(all),'utf-8');
        }

    } catch (err) {
        console.error(err)
    }

    res.send('ok')
});

module.exports = router;
