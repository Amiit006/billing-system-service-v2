const reportService = require('./report.service');

const getSellsReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    const result = await reportService.getSellsReport(from_date, to_date);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sells report:', error);
    return res.status(500).json({});
  }
};

const getCollectionsReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    const result = await reportService.getCollectionsReport(from_date, to_date);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching collections report:', error);
    return res.status(500).json({});
  }
};

const getClientReport = async (req, res) => {
  try {
    const { from_date, to_date, clientId } = req.query;
    const result = await reportService.getClientReport(
      from_date, 
      to_date, 
      parseInt(clientId)
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching client report:', error);
    return res.status(500).json({});
  }
};

const getTradeBookReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    const result = await reportService.getTradeBookReport(from_date, to_date);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching trade book report:', error);
    return res.status(500).json({});
  }
};

const getParticularsReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    const result = await reportService.getParticularsReport(from_date, to_date);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching particulars report:', error);
    return res.status(500).json({});
  }
};

const getClientOutstandingReport = async (req, res) => {
  try {
    const result = await reportService.getClientOutstandingReport();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching client outstanding report:', error);
    return res.status(500).json({});
  }
};

const getClientTradeBookReport = async (req, res) => {
  try {
    const { clientId, from_date, to_date } = req.query;
    const result = await reportService.getClientTradeBookReport(
      parseInt(clientId), 
      from_date, 
      to_date
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching client trade book report:', error);
    return res.status(500).json({});
  }
};

module.exports = {
  getSellsReport,
  getCollectionsReport,
  getClientReport,
  getTradeBookReport,
  getParticularsReport,
  getClientOutstandingReport,
  getClientTradeBookReport,
};