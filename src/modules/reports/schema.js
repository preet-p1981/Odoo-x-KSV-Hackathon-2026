const { z } = require('zod');

const reportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

module.exports = {
  reportQuerySchema,
};
