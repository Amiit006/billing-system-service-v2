const clientOutstandingService = require("./clientOutstanding.service");

// GET /client-outstanding?clientId=123
const getClientOutstandingByClientId = async (req, res) => {
  const clientId = parseInt(req.query.clientId);

  if (!clientId) {
    return res.status(400).json({ error: "clientId query param is required" });
  }

  try {
    const outstanding =
      await clientOutstandingService.getClientOutstandingByClientId(clientId);
    return res.status(200).json(outstanding);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Error Occurred" });
  }
};

module.exports = {
  getClientOutstandingByClientId,
};
