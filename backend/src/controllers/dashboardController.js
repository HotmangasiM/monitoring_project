const dashboardService = require("../service/dashboardService");

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.json(data);
  } catch (err) {
    console.log("Dashboard crash: ", err);
    next(err);
  }
};

exports.getDashboardTrend = async (req, res, next) => {
  try{
    const data = await dashboardService.getDashboardTrend();
    res.json(data);
  } catch (err){
    next(err);
  }
};

// ini adalah log
