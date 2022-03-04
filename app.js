const express = require('express');

const mongoose = require('mongoose');

const { errors } = require('celebrate');

const app = express();

const errorHandler = require('./middlewares/error-handler');

const { PORT = 3000 } = process.env;

const { login, createUser } = require('./controllers/users');

const auth = require('./middlewares/auth');

app.use(express.json());// It parses incoming req with JSON payloads and is based on body-parser.

async function main() {
  // подключаемся к серверу mongo
  await mongoose.connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('conect to db');

  await app.listen(PORT);
  console.log(`Listen ${PORT} port`);
}

// роуты, не требующие авторизации
app.post('/signin', login);
app.post('/signup', createUser);

// авторизация
app.use(auth);

// роуты, которым авторизация нужна
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.use(errors()); // обработчик ошибок celebrate

app.use(errorHandler); // ыцентрализованный обработчик

main();
