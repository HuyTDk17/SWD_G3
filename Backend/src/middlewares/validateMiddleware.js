const validate = (validatorFn) => (req, res, next) => {
  try {
    req.validated = validatorFn(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
