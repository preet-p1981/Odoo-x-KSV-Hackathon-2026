const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll(req.query);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.create(req.user.id, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const data = await service.approve(req.user.id, req.params.id, req.body.remarks);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const data = await service.reject(req.user.id, req.params.id, req.body.remarks);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getPending = async (_req, res) => {
  try {
    const data = await service.getPending();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
