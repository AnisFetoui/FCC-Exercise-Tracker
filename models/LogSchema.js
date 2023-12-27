const Mongoose = require("mongoose");

const log_schema = new Mongoose.Schema(
  {
    _id: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    log: [
      {
        description: {
          type: String,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    collection: "logs",
  },
);

module.exports = Mongoose.model("LogModel", log_schema);
