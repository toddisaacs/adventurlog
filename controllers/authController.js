const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
//const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failuerRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'you are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();

  req.flash('success', 'You are now logged out');
  res.redirect('/');
};

exports.isLggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error', 'Oops you must be logged in to do that!');
    res.redirect('/login');
  }
};

// exports.forgot = async (req, res) => {
//   // 1) check for valid user by email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     req.flash('error', 'Your password reset has been mailed to you!');
//     return res.redirect('/login');
//   }
//   // 2) set reset tokens and expire
//   user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
//   user.resetPasswordExpires = Date.now() + 36000000;
//   await user.save();

//   // send email
//   const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
//   await mail.send({
//     user,
//     subject: 'Password Reset',
//     resetURL,
//     filename: 'password-reset'
//   });

//   req.flash('success', `You have been mailed a passworrd reset link.`);
//   res.redirect('/login');
// };

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  res.render('reset', { title: 'Reset your Password' });
};

exports.confirmPasswords = async (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', 'Passwords do not match');
  res.redirect('back');
};

exports.update = async (req, res) => {
  // TODO make middle ware
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  // user.setPassword() //from plugin but callback based
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password); // set the new hash and salt

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  const updatedUser = await user.save();
  // login
  await req.login(updatedUser);
  req.flash('success', 'Your password has been reset! You are now logged in!');
  res.redirect('/');
};
