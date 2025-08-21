module.exports = {
  success: (data) => ({ success: true, data, error: null }),
  error: (message, error = null) => ({ success: false, data: null, error: { message, details: error } })
};
