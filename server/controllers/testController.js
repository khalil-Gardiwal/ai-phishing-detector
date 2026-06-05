const testApi = (req, res) => {
  res.json({
    message: "Test controller is working successfully",
  });
};

module.exports = {
  testApi,
};