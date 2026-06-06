const service = require('./service');

exports.dashboard = async (_req, res) => {
  try {
    const data = await service.getDashboard();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.spending = async (_req, res) => {
  try {
    const data = await service.getSpending();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.vendorPerformance = async (_req, res) => {
  try {
    const data = await service.getVendorPerformance();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.procurementTrend = async (_req, res) => {
  try {
    const data = await service.getProcurementTrend();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.exportCsv = async (_req, res) => {
  try {
    const csv = await service.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=vendorbridge-report.csv');
    return res.send(csv);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
