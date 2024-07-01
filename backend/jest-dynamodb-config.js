/**
 * @see https://github.com/shelfio/jest-dynamodb?tab=readme-ov-file#22-examples
 * @see https://github.com/shelfio/jest-dynamodb/issues/124#issuecomment-1051485779
 */
const Serverless = require('serverless');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

module.exports = async () => {
  const serviceDir = process.cwd();
  const configurationFilename = 'serverless.yml';
  const configuration = yaml.load(fs.readFileSync(path.resolve(serviceDir, configurationFilename), 'utf8'));
  const serverless = new Serverless({ configuration, serviceDir, configurationFilename, commands: [], options: {} });
  await serverless.init();
  const resources = serverless.service.resources.Resources;

  const tables = Object.keys(resources)
    .map((name) => resources[name])
    .filter((r) => r.Type === 'AWS::DynamoDB::Table')
    .map((r) => r.Properties);

  return {
    tables,
    port: 18000,
    hostname: "127.0.0.1"
  };
};