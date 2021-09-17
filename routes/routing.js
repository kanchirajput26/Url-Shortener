const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const salt = 10;
const ShortUrlAccessRecord = require('../models/shortUrlAccessRecord');
const ShortUrl = require('../models/url');
const User = require('../models/user');
const clickLimit = 5;
const timeLimit = 2;



router.get('/', async (req,res) => {
    
    User.findOne({ unique_id: req.session.userId }, async (err, data) => {
		if (!data) {
			res.redirect('/login');
		} else {
            const AllData = await ShortUrl.find({}, {_id:0})
            res.render('index', {ShortUrls: AllData})
        }
    })
}) 

router.get('/register', (req,res) =>{
    if (req.session.userId){
		res.redirect('/');
	}
    return res.render('register')
})

router.post('/register', (req,res) =>{
    const userDetails = req.body
    if (!userDetails.email || !userDetails.name || !userDetails.password || !userDetails.confirmPassword) {
		res.send({'message':'Invalid Data!'});
	} else {
		if (userDetails.password == userDetails.confirmPassword) {

			User.findOne({ email: userDetails.email }, (err, data) => {
				if (!data) {
					let unique_id;
					User.findOne({}, (err, data) => {

						if (data) {
							unique_id = data.unique_id + 1;
						} else {
							unique_id = 1;
						}
                        bcrypt.hash(userDetails.password, salt, (err, encrypted) => {
                            const newUser = new User({
                                unique_id: unique_id,
                                email: userDetails.email,
                                name: userDetails.name,
                                password: encrypted
                            });
    
                            newUser.save((err, User) => {
                                if (err)
                                    console.log(err);
                                else
                                    console.log('Success');
                            });
                            req.session.userId = newUser.unique_id
                        })

					}).sort({ _id: -1 });
					res.redirect("/");
				} else {
					res.send({ "Message": "Email is already used." });
				}

			});
		} else {
			res.send({ "Message": "Password is not matched" });
		}
	}
})

router.get('/login', (req,res) =>{
    if (req.session.userId){
		res.redirect('/');
	}
    return res.render('login')
})

router.post('/login', (req,res) =>{
    User.findOne({ email: req.body.email }, (err, data) => {
		if (data) {
            bcrypt.compare(req.body.password, data.password, function (err, result) {
                if (result == true) {
                    req.session.userId = data.unique_id;
                    res.redirect("/");
                } else {
                    res.send({ "Message": "Wrong password!" });
                }
            });
		} else {
			res.send({ "Message": "This Email Is not registered!" });
		}
	});
})


router.get('/logout', (req, res, next) => {
    
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});



router.post('/short', async (req,res) =>{
    const url = req.body.fullUrl

    const record = new ShortUrl({
        full:url
    })

    await record.save()

    res.redirect('/')
})

router.get('/:ShortId', async (req,res) =>{
    const shortid = req.params.ShortId

    const data = await ShortUrl.findOne({short:shortid})
    if(!data){
        return res.sendStatus(404)
    }
    let urlCreatedAt = new Date(data.createdAt).getTime()
    let difference = Date.now() - urlCreatedAt;

    let minuteDifference = parseInt(difference/(1000*60))
    if(minuteDifference < timeLimit){
        if(data.clicks < clickLimit){
            const record = new ShortUrlAccessRecord({
                shortUrl: data._id
            })
        
            await record.save()
            
            data.clicks += 1
            await data.save()
            res.redirect(data.full)
        }else{
            res.send({'message':'You have reached the click limit!'})
        }
    }else{
        res.send({'message':'Shortened url has expired!'})
    
    }
})

module.exports = router;