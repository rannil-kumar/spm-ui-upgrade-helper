const chalk = require("chalk");
const xp = require("xpath");

// Accepted relational operators for width comparisons.
const OPERATORS = {
  LESS_THAN: "<",
  LESS_THAN_OR_EQUAL_TO: "<=",
  GREATER_THAN: ">",
  GREATER_THAN_OR_EQUAL_TO: ">=",
};

/**
 * Compares two values and returns a boolean value based on whether the comparison is true.
 *
 * @param {number} firstOperand Left hand side operand of the inequality.
 * @param {number} secondOperand Right hand side operand of the inequality.
 * @param {string} operator Relational operator used to compare operands.
 * @returns Whether the comparison is true or not.
 */
function evaluateInequality(firstOperand, secondOperand, operator) {
  switch (operator) {
    case OPERATORS.LESS_THAN: {
      return firstOperand < secondOperand;
    }
    case OPERATORS.LESS_THAN_OR_EQUAL_TO: {
      return firstOperand <= secondOperand;
    }
    case OPERATORS.GREATER_THAN: {
      return firstOperand > secondOperand;
    }
    case OPERATORS.GREATER_THAN_OR_EQUAL_TO: {
      return firstOperand >= secondOperand;
    }
  }
}

/**
 * Gets the WINDOWS_OPTIONS attribute of the PAGE element.
 *
 * @param {object} document UIM document where the PAGE element exists.
 * @returns JS object representing the WINDOWS_OPTIONS string.
 */
function getWindowOptions(document) {
  let windowOptions = {};

  const optionsString =
    document.documentElement.getAttribute("WINDOW_OPTIONS");

  if (optionsString) {
    windowOptions = optionsString
      .replace(/ /g, "")
      .split(",")
      .reduce((acc, option) => {
        const [key, value] = option.split("=");

        acc[key] = value;

        return acc;
      }, windowOptions);
  }

  return windowOptions;
}

/**
 * Updates the WINDOW_OPTIONS attribute of a specified UIM file.
 *
 * @param {object} file UIM file where the PAGE element exists.
 * @param {object} windowOptions JS object representing the WINDOWS_OPTIONS string.
 */
function setWindowOptions(document, windowOptions) {
  const optionsString = Object.entries(windowOptions)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  document.documentElement.setAttribute("WINDOW_OPTIONS", optionsString);
}

/**
 * Checks if a UIM file meets the width criteria defined by a rules object.
 *
 * @param {object} file UIM file to compare to rules width criteria.
 * @param {object} rule Rules object.
 * @returns Whether a UIM file meets the width criteria or not.
 */
function checkWidth(document, rule) {
  let pass = false;

  const { width } = getWindowOptions(document);

  const pageWidth = parseInt(width);
  const [operator, ruleWidth] = rule.width.split(" ");

  if (pageWidth) {
    pass = evaluateInequality(pageWidth, ruleWidth, operator);
  }

  console.info(
    `\t${
      pass ? chalk.green(pass) : chalk.red(pass)
    }\t <-\twidth: ${chalk.magenta(
      `${pageWidth ? pageWidth : "none"} ${operator} ${ruleWidth}`
    )}`
  );

  return pass;
}

/**
 * Compares UIM file to rules criteria.
 *
 * @param {object} file UIM file to compare to rules criteria.
 * @param {object} rule Rules object.
 * @returns Whether the UIM file meets the rules criteria or not.
 */
function checkRule(document, rule) {
  let pass = false;

  rule.terms.forEach((xPath) => {
    if (!pass) {
      const result = xp.select(xPath, document);

      pass = pass || result;

      console.info(
        `\t${
          result ? chalk.green(result) : chalk.red(result)
        }\t <-\t${chalk.magenta(xPath)}`
      );
    }
  });

  return pass;
}

/**
 * Applies xPath rules to UIM files from the inputFolders.
 *
 * @param {array} inputFiles UIM files from input folder.
 * @param {array} rules Rules to apply to the UIM files.
 * @param {object} sizes Mapping breakpoints to be applied to UIMs if rules criteria a met.
 * @returns Array of UIM files transformed by rules.
 */
function applyRules(document, name, rules, sizes) {
  console.info(`filename: ${chalk.cyan(name)}`);

  rules.forEach((rule, index) => {
    console.info(`\trule\t\t${chalk.yellow(index + 1)}`);

    if (checkWidth(document, rule)) {
      const pass = checkRule(document, rule);

      if (pass) {
        const windowOptions = getWindowOptions(document);

        // This is where we can flip between pixels and size attribute
        const usePixelWidths = true;
        if(usePixelWidths) {
          windowOptions.width = sizes[rule.target];
        } else {
          delete windowOptions.width;
          windowOptions.size = rule.target;
        }

        setWindowOptions(document, windowOptions);
      }
    }
  });

  return document;
}

module.exports = { applyRules };