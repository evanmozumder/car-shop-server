const { MongoClient } = require("mongodb");
const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ej9vy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("car_shop");
    const carCollection = database.collection("carCollection");
    const usersCollection = database.collection("users");
    const purchaseCollection = database.collection("purchaseCollection");
    const reviewCollection = database.collection("reviews");

    // getting all products
    app.get("/products", async (req, res) => {
      const cursor = await carCollection.find({});
      const cars = await cursor.toArray();
      //   console.log(cars);
      res.json(cars);
    });

    // save user to the database
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("user", user);
      const result = await usersCollection.insertOne(user);
      // console.log(result);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // logged in user's roll
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.roll === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // get specific car details
    app.get("/purchase/:productId", async (req, res) => {
      const id = req.params.productId;
      const query = { _id: ObjectId(id) };
      const car = await carCollection.findOne(query);
      //   console.log("car", car);
      res.json(car);
    });

    // save purchase info to the db
    app.post("/purchase", async (req, res) => {
      const purchaseInfo = req.body;
      const result = await purchaseCollection.insertOne(purchaseInfo);
      res.json(result);
    });

    // get my all orders
    app.get("/myOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = purchaseCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    // removing order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = { productId: id };
      const result = await purchaseCollection.deleteOne(query);
      res.json(result);
    });

    // removing product
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      // const query = { productId: id };
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      // console.log(result);
      res.json(result);
    });

    // send review to the db
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // getting all reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    // find a user to check admin or not
    /* app.get("/user", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.json(user);
    }); */

    // get all orders
    app.get("/allOrders", async (req, res) => {
      const cursor = purchaseCollection.find({});
      const allOrders = await cursor.toArray();
      res.json(allOrders);
    });

    // add new product
    app.post("/product", async (req, res) => {
      const productInfo = req.body;
      const result = await carCollection.insertOne(productInfo);
      res.json(result);
    });

    // making an user admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { roll: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
