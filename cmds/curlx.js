const { readResponse }= require('../helpers/read');
const shortid = require('shortid')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { outputResponse,
  outputResponseHeaders } = require('../output');
const { parseCurlCommand } = require('../helpers/parse-curl');


async function curlCommand(exec_str) {
  // let exec_str = 'curl -i ' + curlInput.join(' ');
  try {
    const { stdout, stderr } = await exec(exec_str);
    if (stderr.message) throw stderr;
    let response = readResponse(stdout);
    outputResponseHeaders(response.responseHeaders);
    outputResponse(response.body);
    let curlObject = parseCurlCommand(exec_str);
    let cmd = {
      id: shortid.generate(),
      method: curlObject.method,
      command: exec_str,
      url: curlObject.url,
      status: response.statusCode,
      ts: new Date(Date.now()).toString()
    }
    return cmd;
  } catch(err) {
    console.log(err.message);
    return null;
  }
}


module.exports = async (args, exec_str, db) => {

  let exec_cmd = await curlCommand(exec_str);
  if (exec_cmd) {
    db.addToHistory(exec_cmd);
  }

}
