/*********************************************************************
 * AircraftClass :: Passbook
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-10-29
 **********************************************************************/

export const webdiff = (state) => {
  const Plain = state.webPlain;
  if (!Plain || !Array.isArray(Plain.ChainData) || !Array.isArray(Plain.View)) {
    return '';
  }

  const viewLen = Plain.View.length,
    chainLen = Plain.ChainData.length;
  return calcDiffText(viewLen, chainLen);
};

export const mobdiff = (state) => {
  const Plain = state.mobPlain;
  if (!Plain || !Plain.ChainData || !Array.isArray(Plain.View) || !Array.isArray(Plain.ChainData)) {
    return '';
  }
  const viewLen = Plain.View.length,
    chainLen = Plain.ChainData.length;
  return calcDiffText(viewLen, chainLen);
};

function calcDiffText(viewLen = 0, chainLen = 0) {
  const diff = viewLen - chainLen;
  if (diff === 0) return '';
  return diff > 0 ? `+${diff}` : diff.toString();
}

/**
 *
 * @param {Array} state []
 */
export const webItemsState = (state) => {
  return state.webItems;
};

export const mobItemsState = (state) => {
  return state.mobItems;
};
