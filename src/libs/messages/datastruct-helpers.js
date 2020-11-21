/*********************************************************************
 * AircraftClass :: Define Message Struct
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-06
 **********************************************************************/

export const comboSendMessage = (apiType, data) => {};

/**
 *
 * @param {string} apiType
 * @param {object} error [code,message]
 * @param {object} respData
 */
export const comboResponseMessage = (apiType, error, respData) => {
  if (typeof apiType !== 'string') throw 'apiType illegal.';
  const RespMessage = {
    apiType,
    data: respData,
  };

  if (error) {
    if (!'code' in error) {
      throw `error paramerter illegal,maybe lost code. ${error}`;
    }
    RespMessage.error = error;

    return RespMessage;
  }

  return RespMessage;
};

export const buildErrorResponseMessage = (apiType, err) => {
  if (typeof apiType !== 'string') throw 'apiType miss.';
  let exData = {};
  if (typeof err === 'object' && err.code) {
    exData = {
      code: err.code,
      message: err.message || '',
    };
  } else {
    exData = {
      code: '',
      message: err.toString() || 'unknow error.',
    };
  }

  return {
    apiType,
    error: exData,
  };
};

export const buildResponseMessage = (apiType, data) => {
  if (typeof apiType !== 'string') throw 'apiType miss.';
  return {
    apiType,
    data,
  };
};
