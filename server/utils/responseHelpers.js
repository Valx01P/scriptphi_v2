const createResponse = (success, status, data = null, message = null, error = null) => {
  return {
    success,
    status,
    timestamp: new Date().toISOString(),
    data,
    message,
    error
  };
};

const successResponse = (data = null, message = "Success", status = 200) => {
  return createResponse(true, status, data, message, null);
};

const errorResponse = (message = "Error", status = 500, error = null) => {
  return createResponse(false, status, null, message, error);
};

export { successResponse, errorResponse };