const Sauce = require('../models/Sauce');
const fs = require("fs");

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename
      }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  if(req.file) {
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      console.log(filename);
      fs.unlink(`images/${filename}`, (error) => {
        if (error) throw error;
      })
    });
  }
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
    .catch((error) => res.status(401).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeDislike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      console.log(sauce);

      // If usersLiked array is empty and like === 1
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        console.log("userId n'est pas dans usersLiked et requête front like = 1.");
        // Update database
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: 'Sauce like +1' }))
          .catch((error) => res.status(400).json({ error }));
      }
      // usersLiked array is not empty and like === 0
      else if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        console.log("userId est dans usersLiked et requête front like = 0.");
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: 'Sauce like 0' }))
          .catch((error) => res.status(400).json({ error }));
      }
      // userDisliked is empty and like === -1
      else if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
        console.log("userId est dans usersDisliked et requête front dislike = -1.");
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Sauce dislike 1" }))
          .catch((error) => res.status(400).json({ error }));
      }
      // usersDisliked is not empty and like === 0
      else if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
        console.log("userId est dans usersDisliked et requête front like = 0.");
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: 'Sauce dislike 0' }))
          .catch((error) => res.status(400).json({ error }));
      }
      else {
        res.status(409).json({ error: "Opération interdite" })
      }
    })
    .catch((error) => res.status(404).json({ error }));
};