const fileio = require("@folkforms/file-io");
const shelljs = require("shelljs");

/**
 * Copies files from "<root>/docs" folder to "<root>/packages/docs/src/pages" folder. Also converts
 * markdown documents from a standard format to the Gatsby format. It replaces the heading level 1
 * titles with "title: heading" attributes.
 *
 * @param {*} overrides overrides used for testing
 */
const convertDocs = overrides => {
  const docsFolder = overrides && overrides.docsFolder || "../../docs";
  const outputFolder = overrides && overrides.outputFolder || "src/pages";
  const skipCopy = overrides && overrides.skipCopy || false;

  if(!skipCopy) {
    shelljs.rm("-rf", outputFolder);
    fileio.copyFolder(docsFolder, outputFolder);
  }
  modifyFiles(outputFolder);
}

const modifyFiles = outputFolder => {
  const files = fileio.glob(`${outputFolder}/**/*.md`);
  files.forEach(file => {
    let contents = fileio.readLines(file);
    if(contents[0].startsWith("[<<")) {
      contents.splice(0, 1);
    }
    while(contents[0].trim().length == 0) {
      contents.splice(0, 1);
    }
    contents = contents.map(line => {
      if(line.startsWith("# ")) {
        line = ["---", `title: ${line.substring(2)}`, "---"];
      }
      return line;
    });
    contents = contents.flat();
    fileio.writeLines(file, contents);
  });
}

module.exports = convertDocs;