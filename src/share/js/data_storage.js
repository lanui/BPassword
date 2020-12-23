const CmdAdd = 0x1;
const CmdDelete = 0x2;
const CmdChange = 0x3;
const GroupSeparator = 0x1c;
const RecordSeparator = 0x1e;
const UnitSeparator = 0x1f;

//---------------------------logic of cmd------------------------
function Term(t, n, p) {
  this.title = t;
  this.name = n;
  this.password = p;
}

Term.prototype.equal = function (other) {
  if (this.title == other.title && this.name == other.name && this.password == other.password) {
    return true;
  }
  return false;
};

function Cmd(type, term) {
  if (type == CmdAdd || type == CmdDelete || type == CmdChange) {
    this.CType = type;
    this.Term = term;
  } else {
    throw 'not a valid cmd type';
  }
}

Cmd.prototype = {
  pack: function () {
    p = [];
    p.push(this.CType);
    p.push(RecordSeparator);
    switch (this.CType) {
      case CmdAdd:
        p = p.concat(Buffer.from(this.Term.title).toJSON().data);
        p.push(UnitSeparator);
        p = p.concat(Buffer.from(this.Term.name).toJSON().data);
        p.push(UnitSeparator);
        p = p.concat(Buffer.from(this.Term.password).toJSON().data);
        break;
      case CmdDelete:
        p = p.concat(Buffer.from(this.Term.title).toJSON().data);
        break;
      case CmdChange:
        p = p.concat(Buffer.from(this.Term.title).toJSON().data);
        p.push(UnitSeparator);
        p = p.concat(Buffer.from(this.Term.name).toJSON().data);
        p.push(UnitSeparator);
        p = p.concat(Buffer.from(this.Term.password).toJSON().data);
        break;
    }
    return p;
  },
  unpack: function (p) {
    cType = p[0];
    ls = splitBytesArray(p.slice(2), UnitSeparator);
    if (cType == CmdDelete) {
      _term = ls.map((x) => Buffer.from(x).toString());
      this.Term = new Term(_term[0], null, null);
    } else {
      if (ls.length != 3) {
        throw 'bad format of term';
      }
      _term = ls.map((x) => Buffer.from(x).toString());
      this.CType = cType;
      if (_term.length != 3) {
        throw 'bad format';
      }
      this.Term = new Term(_term[0], _term[1], _term[2]);
    }
  },
  check: function () {
    if (this.CType != CmdAdd && this.CType != CmdDelete && this.CType != CmdChange) {
      return false;
    }
    if (this.Term.title.length == 0) {
      return false;
    }
    if (this.CType == CmdAdd || this.CType == CmdChange) {
      if (this.Term.name.length == 0 || this.Term.password.length == 0) {
        return false;
      }
    }
    return true;
  },
};

//-------------------logic of NoConflictMerge---------------------
function NoConflictMerge() {
  this.data = [];
}

NoConflictMerge.prototype = {
  searchTitle: function (title) {
    if (this.data.length == 0) {
      return -1;
    }
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i].title == title) {
        return i;
      }
    }
    return -1;
  },
  searchTerm: function (term) {
    if (this.data.length == 0) {
      return -1;
    }
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i].equal(term)) {
        return i;
      }
    }
    return -1;
  },
  addRespectNew: function (term) {
    index = this.searchTitle(term.title);
    if (index != -1) {
      old = this.data[index];
      this.data[index] = term;
      return old;
    } else {
      this.data.push(term);
    }
  },
  deleteRespectNew: function (term) {
    index = this.searchTitle(term.title);
    if (index != -1) {
      d = this.data[index];
      this.data = this.data.slice(0, index).concat(this.data.slice(index + 1));
      return d;
    }
  },
  changeRespectNew: function (term) {
    return this.addRespectNew(term);
  },
  addRespectOld: function (term) {
    index = this.searchTitle(term.title);
    if (index != -1) {
      return term;
    } else {
      this.data.push(term);
    }
  },
  deleteRespectOld: function (term) {
    return this.deleteRespectNew(term);
  },
  changeRespectOld: function (term) {
    index = this.searchTitle(term.title);
    if (index != -1) {
      if (this.data[index].equal(term)) {
        //duplicated, do nothing
      } else {
        old = this.data[index];
        this.data[index] = term;
        return old;
      }
    }
  },
};

//---------------------chain cmd array----------------------------
function ChainCmdArray() {
  this.data = [];
}

ChainCmdArray.prototype.DecryptChainCmdArray = function (key, bytes) {
  if (bytes == null || bytes.length == 0) {
    throw 'nothing to decrypt';
  }
  var plainTxt = BPDecryptB(key, bytes);
  var ls = splitBytesArray(plainTxt, GroupSeparator);
  var cs = [];
  for (var i = 0; i < ls.length; i++) {
    var c = new Cmd(1, null); // those values will be overwrite by unpack
    try {
      c.unpack(ls[i]);
      cs.push(c);
    } catch (err) {
      console.log(err);
      continue;
    }
  }
  this.data = cs;
};

//-------------------logic of local cmd array---------------------
function LocalCmdArray() {
  this.data = []; // array of cmds
}

LocalCmdArray.prototype = {
  backwardCmdSearch: function (cmd) {
    if (this.data.length == 0) {
      return -1;
    }
    for (var i = this.data.length - 1; i > -1; i--) {
      d = this.data[i];
      if (d.CType == cmd.CType && d.Term.title == cmd.Term.title) {
        return i;
      }
    }
    return -1;
  },
  backwardTitleSearch: function (cmd) {
    if (this.data.length == 0) {
      return -1;
    }
    for (var i = this.data.length - 1; i > -1; i--) {
      if (this.data[i].Term.title == cmd.Term.title) {
        return i;
      }
    }
    return -1;
  },
  remove: function (index) {
    if (index == -1 || this.data.length == 0) {
      return;
    }
    this.data = this.data.slice(0, index).concat(this.data.slice(index + 1));
  },
  removeAllTitle: function (title) {
    clear = [];
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i].Term.title != title) {
        clear.push(this.data[i]);
      }
    }
    this.data = clear;
  },
  pack: function () {
    r = [];
    if (this.data.length == 0) {
      return p;
    }
    for (var i = 0; i < this.data.length - 1; i++) {
      p = this.data[i].pack();
      r = r.concat(p);
      r.push(GroupSeparator);
    }
    r = r.concat(this.data[this.data.length - 1].pack());
    return r;
  },
  encrypt: function (aesKey) {
    p = this.pack();
    return BPEncryptB(aesKey, p);
  },
};

//@param {chainData} NoConflictMerge data from block chain
LocalCmdArray.prototype.pushCmd = function (cmd, chainData) {
  if (!cmd.check()) {
    throw 'cmd check failed';
  }
  if (chainData == null) {
    chainData = new NoConflictMerge();
  }
  index = this.backwardTitleSearch(cmd);
  prev = this.data[index];
  switch (cmd.CType) {
    case CmdAdd:
      if (index != -1) {
        switch (prev.CType) {
          case CmdAdd:
            throw 'reject, find other add cmd locally';
          case CmdDelete:
            this.remove(index);
            this.pushCmd(new Cmd(CmdChange, cmd.Term), chainData);
            break;
          case CmdChange:
            throw 'reject, find other change cmd locally';
        }
      } else {
        if (chainData.searchTitle(cmd.Term.title) != -1) {
          throw 'reject, find other term on chain';
        } else {
          this.data.push(cmd);
        }
      }
      return this;
    case CmdDelete:
      if (index != -1) {
        switch (prev.CType) {
          case CmdAdd:
            this.remove(index);
            if (chainData.searchTitle(cmd.Term.title) != -1) {
              this.data.push(cmd);
            }
            break;
          case CmdDelete:
            throw 'reject, find other delete locally';
          case CmdChange:
            this.remove(index);
            this.pushCmd(cmd, chainData);
            break;
        }
      } else {
        if (chainData.searchTitle(cmd.Term.title) != -1) {
          this.data.push(cmd);
        } else {
          throw 'reject, no where to find term';
        }
      }
      return this;
    case CmdChange:
      if (index != -1) {
        switch (prev.CType) {
          case CmdAdd:
            this.data[index] = new Cmd(CmdAdd, cmd.Term);
            break;
          case CmdDelete:
            throw 'reject, find delete locally';
          case CmdChange:
            this.remove(index);
            this.pushCmd(cmd, chainData);
            break;
        }
      } else {
        if (chainData.searchTitle(cmd.Term.title) != -1) {
          this.data.push(cmd);
        } else {
          throw 'reject, no where to find term';
        }
      }
      return this;
  }
  throw 'logic error, code should not be reached';
};

//---------------------------Trash--------------------------------
function Trash() {
  this.data = [];
}

Trash.prototype = {
  add: function (term) {
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i].equal(term)) {
        return;
      }
    }
    this.data.push(term);
  },

  addAll: function (terms) {
    for (var i = 0; i < terms.length; i++) {
      this.add(terms[i]);
    }
  },

  removeDuplicate: function (terms) {
    var clean = [];
    var noConflictMerge = new NoConflictMerge();
    noConflictMerge.data = terms;
    for (var j = 0; j < this.data.length; j++) {
      if (noConflictMerge.searchTerm(this.data[j]) == -1) {
        clean.push(this.data[j]);
      }
    }
    this.data = clean;
  },
};

//----------------------file management---------------------------
function PlainTxt() {
  this.ChainData = new NoConflictMerge();
  this.Commit = new LocalCmdArray();
  this.View = new NoConflictMerge();
  this.Trash = new Trash();
  this.BlockNumber = 0;
  this.Hash = '';
}

PlainTxt.prototype = {
  unwrap: function () {
    return {
      ChainData: this.ChainData.data,
      Commit: this.Commit.data,
      View: this.View.data,
      Trash: this.Trash.data,
      BlockNumber: this.BlockNumber,
      Hash: this.Hash,
    };
  },
  encrypt: function (key) {
    var j = JSON.stringify(this.unwrap());
    return BPEncryptB(key, j).toString('base64');
  },
  acceptBlockCmd: function (cmds) {
    for (var i = 0; i < cmds.data.length; i++) {
      var v = cmds.data[i];
      switch (v.CType) {
        case CmdAdd:
          var t = this.ChainData.addRespectNew(v.Term);
          if (t != null) {
            this.Trash.add(t);
          }
          this.Commit.removeAllTitle(v.Term.title);
          break;
        case CmdDelete:
          var t = this.ChainData.deleteRespectNew(v.Term);
          if (t != null) {
            this.Trash.add(t);
            this.Commit.removeAllTitle(v.Term.title);
          }
          break;
        case CmdChange:
          var t = this.ChainData.changeRespectNew(v.Term);
          if (t != null) {
            this.Trash.add(t);
            this.Commit.removeAllTitle(v.Term.title);
          }
          break;
      }
    }
    this.View = new NoConflictMerge();
    for (var i = 0; i < this.ChainData.data.length; i++) {
      this.View.data.push(this.ChainData.data[i]);
    }
  },
  mergeLocal: function () {
    for (var i = 0; i < this.Commit.data.length; i++) {
      var v = this.Commit.data[i];
      switch (v.CType) {
        case CmdAdd:
          var t = this.View.addRespectOld(v.Term);
          if (t != null) {
            this.Trash.add(v.Term);
          }
          break;
        case CmdDelete:
          var t = this.View.deleteRespectOld(v.Term);
          if (t != null) {
            this.Trash.add(v.Term);
          }
          break;
        case CmdChange:
          var t = this.View.changeRespectOld(v.Term);
          if (t != null) {
            this.Trash.add(v.Term);
          }
          break;
      }
    }
    this.Trash.removeDuplicate(this.View);
  },
};

function decryptToPlainTxt(key, cipher64) {
  var b = BPDecryptB(key, Buffer.from(cipher64, 'base64'));
  var obj = JSON.parse(Buffer.from(b).toString());
  var p = new PlainTxt();
  //do some wrapping
  for (let i = 0; i < obj.ChainData.length; i++) {
    let t = obj.ChainData[i];
    p.ChainData.data.push(new Term(t.title, t.name, t.password));
  }
  for (let i = 0; i < obj.Commit.length; i++) {
    let t = obj.Commit[i];
    p.Commit.data.push(new Cmd(t.CType, new Term(t.Term.title, t.Term.name, t.Term.password)));
  }
  for (let i = 0; i < obj.View.length; i++) {
    let t = obj.View[i];
    p.View.data.push(new Term(t.title, t.name, t.password));
  }
  for (let i = 0; i < obj.Trash.length; i++) {
    let t = obj.Trash[i];
    p.Trash.data.push(new Term(t.title, t.name, t.password));
  }
  p.BlockNumber = obj.BlockNumber;
  p.Hash = obj.Hash;
  return p;
}

function FileInterface(p, c) {
  this.Plain = p;
  this.Cypher64 = c;
}

function deriveFileFromPlainTxt(key, p) {
  return new FileInterface(p, p.encrypt(key));
}

//---------------------exposed functions-------------------------

function InitFile(key) {
  var p = new PlainTxt();
  return new FileInterface(p, p.encrypt(key));
}

function RecoverLocal(key, cipher64) {
  return new FileInterface(decryptToPlainTxt(key, cipher64), cipher64);
}

function UpdateBlockData(key, cipher64, blockNumber, lastTxHash, logs) {
  var p = decryptToPlainTxt(key, cipher64);
  if (p.Hash != lastTxHash) {
    for (var i = 0; i < logs.length; i++) {
      var v = logs[i];
      var cmdArray = new ChainCmdArray();
      cmdArray.DecryptChainCmdArray(key, v);
      p.acceptBlockCmd(cmdArray);
    }
    p.mergeLocal();
    p.BlockNumber = blockNumber;
    p.Hash = lastTxHash;
  }
  return deriveFileFromPlainTxt(key, p);
}

function UpdateCmdAdd(key, cipher64, term) {
  var p = decryptToPlainTxt(key, cipher64);
  p.Commit.pushCmd(new Cmd(CmdAdd, term), p.ChainData);
  var junk = p.View.addRespectOld(term);
  if (junk != null) {
    throw "can't update view by Cmd add of this term: " + JSON.stringify(term);
  }
  return deriveFileFromPlainTxt(key, p);
}

function UpdateCmdDelete(key, cipher64, term) {
  var p = decryptToPlainTxt(key, cipher64);
  p.Commit.pushCmd(new Cmd(CmdDelete, term), p.ChainData);
  var junk = p.View.deleteRespectOld(term);
  if (junk == null) {
    throw "can't update view by Cmd delete of this term: " + JSON.stringify(term);
  }
  p.Trash.add(junk);
  return deriveFileFromPlainTxt(key, p);
}

function UpdateCmdChange(key, cipher64, term) {
  var p = decryptToPlainTxt(key, cipher64);
  p.Commit.pushCmd(new Cmd(CmdChange, term), p.ChainData);
  var junk = p.View.changeRespectOld(term);
  if (junk == null) {
    throw "can't update view by Cmd change of this term: " + JSON.stringify(term);
  }
  p.Trash.add(junk);
  return deriveFileFromPlainTxt(key, p);
}

function ExtractCommit(key, cipher64) {
  var p = decryptToPlainTxt(key, cipher64);
  return p.Commit.encrypt(key);
}

//-------------------cryptography functions-----------------------
function toKey32(key) {
  if (key.length < 32) {
    throw 'invalid key size';
  }
  return key.slice(0, 32);
}

//bad news, I have to impelement padding, good news, cfb is stream cipher
function padding16(txt) {
  var buffer = Buffer.from(txt);
  var left = 16 - (buffer.length % 16);
  if (left == 0) {
    return [buffer, 0];
  }
  return [appendBuffer(buffer, zeros(left)), left];
}

function aesEncrypt(key, plainTxt) {
  var key = toKey32(key);
  var padded = padding16(plainTxt);
  var iv = getRandomBuffer(16);
  var aesCfb = new aesjs.ModeOfOperation.cfb(key, iv, 16);
  var encryptedBytes = aesCfb.encrypt(padded[0]);
  return appendBuffer(iv, encryptedBytes.slice(0, encryptedBytes.length - padded[1]));
}

function aesDecrypt(key, cipherTxt) {
  var key = toKey32(key);
  var padded = padding16(cipherTxt);
  var iv = cipherTxt.slice(0, 16);
  var c = padded[0].slice(16);
  var aesCfb = new aesjs.ModeOfOperation.cfb(key, iv, 16);
  var plainBytes = aesCfb.decrypt(c);
  return plainBytes.slice(0, plainBytes.length - padded[1]);
}

function BPEncryptB(key, plainTxt) {
  key = ed25519ToCurve25519(key);
  return aesEncrypt(key, plainTxt);
}

function BPDecryptB(key, Cypher64) {
  key = ed25519ToCurve25519(key);
  return aesDecrypt(key, Cypher64);
}

function ed25519ToCurve25519(secretKey) {
  return ed2curve.convertSecretKey(secretKey);
}

const options = {
  kdf: 'scrypt',
  cipher: 'aes-128-ctr',
  kdfparams: {
    n: 262144,
    dklen: 32,
    prf: 'hmac-sha256',
  },
};

function generateWallet(password) {
  generateWallet2(password)[0];
}

function generateWallet2(password) {
  // create eth account
  var params = {
    keyBytes: 32,
    ivBytes: 16,
  };
  var edk = keythereum.create(params);
  var keyObject = keythereum.dump(password, edk.privateKey, edk.salt, edk.iv, options);
  //create ed25519 keypair
  var ed25519KeyPair = nacl.sign.keyPair();
  //derive aes key
  var determinsticSalt = ed25519KeyPair.publicKey.slice(0, 8);
  var pass = Buffer.from(password);
  var dk = keythereum.deriveKey(Buffer.from(pass), determinsticSalt, {
    kdf: 'scrypt',
    kdfparams: {
      n: 32768,
    },
  });
  //encrypt ed25519 priKey
  var cipher = aesEncrypt(dk, ed25519KeyPair.secretKey);
  //base58 encode
  var base58Cipher = bs58.encode(cipher);
  //output wallet
  var subAddr = 'BP' + bs58.encode(ed25519KeyPair.publicKey);
  var pWallet = {
    version: 1,
    mainAddress: '0x' + keyObject.address,
    crypto: keyObject.crypto,
    subAddress: subAddr,
    subCipher: base58Cipher,
  };
  return [pWallet, edk.privateKey, ed25519KeyPair.secretKey];
}

function generateWalletAsync(password) {
  return new Promise(function (resolve, reject) {
    try {
      setTimeout(function () {
        let w = generateWallet(password);
        resolve(w);
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
}

function openWallet(pWallet, password) {
  //open keystore
  var keyObject = {
    crypto: pWallet.crypto,
  };
  var privateKey = keythereum.recover(password, keyObject);
  //recover publicKey
  var ed25519PublicKey = bs58.decode(pWallet.subAddress.slice(2));
  //derive aes key
  var determinsticSalt = ed25519PublicKey.slice(0, 8);
  var pass = Buffer.from(password);
  var dk = keythereum.deriveKey(Buffer.from(pass), determinsticSalt, {
    kdf: 'scrypt',
    kdfparams: {
      n: 32768,
    },
  });
  //decrypt sub privateKey
  var cipher = bs58.decode(pWallet.subCipher);
  var iv = cipher.slice(0, 16);
  var aesCfb = new aesjs.ModeOfOperation.cfb(dk, iv, 16);
  var subPriKey = aesCfb.decrypt(cipher.slice(16));
  return {
    MainPriKey: privateKey,
    SubPriKey: subPriKey,
  };
}

function openWalletAsync(pWallet, password) {
  return new Promise(function (resolve, reject) {
    try {
      setTimeout(function () {
        let keys = openWallet(pWallet, password);
        resolve(keys);
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
}

//implemented by frontend
// function closeWallet(){}

function exportEth(pWallet, password) {
  var keyObject = {
    crypto: pWallet.crypto,
  };
  var privateKey = keythereum.recover(password, keyObject);
  return keythereum.dump(
    password,
    privateKey,
    keyObject.crypto.kdfparams.salt,
    keyObject.crypto.cipherparams.iv,
    options
  );
}

//-------------------some utils-----------------------------
function appendBuffer(A, B) {
  var r = [];
  for (var i = 0; i < A.length; i++) {
    r.push(A[i]);
  }
  for (var j = 0; j < B.length; j++) {
    r.push(B[j]);
  }
  return Buffer.from(r);
}

function splitBytesArray(bytes, delimiter) {
  var array = [];
  if (bytes.length == 0) {
    return array;
  }

  var lastIndex = 0;
  for (var i = 0; i < bytes.length; i++) {
    if (bytes[i] == delimiter) {
      if (i == lastIndex) {
        continue;
      }
      array.push(bytes.slice(lastIndex, i));
      lastIndex = i + 1;
    }
  }
  if (lastIndex < bytes.length) {
    array.push(bytes.slice(lastIndex));
  }
  return array;
}

function getRandomBuffer(size) {
  var l = [];
  for (var i = 0; i < size; i++) {
    l.push(Math.floor(Math.random() * 256));
  }
  return Buffer.from(l);
}

function zeros(size) {
  var b = [];
  for (var i = 0; i < size; i++) {
    b.push(0);
  }
  return Buffer.from(b);
}
