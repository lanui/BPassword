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
  if (!Plain || !Array.isArray(Plain.Commit) || Plain.Commit.length == 0) {
    return '';
  }

  let add = 0,
    del = 0;
  Plain.Commit.forEach((c) => {
    if (c.CType == 1) {
      add += 1;
    }
    if (c.CType == 2) {
      del += 1;
    }
  });

  return add > 0 ? '+' + add : del > 0 ? '-' + del : '';
};

export const mobdiff = (state) => {
  const Plain = state.mobPlain;
  if (!Plain || !Plain.Commit || !Array.isArray(Plain.Commit) || !Plain.Commit.length) {
    return '';
  }
  let add = 0,
    del = 0;
  Plain.Commit.forEach((c) => {
    if (c.CType == 1) {
      add += 1;
    }
    if (c.CType == 2) {
      del += 1;
    }
  });

  return add > 0 ? '+' + add : del > 0 ? '-' + del : '';
};

function diffCalcPlain(Plain) {
  if (!Plain) {
    return '';
  }

  let vLen = Plain.View.length,
    chainLen = Plain.ChainData.length,
    delLen = Plain.Trash.length,
    commitLen = Plain.Commit.length;

  let diff = vLen - chainLen;
  if (diff !== 0) {
    return diff > 0 ? `+${diff}` : '' + diff;
  }

  let dLen = Plain.Commit.filter((c) => c.CType == 2).length;
  if (dLen) {
    return '-' + dLen;
  }
  return '';
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
