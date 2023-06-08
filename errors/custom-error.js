// class CustomErrorAPI extends Error {
//     constructor(message , statusCode){
//         super(message)
//         this.statusCode = statusCode
//     }
// }

// module.exports = CustomErrorAPI

function customErrorAPI(message, statusCode) {
  // Create an Error object.
  const error = new Error(message);

  // Set the status code on the error object.
  error.statusCode = statusCode;

  // Return the error object.
  return error;
}

module.exports = customErrorAPI;
