'use strict';

const config = require('turing-config');
const Vault = require('node-vault');
const reduce = require('async/reduce');
const {logger: log} = require('turing-logging');

function addSecretTo(configWithSecrets, configPath, value) {
  configPath.reduce((configToEnhance, key, index) => {
    if (!configToEnhance[key]) {
      configToEnhance[key] = index === configPath.length - 1 ? value : {};
    }
    return configToEnhance[key];
  }, configWithSecrets);
}

function getReadSecretFunction(vault) {
  return (configWithSecrets, secret, done) => {
    const {path} = secret;
    vault.read(path, {rejectUnauthorized: false})
      .then((result) => {
        if (result && result.data) {
          const configPath = secret.key.alias.split(':');
          const value = result.data[secret.key.name];
          addSecretTo(configWithSecrets, configPath, value);
          done(null, configWithSecrets);
        }
      })
      .catch((error) => {
        done(error);
      });
  };
}

function getUpdateConfigFunction(resolve) {
  return (error, configWithSecrets) => {
    if (error) {
      const vaultError = new Error('Vault: Cannot read secrets from vault', error);
      log.error(vaultError);
      throw vaultError;
    }
    config.update(configWithSecrets);
    log.info('Vault: Read secrets from vault and injected them into the config');
    resolve();
  };
}

module.exports = class TuringVault extends Promise {
  constructor() {
    super((resolve) => {
      const vaultConfig = config.get('turing:vault');
      if (vaultConfig.token) {
        const vault = Vault({
          endpoint: vaultConfig.address,
          token: vaultConfig.token
        });
        reduce(vaultConfig.secrets, {}, getReadSecretFunction(vault), getUpdateConfigFunction(resolve));
      } else {
        log.warn('Vault: No token');
        resolve();
      }
    });
  }
};
