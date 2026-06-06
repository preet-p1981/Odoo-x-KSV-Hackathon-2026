const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll(req.query, req.user);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.create(req.user, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id, req.user);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.update(req.user, req.params.id, req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
