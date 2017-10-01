ripple-lib: Canales de Pago en el XRP Ledger
=========

Código de ejemplo para trabajar con canales de pago en el XRP Ledger con la ayuda de ripple-lib.

## Instalación

  `git clone && npm install`

## Generación de Claves y configuración

  Antes de empezar deberas crear un par de clave privada/publica:

  * Generar Par de claves
  `modo=generarParDeClaves node app`

  Y dos direcciones en la [TestNet de Ripple](https://ripple.com/build/xrp-test-net/) (`Generate Credentials'):

Una vez creadas, añadelas a las variables de cabecera del fichero `app.js`:

  * AddressPayer (Dirección del emisor de los pagos, Marta)
  * AddressPayerSecret (Clave Privada del emisor de los pagos, Marta)
  * AddressPayee (Receptor de los pagos, eNews)
  * ChannelPublicKeyHex (Clave Publica del canal)
  * ChannelPrivateKeyHex (Clave Privada del canal)

## Utilidades para Canales de Pago


  * Generar Canal de Pago  
  `modo=crearCanalDePago valor={valor} node app`

  * Detalles de un Canal de Pago  
  `modo=detallesCanalDePago id={id del canal} node app`

  * Generar un claim en un Canal de Pago  
  `modo=generarClaimCanalDePago id={id del canal} valor={valor} node app`

  * Verificar el claim de un Canal de Pago  
  `modo=verificarClaimCanalDePago id={id del canal} valor=200 firma={firma} node app`

  * Hacer claim en un Canal de Pago  
  `modo=hacerClaimCanalDePago id={id del canal} valor={valor} firma={firma} node app`

  * Cerrar Canal de Pago  
  `modo=cerrarCanalDePago id={id del canal} node app`

## Artículos

  * [https://xrp.today/canales-de-pago-xrp](https://xrp.today/canales-de-pago-xrp)
  * [https://xrp.today/canales-de-pago-xrp-codigo](https://xrp.today/canales-de-pago-xrp-codigo)