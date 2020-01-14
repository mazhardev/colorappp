const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const url = 'mongodb+srv://RickLeinecker:COP4331Rocks@cluster0-4pisv.mongodb.net/COP4331?retryWrites=true&w=majority';
const app = express();

// if (process.env.NODE_ENV === 'production') {
//   url = process.env.MONGO_URI
// } else {
//   url = 'mongodb+srv://RickLeinecker:COP4331Rocks@cluster0-4pisv.mongodb.net/COP4331?retryWrites=true&w=majority';
// }
const client = new MongoClient(url);
client.connect().then(() => console.log("Mongo DB connected"))
  .catch(err => console.log(err));

app.use(bodyParser.json());

var colorList =
  [
    'blue',
    'white',
    'black',
    'gray',
    'magenta',
    'yellow',
    'cyan',
    'salmon',
    'chartreuse',
    'lime',
    'light blue',
    'light gray',
    'light red',
    'light green',
    'chiffon',
    'fuscia',
    'brown',
    'beige'
  ];

// CORS Headers => Required for cross-origin/ cross-server communication
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.get('/', (req, res) => res.send('Hello World'));

app.post('/api/addcolor', (req, res, next) => {
  // incoming: userId, color
  // outgoing: error

  const { userId, color } = req.body;

  const newColor = { Color: color.toLowerCase(), UserId: userId };
  var error = '';

  try {
    const db = client.db();
    const result = db.collection('Colors').insertOne(newColor);
  }
  catch (e) {
    error = e.toString();
  }

  colorList.push(color);

  var ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/login', async (req, res, next) => {
  // incoming: login, password
  // outgoing: id, firstName, lastName, error

  const { login, password } = req.body;
  try {

    const db = client.db();
    const results = await db.collection('Users').find({ Login: login, Password: password }).toArray();

    var id = -1;
    var fn = '';
    var ln = '';

    if (results.length > 0) // login=='RickL' && password=='COP4331')
    {
      id = results[0].UserId;
      fn = results[0].FirstName; // 'Rick';
      ln = results[0].LastName; // 'Leinecker';
    }

    var ret = { id: id, firstName: fn, lastName: ln, error: '' };
    res.status(200).json(ret);
  } catch (error) {
    res.json(error);
  }
});

app.post('/api/searchcolors', async (req, res, next) => {
  // incoming: userId, search
  // outgoing: results[], error

  // // VERY TEMP
  // for( var i=0; i<colorList.length; i++ )
  // {
  //   const newColor = {Color:colorList[i],UserId:1};
  //   const db = client.db();
  //   const result = db.collection('Colors').insertOne(newColor);
  // }

  const { userId, search } = req.body;

  var _search = search.toLowerCase().trim();

  const db = client.db();
  const results = await db.collection('Colors').find().toArray();

  var _ret = [];
  for (var i = 0; i < results.length; i++) {
    var nextColor = results[i].Color.toLowerCase().trim();
    if (nextColor.indexOf(_search) >= 0) {
      _ret.push(nextColor);
    }
  }

  var ret = { results: _ret, error: '' };
  res.status(200).json(ret);
});

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

}


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
