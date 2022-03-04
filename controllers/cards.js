const Card = require('../models/card');
const {
  NotValidateError,
  NotOwnerError,
  NotFoundError,
} = require('../errors');

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .then((cards) => { res.send({ data: cards }); })
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      if (!card) {
        throw new NotValidateError('Переданы некорректные данные');
        // res.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidateError('Переданы некорректные данные'));
        // res.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const guest = req.user._id;
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий id карточки');
        // res.status(404).send({ message: 'Передан несуществующий id карточки' });
      } else if (guest !== card.owner) {
        throw new NotOwnerError('Попытка удалить чужую карточку');
        // res.status(403).send({ message: 'Попытка удалить чужую карточку' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotValidateError('Переданы некорректные данные'));
        // res.status(400).send({ message: 'Карточка не найдена' });
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.putLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий id карточки');
        // res.status(404).send({ message: 'Передан несуществующий id карточки' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotValidateError('Переданы некорректные данные для постановки лайка'));
        // res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий id карточки');
        // res.status(404).send({ message: 'Передан несуществующий id карточки' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotValidateError('Переданы некорректные данные для снятии лайка'));
        // res.status(400).send({ message: 'Переданы некорректные данные для снятии лайка' });
      } else {
        next(err);
        // res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};
