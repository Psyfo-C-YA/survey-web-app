const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://psyfohadebe:qCSJjaDJlJ01qGdk@cluster0.f3vnvdj.mongodb.net/surveyDB'
);

//
// Survey schema and model
const surveySchema = new mongoose.Schema({
  surname: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
  },
  age: {
    type: Number,
    required: true,
    min: 5,
    max: 120,
  },
  foodChoices: [String],
  eatOutRating: {
    type: Number,
    required: true,
  },
  watchMoviesRating: {
    type: Number,
    required: true,
  },
  watchTVRating: {
    type: Number,
    required: true,
  },
  listenRadioRating: {
    type: Number,
    required: true,
  },
});
const Survey = mongoose.model('Survey', surveySchema);

// Set up Handlebars as the view engine
app.engine('handlebars', exphbs.engine({ defaultLayout: false }));
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/survey', (req, res) => {
  res.render('survey');
});

app.post('/survey', async (req, res) => {
  try {
    const {
      surname,
      name,
      number,
      date,
      age,
      foodChoices,
      eatOutRating,
      watchMoviesRating,
      watchTVRating,
      listenRadioRating,
    } = req.body;

    const survey = new Survey({
      surname,
      name,
      number,
      date,
      age,
      foodChoices,
      eatOutRating,
      watchMoviesRating,
      watchTVRating,
      listenRadioRating,
    });

    await survey.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error saving survey.' + error);
  }
});

app.get('/results', async (req, res) => {
  try {
    const totalSurveys = await Survey.countDocuments();
    const surveys = await Survey.find();

    // Calculate survey result details
    // Average age
    const ages = surveys.map((survey) => survey.age);
    const sumOfAges = ages.reduce((total, age) => total + age, 0);
    const averageAge = sumOfAges / totalSurveys;

    // Find the oldest person
    const oldestPerson = await Survey.findOne().sort({ age: -1 });

    // Find the youngest person
    const youngestPerson = await Survey.findOne().sort({ age: 1 });

    // Percentage of people who like pizza
    const pizzaSurveys = await Survey.countDocuments({ foodChoices: 'Pizza' });
    const pizzaPercentage = (pizzaSurveys / totalSurveys) * 100;

    // Percentage of people who like pasta
    const pastaSurveys = await Survey.countDocuments({ foodChoices: 'Pasta' });
    const pastaPercentage = (pastaSurveys / totalSurveys) * 100;

    // Percentage of people who like pap and wors
    const papWorsSurveys = await Survey.countDocuments({
      foodChoices: 'Pap and Wors',
    });
    const papWorsPercentage = (papWorsSurveys / totalSurveys) * 100;

    // Calculate averageEatOutRating
    const eatOutRatings = surveys.map((survey) => survey.eatOutRating);
    const sumOfEatOutRatings = eatOutRatings.reduce(
      (total, rating) => total + rating,
      0
    );
    const averageEatOutRating = sumOfEatOutRatings / totalSurveys;

    // Calculate average movie rating
    const movieRatings = surveys.map((survey) => survey.watchMoviesRating);
    const sumOfMovieRatings = movieRatings.reduce(
      (total, rating) => total + rating,
      0
    );
    const averageMovieRating = sumOfMovieRatings / totalSurveys;

    // Calculate average TV rating
    const tvRatings = surveys.map((survey) => survey.watchTVRating);
    const sumOfTvRatings = tvRatings.reduce(
      (total, rating) => total + rating,
      0
    );
    const averageTvRating = sumOfTvRatings / totalSurveys;

    // Calculate average radio rating
    const radioRatings = surveys.map((survey) => survey.listenRadioRating);
    const sumOfRadioRatings = radioRatings.reduce(
      (total, rating) => total + rating,
      0
    );
    const averageRadioRating = sumOfRadioRatings / totalSurveys;

    res.render('results', {
      totalSurveys,
      averageAge,
      oldestPerson: oldestPerson.name,
      youngestPerson: youngestPerson.name,
      pizzaPercentage: pizzaPercentage.toFixed(1),
      pastaPercentage: pastaPercentage.toFixed(1),
      papWorsPercentage: papWorsPercentage.toFixed(1),
      averageEatOutRating: averageEatOutRating.toFixed(1),
      averageMovieRating: averageMovieRating.toFixed(1),
      averageTvRating: averageTvRating.toFixed(1),
      averageRadioRating: averageRadioRating.toFixed(1),
    });
  } catch (error) {
    res.status(500).send('Error retrieving survey results.' + error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
