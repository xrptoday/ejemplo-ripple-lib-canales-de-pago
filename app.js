const {RippleAPI} = require('ripple-lib'),
      chalk = require('chalk'),
      log = console.log,
      api = new RippleAPI({
        server: 'wss://s.altnet.rippletest.net:51233' // Testnet
      }),
      keypairs = require('ripple-keypairs'),
      instructions = {maxLedgerVersionOffset: 5},
      AddressPayer = '', // Marta
      AddressPayerSecret = '', // Secreto de Marta
      AddressPayee = '', // eNews
      AddressPayeeDestinationTag = 0, // Opcional: Destination Tag de eNews
      ChannelPublicKeyHex = '', // Clave publica del canal (hex)
      ChannelPrivateKeyHex = '', // Clave privada para firmar operaciones en el canal (hex)
      settlementDelay = 86400 // Retraso forzado para que eNews pueda finalizar la liquidacion - 1 Dia en este ejemplo

let   canalDePago = {
          "amount": null,
          "destination": AddressPayee,
          "destinationTag": AddressPayeeDestinationTag,
          "settleDelay": settlementDelay,
          "publicKey": ChannelPublicKeyHex
      }

let trxhash

function fallar(mensaje) {
  log(chalk.red(mensaje))
  process.exit(1)
}

function salir() {
  process.exit(1)
}

function generarParDeClaves() {
  const par = keypairs.deriveKeypair(keypairs.generateSeed())
  log(chalk.blue('Clave Privada',par.privateKey))
  log(chalk.blue('Clave Publica',par.publicKey))
  process.exit(0)
}

function crearCanalDePago(valor) {
  return new Promise(function(resolve, reject) {
    canalDePago.amount = valor
    log(chalk.blue('canalDePago'))
    log(chalk.grey(JSON.stringify(canalDePago)))
    api.connect().then(() => {
      log(chalk.green('Conectados a Ripple'))
      return api.preparePaymentChannelCreate(AddressPayer, canalDePago, instructions).then(prepared => {
        log(chalk.blue('Transaccion canal de pago preparada...'))
        log(chalk.grey(JSON.stringify(prepared)))
        const {signedTransaction,id} = api.sign(prepared.txJSON, AddressPayerSecret)
        log(chalk.blue('Transaccion canal de pago firmada...'))
        log(chalk.grey('id: ',id))
        trxhash = id
        api.submit(signedTransaction).then(function(result) {
          if (result.resultCode === 'tesSUCCESS') {
            // Transaccion enviada, hash asignado a trxhash para su validacion en el evento ledger
            log(chalk.green('Transaccion canal de pago enviada correctamente'))
            resolve('Transaccion canal de pago enviada correctamente')
          } else if (result.resultCode ==='terQUEUED') {
            log(chalk.yellow('Transaccion canal de pago enviada correctamente pero encolada'))
            resolve('Transaccion canal de pago enviada correctamente pero encolada')
          } else {
            reject('Transaccion canal de pago en error: ' + result.resultCode + ' ' + result.resultMessage)
          }
        }, fallar)
      })
    }).catch((e) => {
      reject(e)
    })
  })
}

function getCanalDePago(id) {
  return new Promise(function(resolve, reject) {
    api.connect().then(() => {
      log(chalk.green('Conectados a Ripple'))
      return api.getPaymentChannel(id).then(canal => {
        log(chalk.blue('Detalles del canal de pago: ',id))
        log(chalk.grey(JSON.stringify(canal)))
        resolve()
      })
    }).catch((e) => {
      reject(e)
    })
  })
}

function cerrarCanalDePago(id) {
  const claimCanalDePago = {
    'channel': id,
    'close': true
  }
  log(chalk.blue('cerrarCanalDePago'))
  log(chalk.grey(JSON.stringify(claimCanalDePago)))
  return new Promise(function(resolve, reject) {
    api.connect().then(() => {
      log(chalk.green('Conectados a Ripple'))
      return api.preparePaymentChannelClaim(AddressPayer, claimCanalDePago, instructions).then(prepared => {
        log(chalk.blue('Transaccion cerrar canal de pago preparada...'))
        log(chalk.grey(JSON.stringify(prepared)))
        const {signedTransaction,id} = api.sign(prepared.txJSON, AddressPayerSecret)
        log(chalk.blue('Transaccion cerrar canal de pago firmada...'))
        log(chalk.grey('id: ',id))
        trxhash = id
        api.submit(signedTransaction).then(function(result) {
          if (result.resultCode === 'tesSUCCESS') {
            // Transaccion enviada
            log(chalk.green('Transaccion cerrar canal de pago enviada correctamente'))
            resolve('Transaccion cerrar canal de pago enviada correctamente')
          } else if (result.resultCode ==='terQUEUED') {
            log(chalk.yellow('Transaccion cerrar canal de pago enviada correctamente pero encolada'))
            resolve('Transaccion cerrar canal de pago enviada correctamente pero encolada')
          } else {
            reject('Transaccion cerrar canal de pago en error: ' + result.resultCode + ' ' + result.resultMessage)
          }
        }, fallar)
      })
    }).catch((e) => {
      reject(e)
    })
  })
}

function generarClaimCanalDePago(canal, valor) {
  return new Promise(function(resolve, reject) {
    api.connect().then(() => {
      log(chalk.green('Conectados a Ripple'))
      log(chalk.blue('Claim de canal de pago firmado:'))
      log(chalk.grey(api.signPaymentChannelClaim(canal, valor, ChannelPrivateKeyHex)))
      resolve()
    }).catch((e) => {
      reject(e)
    })
  })
}

function hacerClaimCanalDePago(canal, valor, firma) {
  return new Promise(function(resolve, reject) {
    const claimCanalDePago = {
      'channel': canal,
      'balance': valor,
      'signature': firma,
      'publicKey': ChannelPublicKeyHex
    }
    log(chalk.blue('claimCanalDePago'))
    log(chalk.grey(JSON.stringify(claimCanalDePago)))
    api.connect().then(() => {
      log(chalk.green('Conectados a Ripple'))
      return api.preparePaymentChannelClaim(AddressPayer, claimCanalDePago, instructions).then(prepared => {

        const {signedTransaction,id} = api.sign(prepared.txJSON, AddressPayerSecret)

        api.submit(signedTransaction).then(function(result) {
          if (result.resultCode === 'tesSUCCESS') {
            // Transaccion enviada, hash asignado a trxhash para su validacion en el evento ledger
            resolve('Transaccion claim canal de pago enviada correctamente')
          } else if (result.resultCode ==='terQUEUED') {
            resolve('Transaccion claim canal de pago enviada correctamente pero encolada')
          } else {
            reject('Transaccion claim canal de pago en error: ' + result.resultCode + ' ' + result.resultMessage)
          }
        }, fallar)
      })
    }).catch((e) => {
      reject(e)
    })
  })
}

function verificarClaimCanalDePago(canal, valor, firma) {
  return new Promise(function(resolve, reject) {
    api.connect().then(() => {
      log(chalk.green('Conectados a Ripple'))
      log(chalk.blue('Verificacion de claim de canal de pago firmado:'))
      log(chalk.grey(api.verifyPaymentChannelClaim(canal, valor, firma, ChannelPublicKeyHex)))
      resolve()
    }).catch((e) => {
      reject(e)
    })
  })
}

switch (process.env.modo) {

  case 'generarParDeClaves':
    generarParDeClaves()
    break
  case 'crearCanalDePago':
    if (!process.env.valor) fallar('Especifica un valor')
    crearCanalDePago(process.env.valor)
    .then(() => {
      // Esperamos a confirmar la transaccion en el ledger
      // No salimos
    })
    .catch((e) => {
      fallar(e)
    })
    break
  case 'cerrarCanalDePago':
    if (!process.env.id) fallar('Especifica un id')
    cerrarCanalDePago(process.env.id,true)
    .then(() => {
      salir()
    })
    .catch((e) => {
      fallar(e)
    })
    break
  case 'detallesCanalDePago':
    if (!process.env.id) fallar('Especifica un id de canal de pago')
    getCanalDePago(process.env.id)
    .then(() => {
      salir()
    })
    .catch((e) => {
      fallar(e)
    })
    break
  case 'generarClaimCanalDePago':
    if (!process.env.id || !process.env.valor) fallar('Especifica un id de canal de pago y un valor')
    generarClaimCanalDePago(process.env.id,process.env.valor)
    .then(() => {
      salir()
    })
    .catch((e) => {
      fallar(e)
    })
    break
  case 'verificarClaimCanalDePago':
    if (!process.env.id || !process.env.valor || !process.env.firma) fallar('Especifica un id de canal de pago, un valor y una firma')
    verificarClaimCanalDePago(process.env.id,process.env.valor,process.env.firma)
    .then(() => {
      salir()
    })
    .catch((e) => {
      fallar(e)
    })
    break
  case 'hacerClaimCanalDePago':
    if (!process.env.id || !process.env.valor || !process.env.firma) fallar('Especifica un id de canal de pago, un valor y una firma')
    hacerClaimCanalDePago(process.env.id,process.env.valor,process.env.firma)
    .then(() => {
      salir()
    })
    .catch((e) => {
      fallar(e)
    })
    break
  case 'cerrarCanalDePago':
    if (!process.env.id) fallar('Especifica un id de canal de pago')
    cerrarCanalDePago(process.env.id)
    .then(() => {
      salir()
    })
    .catch((e) => {
      fallar(e)
    })
    break

  default:
    fallar('Modo no reconocido')
}

api.on('ledger', ledger => {
    api.getLedger({
      includeAllData: true,
      includeTransactions: true,
      ledgerVersion: ledger.ledgerVersion
    })
    .then(results => {
      let _json = JSON.parse(results.rawTransactions)
      for (let x=0;x<_json.length;x++) {
        if (_json[x].hash===trxhash) {
          _curr = _json[x].metaData
          for (let i = 0; i < _curr.AffectedNodes.length; i++) {
            _affectedNode = _curr.AffectedNodes[i]
            if (_affectedNode.CreatedNode && _affectedNode.CreatedNode.LedgerEntryType === 'PayChannel') {
              log(chalk.green('Id del Canal de Pago:',_affectedNode.CreatedNode.LedgerIndex))
              salir()
            }
          }
        }
      }
    })
    .catch((e) => {
      fallar(e)
    })
})




