const bcrypt = require('bcrypt');

exports.login = (model, { usernameField, passwordField }) => {
  return async ({ request, response, session }) => {
    let user;
    let username = request.body[usernameField];
    let password = request.body[passwordField];

    if (username && password) {
      user = await model.findOne({
        [usernameField]: username,
      });
    }

    if (user) {
      let check = await bcrypt.compare(request.body[passwordField], user[passwordField]);
      if (check) {
        session.userId = user._id;
        response.status = 200;
        return;
      }
    }

    response.status = 401;
    response.message = 'Invalid credentials.';
  };
};
