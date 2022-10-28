const express = require('express')
const sequelize = require('sequelize')

const { setTokenCookie, requireAuth, authenticateUser } = require('../../utils/auth');
const { User, Spot, Review, SpotImage, Booking } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Op } = require('sequelize')
const router = express.Router();

const validateSpotSignup =[
    check('address')
        .exists({checkFalsy: true})
        .withMessage('Street address is required'),
    check('city')
        .exists({checkFalsy: true})
        .withMessage('City is required'),
    check('state')
        .exists({checkFalsy: true})
        .withMessage('State is required'),
    check('country')
        .exists({checkFalsy: true})
        .withMessage('Country is required'),
    check('lat')
        .exists({checkFalsy: true})
        .isFloat({min: -90, max: 90})
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({checkFalsy: true})
        .isFloat({min: -180, max: 180})
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({checkFalsy: true})
        .withMessage('Name is rquired'),
    check('name')
        .isLength({ max: 49})
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({checkFalsy: true})
        .withMessage('Description is required'),
    check('price')
        .exists({checkFalsy: true})
        .withMessage('Price per day is required'),
    handleValidationErrors
]

router.get('/', async (req, res, next) => {
    const responseBody = [];
    const spots = await Spot.findAll({
        // include:[
        //     {
        //         model: SpotImage,
        //         attributes: ['url'],
        //         where: {
        //             preview: true
        //         }
        //     },
        //     {
        //         model: Review,
        //         attributes:['stars'] //collect for the avg
        //     }
        // ]
        // })

        // spots.forEach(obj => {
        //     let sum = 0; //get the avg review
        //     obj.Reviews.forEach(review => {
        //         sum += review.stars
        //     })
        //     const avgRating = sum / obj.Reviews.length

        //     responseBody.push({
        //         id: obj.id,
        //         ownerId: obj.ownerId,
        //         address: obj.address,
        //         city: obj.city,
        //         state: obj.state,
        //         country: obj.country,
        //         lat: obj.lat,
        //         lng: obj.lng,
        //         name: obj.name,
        //         description: obj.description,
        //         price: obj.price,
        //         createdAt: obj.createdAt,
        //         updatedAt: obj.updatedAt,
        //         avgRating: avgRating,
        //         previewImage: obj.SpotImages[0].url
        //     })
        })
    res.json({
        Spots: spots
    })
});

router.post('/', authenticateUser, validateSpotSignup, async (req, res, next) => {
    const {address, city, state, country, lat, lng, name, description, price} = req.body;
    const ownerId = req.user.id;
    const spot = Spot.build({
        ownerId: ownerId,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
    })
    await spot.save()
    res.json(spot)
})

router.post('/:spotId/images', authenticateUser, async (req, res, next) => {
    const { spotId } = req.params;
    const currentSpot = await Spot.findByPk(spotId);
    if(!currentSpot) {
        const err = new Error("Spot couldn't be found");
        err.title = "Spot couldn't be found";
        err.errors = ["Spot couldn't be found"];
        err.status = 404;
        return next(err);
    }

    const { url, preview } = req.body;
    const currentUser = req.user.id;
    const spotOwner = currentSpot.ownerId

    if(currentUser !== spotOwner) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
        err.errors = ['Forbidden'];
        err.status = 403;
        return next(err);
    }

    const newImage = await SpotImage.create({
        url,
        preview,
        spotId: spotOwner
    })
    res.json({
        id: newImage.id,
        url,
        preview
    })
})

router.post('/:spotId/reviews', authenticateUser, async (req, res, next) => {
    const { spotId } = req.params;
    const { review, stars } = req.body;
    const userId = req.user.id;

    const newReview = await Review.create({
        userId: userId,
        spotId: spotId,
        review,
        stars
    });

    res.json(newReview)
})

router.get('/:spotId/reviews', async (req, res, next) => {
    const { spotId } = req.params;
    const spotReviews = await Review.findAll({
        where: {
            id: spotId
        },
        include: ['User', 'ReviewImages']
    })

    res.json(spotReviews)
})


router.get('/current', authenticateUser, async (req, res) => {
    const userSpots = await Spot.findAll({
        where: {
            ownerId: req.user.id
        }
    })

    res.json(userSpots)
})

router.get('/:spotId', async (req, res, next) => {
    const { spotId } = req.params;
    const spot = await Spot.findOne({
        where: {
            id: spotId
        },
    });
    if(!spot) {
        const err = new Error("Spot couldn't be found");
        err.title = "Spot couldn't be found";
        err.errors = ["Spot couldn't be found"];
        err.status = 404;
        return next(err);
    }

    res.json(spot)
})

router.put('/:spotId', authenticateUser, async (req, res, next) => {
    const { spotId } = req.params;
    const currentSpot = await Spot.findByPk(spotId);
    if(!currentSpot) {
        const err = new Error("Spot couldn't be found");
        err.title = "Spot couldn't be found";
        err.errors = ["Spot couldn't be found"];
        err.status = 404;
        return next(err);
    }

    const currentUser = req.user.id;
    const spotOwner = currentSpot.ownerId

    if(currentUser !== spotOwner) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
        err.errors = ['Forbidden'];
        err.status = 403;
        return next(err);
    }
    const { address, city, state, country, lat, lng, name, description, price } = req.body
    ;
    await Spot.update(
         { address, city, state, country, lat, lng, name, description, price },
         {
            where: {id: spotId}
         }
    )
    const updatedSpot = await Spot.findByPk(spotId)
    res.json({updatedSpot})

})

router.post('/:spotId/bookings', authenticateUser, async (req, res, err) => {
    const { spotId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    const newBooking = await Booking.create({
        spotId,
        userId: userId,
        startDate,
        endDate
    })

    res.json(newBooking)
})




router.get('/:spotId/bookings', authenticateUser, async (req, res, err) => {
    const userId = req.user.id;
    const { spotId } = req.params;
    const ownerCheck = await Spot.findOne({ //ownerCheck should be an empty object if the current spot does not belong to the current user
        where: {
            id:spotId,
            ownerId: userId
        }
    })

    let bookings;

    if (!ownerCheck) {
        bookings = await Booking.findAll({
            where: {
                spotId: spotId
            },
            attributes: ['spotId', 'startDate', 'endDate']
        })
    } else {
        bookings = await Booking.findAll({
            where: {
                spotId: spotId
            },
            include: ['User']
        })
    }

    res.json(bookings)
})


router.delete('/:spotId', authenticateUser, async (req, res, next) => {
 const { spotId } = req.params;
 await Spot.destroy({where: {id: spotId}});

 res.json ({
    message: "Successfully deleted",
    statusCode: 200
});
})


module.exports = router;
