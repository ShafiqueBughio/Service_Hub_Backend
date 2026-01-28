/** @format */

class Responses {
  generic_response = (status, success, data = null, error = null) => ({
    status: {
      code: status,
      success,
    },
    data,
    message: error,
  });

  ok_response = (data = null, message = null) => ({
    status: {
      code: 200,
      success: true,
    },
    data,
    error: null,
    message,
  });

  create_success_response = (
    data = null,
    message = "Successfully created."
  ) => ({
    status: {
      code: 201,
      success: true,
    },
    data,
    error: null,
    message,
  });

  update_success_response = (
    data = null,
    message = "Successfully updated."
  ) => ({
    status: {
      code: 200,
      success: true,
    },
    data,
    error: null,
    message,
  });

  delete_success_response = (
    data = null,
    message = "Successfully deleted."
  ) => ({
    status: {
      code: 200,
      success: true,
    },
    data,
    error: null,
    message,
  });

  bad_request_response = (error = null, data = null) => ({
    status: {
      code: 400,
      success: false,
    },
    data,
    message: error,
  });

  not_found_response = (error = null) => ({
    status: {
      code: 404,
      success: false,
    },
    data: null,
    message: error,
  });

  unauthorized_response = (error = null) => ({
    status: {
      code: 401,
      success: false,
    },
    data: null,
    message: error,
  });

  forbidden_response = (error = null) => ({
    status: {
      code: 403,
      success: false,
    },
    data: null,
    message: error,
  });

  session_expired_response = (error = null) => ({
    status: {
      code: 440,
      success: false,
    },
    data: null,
    message: error,
  });

  server_error_response = (error = null) => ({
    status: {
      code: 500,
      success: false,
    },
    data: null,
    message: error,
  });

  conflict_response = (error = null, data = null) => ({
    status: {
      code: 409,
      success: false,
    },
    data,
    message: error,
  });

  unprocessable_entity_response = (error = null, data = null) => ({
    status: {
      code: 422,
      success: false,
    },
    data,
    message: error,
  });

  no_content_response = () => ({
    status: {
      code: 204,
      success: true,
    },
    data: null,
    message: null,
  });

  service_unavailable_response = (error = null) => ({
    status: {
      code: 503,
      success: false,
    },
    data: null,
    message: error,
  });
}

module.exports = Responses;
