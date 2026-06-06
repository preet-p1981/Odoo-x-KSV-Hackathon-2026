const service = require('./service');
const quotationService = require('../quotations/service');

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

exports.update = async (req, res) => {
  try {
    const data = await service.update(req.user.id, req.params.id, req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.publish = async (req, res) => {
  try {
    const data = await service.publish(req.user.id, req.params.id);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.close = async (req, res) => {
  try {
    const data = await service.close(req.user.id, req.params.id);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const data = await service.cancel(req.user.id, req.params.id);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.assignVendors = async (req, res) => {
  try {
    const data = await service.assignVendors(req.user.id, req.params.id, req.body.vendorIds);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.addAttachment = async (req, res) => {
  try {
    const data = await service.addAttachment(req.user.id, req.params.id, req.file);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.removeAttachment = async (req, res) => {
  try {
    const data = await service.removeAttachment(req.user.id, req.params.id, req.params.attachmentId);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.compareQuotations = async (req, res) => {
  try {
    const data = await quotationService.compareByRFQ(req.params.rfqId);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
