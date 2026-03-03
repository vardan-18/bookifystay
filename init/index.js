const mongoose= require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/bookifystay";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
};
const initDB = async () => {
  await Listing.deleteMany({});
  const dataWithOwner=initData.data.map((obj)=>({...obj ,owner:'69a53da098fac5d0f091f325'}))
  await Listing.insertMany(dataWithOwner);
  console.log("data was initialized");

};

initDB();