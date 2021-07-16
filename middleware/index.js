"use strict";

let Keyfetch = require("keyfetch");
let E = require("../lib/errors.js");

module.exports = function authMiddleware({
  pub,
  iss,
  optional = false,
  userParam = "user",
  jwsParam = "jws",
}) {
  return async function (req, res, next) {
    let jwt = (req.headers.authorization || "").replace("Bearer ", "");
    if (!jwt) {
      if (optional) {
        next();
        return;
      }

      next(E.MISSING_TOKEN());
      return;
    }

    await Keyfetch.jwt
      .verify(jwt, {
        jwk: pub,
        issuers: [iss],
      })
      .then(function (jws) {
        req[jwsParam] = jws;
        if (userParam) {
          req[userParam] = req[jwsParam].claims;
        }
        next();
      })
      .catch(next);
  };
};
