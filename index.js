const Express = require('express');
const CORS = require('cors');
const UserModel = require('./models/UserSchema');
const ExerciseModel = require('./models/ExerciseSchema');
const LogModel = require('./models/LogSchema');
require('dotenv').config()
require('./config/db.config').connectDB();

const App = Express();

App.use(CORS());
App.use(Express.urlencoded(
    {
        extended: false
    }
));
App.use(Express.json());
App.use(Express.static('public'));

App.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

// saving a user in the database
App.post('/api/users', (req, res) => {
    const user_obj = new UserModel({
        username: req.body.username
    });

  user_obj.save()
  .then(new_user => {
      res.json(new_user);
  })
  .catch(err => {
      res.status(500).json({
          error: err.message
      });
  });
  });

// get all users
App.get('/api/users', async (req, res) => {
    try {
        const all_users = await UserModel.find();
        res.json(all_users);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// save exercises for the specified user
// Save exercises for the specified user
App.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const user_id = req.params._id;
        const user = await UserModel.findById(user_id);

        if (!user) {
            return res.status(404).send('User Not Found!');
        }

        let date_input;

        // if (req.body.date === "") {
        //     date_input = new Date();
        // } else {
        //     date_input = new Date(req.body.date);
        // }
      if (req.body.date !== undefined && req.body.date !== "") {
          date_input = new Date(req.body.date);
      } else {
          date_input = new Date(); 
      }

        const exercise_obj = new ExerciseModel({
            user_id: user._id,
            username: user.username,
            description: req.body.description,
            duration: req.body.duration,
            date: date_input
        });

        const new_exercise = await exercise_obj.save();
        let log = await LogModel.findById(new_exercise.user_id);

        if (!log) {
            const log_obj = new LogModel({
                _id: new_exercise.user_id,
                username: new_exercise.username,
                count: 1,
                log: [{
                    description: new_exercise.description,
                    duration: new_exercise.duration,
                    date: new_exercise.date
                }]
            });

            await log_obj.save();
        } else {
            const docs = await ExerciseModel.find({ user_id: new_exercise.user_id });
            const log_arr = docs.map((exerciseObj) => {
                return {
                    description: exerciseObj.description,
                    duration: exerciseObj.duration,
                    date: exerciseObj.date
                };
            });

            const new_count = log_arr.length;

            await LogModel.findByIdAndUpdate(new_exercise.user_id)
                .exec()
                .then(updatedLog => {
                    // You need to check if `updatedLog` is not null or undefined before accessing properties
                    if (updatedLog) {
                        updatedLog.count = new_count;
                        updatedLog.log = log_arr;
                        return updatedLog.save(); // Save the updated document
                    } else {
                        console.log('Log not found'); // Handle the case where the document is not found
                    }
                });
        }

        res.json({
            _id: new_exercise.user_id,
            username: new_exercise.username,
            description: new_exercise.description,
            duration: new_exercise.duration,
            date: new Date(new_exercise.date).toDateString()
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});




// access all logs of any user
// Get logs for a specific user
// access all logs of any user
// Get logs for a specific user
App.get('/api/users/:_id/logs', async (req, res) => {
    const { from, to, limit } = req.query;

    try {
        const user_log = await LogModel.findById(req.params._id);

        if (!user_log) {
            return res.status(404).send('User Log Not Found!');
        }

        let dateObj = {};
        if (from) dateObj.$gte = new Date(from);
        if (to) dateObj.$lte = new Date(to);

        let filter = {
            user_id: req.params._id,
        };

        if (from || to) {
            filter.date = dateObj;
        }

        const exercises = await ExerciseModel.find(filter).limit(+limit || 500).exec();

        const log_obj = exercises.map((obj) => ({
            description: obj.description,
            duration: obj.duration,
            date: new Date(obj.date).toDateString(),
        }));

        res.json({
            _id: user_log._id,
            username: user_log.username,
            count: user_log.count,
            log: log_obj,
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});



const CONN_PORT = process.env.PORT || 3000;
App.listen(CONN_PORT,
    () => console.log(`Your App is Listening at http://localhost:${CONN_PORT}`)
);