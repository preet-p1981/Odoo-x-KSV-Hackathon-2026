const service = require('./service');

exports.register = async (req, res) => {
  try {
    const data = await service.register(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await service.login(req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const data = await service.forgotPassword(req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const data = await service.resetPassword(req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const data = await service.getMe(req.user.id);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const data = await service.updateMe(req.user.id, req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
