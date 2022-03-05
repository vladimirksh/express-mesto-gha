const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  NotValidateError,
  NotFoundError,
  NotDoubleError,
  NotAuthError,
} = require('../errors');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => { res.send({ data: users }); })
    .catch((err) => next(err));
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному id не найден');
        // res.status(404).send({ message: 'Пользователь по указанному id не найден' });
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotValidateError('Невалидный id пользователя'));
        // res.status(400).send({ message: 'Невалидный id пользователя' });
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      res.send(err);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name, about, avatar,
    }))
    .then(() => {
      res.send({
        data: {
          name, about, avatar, email,
        },
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new NotDoubleError('Данный email уже используется'));
        // res.status(409).send({ message: 'Данный email уже используется' });
      } else if (err.name === 'ValidationError') {
        next(new NotValidateError('Переданы некорректные данные при создании пользователя'));
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.patchUser = (req, res, next) => {
  const { name, about } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      upsert: false, // если пользователь не найден, он не будет создан
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному id не найден');
        // res.status(404).send({ message: 'Пользователь с указанным id не найден' });
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidateError('Переданы некорректные данные при обновлении профиля'));
        // res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.patchUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      upsert: false, // если пользователь не найден, он не будет создан
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному id не найден');
        // res.status(404).send({ message: 'Пользователь с указанным id не найден' });
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidateError('Переданы некорректные данные при обновлении аватара'));
        // res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(() => {
      // ошибка аутентификации
      next(new NotAuthError('невозможно авторизоваться'));
      // res.status(401).send({ message: err.message });
    });
};
