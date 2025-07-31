const topContentService = require('./topContent.service');

const getTopSellingProduct = async (req, res) => {
  try {
    const topCount = parseInt(req.query.topCount);
    
    if (!topCount || topCount <= 0) {
      return res.status(400).json({ error: 'Valid topCount parameter is required' });
    }
    
    const result = await topContentService.getTopSellingProducts(topCount);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getTopBuyer = async (req, res) => {
  try {
    const topCount = parseInt(req.query.topCount);
    
    if (!topCount || topCount <= 0) {
      return res.status(400).json({ error: 'Valid topCount parameter is required' });
    }
    
    const result = await topContentService.getTopBuyer(topCount);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching top buyers:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getSellCollectionStats = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    
    if (!year || year < 1900 || year > 2100) {
      return res.status(400).json({ error: 'Valid year parameter is required' });
    }
    
    const result = await topContentService.getSellCollectionStats(year);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sell collection stats:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getMonthlySellStats = async (req, res) => {
  try {
    const result = await topContentService.getMonthlySellStats();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching monthly sell stats:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getSellStats = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    
    if (!from_date || !to_date) {
      return res.status(400).json({ error: 'from_date and to_date are required' });
    }
    
    const result = await topContentService.getSellStats(from_date, to_date);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sell stats:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getCollectionStats = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    
    if (!from_date || !to_date) {
      return res.status(400).json({ error: 'from_date and to_date are required' });
    }
    
    const result = await topContentService.getCollectionStats(from_date, to_date);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getSellCollectionStatsByClientId = async (req, res) => {
  try {
    const { from_date, to_date, clientId } = req.query;
    
    if (!from_date || !to_date || !clientId) {
      return res.status(400).json({ error: 'from_date, to_date, and clientId are required' });
    }
    
    const result = await topContentService.getSellCollectionStatsByClientId(
      from_date, 
      to_date, 
      parseInt(clientId)
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sell collection stats by client:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getClientOutstanding = async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId);
    
    if (!clientId) {
      return res.status(400).json({ error: 'clientId parameter is required' });
    }
    
    const result = await topContentService.getClientOutstanding(clientId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching client outstanding:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

const getSellForOneYearByDayReport = async (req, res) => {
  try {
    const result = await topContentService.getSellForOneYearByDayReport();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sell by day report:', error);
    return res.status(500).json({ error: 'Error while fetching data!' });
  }
};

module.exports = {
  getTopSellingProduct,
  getTopBuyer,
  getSellCollectionStats,
  getMonthlySellStats,
  getSellStats,
  getCollectionStats,
  getSellCollectionStatsByClientId,
  getClientOutstanding,
  getSellForOneYearByDayReport,
};