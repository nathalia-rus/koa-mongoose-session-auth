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

exports.logout = () => {
  return async (ctx) => {
    ctx.session = null;
    ctx.response.status = 200;
  };
};

exports.register = (model, { usernameField, passwordField, extra}) => {
  return async ({ request, response }) => {
    let hash = await bcrypt.hash(request.body[passwordField], 10);
    let query = {
      [usernameField]: request.body[usernameField],
      [passwordField]: hash,
    };

    for (let extraField of extra) {
      query[extraField] = request.body[extraField];
    }

    let user = await model.create(query);
    let body = user.toObject();

    delete body[passwordField];

    response.status = 200;
    response.body = body;
  };
};
