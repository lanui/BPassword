import { UNKONW_ERROR } from './error-codes';

// function BPError(message, code) {
//   this.message = message || 'unknow error.';
//   this.name = 'BPError';

//   this.code = code || UNKONW_ERROR;

//   Error.captureStackTrace(this, BPError);
// }

// BPError.prototype = new BPError();
// BPError.prototype.constructor = BPError;

// BPError.prototype.getError = function () {
//   return {
//     code: this.code,
//     message: this.message,
//   };
// };

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-20
 *    @comments: Firefox Addon can't support Origin captureStackTrace
 **********************************************************************/
class BPError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'BPError';
    this.code = code || UNKONW_ERROR;

    // Error.captureStackTrace(this,this.constructor)
  }

  getError() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export default BPError;
