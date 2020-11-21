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
  const webPlain = state.webPlain;
  console.log('>>>>>>>>', webPlain);
  if (
    !webPlain ||
    !webPlain.ChainData ||
    !Array.isArray(webPlain.Commit) ||
    !Array.isArray(webPlain.Trash)
  ) {
    return '';
  }

  let commitLen = webPlain.Commit.length,
    deleteLen = webPlain.Trash.length;

  let addLen = webPlain.View.length - webPlain.ChainData.length;

  const diff = commitLen - deleteLen == 0 ? addLen : commitLen - deleteLen;
  if (diff === 0) return '';
  return diff > 0 ? '+' + diff : '' + diff;
};

export const mobdiff = (state) => {
  const Plain = state.mobPlain;
  if (!Plain || !Plain.ChainData || !Array.isArray(Plain.Commit) || !Array.isArray(Plain.Trash)) {
    return '';
  }

  let addLen = Plain.View.length - Plain.ChainData.length;
  let diff = Plain.Commit.length - Plain.Trash.length;
  !diff && (diff = addLen);

  if (diff === 0) return '';
  return diff > 0 ? '+' + diff : '' + diff;
};

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
