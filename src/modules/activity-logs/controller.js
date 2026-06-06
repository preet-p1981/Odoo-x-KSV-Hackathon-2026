const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll(req.query);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const data = await service.getMine(req.user.id, req.query);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getByEntity = async (req, res) => {
  try {
    const data = await service.getByEntity(req.params.entity, req.params.id, req.query);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
