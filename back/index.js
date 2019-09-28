const express = require('express');
const app = express();
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');

const config = {
  secret: `;dtn',kznm`
}

function jwtWare() {
  const { secret } = config;
  return expressJwt({ secret }).unless({
    path: [
      // public routes that don't require authentication
      '/authenticate',
      '/register',
      '/getInformation'
    ]
  });
}

function errorHandler(err, req, res, next) {
  if (typeof (err) === 'string') {
    return res.status(400).json({ error: err });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid Token' });
  }
  return res.status(500).json({ error: err.message });
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwtWare());

// api routes
app.post('/authenticate', function (req, res, next) {
  authenticate(req.body)
    .then(token => token ? res.json({token}) : res.status(400).json({ error: 'Username or password is incorrect' }))
    .catch(err => next(err));
});

app.post('/register', function (req, res, next) {
  register(req.body)
    .then(token => token ? res.json({token}) : res.status(400).json({ error: 'User with the same name already exists' }))
    .catch(err => next(err));
})

app.get('/getInformation', function (req, res, next) {
  getInformation(req.body)
    .then(inform => inform ? res.send(inform) : (res.status(400).send({ message: 'not found' })))
    .catch(err => next(err));
})

// global error handler
app.get('/', (req, res, next) => {
  res.json({all: 'ok'})
  //next()
});

app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 5000;
const server = app.listen(port, function () {
  console.log('Server listening on port ' + port);
});

var schema = buildSchema(`
  type Query {
    getInformation: [Match]
  }
  type Mutation {
    startGame(lat: Float!, lng: Float!): Match
    updateGame(lat: Float!, lng: Float!): Match
  }

  type Map {
    id: Int
    lat: Float
    lng: Float
  }
  type User {
    id: Int
    username: String
  }
  type Checkpoint {
    id: Int
    lat: Float
    lng: Float
    weight: Int
  }
  type Team {
    id: Int
    title: String
  }
  type Match {
    id: Int
    lat: Float
    lng: Float
    status: String
    usersCount: Int
    checkpoints: [Checkpoint]
    users: [User]
    userlogs: [Userlog]
  }

  type Userlog {
    id: Int
    lat: Float
    lng: Float
    weight: Int
    user: User
    team: Team
  }
`);

async function authenticate({ username, password }) {
  console.log(username, password)
  let user = await User.findOne({where: {username, password}});
  if (user) {  
    const token = jwt.sign({ sub: user.id, name: user.username }, config.secret);
    return  token;
  }
  else{
    return;
  }
}

async function register({username, password}){
  let user = await User.findOne({where: {username}});
  if(!user){
    user = await User.create({username, password});
    const token = jwt.sign({sub: user.id}, config.secret);
    return token;
  }
  else{
    return;
  }
}

async function getInformation(){
  let information = {
    "Количество игроков:": (await User.findAll()).length,
    // loggedUsersCount: (await User.findAll({where: {status: {'login'}}})).length,
    "Количество матчей:": (await Match.findAll()).length,
    "Из них текущих:": (await Match.findAll({where: {status: 'current'}})).length,
    "В режиме ожидания:": (await Match.findAll({where: {status: 'awaiting'}})).length,
  }
  return JSON.stringify({information});
}

async function startGame({lat, lng}, context){
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
  function getFieldBorder(lat, lng){
    const height = 0.007, width = 0.0135;
    let top = lat + height;
    let right = lng + width;
    let bottom = lat - height;
    let left = lng - width;
    let borders = {top, right, bottom, left};
    return borders;
  }

  let user = await User.findOne({where: {id: context.jwt.sub}});
  if(!user) return;
  let userCurrentMatches = await user.getMatches({where: {status: 'current'}});
  let userAwaitingMatches = await user.getMatches({where: {status: 'awaiting'}});

  let match = userCurrentMatches[0] || userAwaitingMatches[0];
  if(match){
    return match;
  }
  else{
    let awaitingMatches = await Match.findAll({where: {status: 'awaiting'}});
    let nearestMatches = awaitingMatches.filter(match => {
      let borders = getFieldBorder(match.lat, match.lng);
      let userOnField = (lat <= borders.top) && (lat >= borders.bottom) &&
        (lng <= borders.right) && (lng >= borders.left);
      return userOnField;
    });
    match = nearestMatches[0];
    let userlog = await Userlog.create({lat, lng, weight: 10000});
    await user.addUserlog(userlog);

    if(match){
      let users = await match.getUsers();
      let [friends, enemies] = await match.getTeams();
      if(users.length % 2 === 0){
        friends.addUserlog(userlog);
      }
      else{
        enemies.addUserlog(userlog);
      }
      await match.addUser(user);
      await match.addUserlog(userlog);
    }
    else{
      let date = new Date();
      let time = date.getTime();
      let map = await Map.create({lat, lng});
      match = await Match.create({lat, lng, mapId: map.id, status: 'awaiting'});
      let points = [];
      let borders = getFieldBorder(lat, lng);
      for(let i = 0; i <= 4; i++){
        latitude = getRandomArbitrary(borders.bottom, borders.top);
        longitude = getRandomArbitrary(borders.left, lng);
        points[i] = await Checkpoint.create({lat: latitude, lng: longitude, weight: 10000, matchId: match.id, mapId: map.id});
      }
      for(let i = 5; i <= 9; i++){
        latitude = getRandomArbitrary(borders.bottom, borders.top);
        longitude = getRandomArbitrary(lng, borders.right);
        points[i] = await Checkpoint.create({lat: latitude, lng: longitude, weight: 10000, matchId: match.id, mapId: map.id});
      }
      let friends = await Team.create({title: 'friends', matchId: match.id});
      let enemies = await Team.create({title: 'enemies', matchId: match.id});
      await friends.addUserlog(userlog);
      await match.addUser(user);
      await match.addUserlog(userlog);
    }

    let usersCount = await match.usersCount;
    if(usersCount >= 4){
      await match.update({status: 'current'});
    }
  }
  return match;
}

setInterval(async () => {
  function getDistance(point1, point2) {
    var p = Math.PI / 180;  //0.017453292519943295;
    var c = Math.cos;
    let a = 0.5 - c((point2.lat - point1.lat) * p)/2 + 
            c(point1.lat * p) * c(point2.lat * p) * 
            (1 - c((point2.lng - point1.lng) * p))/2;
            let res = 12742000 * Math.asin(Math.sqrt(a));
    return (12742000 * Math.asin(Math.sqrt(a))) // 2 * R; R = 6371 km
  }

  function getCoefficient(pnt, points) {
    let points1 = [], points2 = [];
    for(let i = 0; i < points.length / 2; i++){
      points1.push(points[i]);      //checkpoints of friends team
    }
    for(let i = points.length / 2; i < points.length; i++){
      points2.push(points[i]);      //checkpoints of enemies team
    }
    let k = 0, distances = [];
    for(let point of points1){
      let distance = getDistance(pnt, point);
      k += (1 / distance) * 1000;
      distances.push(distance);
    }
    for(let point of points2){
      let distance = getDistance(pnt, point);
      k += (1 / distance) * 1000;
      distances.push(distance);
    }
    return {k, distances};
  }
  let currentDate = new Date();
  let currentTime = currentDate.getTime();
  let awaitingMatches = await Match.findAll({where: {status: 'awaiting'}});
  let currentMatches = await Match.findAll({where: {status: 'current'}});
  if(awaitingMatches.length)
    awaitingMatches.forEach(async match => {
      if(currentTime >= match.createdAt.getTime() + 600000){
        await match.update({status: 'ended'});
      }      
    })
  if(currentMatches.length)
    currentMatches.forEach(async match => {
      if(currentTime >= match.createdAt.getTime() + 3600000){
        await match.update({status: 'ended'});
      }
      else{
        let userlogs = await match.getUserlogs();
        let checkpoints = await match.getCheckpoints();
        let length = checkpoints.length / 2;
        if(currentTime >= match.updatedAt.getTime() + 1000){
          userlogs.forEach(async (userlog, i) => {
            let userWeight = userlog.weight;
            let coef = getCoefficient(userlog, checkpoints);
            let user = await userlog.getUser();
            let team = await userlog.getTeam();
            checkpoints.forEach(async (checkpoint, j) => {
              if(coef.distances[j] <= 150 && userlog.weight > 0 && checkpoint.weight > 0){
                let pointWeight = (i % 2 === 0) && (j < length) ||
                            (i % 2 !== 0) && (j >= length) ?
                            checkpoint.weight + 30 :
                            checkpoint.weight - 30;
                userWeight -= 50;
                await checkpoint.update({weight: (pointWeight > 10000 ? 10000 : pointWeight < 0 ? 0 : pointWeight)});
                await userlog.update({weight: (userWeight > 10000 ? 10000 : userWeight < 0 ? 0 : userWeight)});  
              }            
            });
            let minDist = Math.min(...coef.distances);
            if(userWeight > 0 && minDist > 150){
              // (team.title === 'friend') ? 
              userWeight += 5 * coef.k// : userWeight -= coef.k;
              await userlog.update({weight: (userWeight > 10000 ? 10000 : userWeight < 0 ? 0 : userWeight)});
            }
          });
        }
      }
  })
}, 5000)

async function updateGame({lat, lng}, context){
  let user = await User.findOne({where: {id: context.jwt.sub}});
  let currentMatches = await user.getMatches({where: {status: 'current'}});
  let awaitingMatches = await user.getMatches({where: {status: 'awaiting'}});
  let endedMatches = await user.getMatches({where: {status: 'ended'}});
  let match = currentMatches[0] || awaitingMatches[0] || endedMatches[endedMatches.length - 1];
  let userlog = await Userlog.findOne({where: {userId: user.id, matchId: match.id}});
  userlog.update({lat: lat, lng: lng});
  let updatedMatch = await match.update();
  return updatedMatch;
}

var root = {//объект соответствия названий в type Query и type Mutation с функциями-резолверами из JS-кода
  getInformation,
  startGame,
  updateGame
};

// Create an express server and a GraphQL endpoint

app.use('/graphql', express_graphql(req => ({
    schema: schema,
    rootValue: root,
    graphiql: true, 
    context: req.headers.authorization && {
        jwt: jwt.verify(req.headers.authorization.substring("Bearer ".length), config.secret)
    }
})));

// app.use('/graphql', express_graphql(async (req, res, gql) => {
//   console.log(gql.query)
//   if (!gql.query){ //нема запроса, можно отдать анонимную схему и резолверы
//     return {
//       schema: schema,
//       rootValue: (...params) => (console.log("params",params), rootResolvers),
//       graphiql: true, 
//     }
//   }
//   const operationMatch = gql.query.match(/\{\s*([a-zA-Z]+)\s*/);
//   const operationName  = gql.operationName || operationMatch[1];
//   console.log('before oper', operationName, operationMatch[1]);
//   if ((!operationName) || anonResolvers.includes(operationName)){
//     console.log("schema", schema, rootResolvers);
//     return {
//       schema: schema, //анонимная схема и резолверы
//       rootValue: rootResolvers,
//       graphiql: true, 
//     }
//   }
//   const authorization = req.headers.authorization; 
//   console.log("auth",authorization);
  
//   if (authorization && authorization.startsWith('Bearer ')){
//     console.log('token provided');
//     const token = authorization.substr("Bearer ".length);
//     const decoded = jwt.verify(token, jwtSecret);
//     if (decoded){
//       console.log('token verified', decoded);

//       let slicedModels  = await getModels(decoded.sub.id);

//       return {
//         schema: schema,
//         rootValue: rootResolvers,
//         graphiql: true, 
//         context: {jwt: decoded.sub,
//                   models: slicedModels}
//       }
//     }
//   }
//   console.log('bad end');
// }))

// ------------------ Sequelize

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:12345@localhost/game');

class User extends Sequelize.Model {}

User.init({
  username: Sequelize.STRING,
  password: Sequelize.STRING
}, { sequelize, modelName: 'user' });

class Userlog extends Sequelize.Model {
  get user(){
    return this.getUser();
  }
  get team(){
    return this.getTeam();
  }
}

Userlog.init({
  lat: Sequelize.FLOAT,
  lng: Sequelize.FLOAT,
  weight: Sequelize.INTEGER
}, { sequelize, modelName: 'userlog' })

class Team extends Sequelize.Model {}
Team.init({
  title: Sequelize.STRING
}, { sequelize, modelName: 'team' })

class Checkpoint extends Sequelize.Model {}

Checkpoint.init({
  lat: Sequelize.FLOAT,
  lng: Sequelize.FLOAT,
  weight: Sequelize.INTEGER
}, { sequelize, modelName: 'checkpoint' })

class Fieldlog extends Sequelize.Model {}

Fieldlog.init({}, { sequelize, modelName: 'fieldlog' })

class Match extends Sequelize.Model {
  get usersCount(){
    return this.getUsers().then(p => p.length);
  }
  get checkpoints(){
    return this.getCheckpoints();
  }
  get users(){
    return this.getUsers();
  }
  get userlogs(){
    return this.getUserlogs();
  }
}

Match.init({
  lat: Sequelize.FLOAT,
  lng: Sequelize.FLOAT,
  status: Sequelize.STRING
}, { sequelize, modelName: 'match' })

class Map extends Sequelize.Model {}

Map.init({
  lat: Sequelize.FLOAT,
  lng: Sequelize.FLOAT
}, { sequelize, modelName: 'map' })

User.hasMany(Userlog);
Userlog.belongsTo(User);

Team.hasMany(Userlog);
Userlog.belongsTo(Team);

Match.hasMany(Team);
Team.belongsTo(Match);

User.belongsToMany(Match, {through: 'user2match'});
Match.belongsToMany(User, {through: 'user2match'});

Match.hasMany(Userlog);
Userlog.belongsTo(Match);

Match.hasMany(Fieldlog);
Fieldlog.belongsTo(Match);

Match.hasMany(Checkpoint);
Checkpoint.belongsTo(Match);

Map.hasMany(Checkpoint);
Checkpoint.belongsTo(Map);

Map.hasMany(Match);
Match.belongsTo(Map);

;(async () => {
  await sequelize.sync()
})()

app.listen(4000, '0.0.0.0', () =>  console.log('Express GraphQL Server Now Running On'));