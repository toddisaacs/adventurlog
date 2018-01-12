const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login Form' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name'); // comes from App.js see expressValidator
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot Blank!').notEmpty();
  req.checkBody('password-confirm', 'Password Confirm Cannot Blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! your passwords so not match').equals(req.body.password);

  const error = req.validationErrors();
  if (error) {
    req.flash('error', error.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return;
  }

  next();
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  // User.register(user, req.body.password, function(err, user) {}) //came from the passport plugin
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit your Account' });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );

  req.flash('success', 'Updated Profile! ');
  res.redirect('back');
};
