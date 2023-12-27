const Mongoose = require('mongoose');

const exercise_schema = new Mongoose.Schema({
    user_id: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
},
    {
        collection: 'exercises'
    }
);

module.exports = Mongoose.model('ExerciseModel', exercise_schema);