function Scaler(sourceRangeStart, sourceRangeEnd, targetRangeStart, targetRangeEnd, precision) {
    this.sourceRangeStart = sourceRangeStart;
    this.sourceRangeEnd = sourceRangeEnd + 1;
    this.targetRangeStart = targetRangeStart;
    this.targetRangeEnd = targetRangeEnd;
    this.precision = precision;


    this.Scale = function (value, round = true) {
        //value = value + 1;

        var result = (value - this.sourceRangeStart) / (this.sourceRangeEnd - this.sourceRangeStart) * (this.targetRangeEnd - this.targetRangeStart) + this.targetRangeStart;
        if (round) {
            result = parseFloat(result.toFixed(this.precision));
        }
        return result;
    }

    this.UnitStep =this.Scale(1, false) - this.Scale(0, false);
    this.UnitStepAbs = Math.abs(this.UnitStep);

    this.ScaleWithOffset = function (value) {
        return this.Scale(value) + this.UnitStep / 2;    
    }

    this.toString = function () {
        return "Scaler: " + this.sourceRangeStart + " - " + this.sourceRangeEnd + " -> " + this.targetRangeStart + " - " + this.targetRangeEnd + " (precision: " + this.precision + ")";
    }

}