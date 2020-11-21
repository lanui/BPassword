/*********************************************************************
 * AircraftClass :: Pipe Helper
 *     @Description: handle Stream pipe
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-06
 **********************************************************************/

import ObjectMultiplex from 'obj-multiplex';
import pump from 'pump';

/**
 *
 * @param {*} connectionStream
 */
export function setupMultiplex(connectionStream) {
  const mux = new ObjectMultiplex();
  /**
   *
   */
  pump(connectionStream, mux, connectionStream, (err) => {
    if (err) {
      console.error(err);
    }
  });

  return mux;
}
