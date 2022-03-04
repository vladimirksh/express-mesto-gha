/* eslint-disable func-names */
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const validator = require('validator');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { // опишем свойство validate
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'неверный формат Email', // когда validator вернёт false, будет использовано это сообщение
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    required: false,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    required: false,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: false,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(link) {
        return validator.isURL(link);
      },
      message: 'неверный формат Url',
    },
  },
});

// добавим метод findUserByCredentials схеме пользователя
// у него будет два параметра — почта и пароль
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          return user; // теперь user доступен
        });
    });
};

module.exports = mongoose.model('user', userSchema);
