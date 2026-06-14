const getHealthStatus = (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SomuPilot AI API is running",
  });
};

export { getHealthStatus };
