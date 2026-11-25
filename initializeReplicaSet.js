
const mongoose = require("./server/node_modules/mongoose");
const dotenv = require("./server/node_modules/dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const initializeReplicaSet = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
  directConnection: true,
});

    const result = await mongoose.connection.db.admin().command({
      replSetInitiate: {
        _id: "rs0",
        members: [
          {
            _id: 0,
            host: "127.0.0.1:27017",
          },
        ],
      },
    });

    console.log("Replica set initialized successfully!");
    console.log(result);
  } catch (error) {
    console.error("Replica set initialization failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

initializeReplicaSet();
