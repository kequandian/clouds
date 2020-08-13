
module.exports = function cliArgs(options) {
  const [, , ...validArgs] = process.argv;

  if (validArgs.length) {
    validArgs.forEach((arg, i) => {
      if (options.hasOwnProperty(arg)) {
        if (validArgs[i + 1] && !options.hasOwnProperty(validArgs[i + 1])) {
          options[arg] = validArgs[i + 1];
        } else {
          options[arg] = true;
        }

      }
    })
  }
}