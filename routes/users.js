const router = require('express').Router();
const {
  getUsers, getUser, createUser, patchUser, patchUserAvatar, login,
} = require('../controllers/users');

// сработает при GET-запросе на URL /users
router.get('/', getUsers);

router.post('/', createUser);

router.post('/', login);

router.get('/:userId', getUser);

router.patch('/me', patchUser);

router.patch('/me/avatar', patchUserAvatar);

module.exports = router;
