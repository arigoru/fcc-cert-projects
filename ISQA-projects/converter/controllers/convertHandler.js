const UNITS = ['gal','l','mi','km','lbs','kg','GAL','L','MI','KM','LBS','KG'];

function roundNum(num, decimals) {
  let power = Math.pow(10, decimals);
  return Math.round(num * power) / power;
}

function notProperUnit(str) {
  if (UNITS.indexOf(str) === -1) return true;
  return false;
}

function notProperNumber(str) {
  // let regex = /^\d+.?d*\/?\d*.?d*$/;
  let regex = /(^\d+\.?\d*$)|(^\d+\.?\d*\/\d+\.?\d*$)/;
  return !regex.test(str);
}

function ConvertHandler() {

  this.getNum = function(input) {
    let match = input.match(/[a-zA-Z]/);
    if (match === null) return "invalid unit";
    var result = input.slice(0, match.index);
    if (result.length === 0) result = "1";
    if (notProperNumber(result)) return "invalid number";
    let num;
      if (/\//.test(result)) {
        let fNum = result.slice(0, result.match(/\//).index);
        let sNum = result.slice(result.match(/\//).index + 1);
        result = fNum / sNum;
      } else result = Number(result);

    return result;
  };

  this.getUnit = function(input) {
    let match = input.match(/[a-zA-Z]/);
    if (match === null) return "invalid unit";
    var result = input.slice(match.index);
    if (notProperUnit(result)) return "invalid unit";
    return result;
  };

  this.getReturnUnit = function(initUnit) {
    var result;
    switch (initUnit) {
      case "gal":
      case "GAL":
        result = "l";
        break;
      case "lbs":
      case "LBS":
        result = "kg";
        break;
      case "mi":
      case "MI":
        result = "km";
        break;
      case "L":
      case "l":
        result = "gal";
        break;
      case "kg":
      case "KG":
        result = "lbs";
        break;
      case "KM":
      case "km":
        result = "mi";
        break;
      default:
        result = "invalid unit";
        break;
    }

    return result;
  };

  this.spellOutUnit = function(unit) {
    var result;

    switch (unit.toLowerCase()) {
      case "gal":
        result = "gallons";
        break;
      case "lbs":
        result = "pounds";
        break;
      case "mi":
        result = "miles";
        break;
      case "l":
        result = "litres";
        break;
      case "kg":
        result = "kilograms";
        break;
      case "km":
        result = "kilometers";
        break;
      default:
        result = "invalid unit";
        break;
    }

    return result;
  };

  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    var result;

    if (notProperNumber(initNum)) {
      result = notProperUnit(initUnit)
        ? "invalid number and unit"
        : "invalid number";
    } else {
      

      switch (initUnit.toLowerCase()) {
        case "gal":
          result = initNum * galToL;
          break;
        case "lbs":
          result = initNum * lbsToKg;
          break;
        case "mi":
          result = initNum * miToKm;
          break;
        case "l":
          result = initNum / galToL;
          break;
        case "kg":
          result = initNum / lbsToKg;
          break;
        case "km":
          result = initNum / miToKm;
          break;
        default:
          result = notProperNumber(initNum)
            ? "invalid number and unit"
            : "invalid unit";
          break;
      }
    }

    return result;
  };

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    var result;
    let numCheck = notProperNumber(initNum);
    let unitCheck = notProperUnit(initUnit);
    if (numCheck && unitCheck) {
      result = "invalid number and unit";
    } else if (numCheck) {
      result = "invalid number";
    } else if (unitCheck) {
      result = "invalid unit";
    } else {
      result = `${roundNum(initNum, 5)} ${this.spellOutUnit(
        initUnit
      )} converts to ${roundNum(returnNum, 5)} ${this.spellOutUnit(
        returnUnit
      )}`;
    }

    return result;
  };
}

module.exports = ConvertHandler;
