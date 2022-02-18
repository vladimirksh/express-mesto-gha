const router = require('express').Router();
const {
  getUsers, getUser, createUser, patchUser, patchUserAvatar,
} = require('../controllers/users');

// сработает при GET-запросе на URL /users
router.get('/', getUsers);

router.get('/:userId', getUser);

router.post('/', createUser);

router.patch('/me', patchUser);

router.patch('/me/avatar', patchUserAvatar);

module.exports = router;
