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
  return diffCalcPlain(Plain);
};

export const mobdiff = (state) => {
  const Plain = state.mobPlain;
  return diffCalcPlain(Plain);
};

/**
 *
 * @param {object} Plain
 */
function diffCalcPlain(Plain) {
  if (!Plain || !Plain.Commit || !Array.isArray(Plain.Commit) || !Plain.Commit.length) {
    return '';
  }
  let add = 0,
    del = 0,
    edit = 0;
  Plain.Commit.forEach((c) => {
    if (c.CType == 1) {
      add += 1;
    }
    if (c.CType == 2) {
      del += 1;
    }
    if (c.CType == 3) {
      edit += 1;
    }
  });

  if (add > 0) return `+${add}`;
  if (del > 0) return `-${del}`;
  if (edit > 0) return edit.toString();
}

function diffCalcCommit(commits = []) {
  let add = 0,
    del = 0;
  commits.forEach((c) => {
    if (c.CType == 1) {
      add += 1;
    }
    if (c.CType == 2) {
      del += 1;
    }
  });

  return add > 0 ? '+' + add : del > 0 ? '-' + del : '';
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

export const websiteCommitItems = (state) => {
  return state.webPlain.Commit.map((it) => {
    it.title = it.Term.title;
    return it;
  });
};

export const mobileCommitItems = (state) => {
  return state.mobPlain.Commit.map((it) => {
    it.title = it.Term.title;
    return it;
  });
};
