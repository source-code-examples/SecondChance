// secondChance-backend/routes/secondChanceItemsRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 
        const db = await connectToDatabase();
        //Step 2: task 2 
        const collection = db.collection("secondChanceItems");
        //Step 2: task 3 
        const secondChanceItems = await collection.find({}).toArray();
        //Step 2: task 4 
        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// or this alternative:
// router.get('/secondChanceItems', async (req, res) => {
//     try {
//         const db = await connectToDatabase();
//         const collection = db.collection("secondChanceItems");
//         const secondChanceItems = await collection.find({}).toArray();
//         res.json(secondChanceItems);
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while fetching items.' });
//     }
// });

// Add a new item
router.post('/', upload.single('file'), async(req, res,next) => {
    try {

        //Step 3: task 1
        const db = await connectToDatabase();
        //Step 3: task 2 
        const collection = db.collection("secondChanceItems");
        //Step 3: task 3 
        let secondChanceItem = req.body;
        //Step 3: task 4 
        const lastItemQuery = await collection.find().sort({'id': -1}).limit(1);
        await lastItemQuery.forEach(item => {
            secondChanceItem.id = (parseInt(item.id) + 1).toString();
        });
        //Step 3: task 5 
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added
         //Step 3: task 6
        secondChanceItem = await collection.insertOne(secondChanceItem);

        res.status(201).json(secondChanceItem.ops[0]);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        //Step 4: task 1
        const db = await connectToDatabase();
        //Step 4: task 2 
        const collection = db.collection("secondChanceItems");
        //Step 4: task 3 
        const secondChanceItem = await collection.findOne({ id: id });
        //Step 4: task 4 
        if (!secondChanceItem) {
            return res.status(404).send("secondChanceItem not found");
          }
          
        res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        //Step 5: task 1 
        const db = await connectToDatabase();
        //Step 5: task 2 
        const collection = db.collection("secondChanceItems");
        //Step 5: task 3 
        const secondChanceItem = await collection.findOne({ id });

        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }
        //Step 5: task 4 
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days/365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );
        //Step 5: task 5 
        if(updatepreloveItem) {
            res.json({"uploaded":"success"});
        } else {
            res.json({"uploaded":"failed"});
        }
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        //Step 6: task 1 - 
        const db = await connectToDatabase();
        //Step 6: task 2 
        const collection = db.collection("secondChanceItems");
        //Step 6: task 3 
        const secondChanceItem = await collection.findOne({ id });

        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
    }
        //Step 6: task 4 
        await collection.deleteOne({ id });
        res.json({"deleted":"success"});
    } catch (e) {
        next(e);
    }
});

module.exports = router;
