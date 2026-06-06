const { ZodError } = require('zod');

const formatValidationErrors = (issues = []) =>
  issues
    .map((issue) => {
      const path = issue.path && issue.path.length ? issue.path.join('.') : 'body';
      return `${path}: ${issue.message}`;
    })
    .join('; ');

const validate = (schema, source = 'body') => async (req, res, next) => {
  try {
    const payload =
      source === 'all'
        ? {
            body: req.body,
            query: req.query,
            params: req.params,
          }
        : req[source];

    const parsed = await schema.parseAsync(payload);

    if (source === 'all') {
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
    } else {
      req[source] = parsed;
    }

    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: formatValidationErrors(error.issues) || 'Validation failed' });
    }

    return res.status(500).json({ error: error.message || 'Validation middleware error' });
  }
};

module.exports = { validate };
