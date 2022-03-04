const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUser, createUser, patchUser, patchUserAvatar, login,
} = require('../controllers/users');

// сработает при GET-запросе на URL /users
router.get('/', getUsers);

router.post('/', createUser);

router.post('/', login);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().min(24)
      .max(24),
  }),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), patchUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required()
      .regex(/^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w.-]*)*\/?$/),
  }),
}), patchUserAvatar);

module.exports = router;
