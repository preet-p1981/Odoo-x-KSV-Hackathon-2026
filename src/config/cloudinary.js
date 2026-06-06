const isConfigured = Boolean(process.env.CLOUDINARY_URL);

module.exports = {
  isConfigured,
  url: process.env.CLOUDINARY_URL || null,
};
