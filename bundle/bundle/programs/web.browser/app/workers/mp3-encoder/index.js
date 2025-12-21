var hasSubarray = function (a) {
    return typeof a === 'object' &&
        a !== null &&
        'subarray' in a &&
        typeof a.subarray === 'function';
};
var hasSet = function (a) {
    return typeof a === 'object' &&
        a !== null &&
        'set' in a &&
        typeof a.set === 'function';
};
function copyArray(src, srcPos, dest, destPos, length) {
    if (hasSubarray(src) && hasSet(dest)) {
        dest.set(src.subarray(srcPos, srcPos + length), destPos);
        return;
    }
    var srcEnd = srcPos + length;
    while (srcPos < srcEnd)
        dest[destPos++] = src[srcPos++];
}
function sortArray(a, fromIndex, toIndex) {
    var sorted = Array.from(a).slice(fromIndex, toIndex).sort();
    for (var i = fromIndex; i < toIndex; i++) {
        a[i] = sorted[i - fromIndex];
    }
}
function fillArray() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length === 2) {
        var a = args[0], val = args[1];
        for (var i = 0; i < a.length; i++) {
            a[i] = val;
        }
    }
    else {
        var a = args[0], fromIndex = args[1], toIndex = args[2], val = args[3];
        for (var i = fromIndex; i < toIndex; i++) {
            a[i] = val;
        }
    }
}

function blackmanWindow(x, fcn, l) {
    var wcn = Math.PI * fcn;
    x /= l;
    if (x < 0)
        x = 0;
    if (x > 1)
        x = 1;
    var x2 = x - 0.5;
    var bkwn = 0.42 - 0.5 * Math.cos(2 * x * Math.PI) + 0.08 * Math.cos(4 * x * Math.PI);
    if (Math.abs(x2) < 1e-9)
        return wcn / Math.PI;
    return (bkwn * Math.sin(l * wcn * x2)) / (Math.PI * l * x2);
}
function gcd(i, j) {
    return j !== 0 ? gcd(j, i % j) : i;
}
function isCloseToEachOther(a, b) {
    return Math.abs(a) > Math.abs(b)
        ? Math.abs(a - b) <= Math.abs(a) * 1e-6
        : Math.abs(a - b) <= Math.abs(b) * 1e-6;
}
function fsqr(d) {
    return d * d;
}
function equals(a, b) {
    return !(Math.abs(a - b) > 0);
}

var GainAnalysis = /** @class */ (function () {
    function GainAnalysis() {
        this.ABYule = [
            [
                0.038575994352, -3.84664617118067, -0.02160367184185, 7.81501653005538,
                -0.00123395316851, -11.34170355132042, -0.00009291677959,
                13.05504219327545, -0.01655260341619, -12.28759895145294,
                0.02161526843274, 9.4829380631979, -0.02074045215285, -5.87257861775999,
                0.00594298065125, 2.75465861874613, 0.00306428023191, -0.86984376593551,
                0.00012025322027, 0.13919314567432, 0.00288463683916,
            ],
            [
                0.0541865640643, -3.47845948550071, -0.02911007808948, 6.36317777566148,
                -0.00848709379851, -8.54751527471874, -0.00851165645469, 9.4769360780128,
                -0.00834990904936, -8.81498681370155, 0.02245293253339, 6.85401540936998,
                -0.02596338512915, -4.39470996079559, 0.01624864962975, 2.19611684890774,
                -0.00240879051584, -0.75104302451432, 0.00674613682247, 0.13149317958808,
                -0.00187763777362,
            ],
            [
                0.15457299681924, -2.37898834973084, -0.09331049056315, 2.84868151156327,
                -0.06247880153653, -2.64577170229825, 0.02163541888798, 2.23697657451713,
                -0.05588393329856, -1.67148153367602, 0.04781476674921, 1.00595954808547,
                0.00222312597743, -0.45953458054983, 0.03174092540049, 0.16378164858596,
                -0.01390589421898, -0.05032077717131, 0.00651420667831, 0.0234789740702,
                -0.00881362733839,
            ],
            [
                0.30296907319327, -1.61273165137247, -0.22613988682123, 1.0797749225997,
                -0.08587323730772, -0.2565625775407, 0.03282930172664, -0.1627671912044,
                -0.00915702933434, -0.22638893773906, -0.02364141202522, 0.39120800788284,
                -0.00584456039913, -0.22138138954925, 0.06276101321749, 0.04500235387352,
                -0.00000828086748, 0.02005851806501, 0.00205861885564, 0.00302439095741,
                -0.02950134983287,
            ],
            [
                0.33642304856132, -1.49858979367799, -0.2557224142557, 0.87350271418188,
                -0.11828570177555, 0.12205022308084, 0.11921148675203, -0.80774944671438,
                -0.07834489609479, 0.47854794562326, -0.0046997791438, -0.12453458140019,
                -0.0058950022444, -0.04067510197014, 0.05724228140351, 0.08333755284107,
                0.00832043980773, -0.04237348025746, -0.0163538138454, 0.02977207319925,
                -0.0176017656815,
            ],
            [
                0.4491525660845, -0.62820619233671, -0.14351757464547, 0.29661783706366,
                -0.22784394429749, -0.372563729424, -0.01419140100551, 0.00213767857124,
                0.04078262797139, -0.42029820170918, -0.12398163381748, 0.22199650564824,
                0.04097565135648, 0.00613424350682, 0.10478503600251, 0.06747620744683,
                -0.01863887810927, 0.05784820375801, -0.03193428438915, 0.03222754072173,
                0.00541907748707,
            ],
            [
                0.56619470757641, -1.04800335126349, -0.75464456939302, 0.29156311971249,
                0.1624213774223, -0.26806001042947, 0.16744243493672, 0.00819999645858,
                -0.18901604199609, 0.45054734505008, 0.3093178284183, -0.33032403314006,
                -0.27562961986224, 0.0673936833311, 0.00647310677246, -0.04784254229033,
                0.08647503780351, 0.01639907836189, -0.0378898455484, 0.01807364323573,
                -0.00588215443421,
            ],
            [
                0.58100494960553, -0.51035327095184, -0.53174909058578, -0.31863563325245,
                -0.14289799034253, -0.20256413484477, 0.17520704835522, 0.1472815413433,
                0.02377945217615, 0.38952639978999, 0.15558449135573, -0.23313271880868,
                -0.25344790059353, -0.05246019024463, 0.01628462406333, -0.02505961724053,
                0.06920467763959, 0.02442357316099, -0.03721611395801, 0.01818801111503,
                -0.00749618797172,
            ],
            [
                0.53648789255105, -0.2504987195602, -0.42163034350696, -0.43193942311114,
                -0.00275953611929, -0.03424681017675, 0.04267842219415, -0.04678328784242,
                -0.10214864179676, 0.26408300200955, 0.14590772289388, 0.15113130533216,
                -0.02459864859345, -0.17556493366449, -0.11202315195388,
                -0.18823009262115, -0.04060034127, 0.05477720428674, 0.0478866554818,
                0.0470440968812, -0.02217936801134,
            ],
        ];
        this.ABButter = [
            [
                0.98621192462708, -1.97223372919527, -1.97242384925416, 0.97261396931306,
                0.98621192462708,
            ],
            [
                0.98500175787242, -1.96977855582618, -1.97000351574484, 0.9702284756635,
                0.98500175787242,
            ],
            [
                0.97938932735214, -1.95835380975398, -1.95877865470428, 0.95920349965459,
                0.97938932735214,
            ],
            [
                0.97531843204928, -1.95002759149878, -1.95063686409857, 0.95124613669835,
                0.97531843204928,
            ],
            [
                0.97316523498161, -1.94561023566527, -1.94633046996323, 0.94705070426118,
                0.97316523498161,
            ],
            [
                0.96454515552826, -1.92783286977036, -1.92909031105652, 0.93034775234268,
                0.96454515552826,
            ],
            [
                0.96009142950541, -1.91858953033784, -1.92018285901082, 0.92177618768381,
                0.96009142950541,
            ],
            [
                0.95856916599601, -1.9154210807478, -1.91713833199203, 0.91885558323625,
                0.95856916599601,
            ],
            [
                0.94597685600279, -1.88903307939452, -1.89195371200558, 0.89487434461664,
                0.94597685600279,
            ],
        ];
    }
    GainAnalysis.prototype.filterYule = function (input, inputPos, output, outputPos, nSamples, kernel) {
        while (nSamples-- !== 0) {
            output[outputPos] =
                1e-10 +
                    input[inputPos + 0] * kernel[0] -
                    output[outputPos - 1] * kernel[1] +
                    input[inputPos - 1] * kernel[2] -
                    output[outputPos - 2] * kernel[3] +
                    input[inputPos - 2] * kernel[4] -
                    output[outputPos - 3] * kernel[5] +
                    input[inputPos - 3] * kernel[6] -
                    output[outputPos - 4] * kernel[7] +
                    input[inputPos - 4] * kernel[8] -
                    output[outputPos - 5] * kernel[9] +
                    input[inputPos - 5] * kernel[10] -
                    output[outputPos - 6] * kernel[11] +
                    input[inputPos - 6] * kernel[12] -
                    output[outputPos - 7] * kernel[13] +
                    input[inputPos - 7] * kernel[14] -
                    output[outputPos - 8] * kernel[15] +
                    input[inputPos - 8] * kernel[16] -
                    output[outputPos - 9] * kernel[17] +
                    input[inputPos - 9] * kernel[18] -
                    output[outputPos - 10] * kernel[19] +
                    input[inputPos - 10] * kernel[20];
            ++outputPos;
            ++inputPos;
        }
    };
    GainAnalysis.prototype.filterButter = function (input, inputPos, output, outputPos, nSamples, kernel) {
        while (nSamples-- !== 0) {
            output[outputPos] =
                input[inputPos + 0] * kernel[0] -
                    output[outputPos - 1] * kernel[1] +
                    input[inputPos - 1] * kernel[2] -
                    output[outputPos - 2] * kernel[3] +
                    input[inputPos - 2] * kernel[4];
            ++outputPos;
            ++inputPos;
        }
    };
    GainAnalysis.prototype.resetSampleFrequency = function (rgData, samplefreq) {
        for (var i = 0; i < GainAnalysis.MAX_ORDER; i++) {
            rgData.linprebuf[i] = 0;
            rgData.lstepbuf[i] = 0;
            rgData.loutbuf[i] = 0;
            rgData.rinprebuf[i] = 0;
            rgData.rstepbuf[i] = 0;
            rgData.routbuf[i] = 0;
        }
        switch (Math.trunc(samplefreq)) {
            case 48000:
                rgData.reqindex = 0;
                break;
            case 44100:
                rgData.reqindex = 1;
                break;
            case 32000:
                rgData.reqindex = 2;
                break;
            case 24000:
                rgData.reqindex = 3;
                break;
            case 22050:
                rgData.reqindex = 4;
                break;
            case 16000:
                rgData.reqindex = 5;
                break;
            case 12000:
                rgData.reqindex = 6;
                break;
            case 11025:
                rgData.reqindex = 7;
                break;
            case 8000:
                rgData.reqindex = 8;
                break;
            default:
                return GainAnalysis.INIT_GAIN_ANALYSIS_ERROR;
        }
        rgData.sampleWindow = Math.trunc((samplefreq * GainAnalysis.RMS_WINDOW_TIME_NUMERATOR +
            GainAnalysis.RMS_WINDOW_TIME_DENOMINATOR -
            1) /
            GainAnalysis.RMS_WINDOW_TIME_DENOMINATOR);
        rgData.lsum = 0;
        rgData.rsum = 0;
        rgData.totsamp = 0;
        fillArray(rgData.A, 0);
        return GainAnalysis.INIT_GAIN_ANALYSIS_OK;
    };
    GainAnalysis.prototype.initGainAnalysis = function (rgData, samplefreq) {
        if (this.resetSampleFrequency(rgData, samplefreq) !==
            GainAnalysis.INIT_GAIN_ANALYSIS_OK) {
            return GainAnalysis.INIT_GAIN_ANALYSIS_ERROR;
        }
        rgData.linpre = GainAnalysis.MAX_ORDER;
        rgData.rinpre = GainAnalysis.MAX_ORDER;
        rgData.lstep = GainAnalysis.MAX_ORDER;
        rgData.rstep = GainAnalysis.MAX_ORDER;
        rgData.lout = GainAnalysis.MAX_ORDER;
        rgData.rout = GainAnalysis.MAX_ORDER;
        fillArray(rgData.B, 0);
        return GainAnalysis.INIT_GAIN_ANALYSIS_OK;
    };
    GainAnalysis.prototype.analyzeSamples = function (rgData, left_samples, left_samplesPos, right_samples, right_samplesPos, num_samples, num_channels) {
        var curleft;
        var curleftBase;
        var curright;
        var currightBase;
        var batchsamples;
        var cursamples;
        var cursamplepos;
        if (num_samples === 0)
            return GainAnalysis.GAIN_ANALYSIS_OK;
        cursamplepos = 0;
        batchsamples = num_samples;
        switch (num_channels) {
            case 1:
                right_samples = left_samples;
                right_samplesPos = left_samplesPos;
                break;
            case 2:
                break;
            default:
                return GainAnalysis.GAIN_ANALYSIS_ERROR;
        }
        if (num_samples < GainAnalysis.MAX_ORDER) {
            copyArray(left_samples, left_samplesPos, rgData.linprebuf, GainAnalysis.MAX_ORDER, num_samples);
            copyArray(right_samples, right_samplesPos, rgData.rinprebuf, GainAnalysis.MAX_ORDER, num_samples);
        }
        else {
            copyArray(left_samples, left_samplesPos, rgData.linprebuf, GainAnalysis.MAX_ORDER, GainAnalysis.MAX_ORDER);
            copyArray(right_samples, right_samplesPos, rgData.rinprebuf, GainAnalysis.MAX_ORDER, GainAnalysis.MAX_ORDER);
        }
        while (batchsamples > 0) {
            cursamples =
                batchsamples > rgData.sampleWindow - rgData.totsamp
                    ? rgData.sampleWindow - rgData.totsamp
                    : batchsamples;
            if (cursamplepos < GainAnalysis.MAX_ORDER) {
                curleft = rgData.linpre + cursamplepos;
                curleftBase = rgData.linprebuf;
                curright = rgData.rinpre + cursamplepos;
                currightBase = rgData.rinprebuf;
                if (cursamples > GainAnalysis.MAX_ORDER - cursamplepos)
                    cursamples = GainAnalysis.MAX_ORDER - cursamplepos;
            }
            else {
                curleft = left_samplesPos + cursamplepos;
                curleftBase = left_samples;
                curright = right_samplesPos + cursamplepos;
                currightBase = right_samples;
            }
            this.filterYule(curleftBase, curleft, rgData.lstepbuf, rgData.lstep + rgData.totsamp, cursamples, this.ABYule[rgData.reqindex]);
            this.filterYule(currightBase, curright, rgData.rstepbuf, rgData.rstep + rgData.totsamp, cursamples, this.ABYule[rgData.reqindex]);
            this.filterButter(rgData.lstepbuf, rgData.lstep + rgData.totsamp, rgData.loutbuf, rgData.lout + rgData.totsamp, cursamples, this.ABButter[rgData.reqindex]);
            this.filterButter(rgData.rstepbuf, rgData.rstep + rgData.totsamp, rgData.routbuf, rgData.rout + rgData.totsamp, cursamples, this.ABButter[rgData.reqindex]);
            curleft = rgData.lout + rgData.totsamp;
            curleftBase = rgData.loutbuf;
            curright = rgData.rout + rgData.totsamp;
            currightBase = rgData.routbuf;
            var i = cursamples % 8;
            while (i-- !== 0) {
                rgData.lsum += fsqr(curleftBase[curleft++]);
                rgData.rsum += fsqr(currightBase[curright++]);
            }
            i = cursamples / 8;
            while (i-- !== 0) {
                rgData.lsum +=
                    fsqr(curleftBase[curleft + 0]) +
                        fsqr(curleftBase[curleft + 1]) +
                        fsqr(curleftBase[curleft + 2]) +
                        fsqr(curleftBase[curleft + 3]) +
                        fsqr(curleftBase[curleft + 4]) +
                        fsqr(curleftBase[curleft + 5]) +
                        fsqr(curleftBase[curleft + 6]) +
                        fsqr(curleftBase[curleft + 7]);
                curleft += 8;
                rgData.rsum +=
                    fsqr(currightBase[curright + 0]) +
                        fsqr(currightBase[curright + 1]) +
                        fsqr(currightBase[curright + 2]) +
                        fsqr(currightBase[curright + 3]) +
                        fsqr(currightBase[curright + 4]) +
                        fsqr(currightBase[curright + 5]) +
                        fsqr(currightBase[curright + 6]) +
                        fsqr(currightBase[curright + 7]);
                curright += 8;
            }
            batchsamples -= cursamples;
            cursamplepos += cursamples;
            rgData.totsamp += cursamples;
            if (rgData.totsamp === rgData.sampleWindow) {
                var val = GainAnalysis.STEPS_per_dB *
                    10 *
                    Math.log10(((rgData.lsum + rgData.rsum) / rgData.totsamp) * 0.5 + 1e-37);
                var ival = val <= 0 ? 0 : Math.trunc(val);
                if (ival >= rgData.A.length)
                    ival = rgData.A.length - 1;
                rgData.A[ival]++;
                rgData.lsum = 0;
                rgData.rsum = 0;
                copyArray(rgData.loutbuf, rgData.totsamp, rgData.loutbuf, 0, GainAnalysis.MAX_ORDER);
                copyArray(rgData.routbuf, rgData.totsamp, rgData.routbuf, 0, GainAnalysis.MAX_ORDER);
                copyArray(rgData.lstepbuf, rgData.totsamp, rgData.lstepbuf, 0, GainAnalysis.MAX_ORDER);
                copyArray(rgData.rstepbuf, rgData.totsamp, rgData.rstepbuf, 0, GainAnalysis.MAX_ORDER);
                rgData.totsamp = 0;
            }
            if (rgData.totsamp > rgData.sampleWindow) {
                return GainAnalysis.GAIN_ANALYSIS_ERROR;
            }
        }
        if (num_samples < GainAnalysis.MAX_ORDER) {
            copyArray(rgData.linprebuf, num_samples, rgData.linprebuf, 0, GainAnalysis.MAX_ORDER - num_samples);
            copyArray(rgData.rinprebuf, num_samples, rgData.rinprebuf, 0, GainAnalysis.MAX_ORDER - num_samples);
            copyArray(left_samples, left_samplesPos, rgData.linprebuf, GainAnalysis.MAX_ORDER - num_samples, num_samples);
            copyArray(right_samples, right_samplesPos, rgData.rinprebuf, GainAnalysis.MAX_ORDER - num_samples, num_samples);
        }
        else {
            copyArray(left_samples, left_samplesPos + num_samples - GainAnalysis.MAX_ORDER, rgData.linprebuf, 0, GainAnalysis.MAX_ORDER);
            copyArray(right_samples, right_samplesPos + num_samples - GainAnalysis.MAX_ORDER, rgData.rinprebuf, 0, GainAnalysis.MAX_ORDER);
        }
        return GainAnalysis.GAIN_ANALYSIS_OK;
    };
    GainAnalysis.prototype.analyzeResult = function (Array, len) {
        var i;
        var elems = 0;
        for (i = 0; i < len; i++)
            elems += Array[i];
        if (elems === 0)
            return GainAnalysis.GAIN_NOT_ENOUGH_SAMPLES;
        var upper = Math.ceil(elems * (1 - GainAnalysis.RMS_PERCENTILE));
        for (i = len; i-- > 0;) {
            if ((upper -= Array[i]) <= 0)
                break;
        }
        return GainAnalysis.PINK_REF - i / GainAnalysis.STEPS_per_dB;
    };
    GainAnalysis.prototype.getTitleGain = function (rgData) {
        var retval = this.analyzeResult(rgData.A, rgData.A.length);
        for (var i = 0; i < rgData.A.length; i++) {
            rgData.B[i] += rgData.A[i];
            rgData.A[i] = 0;
        }
        for (var i = 0; i < GainAnalysis.MAX_ORDER; i++) {
            rgData.linprebuf[i] = 0;
            rgData.lstepbuf[i] = 0;
            rgData.loutbuf[i] = 0;
            rgData.rinprebuf[i] = 0;
            rgData.rstepbuf[i] = 0;
            rgData.routbuf[i] = 0;
        }
        rgData.totsamp = 0;
        rgData.lsum = 0;
        rgData.rsum = 0;
        return retval;
    };
    GainAnalysis.STEPS_per_dB = 100;
    GainAnalysis.MAX_dB = 120;
    GainAnalysis.GAIN_NOT_ENOUGH_SAMPLES = -24601;
    GainAnalysis.GAIN_ANALYSIS_ERROR = 0;
    GainAnalysis.GAIN_ANALYSIS_OK = 1;
    GainAnalysis.INIT_GAIN_ANALYSIS_ERROR = 0;
    GainAnalysis.INIT_GAIN_ANALYSIS_OK = 1;
    GainAnalysis.YULE_ORDER = 10;
    GainAnalysis.MAX_ORDER = GainAnalysis.YULE_ORDER;
    GainAnalysis.MAX_SAMP_FREQ = 48000;
    GainAnalysis.RMS_WINDOW_TIME_NUMERATOR = 1;
    GainAnalysis.RMS_WINDOW_TIME_DENOMINATOR = 20;
    GainAnalysis.MAX_SAMPLES_PER_WINDOW = (GainAnalysis.MAX_SAMP_FREQ * GainAnalysis.RMS_WINDOW_TIME_NUMERATOR) /
        GainAnalysis.RMS_WINDOW_TIME_DENOMINATOR +
        1;
    GainAnalysis.PINK_REF = 64.82;
    GainAnalysis.RMS_PERCENTILE = 0.95;
    return GainAnalysis;
}());

var t1HB = [1, 1, 1, 0];
var t2HB = [1, 2, 1, 3, 1, 1, 3, 2, 0];
var t3HB = [3, 2, 1, 1, 1, 1, 3, 2, 0];
var t5HB = [1, 2, 6, 5, 3, 1, 4, 4, 7, 5, 7, 1, 6, 1, 1, 0];
var t6HB = [7, 3, 5, 1, 6, 2, 3, 2, 5, 4, 4, 1, 3, 3, 2, 0];
var t7HB = [
    1, 2, 10, 19, 16, 10, 3, 3, 7, 10, 5, 3, 11, 4, 13, 17, 8, 4, 12, 11, 18, 15,
    11, 2, 7, 6, 9, 14, 3, 1, 6, 4, 5, 3, 2, 0,
];
var t8HB = [
    3, 4, 6, 18, 12, 5, 5, 1, 2, 16, 9, 3, 7, 3, 5, 14, 7, 3, 19, 17, 15, 13, 10,
    4, 13, 5, 8, 11, 5, 1, 12, 4, 4, 1, 1, 0,
];
var t9HB = [
    7, 5, 9, 14, 15, 7, 6, 4, 5, 5, 6, 7, 7, 6, 8, 8, 8, 5, 15, 6, 9, 10, 5, 1,
    11, 7, 9, 6, 4, 1, 14, 4, 6, 2, 6, 0,
];
var t10HB = [
    1, 2, 10, 23, 35, 30, 12, 17, 3, 3, 8, 12, 18, 21, 12, 7, 11, 9, 15, 21, 32,
    40, 19, 6, 14, 13, 22, 34, 46, 23, 18, 7, 20, 19, 33, 47, 27, 22, 9, 3, 31,
    22, 41, 26, 21, 20, 5, 3, 14, 13, 10, 11, 16, 6, 5, 1, 9, 8, 7, 8, 4, 4, 2, 0,
];
var t11HB = [
    3, 4, 10, 24, 34, 33, 21, 15, 5, 3, 4, 10, 32, 17, 11, 10, 11, 7, 13, 18, 30,
    31, 20, 5, 25, 11, 19, 59, 27, 18, 12, 5, 35, 33, 31, 58, 30, 16, 7, 5, 28,
    26, 32, 19, 17, 15, 8, 14, 14, 12, 9, 13, 14, 9, 4, 1, 11, 4, 6, 6, 6, 3, 2,
    0,
];
var t12HB = [
    9, 6, 16, 33, 41, 39, 38, 26, 7, 5, 6, 9, 23, 16, 26, 11, 17, 7, 11, 14, 21,
    30, 10, 7, 17, 10, 15, 12, 18, 28, 14, 5, 32, 13, 22, 19, 18, 16, 9, 5, 40,
    17, 31, 29, 17, 13, 4, 2, 27, 12, 11, 15, 10, 7, 4, 1, 27, 12, 8, 12, 6, 3, 1,
    0,
];
var t13HB = [
    1, 5, 14, 21, 34, 51, 46, 71, 42, 52, 68, 52, 67, 44, 43, 19, 3, 4, 12, 19,
    31, 26, 44, 33, 31, 24, 32, 24, 31, 35, 22, 14, 15, 13, 23, 36, 59, 49, 77,
    65, 29, 40, 30, 40, 27, 33, 42, 16, 22, 20, 37, 61, 56, 79, 73, 64, 43, 76,
    56, 37, 26, 31, 25, 14, 35, 16, 60, 57, 97, 75, 114, 91, 54, 73, 55, 41, 48,
    53, 23, 24, 58, 27, 50, 96, 76, 70, 93, 84, 77, 58, 79, 29, 74, 49, 41, 17,
    47, 45, 78, 74, 115, 94, 90, 79, 69, 83, 71, 50, 59, 38, 36, 15, 72, 34, 56,
    95, 92, 85, 91, 90, 86, 73, 77, 65, 51, 44, 43, 42, 43, 20, 30, 44, 55, 78,
    72, 87, 78, 61, 46, 54, 37, 30, 20, 16, 53, 25, 41, 37, 44, 59, 54, 81, 66,
    76, 57, 54, 37, 18, 39, 11, 35, 33, 31, 57, 42, 82, 72, 80, 47, 58, 55, 21,
    22, 26, 38, 22, 53, 25, 23, 38, 70, 60, 51, 36, 55, 26, 34, 23, 27, 14, 9, 7,
    34, 32, 28, 39, 49, 75, 30, 52, 48, 40, 52, 28, 18, 17, 9, 5, 45, 21, 34, 64,
    56, 50, 49, 45, 31, 19, 12, 15, 10, 7, 6, 3, 48, 23, 20, 39, 36, 35, 53, 21,
    16, 23, 13, 10, 6, 1, 4, 2, 16, 15, 17, 27, 25, 20, 29, 11, 17, 12, 16, 8, 1,
    1, 0, 1,
];
var t15HB = [
    7, 12, 18, 53, 47, 76, 124, 108, 89, 123, 108, 119, 107, 81, 122, 63, 13, 5,
    16, 27, 46, 36, 61, 51, 42, 70, 52, 83, 65, 41, 59, 36, 19, 17, 15, 24, 41,
    34, 59, 48, 40, 64, 50, 78, 62, 80, 56, 33, 29, 28, 25, 43, 39, 63, 55, 93,
    76, 59, 93, 72, 54, 75, 50, 29, 52, 22, 42, 40, 67, 57, 95, 79, 72, 57, 89,
    69, 49, 66, 46, 27, 77, 37, 35, 66, 58, 52, 91, 74, 62, 48, 79, 63, 90, 62,
    40, 38, 125, 32, 60, 56, 50, 92, 78, 65, 55, 87, 71, 51, 73, 51, 70, 30, 109,
    53, 49, 94, 88, 75, 66, 122, 91, 73, 56, 42, 64, 44, 21, 25, 90, 43, 41, 77,
    73, 63, 56, 92, 77, 66, 47, 67, 48, 53, 36, 20, 71, 34, 67, 60, 58, 49, 88,
    76, 67, 106, 71, 54, 38, 39, 23, 15, 109, 53, 51, 47, 90, 82, 58, 57, 48, 72,
    57, 41, 23, 27, 62, 9, 86, 42, 40, 37, 70, 64, 52, 43, 70, 55, 42, 25, 29, 18,
    11, 11, 118, 68, 30, 55, 50, 46, 74, 65, 49, 39, 24, 16, 22, 13, 14, 7, 91,
    44, 39, 38, 34, 63, 52, 45, 31, 52, 28, 19, 14, 8, 9, 3, 123, 60, 58, 53, 47,
    43, 32, 22, 37, 24, 17, 12, 15, 10, 2, 1, 71, 37, 34, 30, 28, 20, 17, 26, 21,
    16, 10, 6, 8, 6, 2, 0,
];
var t16HB = [
    1, 5, 14, 44, 74, 63, 110, 93, 172, 149, 138, 242, 225, 195, 376, 17, 3, 4,
    12, 20, 35, 62, 53, 47, 83, 75, 68, 119, 201, 107, 207, 9, 15, 13, 23, 38, 67,
    58, 103, 90, 161, 72, 127, 117, 110, 209, 206, 16, 45, 21, 39, 69, 64, 114,
    99, 87, 158, 140, 252, 212, 199, 387, 365, 26, 75, 36, 68, 65, 115, 101, 179,
    164, 155, 264, 246, 226, 395, 382, 362, 9, 66, 30, 59, 56, 102, 185, 173, 265,
    142, 253, 232, 400, 388, 378, 445, 16, 111, 54, 52, 100, 184, 178, 160, 133,
    257, 244, 228, 217, 385, 366, 715, 10, 98, 48, 91, 88, 165, 157, 148, 261,
    248, 407, 397, 372, 380, 889, 884, 8, 85, 84, 81, 159, 156, 143, 260, 249,
    427, 401, 392, 383, 727, 713, 708, 7, 154, 76, 73, 141, 131, 256, 245, 426,
    406, 394, 384, 735, 359, 710, 352, 11, 139, 129, 67, 125, 247, 233, 229, 219,
    393, 743, 737, 720, 885, 882, 439, 4, 243, 120, 118, 115, 227, 223, 396, 746,
    742, 736, 721, 712, 706, 223, 436, 6, 202, 224, 222, 218, 216, 389, 386, 381,
    364, 888, 443, 707, 440, 437, 1728, 4, 747, 211, 210, 208, 370, 379, 734, 723,
    714, 1735, 883, 877, 876, 3459, 865, 2, 377, 369, 102, 187, 726, 722, 358,
    711, 709, 866, 1734, 871, 3458, 870, 434, 0, 12, 10, 7, 11, 10, 17, 11, 9, 13,
    12, 10, 7, 5, 3, 1, 3,
];
var t24HB = [
    15, 13, 46, 80, 146, 262, 248, 434, 426, 669, 653, 649, 621, 517, 1032, 88,
    14, 12, 21, 38, 71, 130, 122, 216, 209, 198, 327, 345, 319, 297, 279, 42, 47,
    22, 41, 74, 68, 128, 120, 221, 207, 194, 182, 340, 315, 295, 541, 18, 81, 39,
    75, 70, 134, 125, 116, 220, 204, 190, 178, 325, 311, 293, 271, 16, 147, 72,
    69, 135, 127, 118, 112, 210, 200, 188, 352, 323, 306, 285, 540, 14, 263, 66,
    129, 126, 119, 114, 214, 202, 192, 180, 341, 317, 301, 281, 262, 12, 249, 123,
    121, 117, 113, 215, 206, 195, 185, 347, 330, 308, 291, 272, 520, 10, 435, 115,
    111, 109, 211, 203, 196, 187, 353, 332, 313, 298, 283, 531, 381, 17, 427, 212,
    208, 205, 201, 193, 186, 177, 169, 320, 303, 286, 268, 514, 377, 16, 335, 199,
    197, 191, 189, 181, 174, 333, 321, 305, 289, 275, 521, 379, 371, 11, 668, 184,
    183, 179, 175, 344, 331, 314, 304, 290, 277, 530, 383, 373, 366, 10, 652, 346,
    171, 168, 164, 318, 309, 299, 287, 276, 263, 513, 375, 368, 362, 6, 648, 322,
    316, 312, 307, 302, 292, 284, 269, 261, 512, 376, 370, 364, 359, 4, 620, 300,
    296, 294, 288, 282, 273, 266, 515, 380, 374, 369, 365, 361, 357, 2, 1033, 280,
    278, 274, 267, 264, 259, 382, 378, 372, 367, 363, 360, 358, 356, 0, 43, 20,
    19, 17, 15, 13, 11, 9, 7, 6, 4, 7, 5, 3, 1, 3,
];
var t32HB = [
    1 << 0,
    5 << 1,
    4 << 1,
    5 << 2,
    6 << 1,
    5 << 2,
    4 << 2,
    4 << 3,
    7 << 1,
    3 << 2,
    6 << 2,
    0 << 3,
    7 << 2,
    2 << 3,
    3 << 3,
    1 << 4,
];
var t33HB = [
    15 << 0,
    14 << 1,
    13 << 1,
    12 << 2,
    11 << 1,
    10 << 2,
    9 << 2,
    8 << 3,
    7 << 1,
    6 << 2,
    5 << 2,
    4 << 3,
    3 << 2,
    2 << 3,
    1 << 3,
    0 << 4,
];
var t1l = [1, 4, 3, 5];
var t2l = [1, 4, 7, 4, 5, 7, 6, 7, 8];
var t3l = [2, 3, 7, 4, 4, 7, 6, 7, 8];
var t5l = [1, 4, 7, 8, 4, 5, 8, 9, 7, 8, 9, 10, 8, 8, 9, 10];
var t6l = [3, 4, 6, 8, 4, 4, 6, 7, 5, 6, 7, 8, 7, 7, 8, 9];
var t7l = [
    1, 4, 7, 9, 9, 10, 4, 6, 8, 9, 9, 10, 7, 7, 9, 10, 10, 11, 8, 9, 10, 11, 11,
    11, 8, 9, 10, 11, 11, 12, 9, 10, 11, 12, 12, 12,
];
var t8l = [
    2, 4, 7, 9, 9, 10, 4, 4, 6, 10, 10, 10, 7, 6, 8, 10, 10, 11, 9, 10, 10, 11,
    11, 12, 9, 9, 10, 11, 12, 12, 10, 10, 11, 11, 13, 13,
];
var t9l = [
    3, 4, 6, 7, 9, 10, 4, 5, 6, 7, 8, 10, 5, 6, 7, 8, 9, 10, 7, 7, 8, 9, 9, 10, 8,
    8, 9, 9, 10, 11, 9, 9, 10, 10, 11, 11,
];
var t10l = [
    1, 4, 7, 9, 10, 10, 10, 11, 4, 6, 8, 9, 10, 11, 10, 10, 7, 8, 9, 10, 11, 12,
    11, 11, 8, 9, 10, 11, 12, 12, 11, 12, 9, 10, 11, 12, 12, 12, 12, 12, 10, 11,
    12, 12, 13, 13, 12, 13, 9, 10, 11, 12, 12, 12, 13, 13, 10, 10, 11, 12, 12, 13,
    13, 13,
];
var t11l = [
    2, 4, 6, 8, 9, 10, 9, 10, 4, 5, 6, 8, 10, 10, 9, 10, 6, 7, 8, 9, 10, 11, 10,
    10, 8, 8, 9, 11, 10, 12, 10, 11, 9, 10, 10, 11, 11, 12, 11, 12, 9, 10, 11, 12,
    12, 13, 12, 13, 9, 9, 9, 10, 11, 12, 12, 12, 9, 9, 10, 11, 12, 12, 12, 12,
];
var t12l = [
    4, 4, 6, 8, 9, 10, 10, 10, 4, 5, 6, 7, 9, 9, 10, 10, 6, 6, 7, 8, 9, 10, 9, 10,
    7, 7, 8, 8, 9, 10, 10, 10, 8, 8, 9, 9, 10, 10, 10, 11, 9, 9, 10, 10, 10, 11,
    10, 11, 9, 9, 9, 10, 10, 11, 11, 12, 10, 10, 10, 11, 11, 11, 11, 12,
];
var t13l = [
    1, 5, 7, 8, 9, 10, 10, 11, 10, 11, 12, 12, 13, 13, 14, 14, 4, 6, 8, 9, 10, 10,
    11, 11, 11, 11, 12, 12, 13, 14, 14, 14, 7, 8, 9, 10, 11, 11, 12, 12, 11, 12,
    12, 13, 13, 14, 15, 15, 8, 9, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14,
    15, 15, 9, 9, 11, 11, 12, 12, 13, 13, 12, 13, 13, 14, 14, 15, 15, 16, 10, 10,
    11, 12, 12, 12, 13, 13, 13, 13, 14, 13, 15, 15, 16, 16, 10, 11, 12, 12, 13,
    13, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 11, 11, 12, 13, 13, 13, 14, 14,
    14, 14, 15, 15, 15, 16, 18, 18, 10, 10, 11, 12, 12, 13, 13, 14, 14, 14, 14,
    15, 15, 16, 17, 17, 11, 11, 12, 12, 13, 13, 13, 15, 14, 15, 15, 16, 16, 16,
    18, 17, 11, 12, 12, 13, 13, 14, 14, 15, 14, 15, 16, 15, 16, 17, 18, 19, 12,
    12, 12, 13, 14, 14, 14, 14, 15, 15, 15, 16, 17, 17, 17, 18, 12, 13, 13, 14,
    14, 15, 14, 15, 16, 16, 17, 17, 17, 18, 18, 18, 13, 13, 14, 15, 15, 15, 16,
    16, 16, 16, 16, 17, 18, 17, 18, 18, 14, 14, 14, 15, 15, 15, 17, 16, 16, 19,
    17, 17, 17, 19, 18, 18, 13, 14, 15, 16, 16, 16, 17, 16, 17, 17, 18, 18, 21,
    20, 21, 18,
];
var t15l = [
    3, 5, 6, 8, 8, 9, 10, 10, 10, 11, 11, 12, 12, 12, 13, 14, 5, 5, 7, 8, 9, 9,
    10, 10, 10, 11, 11, 12, 12, 12, 13, 13, 6, 7, 7, 8, 9, 9, 10, 10, 10, 11, 11,
    12, 12, 13, 13, 13, 7, 8, 8, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13,
    8, 8, 9, 9, 10, 10, 11, 11, 11, 11, 12, 12, 12, 13, 13, 13, 9, 9, 9, 10, 10,
    10, 11, 11, 11, 11, 12, 12, 13, 13, 13, 14, 10, 9, 10, 10, 10, 11, 11, 11, 11,
    12, 12, 12, 13, 13, 14, 14, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12,
    13, 13, 13, 14, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 14, 14,
    14, 10, 10, 11, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 11, 11,
    11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 14, 15, 14, 11, 11, 11, 11, 12,
    12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 12, 12, 11, 12, 12, 12, 13, 13,
    13, 13, 13, 13, 14, 14, 15, 15, 12, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14,
    14, 14, 14, 15, 15, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15,
    14, 15, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15,
];
var t16_5l = [
    1, 5, 7, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13, 14, 11, 4, 6, 8, 9, 10,
    11, 11, 11, 12, 12, 12, 13, 14, 13, 14, 11, 7, 8, 9, 10, 11, 11, 12, 12, 13,
    12, 13, 13, 13, 14, 14, 12, 9, 9, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14,
    15, 15, 13, 10, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 12,
    10, 10, 11, 11, 12, 13, 13, 14, 13, 14, 14, 15, 15, 15, 16, 13, 11, 11, 11,
    12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 16, 13, 11, 11, 12, 12, 13, 13,
    13, 14, 14, 15, 15, 15, 15, 17, 17, 13, 11, 12, 12, 13, 13, 13, 14, 14, 15,
    15, 15, 15, 16, 16, 16, 13, 12, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16,
    15, 16, 15, 14, 12, 13, 12, 13, 14, 14, 14, 14, 15, 16, 16, 16, 17, 17, 16,
    13, 13, 13, 13, 13, 14, 14, 15, 16, 16, 16, 16, 16, 16, 15, 16, 14, 13, 14,
    14, 14, 14, 15, 15, 15, 15, 17, 16, 16, 16, 16, 18, 14, 15, 14, 14, 14, 15,
    15, 16, 16, 16, 18, 17, 17, 17, 19, 17, 14, 14, 15, 13, 14, 16, 16, 15, 16,
    16, 17, 18, 17, 19, 17, 16, 14, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14,
    14, 14, 14, 14, 12,
];
var t16l = [
    1, 5, 7, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13, 14, 10, 4, 6, 8, 9, 10,
    11, 11, 11, 12, 12, 12, 13, 14, 13, 14, 10, 7, 8, 9, 10, 11, 11, 12, 12, 13,
    12, 13, 13, 13, 14, 14, 11, 9, 9, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14,
    15, 15, 12, 10, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 11,
    10, 10, 11, 11, 12, 13, 13, 14, 13, 14, 14, 15, 15, 15, 16, 12, 11, 11, 11,
    12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 16, 12, 11, 11, 12, 12, 13, 13,
    13, 14, 14, 15, 15, 15, 15, 17, 17, 12, 11, 12, 12, 13, 13, 13, 14, 14, 15,
    15, 15, 15, 16, 16, 16, 12, 12, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16,
    15, 16, 15, 13, 12, 13, 12, 13, 14, 14, 14, 14, 15, 16, 16, 16, 17, 17, 16,
    12, 13, 13, 13, 13, 14, 14, 15, 16, 16, 16, 16, 16, 16, 15, 16, 13, 13, 14,
    14, 14, 14, 15, 15, 15, 15, 17, 16, 16, 16, 16, 18, 13, 15, 14, 14, 14, 15,
    15, 16, 16, 16, 18, 17, 17, 17, 19, 17, 13, 14, 15, 13, 14, 16, 16, 15, 16,
    16, 17, 18, 17, 19, 17, 16, 13, 10, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13,
    13, 13, 13, 13, 10,
];
var t24l = [
    4, 5, 7, 8, 9, 10, 10, 11, 11, 12, 12, 12, 12, 12, 13, 10, 5, 6, 7, 8, 9, 10,
    10, 11, 11, 11, 12, 12, 12, 12, 12, 10, 7, 7, 8, 9, 9, 10, 10, 11, 11, 11, 11,
    12, 12, 12, 13, 9, 8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 9,
    9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12, 12, 12, 13, 9, 10, 9, 10, 10, 10,
    10, 11, 11, 11, 11, 12, 12, 12, 12, 12, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11,
    12, 12, 12, 12, 12, 13, 9, 11, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12,
    13, 13, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 10,
    11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 10, 12, 11, 11,
    11, 11, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 10, 12, 12, 11, 11, 11, 12,
    12, 12, 12, 12, 12, 13, 13, 13, 13, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12,
    12, 13, 13, 13, 13, 13, 10, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13,
    13, 13, 13, 10, 13, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13,
    10, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 6,
];
var t32l = [
    1 + 0,
    4 + 1,
    4 + 1,
    5 + 2,
    4 + 1,
    6 + 2,
    5 + 2,
    6 + 3,
    4 + 1,
    5 + 2,
    5 + 2,
    6 + 3,
    5 + 2,
    6 + 3,
    6 + 3,
    6 + 4,
];
var t33l = [
    4 + 0,
    4 + 1,
    4 + 1,
    4 + 2,
    4 + 1,
    4 + 2,
    4 + 2,
    4 + 3,
    4 + 1,
    4 + 2,
    4 + 2,
    4 + 3,
    4 + 2,
    4 + 3,
    4 + 3,
    4 + 4,
];
var ht = [
    { xlen: 0, linmax: 0 },
    { xlen: 2, linmax: 0, table: t1HB, hlen: t1l },
    { xlen: 3, linmax: 0, table: t2HB, hlen: t2l },
    { xlen: 3, linmax: 0, table: t3HB, hlen: t3l },
    { xlen: 0, linmax: 0 },
    { xlen: 4, linmax: 0, table: t5HB, hlen: t5l },
    { xlen: 4, linmax: 0, table: t6HB, hlen: t6l },
    { xlen: 6, linmax: 0, table: t7HB, hlen: t7l },
    { xlen: 6, linmax: 0, table: t8HB, hlen: t8l },
    { xlen: 6, linmax: 0, table: t9HB, hlen: t9l },
    { xlen: 8, linmax: 0, table: t10HB, hlen: t10l },
    { xlen: 8, linmax: 0, table: t11HB, hlen: t11l },
    { xlen: 8, linmax: 0, table: t12HB, hlen: t12l },
    { xlen: 16, linmax: 0, table: t13HB, hlen: t13l },
    { xlen: 0, linmax: 0, hlen: t16_5l },
    { xlen: 16, linmax: 0, table: t15HB, hlen: t15l },
    { xlen: 1, linmax: 1, table: t16HB, hlen: t16l },
    { xlen: 2, linmax: 3, table: t16HB, hlen: t16l },
    { xlen: 3, linmax: 7, table: t16HB, hlen: t16l },
    { xlen: 4, linmax: 15, table: t16HB, hlen: t16l },
    { xlen: 6, linmax: 63, table: t16HB, hlen: t16l },
    { xlen: 8, linmax: 255, table: t16HB, hlen: t16l },
    { xlen: 10, linmax: 1023, table: t16HB, hlen: t16l },
    { xlen: 13, linmax: 8191, table: t16HB, hlen: t16l },
    { xlen: 4, linmax: 15, table: t24HB, hlen: t24l },
    { xlen: 5, linmax: 31, table: t24HB, hlen: t24l },
    { xlen: 6, linmax: 63, table: t24HB, hlen: t24l },
    { xlen: 7, linmax: 127, table: t24HB, hlen: t24l },
    { xlen: 8, linmax: 255, table: t24HB, hlen: t24l },
    { xlen: 9, linmax: 511, table: t24HB, hlen: t24l },
    { xlen: 11, linmax: 2047, table: t24HB, hlen: t24l },
    { xlen: 13, linmax: 8191, table: t24HB, hlen: t24l },
    { xlen: 0, linmax: 0, table: t32HB, hlen: t32l },
    { xlen: 0, linmax: 0, table: t33HB, hlen: t33l },
];

var Bits = /** @class */ (function () {
    function Bits(bits) {
        this.bits = Math.trunc(bits);
    }
    return Bits;
}());

var MAX_FLOAT32_VALUE = 3.4028235e38;
var LOG10 = 2.302585092994046;
var SBMAX_l = 22;
var SBMAX_s = 13;
var PSFB21 = 6;
var PSFB12 = 6;
var CBANDS = 64;
var NORM_TYPE = 0;
var START_TYPE = 1;
var SHORT_TYPE = 2;
var STOP_TYPE = 3;
var LAME_MAXALBUMART = 128 * 1024;
var LAME_MAXMP3BUFFER = 16384 + LAME_MAXALBUMART;
var BLKSIZE = 1024;
var HBLKSIZE = BLKSIZE / 2 + 1;
var BLKSIZE_s = 256;
var HBLKSIZE_s = BLKSIZE_s / 2 + 1;
var SFBMAX = SBMAX_s * 3;
var MPG_MD_LR_LR = 0;
var MPG_MD_MS_LR = 2;
var SBPSY_l = 21;
var SBPSY_s = 12;
var SBLIMIT = 32;
var ENCDELAY = 576;
var POSTDELAY = 1152;
var MDCTDELAY = 48;
var FFTOFFSET = 224 + MDCTDELAY;
var LAME_ID = 0xfff88e3b;
var BPC = 320;
var MAX_BITS_PER_GRANULE = 7680;
var MAX_BITS_PER_CHANNEL = 4095;
var MAX_HEADER_BUF = 256;
var MFSIZE = 3 * 1152 + ENCDELAY - MDCTDELAY;

var GrInfo = /** @class */ (function () {
    function GrInfo() {
        this.xr = new Float32Array(576);
        this.l3_enc = new Int32Array(576);
        this.scalefac = new Int32Array(SFBMAX);
        this.xrpow_max = 0;
        this.part2_3_length = 0;
        this.big_values = 0;
        this.count1 = 0;
        this.global_gain = 0;
        this.scalefac_compress = 0;
        this.block_type = 0;
        this.mixed_block_flag = 0;
        this.table_select = new Int32Array(3);
        this.subblock_gain = new Int32Array(3 + 1);
        this.region0_count = 0;
        this.region1_count = 0;
        this.preflag = 0;
        this.scalefac_scale = 0;
        this.count1table_select = 0;
        this.part2_length = 0;
        this.sfb_lmax = 0;
        this.sfb_smin = 0;
        this.psy_lmax = 0;
        this.sfbmax = 0;
        this.psymax = 0;
        this.sfbdivide = 0;
        this.width = new Int32Array(SFBMAX);
        this.window = new Int32Array(SFBMAX);
        this.count1bits = 0;
        this.sfb_partition_table = null;
        this.slen = new Int32Array(4);
        this.max_nonzero_coeff = 0;
    }
    GrInfo.prototype.assign = function (other) {
        this.xr = new Float32Array(other.xr);
        this.l3_enc = new Int32Array(other.l3_enc);
        this.scalefac = new Int32Array(other.scalefac);
        this.xrpow_max = other.xrpow_max;
        this.part2_3_length = other.part2_3_length;
        this.big_values = other.big_values;
        this.count1 = other.count1;
        this.global_gain = other.global_gain;
        this.scalefac_compress = other.scalefac_compress;
        this.block_type = other.block_type;
        this.mixed_block_flag = other.mixed_block_flag;
        this.table_select = new Int32Array(other.table_select);
        this.subblock_gain = new Int32Array(other.subblock_gain);
        this.region0_count = other.region0_count;
        this.region1_count = other.region1_count;
        this.preflag = other.preflag;
        this.scalefac_scale = other.scalefac_scale;
        this.count1table_select = other.count1table_select;
        this.part2_length = other.part2_length;
        this.sfb_lmax = other.sfb_lmax;
        this.sfb_smin = other.sfb_smin;
        this.psy_lmax = other.psy_lmax;
        this.sfbmax = other.sfbmax;
        this.psymax = other.psymax;
        this.sfbdivide = other.sfbdivide;
        this.width = new Int32Array(other.width);
        this.window = new Int32Array(other.window);
        this.count1bits = other.count1bits;
        this.sfb_partition_table =
            other.sfb_partition_table !== null
                ? Array.from(other.sfb_partition_table)
                : null;
        this.slen = new Int32Array(other.slen);
        this.max_nonzero_coeff = other.max_nonzero_coeff;
    };
    return GrInfo;
}());

function assert(condition, _message) {
}

var QuantizePVT = /** @class */ (function () {
    function QuantizePVT(psy) {
        this.nr_of_sfb_block = [
            [
                [6, 5, 5, 5],
                [9, 9, 9, 9],
                [6, 9, 9, 9],
            ],
            [
                [6, 5, 7, 3],
                [9, 9, 12, 6],
                [6, 9, 12, 6],
            ],
            [
                [11, 10, 0, 0],
                [18, 18, 0, 0],
                [15, 18, 0, 0],
            ],
            [
                [7, 7, 7, 0],
                [12, 12, 12, 0],
                [6, 15, 12, 0],
            ],
            [
                [6, 6, 6, 3],
                [12, 9, 9, 6],
                [6, 12, 9, 6],
            ],
            [
                [8, 8, 5, 0],
                [15, 12, 9, 0],
                [6, 18, 9, 0],
            ],
        ];
        this.pretab = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 0,
        ];
        this.psy = psy;
    }
    QuantizePVT.prototype.ipow20 = function (x) {
        if (this._ipow20 === undefined) {
            this._ipow20 = new Float32Array(QuantizePVT.Q_MAX);
            for (var i = 0; i < QuantizePVT.Q_MAX; i++) {
                this._ipow20[i] = Math.pow(2.0, (i - 210) * -0.1875);
            }
        }
        return this._ipow20[x];
    };
    QuantizePVT.prototype.pow43 = function (k) {
        if (this._pow43 === undefined) {
            this._pow43 = new Float32Array(QuantizePVT.PRECALC_SIZE);
            this._pow43[0] = 0.0;
            for (var i = 1; i < QuantizePVT.PRECALC_SIZE; i++) {
                this._pow43[i] = Math.pow(i, 4.0 / 3.0);
            }
        }
        return this._pow43[k];
    };
    QuantizePVT.prototype.adj43 = function (k) {
        if (this._adj43 === undefined) {
            this._adj43 = new Float32Array(QuantizePVT.PRECALC_SIZE);
            var i = void 0;
            for (i = 0; i < QuantizePVT.PRECALC_SIZE - 1; i++) {
                this._adj43[i] =
                    i + 1 - Math.pow(0.5 * (this.pow43(i) + this.pow43(i + 1)), 0.75);
            }
            this._adj43[i] = 0.5;
        }
        return this._adj43[k];
    };
    QuantizePVT.prototype.ATHmdct = function (gfp, f) {
        var ath = this.psy.ATHformula(f, gfp);
        ath -= QuantizePVT.NSATHSCALE;
        ath = Math.pow(10.0, ath / 10.0 + gfp.ATHlower);
        return ath;
    };
    QuantizePVT.prototype.compute_ath = function (gfp) {
        var ATH_l = gfp.internal_flags.ATH.l;
        var ATH_psfb21 = gfp.internal_flags.ATH.psfb21;
        var ATH_s = gfp.internal_flags.ATH.s;
        var ATH_psfb12 = gfp.internal_flags.ATH.psfb12;
        var gfc = gfp.internal_flags;
        var samp_freq = gfp.out_samplerate;
        for (var sfb = 0; sfb < SBMAX_l; sfb++) {
            var start = gfc.scalefac_band.l[sfb];
            var end = gfc.scalefac_band.l[sfb + 1];
            ATH_l[sfb] = MAX_FLOAT32_VALUE;
            for (var i = start; i < end; i++) {
                var freq = (i * samp_freq) / (2 * 576);
                var ATH_f = this.ATHmdct(gfp, freq);
                ATH_l[sfb] = Math.min(ATH_l[sfb], ATH_f);
            }
        }
        for (var sfb = 0; sfb < PSFB21; sfb++) {
            var start = gfc.scalefac_band.psfb21[sfb];
            var end = gfc.scalefac_band.psfb21[sfb + 1];
            ATH_psfb21[sfb] = MAX_FLOAT32_VALUE;
            for (var i = start; i < end; i++) {
                var freq = (i * samp_freq) / (2 * 576);
                var ATH_f = this.ATHmdct(gfp, freq);
                ATH_psfb21[sfb] = Math.min(ATH_psfb21[sfb], ATH_f);
            }
        }
        for (var sfb = 0; sfb < SBMAX_s; sfb++) {
            var start = gfc.scalefac_band.s[sfb];
            var end = gfc.scalefac_band.s[sfb + 1];
            ATH_s[sfb] = MAX_FLOAT32_VALUE;
            for (var i = start; i < end; i++) {
                var freq = (i * samp_freq) / (2 * 192);
                var ATH_f = this.ATHmdct(gfp, freq);
                ATH_s[sfb] = Math.min(ATH_s[sfb], ATH_f);
            }
            ATH_s[sfb] *= gfc.scalefac_band.s[sfb + 1] - gfc.scalefac_band.s[sfb];
        }
        for (var sfb = 0; sfb < PSFB12; sfb++) {
            var start = gfc.scalefac_band.psfb12[sfb];
            var end = gfc.scalefac_band.psfb12[sfb + 1];
            ATH_psfb12[sfb] = MAX_FLOAT32_VALUE;
            for (var i = start; i < end; i++) {
                var freq = (i * samp_freq) / (2 * 192);
                var ATH_f = this.ATHmdct(gfp, freq);
                ATH_psfb12[sfb] = Math.min(ATH_psfb12[sfb], ATH_f);
            }
            ATH_psfb12[sfb] *= gfc.scalefac_band.s[13] - gfc.scalefac_band.s[12];
        }
        gfc.ATH.floor = 10 * Math.log10(this.ATHmdct(gfp, -1));
    };
    QuantizePVT.prototype.iteration_init = function (gfp, tak) {
        var gfc = gfp.internal_flags;
        var l3_side = gfc.l3_side;
        var i;
        if (!gfc.iteration_init_init) {
            gfc.iteration_init_init = true;
            l3_side.main_data_begin = 0;
            this.compute_ath(gfp);
            tak.huffman_init(gfc);
            i = (gfp.exp_nspsytune >> 2) & 63;
            if (i >= 32)
                i -= 64;
            var bass = Math.pow(10, i / 4.0 / 10.0);
            i = (gfp.exp_nspsytune >> 8) & 63;
            if (i >= 32)
                i -= 64;
            var alto = Math.pow(10, i / 4.0 / 10.0);
            i = (gfp.exp_nspsytune >> 14) & 63;
            if (i >= 32)
                i -= 64;
            var treble = Math.pow(10, i / 4.0 / 10.0);
            i = (gfp.exp_nspsytune >> 20) & 63;
            if (i >= 32)
                i -= 64;
            var sfb21 = treble * Math.pow(10, i / 4.0 / 10.0);
            for (i = 0; i < SBMAX_l; i++) {
                var f = void 0;
                if (i <= 6)
                    f = bass;
                else if (i <= 13)
                    f = alto;
                else if (i <= 20)
                    f = treble;
                else
                    f = sfb21;
                gfc.nsPsy.longfact[i] = f;
            }
            for (i = 0; i < SBMAX_s; i++) {
                var f = void 0;
                if (i <= 5)
                    f = bass;
                else if (i <= 10)
                    f = alto;
                else if (i <= 11)
                    f = treble;
                else
                    f = sfb21;
                gfc.nsPsy.shortfact[i] = f;
            }
        }
    };
    QuantizePVT.prototype.reduce_side = function (targ_bits, ms_ener_ratio, mean_bits, max_bits) {
        assert(targ_bits[0] + targ_bits[1] <= MAX_BITS_PER_GRANULE);
        var fac = (0.33 * (0.5 - ms_ener_ratio)) / 0.5;
        if (fac < 0)
            fac = 0;
        if (fac > 0.5)
            fac = 0.5;
        var move_bits = Math.trunc(fac * 0.5 * (targ_bits[0] + targ_bits[1]));
        if (move_bits > MAX_BITS_PER_CHANNEL - targ_bits[0]) {
            move_bits = MAX_BITS_PER_CHANNEL - targ_bits[0];
        }
        if (move_bits < 0)
            move_bits = 0;
        if (targ_bits[1] >= 125) {
            if (targ_bits[1] - move_bits > 125) {
                if (targ_bits[0] < mean_bits)
                    targ_bits[0] += move_bits;
                targ_bits[1] -= move_bits;
            }
            else {
                targ_bits[0] += targ_bits[1] - 125;
                targ_bits[1] = 125;
            }
        }
        move_bits = targ_bits[0] + targ_bits[1];
        if (move_bits > max_bits) {
            targ_bits[0] = (max_bits * targ_bits[0]) / move_bits;
            targ_bits[1] = (max_bits * targ_bits[1]) / move_bits;
        }
        assert(targ_bits[0] <= MAX_BITS_PER_CHANNEL);
        assert(targ_bits[1] <= MAX_BITS_PER_CHANNEL);
        assert(targ_bits[0] + targ_bits[1] <= MAX_BITS_PER_GRANULE);
    };
    QuantizePVT.prototype.athAdjust = function (a, x, athFloor) {
        var o = 90.30873362;
        var p = 94.82444863;
        var u = Math.log10(x) * 10.0;
        var v = a * a;
        var w = 0.0;
        u -= athFloor;
        if (v > 1e-20)
            w = 1 + Math.log10(v) * (10.0 / o);
        if (w < 0)
            w = 0;
        u *= w;
        u += athFloor + o - p;
        return Math.pow(10, 0.1 * u);
    };
    // eslint-disable-next-line complexity
    QuantizePVT.prototype.calc_xmin = function (gfp, ratio, cod_info, pxmin) {
        var pxminPos = 0;
        var gfc = gfp.internal_flags;
        var gsfb;
        var j = 0;
        var ath_over = 0;
        var ATH = gfc.ATH;
        var xr = cod_info.xr;
        var enable_athaa_fix = gfp.VBR === 4 /* VbrMode.vbr_mtrh */ ? 1 : 0;
        var masking_lower = gfc.masking_lower;
        if (gfp.VBR === 4 /* VbrMode.vbr_mtrh */ || gfp.VBR === 1 /* VbrMode.vbr_mt */) {
            masking_lower = 1.0;
        }
        for (gsfb = 0; gsfb < cod_info.psy_lmax; gsfb++) {
            var en0 = void 0;
            var xmin = void 0;
            var rh2 = void 0;
            var l = void 0;
            if (gfp.VBR === 2 /* VbrMode.vbr_rh */ || gfp.VBR === 4 /* VbrMode.vbr_mtrh */)
                xmin = this.athAdjust(ATH.adjust, ATH.l[gsfb], ATH.floor);
            else
                xmin = ATH.adjust * ATH.l[gsfb];
            var width = cod_info.width[gsfb];
            var rh1 = xmin / width;
            rh2 = QuantizePVT.DBL_EPSILON;
            l = width >> 1;
            en0 = 0.0;
            do {
                var xa = xr[j] * xr[j];
                en0 += xa;
                rh2 += xa < rh1 ? xa : rh1;
                j++;
                var xb = xr[j] * xr[j];
                en0 += xb;
                rh2 += xb < rh1 ? xb : rh1;
                j++;
            } while (--l > 0);
            if (en0 > xmin)
                ath_over++;
            if (gsfb === SBPSY_l) {
                var x = xmin * gfc.nsPsy.longfact[gsfb];
                if (rh2 < x) {
                    rh2 = x;
                }
            }
            if (enable_athaa_fix !== 0) {
                xmin = rh2;
            }
            var e = ratio.en.l[gsfb];
            if (e > 0.0) {
                var x = void 0;
                x = (en0 * ratio.thm.l[gsfb] * masking_lower) / e;
                if (enable_athaa_fix !== 0)
                    x *= gfc.nsPsy.longfact[gsfb];
                if (xmin < x)
                    xmin = x;
            }
            if (enable_athaa_fix !== 0)
                pxmin[pxminPos++] = xmin;
            else
                pxmin[pxminPos++] = xmin * gfc.nsPsy.longfact[gsfb];
        }
        var max_nonzero = 575;
        if (cod_info.block_type !== SHORT_TYPE) {
            var k = 576;
            while (k-- !== 0 && isCloseToEachOther(xr[k], 0)) {
                max_nonzero = k;
            }
        }
        cod_info.max_nonzero_coeff = max_nonzero;
        for (var sfb = cod_info.sfb_smin; gsfb < cod_info.psymax; sfb++, gsfb += 3) {
            var b = void 0;
            var tmpATH = void 0;
            if (gfp.VBR === 2 /* VbrMode.vbr_rh */ || gfp.VBR === 4 /* VbrMode.vbr_mtrh */)
                tmpATH = this.athAdjust(ATH.adjust, ATH.s[sfb], ATH.floor);
            else
                tmpATH = ATH.adjust * ATH.s[sfb];
            var width = cod_info.width[gsfb];
            for (b = 0; b < 3; b++) {
                var en0 = 0.0;
                var xmin = void 0;
                var rh2 = void 0;
                var l = width >> 1;
                var rh1 = tmpATH / width;
                rh2 = QuantizePVT.DBL_EPSILON;
                do {
                    var xa = xr[j] * xr[j];
                    en0 += xa;
                    rh2 += xa < rh1 ? xa : rh1;
                    j++;
                    var xb = xr[j] * xr[j];
                    en0 += xb;
                    rh2 += xb < rh1 ? xb : rh1;
                    j++;
                } while (--l > 0);
                if (en0 > tmpATH)
                    ath_over++;
                if (sfb === SBPSY_s) {
                    var x = tmpATH * gfc.nsPsy.shortfact[sfb];
                    if (rh2 < x) {
                        rh2 = x;
                    }
                }
                if (enable_athaa_fix !== 0)
                    xmin = rh2;
                else
                    xmin = tmpATH;
                var e = ratio.en.s[sfb][b];
                if (e > 0.0) {
                    var x = void 0;
                    x = (en0 * ratio.thm.s[sfb][b] * masking_lower) / e;
                    if (enable_athaa_fix !== 0)
                        x *= gfc.nsPsy.shortfact[sfb];
                    if (xmin < x)
                        xmin = x;
                }
                if (enable_athaa_fix !== 0)
                    pxmin[pxminPos++] = xmin;
                else
                    pxmin[pxminPos++] = xmin * gfc.nsPsy.shortfact[sfb];
            }
        }
        return ath_over;
    };
    QuantizePVT.Q_MAX = 256 + 1;
    QuantizePVT.Q_MAX2 = 116;
    QuantizePVT.IXMAX_VAL = 8206;
    QuantizePVT.DBL_EPSILON = 2.2204460492503131e-16;
    QuantizePVT.PRECALC_SIZE = QuantizePVT.IXMAX_VAL + 2;
    QuantizePVT.NSATHSCALE = 100;
    return QuantizePVT;
}());

var Takehiro = /** @class */ (function () {
    function Takehiro(qupvt) {
        this.largetbl = [
            0x010004, 0x050005, 0x070007, 0x090008, 0x0a0009, 0x0a000a, 0x0b000a,
            0x0b000b, 0x0c000b, 0x0c000c, 0x0c000c, 0x0d000c, 0x0d000c, 0x0d000c,
            0x0e000d, 0x0a000a, 0x040005, 0x060006, 0x080007, 0x090008, 0x0a0009,
            0x0b000a, 0x0b000a, 0x0b000b, 0x0c000b, 0x0c000b, 0x0c000c, 0x0d000c,
            0x0e000c, 0x0d000c, 0x0e000c, 0x0a000a, 0x070007, 0x080007, 0x090008,
            0x0a0009, 0x0b0009, 0x0b000a, 0x0c000a, 0x0c000b, 0x0d000b, 0x0c000b,
            0x0d000b, 0x0d000c, 0x0d000c, 0x0e000c, 0x0e000d, 0x0b0009, 0x090008,
            0x090008, 0x0a0009, 0x0b0009, 0x0b000a, 0x0c000a, 0x0c000a, 0x0c000b,
            0x0d000b, 0x0d000b, 0x0e000b, 0x0e000c, 0x0e000c, 0x0f000c, 0x0f000c,
            0x0c0009, 0x0a0009, 0x0a0009, 0x0b0009, 0x0b000a, 0x0c000a, 0x0c000a,
            0x0d000a, 0x0d000b, 0x0d000b, 0x0e000b, 0x0e000c, 0x0e000c, 0x0f000c,
            0x0f000c, 0x0f000d, 0x0b0009, 0x0a000a, 0x0a0009, 0x0b000a, 0x0b000a,
            0x0c000a, 0x0d000a, 0x0d000b, 0x0e000b, 0x0d000b, 0x0e000b, 0x0e000c,
            0x0f000c, 0x0f000c, 0x0f000c, 0x10000c, 0x0c0009, 0x0b000a, 0x0b000a,
            0x0b000a, 0x0c000a, 0x0d000a, 0x0d000b, 0x0d000b, 0x0d000b, 0x0e000b,
            0x0e000c, 0x0e000c, 0x0e000c, 0x0f000c, 0x0f000c, 0x10000d, 0x0c0009,
            0x0b000b, 0x0b000a, 0x0c000a, 0x0c000a, 0x0d000b, 0x0d000b, 0x0d000b,
            0x0e000b, 0x0e000c, 0x0f000c, 0x0f000c, 0x0f000c, 0x0f000c, 0x11000d,
            0x11000d, 0x0c000a, 0x0b000b, 0x0c000b, 0x0c000b, 0x0d000b, 0x0d000b,
            0x0d000b, 0x0e000b, 0x0e000b, 0x0f000b, 0x0f000c, 0x0f000c, 0x0f000c,
            0x10000c, 0x10000d, 0x10000d, 0x0c000a, 0x0c000b, 0x0c000b, 0x0c000b,
            0x0d000b, 0x0d000b, 0x0e000b, 0x0e000b, 0x0f000c, 0x0f000c, 0x0f000c,
            0x0f000c, 0x10000c, 0x0f000d, 0x10000d, 0x0f000d, 0x0d000a, 0x0c000c,
            0x0d000b, 0x0c000b, 0x0d000b, 0x0e000b, 0x0e000c, 0x0e000c, 0x0e000c,
            0x0f000c, 0x10000c, 0x10000c, 0x10000d, 0x11000d, 0x11000d, 0x10000d,
            0x0c000a, 0x0d000c, 0x0d000c, 0x0d000b, 0x0d000b, 0x0e000b, 0x0e000c,
            0x0f000c, 0x10000c, 0x10000c, 0x10000c, 0x10000c, 0x10000d, 0x10000d,
            0x0f000d, 0x10000d, 0x0d000a, 0x0d000c, 0x0e000c, 0x0e000c, 0x0e000c,
            0x0e000c, 0x0f000c, 0x0f000c, 0x0f000c, 0x0f000c, 0x11000c, 0x10000d,
            0x10000d, 0x10000d, 0x10000d, 0x12000d, 0x0d000a, 0x0f000c, 0x0e000c,
            0x0e000c, 0x0e000c, 0x0f000c, 0x0f000c, 0x10000c, 0x10000c, 0x10000d,
            0x12000d, 0x11000d, 0x11000d, 0x11000d, 0x13000d, 0x11000d, 0x0d000a,
            0x0e000d, 0x0f000c, 0x0d000c, 0x0e000c, 0x10000c, 0x10000c, 0x0f000c,
            0x10000d, 0x10000d, 0x11000d, 0x12000d, 0x11000d, 0x13000d, 0x11000d,
            0x10000d, 0x0d000a, 0x0a0009, 0x0a0009, 0x0a0009, 0x0b0009, 0x0b0009,
            0x0c0009, 0x0c0009, 0x0c0009, 0x0d0009, 0x0d0009, 0x0d0009, 0x0d000a,
            0x0d000a, 0x0d000a, 0x0d000a, 0x0a0006,
        ];
        this.table23 = [
            0x010002, 0x040003, 0x070007, 0x040004, 0x050004, 0x070007, 0x060006,
            0x070007, 0x080008,
        ];
        this.table56 = [
            0x010003, 0x040004, 0x070006, 0x080008, 0x040004, 0x050004, 0x080006,
            0x090007, 0x070005, 0x080006, 0x090007, 0x0a0008, 0x080007, 0x080007,
            0x090008, 0x0a0009,
        ];
        this.scfsi_band = [0, 6, 11, 16, 21];
        this.subdv_table = [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 1],
            [1, 2],
            [2, 2],
            [2, 3],
            [2, 3],
            [3, 4],
            [3, 4],
            [3, 4],
            [4, 5],
            [4, 5],
            [4, 6],
            [5, 6],
            [5, 6],
            [5, 7],
            [6, 7],
            [6, 7],
        ];
        this.huf_tbl_noESC = [
            1, 2, 5, 7, 7, 10, 10, 13, 13, 13, 13, 13, 13, 13, 13,
        ];
        this.slen1_n = [
            1, 1, 1, 1, 8, 2, 2, 2, 4, 4, 4, 8, 8, 8, 16, 16,
        ];
        this.slen2_n = [
            1, 2, 4, 8, 1, 2, 4, 8, 2, 4, 8, 2, 4, 8, 4, 8,
        ];
        this.scale_short = [
            0, 18, 36, 54, 54, 36, 54, 72, 54, 72, 90, 72, 90, 108, 108, 126,
        ];
        this.scale_mixed = [
            0, 18, 36, 54, 51, 35, 53, 71, 52, 70, 88, 69, 87, 105, 104, 122,
        ];
        this.scale_long = [
            0, 10, 20, 30, 33, 21, 31, 41, 32, 42, 52, 43, 53, 63, 64, 74,
        ];
        this.max_range_sfac_tab = [
            [15, 15, 7, 7],
            [15, 15, 7, 0],
            [7, 3, 0, 0],
            [15, 31, 31, 0],
            [7, 7, 7, 0],
            [3, 3, 0, 0],
        ];
        this.log2tab = [
            0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4,
        ];
        this.qupvt = qupvt;
    }
    Takehiro.prototype.quantize_lines_xrpow_01 = function (l, istep, xr, xrPos, ix, ixPos) {
        var compareval0 = (1.0 - 0.4054) / istep;
        l >>= 1;
        while (l-- !== 0) {
            ix[ixPos++] = compareval0 > xr[xrPos++] ? 0 : 1;
            ix[ixPos++] = compareval0 > xr[xrPos++] ? 0 : 1;
        }
    };
    Takehiro.prototype.quantize_lines_xrpow = function (l, istep, xr, xrPos, ix, ixPos) {
        l >>= 1;
        var remaining = l % 2;
        l >>= 1;
        while (l-- !== 0) {
            var x0 = xr[xrPos++] * istep;
            var x1 = xr[xrPos++] * istep;
            var rx0 = Math.trunc(x0);
            var x2 = xr[xrPos++] * istep;
            var rx1 = Math.trunc(x1);
            var x3 = xr[xrPos++] * istep;
            var rx2 = Math.trunc(x2);
            x0 += this.qupvt.adj43(rx0);
            var rx3 = Math.trunc(x3);
            x1 += this.qupvt.adj43(rx1);
            ix[ixPos++] = Math.trunc(x0);
            x2 += this.qupvt.adj43(rx2);
            ix[ixPos++] = Math.trunc(x1);
            x3 += this.qupvt.adj43(rx3);
            ix[ixPos++] = Math.trunc(x2);
            ix[ixPos++] = Math.trunc(x3);
        }
        if (remaining !== 0) {
            var x0 = xr[xrPos++] * istep;
            var x1 = xr[xrPos++] * istep;
            var rx0 = Math.trunc(x0);
            var rx1 = Math.trunc(x1);
            x0 += this.qupvt.adj43(rx0);
            x1 += this.qupvt.adj43(rx1);
            ix[ixPos++] = Math.trunc(x0);
            ix[ixPos++] = Math.trunc(x1);
        }
    };
    Takehiro.prototype.quantize_xrpow = function (xp, pi, istep, codInfo, prevNoise) {
        var sfb;
        var sfbmax;
        var j = 0;
        var accumulate = 0;
        var accumulate01 = 0;
        var xpPos = 0;
        var iData = pi;
        var iDataPos = 0;
        var acc_iData = iData;
        var acc_iDataPos = 0;
        var acc_xp = xp;
        var acc_xpPos = 0;
        var prev_data_use = prevNoise !== null && codInfo.global_gain === prevNoise.global_gain;
        if (codInfo.block_type === SHORT_TYPE)
            sfbmax = 38;
        else
            sfbmax = 21;
        for (sfb = 0; sfb <= sfbmax; sfb++) {
            var step = -1;
            if (prev_data_use || codInfo.block_type === NORM_TYPE) {
                step =
                    codInfo.global_gain -
                        ((codInfo.scalefac[sfb] +
                            (codInfo.preflag !== 0 ? this.qupvt.pretab[sfb] : 0)) <<
                            (codInfo.scalefac_scale + 1)) -
                        codInfo.subblock_gain[codInfo.window[sfb]] * 8;
            }
            assert(codInfo.width[sfb] >= 0);
            if (prev_data_use && prevNoise.step[sfb] === step) {
                if (accumulate !== 0) {
                    this.quantize_lines_xrpow(accumulate, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
                    accumulate = 0;
                }
                if (accumulate01 !== 0) {
                    this.quantize_lines_xrpow_01(accumulate01, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
                    accumulate01 = 0;
                }
            }
            else {
                var l = codInfo.width[sfb];
                if (j + codInfo.width[sfb] > codInfo.max_nonzero_coeff) {
                    var usefullsize = codInfo.max_nonzero_coeff - j + 1;
                    fillArray(pi, codInfo.max_nonzero_coeff, 576, 0);
                    l = usefullsize;
                    if (l < 0) {
                        l = 0;
                    }
                    sfb = sfbmax + 1;
                }
                if (accumulate === 0 && accumulate01 === 0) {
                    acc_iData = iData;
                    acc_iDataPos = iDataPos;
                    acc_xp = xp;
                    acc_xpPos = xpPos;
                }
                if (prevNoise !== null &&
                    prevNoise.sfb_count1 > 0 &&
                    sfb >= prevNoise.sfb_count1 &&
                    prevNoise.step[sfb] > 0 &&
                    step >= prevNoise.step[sfb]) {
                    if (accumulate !== 0) {
                        this.quantize_lines_xrpow(accumulate, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
                        accumulate = 0;
                        acc_iData = iData;
                        acc_iDataPos = iDataPos;
                        acc_xp = xp;
                        acc_xpPos = xpPos;
                    }
                    accumulate01 += l;
                }
                else {
                    if (accumulate01 !== 0) {
                        this.quantize_lines_xrpow_01(accumulate01, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
                        accumulate01 = 0;
                        acc_iData = iData;
                        acc_iDataPos = iDataPos;
                        acc_xp = xp;
                        acc_xpPos = xpPos;
                    }
                    accumulate += l;
                }
                if (l <= 0) {
                    if (accumulate01 !== 0) {
                        this.quantize_lines_xrpow_01(accumulate01, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
                        accumulate01 = 0;
                    }
                    if (accumulate !== 0) {
                        this.quantize_lines_xrpow(accumulate, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
                        accumulate = 0;
                    }
                    break;
                }
            }
            if (sfb <= sfbmax) {
                iDataPos += codInfo.width[sfb];
                xpPos += codInfo.width[sfb];
                j += codInfo.width[sfb];
            }
        }
        if (accumulate !== 0) {
            this.quantize_lines_xrpow(accumulate, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
        }
        if (accumulate01 !== 0) {
            this.quantize_lines_xrpow_01(accumulate01, istep, acc_xp, acc_xpPos, acc_iData, acc_iDataPos);
        }
    };
    Takehiro.prototype.ix_max = function (ix, ixPos, endPos) {
        var max1 = 0;
        var max2 = 0;
        do {
            var x1 = ix[ixPos++];
            var x2 = ix[ixPos++];
            if (max1 < x1)
                max1 = x1;
            if (max2 < x2)
                max2 = x2;
        } while (ixPos < endPos);
        if (max1 < max2)
            max1 = max2;
        return max1;
    };
    Takehiro.prototype.count_bit_ESC = function (ix, ixPos, end, t1, t2, s) {
        var linbits = ht[t1].xlen * 65536 + ht[t2].xlen;
        var sum = 0;
        do {
            var x = ix[ixPos++];
            var y = ix[ixPos++];
            if (x !== 0) {
                if (x > 14) {
                    x = 15;
                    sum += linbits;
                }
                x *= 16;
            }
            if (y !== 0) {
                if (y > 14) {
                    y = 15;
                    sum += linbits;
                }
                x += y;
            }
            sum += this.largetbl[x];
        } while (ixPos < end);
        var sum2 = sum & 0xffff;
        sum >>= 16;
        if (sum > sum2) {
            sum = sum2;
            t1 = t2;
        }
        s.bits += sum;
        return t1;
    };
    Takehiro.prototype.count_bit_noESC = function (ix, ixPos, end, s) {
        var sum1 = 0;
        var hlen1 = ht[1].hlen;
        do {
            var x = ix[ixPos + 0] * 2 + ix[ixPos + 1];
            ixPos += 2;
            sum1 += hlen1[x];
        } while (ixPos < end);
        s.bits += sum1;
        return 1;
    };
    Takehiro.prototype.count_bit_noESC_from2 = function (ix, ixPos, end, t1, s) {
        var sum = 0;
        var xlen = ht[t1].xlen;
        var hlen;
        if (t1 === 2)
            hlen = this.table23;
        else
            hlen = this.table56;
        do {
            var x = ix[ixPos + 0] * xlen + ix[ixPos + 1];
            ixPos += 2;
            sum += hlen[x];
        } while (ixPos < end);
        var sum2 = sum & 0xffff;
        sum >>= 16;
        if (sum > sum2) {
            sum = sum2;
            t1++;
        }
        s.bits += sum;
        return t1;
    };
    Takehiro.prototype.count_bit_noESC_from3 = function (ix, ixPos, end, t1, s) {
        var sum1 = 0;
        var sum2 = 0;
        var sum3 = 0;
        var xlen = ht[t1].xlen;
        var hlen1 = ht[t1].hlen;
        var hlen2 = ht[t1 + 1].hlen;
        var hlen3 = ht[t1 + 2].hlen;
        do {
            var x = ix[ixPos + 0] * xlen + ix[ixPos + 1];
            ixPos += 2;
            sum1 += hlen1[x];
            sum2 += hlen2[x];
            sum3 += hlen3[x];
        } while (ixPos < end);
        var t = t1;
        if (sum1 > sum2) {
            sum1 = sum2;
            t++;
        }
        if (sum1 > sum3) {
            sum1 = sum3;
            t = t1 + 2;
        }
        s.bits += sum1;
        return t;
    };
    Takehiro.prototype.choose_table = function (ix, ixPos, endPos, s) {
        var max = this.ix_max(ix, ixPos, endPos);
        switch (max) {
            case 0:
                return max;
            case 1:
                return this.count_bit_noESC(ix, ixPos, endPos, s);
            case 2:
            case 3:
                return this.count_bit_noESC_from2(ix, ixPos, endPos, this.huf_tbl_noESC[max - 1], s);
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
                return this.count_bit_noESC_from3(ix, ixPos, endPos, this.huf_tbl_noESC[max - 1], s);
            default:
                if (max > QuantizePVT.IXMAX_VAL) {
                    s.bits = Takehiro.LARGE_BITS;
                    return -1;
                }
                max -= 15;
                var choice2 = void 0;
                for (choice2 = 24; choice2 < 32; choice2++) {
                    if (ht[choice2].linmax >= max) {
                        break;
                    }
                }
                var choice = void 0;
                for (choice = choice2 - 8; choice < 24; choice++) {
                    if (ht[choice].linmax >= max) {
                        break;
                    }
                }
                return this.count_bit_ESC(ix, ixPos, endPos, choice, choice2, s);
        }
    };
    Takehiro.prototype.noquant_count_bits = function (gfc, gi, prev_noise) {
        var ix = gi.l3_enc;
        var i = Math.min(576, ((gi.max_nonzero_coeff + 2) >> 1) << 1);
        if (prev_noise !== null)
            prev_noise.sfb_count1 = 0;
        for (; i > 1; i -= 2)
            if ((ix[i - 1] | ix[i - 2]) !== 0)
                break;
        gi.count1 = i;
        var a1 = 0;
        var a2 = 0;
        for (; i > 3; i -= 4) {
            if (((ix[i - 1] | ix[i - 2] | ix[i - 3] | ix[i - 4]) & 0x7fffffff) > 1) {
                break;
            }
            var p = ((ix[i - 4] * 2 + ix[i - 3]) * 2 + ix[i - 2]) * 2 + ix[i - 1];
            a1 += t32l[p];
            a2 += t33l[p];
        }
        var bits = a1;
        gi.count1table_select = 0;
        if (a1 > a2) {
            bits = a2;
            gi.count1table_select = 1;
        }
        gi.count1bits = bits;
        gi.big_values = i;
        if (i === 0)
            return bits;
        if (gi.block_type === SHORT_TYPE) {
            a1 = 3 * gfc.scalefac_band.s[3];
            if (a1 > gi.big_values)
                a1 = gi.big_values;
            a2 = gi.big_values;
        }
        else if (gi.block_type === NORM_TYPE) {
            a1 = gfc.bv_scf[i - 2];
            gi.region0_count = gfc.bv_scf[i - 2];
            a2 = gfc.bv_scf[i - 1];
            gi.region1_count = gfc.bv_scf[i - 1];
            a2 = gfc.scalefac_band.l[a1 + a2 + 2];
            a1 = gfc.scalefac_band.l[a1 + 1];
            if (a2 < i) {
                var bi = new Bits(bits);
                gi.table_select[2] = this.choose_table(ix, a2, i, bi);
                bits = bi.bits;
            }
        }
        else {
            gi.region0_count = 7;
            gi.region1_count = SBMAX_l - 1 - 7 - 1;
            a1 = gfc.scalefac_band.l[7 + 1];
            a2 = i;
            if (a1 > a2) {
                a1 = a2;
            }
        }
        a1 = Math.min(a1, i);
        a2 = Math.min(a2, i);
        if (a1 > 0) {
            var bi = new Bits(bits);
            gi.table_select[0] = this.choose_table(ix, 0, a1, bi);
            bits = bi.bits;
        }
        if (a1 < a2) {
            var bi = new Bits(bits);
            gi.table_select[1] = this.choose_table(ix, a1, a2, bi);
            bits = bi.bits;
        }
        if (gfc.use_best_huffman === 2) {
            gi.part2_3_length = bits;
            this.best_huffman_divide(gfc, gi);
            bits = gi.part2_3_length;
        }
        if (prev_noise !== null) {
            if (gi.block_type === NORM_TYPE) {
                var sfb = 0;
                while (gfc.scalefac_band.l[sfb] < gi.big_values) {
                    sfb++;
                }
                prev_noise.sfb_count1 = sfb;
            }
        }
        return bits;
    };
    Takehiro.prototype.count_bits = function (gfc, xr, gi, prev_noise) {
        var ix = gi.l3_enc;
        var w = QuantizePVT.IXMAX_VAL / this.qupvt.ipow20(gi.global_gain);
        if (gi.xrpow_max > w)
            return Takehiro.LARGE_BITS;
        this.quantize_xrpow(xr, ix, this.qupvt.ipow20(gi.global_gain), gi, prev_noise);
        if ((gfc.substep_shaping & 2) !== 0) {
            var j = 0;
            var gain = gi.global_gain + gi.scalefac_scale;
            var roundfac = 0.634521682242439 / this.qupvt.ipow20(gain);
            for (var sfb = 0; sfb < gi.sfbmax; sfb++) {
                var width = gi.width[sfb];
                if (gfc.pseudohalf[sfb] === 0) {
                    j += width;
                }
                else {
                    var k = void 0;
                    for (k = j, j += width; k < j; ++k) {
                        ix[k] = xr[k] >= roundfac ? ix[k] : 0;
                    }
                }
            }
        }
        return this.noquant_count_bits(gfc, gi, prev_noise);
    };
    Takehiro.prototype.recalc_divide_init = function (gfc, cod_info, ix, r01_bits, r01_div, r0_tbl, r1_tbl) {
        var bigv = cod_info.big_values;
        for (var r0 = 0; r0 <= 7 + 15; r0++) {
            r01_bits[r0] = Takehiro.LARGE_BITS;
        }
        for (var r0 = 0; r0 < 16; r0++) {
            var a1 = gfc.scalefac_band.l[r0 + 1];
            if (a1 >= bigv)
                break;
            var r0bits = 0;
            var bi = new Bits(r0bits);
            var r0t = this.choose_table(ix, 0, a1, bi);
            r0bits = bi.bits;
            for (var r1 = 0; r1 < 8; r1++) {
                var a2 = gfc.scalefac_band.l[r0 + r1 + 2];
                if (a2 >= bigv)
                    break;
                var bits = r0bits;
                bi = new Bits(bits);
                var r1t = this.choose_table(ix, a1, a2, bi);
                bits = bi.bits;
                if (r01_bits[r0 + r1] > bits) {
                    r01_bits[r0 + r1] = bits;
                    r01_div[r0 + r1] = r0;
                    r0_tbl[r0 + r1] = r0t;
                    r1_tbl[r0 + r1] = r1t;
                }
            }
        }
    };
    Takehiro.prototype.recalc_divide_sub = function (gfc, cod_info2, gi, ix, r01_bits, r01_div, r0_tbl, r1_tbl) {
        var bigv = cod_info2.big_values;
        for (var r2 = 2; r2 < SBMAX_l + 1; r2++) {
            var a2 = gfc.scalefac_band.l[r2];
            if (a2 >= bigv)
                break;
            var bits = r01_bits[r2 - 2] + cod_info2.count1bits;
            if (gi.part2_3_length <= bits)
                break;
            var bi = new Bits(bits);
            var r2t = this.choose_table(ix, a2, bigv, bi);
            bits = bi.bits;
            if (gi.part2_3_length <= bits)
                continue;
            gi.assign(cod_info2);
            gi.part2_3_length = bits;
            gi.region0_count = r01_div[r2 - 2];
            gi.region1_count = r2 - 2 - r01_div[r2 - 2];
            gi.table_select[0] = r0_tbl[r2 - 2];
            gi.table_select[1] = r1_tbl[r2 - 2];
            gi.table_select[2] = r2t;
        }
    };
    Takehiro.prototype.best_huffman_divide = function (gfc, gi) {
        var cod_info2 = new GrInfo();
        var ix = gi.l3_enc;
        var r01_bits = new Int32Array(7 + 15 + 1);
        var r01_div = new Int32Array(7 + 15 + 1);
        var r0_tbl = new Int32Array(7 + 15 + 1);
        var r1_tbl = new Int32Array(7 + 15 + 1);
        if (gi.block_type === SHORT_TYPE && gfc.mode_gr === 1)
            return;
        cod_info2.assign(gi);
        if (gi.block_type === NORM_TYPE) {
            this.recalc_divide_init(gfc, gi, ix, r01_bits, r01_div, r0_tbl, r1_tbl);
            this.recalc_divide_sub(gfc, cod_info2, gi, ix, r01_bits, r01_div, r0_tbl, r1_tbl);
        }
        var i = cod_info2.big_values;
        if (i === 0 || (ix[i - 2] | ix[i - 1]) > 1)
            return;
        i = gi.count1 + 2;
        if (i > 576)
            return;
        cod_info2.assign(gi);
        cod_info2.count1 = i;
        var a1 = 0;
        var a2 = 0;
        for (; i > cod_info2.big_values; i -= 4) {
            var p = ((ix[i - 4] * 2 + ix[i - 3]) * 2 + ix[i - 2]) * 2 + ix[i - 1];
            a1 += t32l[p];
            a2 += t33l[p];
        }
        cod_info2.big_values = i;
        cod_info2.count1table_select = 0;
        if (a1 > a2) {
            a1 = a2;
            cod_info2.count1table_select = 1;
        }
        cod_info2.count1bits = a1;
        if (cod_info2.block_type === NORM_TYPE) {
            this.recalc_divide_sub(gfc, cod_info2, gi, ix, r01_bits, r01_div, r0_tbl, r1_tbl);
        }
        else {
            cod_info2.part2_3_length = a1;
            a1 = gfc.scalefac_band.l[7 + 1];
            if (a1 > i) {
                a1 = i;
            }
            if (a1 > 0) {
                var bi = new Bits(cod_info2.part2_3_length);
                cod_info2.table_select[0] = this.choose_table(ix, 0, a1, bi);
                cod_info2.part2_3_length = bi.bits;
            }
            if (i > a1) {
                var bi = new Bits(cod_info2.part2_3_length);
                cod_info2.table_select[1] = this.choose_table(ix, a1, i, bi);
                cod_info2.part2_3_length = bi.bits;
            }
            if (gi.part2_3_length > cod_info2.part2_3_length)
                gi.assign(cod_info2);
        }
    };
    Takehiro.prototype.scfsi_calc = function (ch, l3_side) {
        var sfb;
        var gi = l3_side.tt[1][ch];
        var g0 = l3_side.tt[0][ch];
        for (var i = 0; i < this.scfsi_band.length - 1; i++) {
            for (sfb = this.scfsi_band[i]; sfb < this.scfsi_band[i + 1]; sfb++) {
                if (g0.scalefac[sfb] !== gi.scalefac[sfb] && gi.scalefac[sfb] >= 0)
                    break;
            }
            if (sfb === this.scfsi_band[i + 1]) {
                for (sfb = this.scfsi_band[i]; sfb < this.scfsi_band[i + 1]; sfb++) {
                    gi.scalefac[sfb] = -1;
                }
                l3_side.scfsi[ch][i] = 1;
            }
        }
        var s1 = 0;
        var c1 = 0;
        for (sfb = 0; sfb < 11; sfb++) {
            if (gi.scalefac[sfb] === -1)
                continue;
            c1++;
            if (s1 < gi.scalefac[sfb])
                s1 = gi.scalefac[sfb];
        }
        var s2 = 0;
        var c2 = 0;
        for (; sfb < SBPSY_l; sfb++) {
            if (gi.scalefac[sfb] === -1)
                continue;
            c2++;
            if (s2 < gi.scalefac[sfb])
                s2 = gi.scalefac[sfb];
        }
        for (var i = 0; i < 16; i++) {
            if (s1 < this.slen1_n[i] && s2 < this.slen2_n[i]) {
                var c = Takehiro.slen1_tab[i] * c1 + Takehiro.slen2_tab[i] * c2;
                if (gi.part2_length > c) {
                    gi.part2_length = c;
                    gi.scalefac_compress = i;
                }
            }
        }
    };
    Takehiro.prototype.best_scalefac_store = function (gfc, gr, ch, l3_side) {
        var gi = l3_side.tt[gr][ch];
        var sfb;
        var i;
        var j;
        var l;
        var recalc = 0;
        j = 0;
        for (sfb = 0; sfb < gi.sfbmax; sfb++) {
            var width = gi.width[sfb];
            j += width;
            for (l = -width; l < 0; l++) {
                if (gi.l3_enc[l + j] !== 0)
                    break;
            }
            if (l === 0) {
                gi.scalefac[sfb] = -2;
                recalc = -2;
            }
        }
        if (gi.scalefac_scale === 0 && gi.preflag === 0) {
            var s = 0;
            for (sfb = 0; sfb < gi.sfbmax; sfb++)
                if (gi.scalefac[sfb] > 0)
                    s |= gi.scalefac[sfb];
            if ((s & 1) === 0 && s !== 0) {
                for (sfb = 0; sfb < gi.sfbmax; sfb++) {
                    if (gi.scalefac[sfb] > 0) {
                        gi.scalefac[sfb] >>= 1;
                    }
                }
                gi.scalefac_scale = 1;
                recalc = 1;
            }
        }
        if (gi.preflag === 0 && gi.block_type !== SHORT_TYPE && gfc.mode_gr === 2) {
            for (sfb = 11; sfb < SBPSY_l; sfb++)
                if (gi.scalefac[sfb] < this.qupvt.pretab[sfb] &&
                    gi.scalefac[sfb] !== -2)
                    break;
            if (sfb === SBPSY_l) {
                for (sfb = 11; sfb < SBPSY_l; sfb++)
                    if (gi.scalefac[sfb] > 0)
                        gi.scalefac[sfb] -= this.qupvt.pretab[sfb];
                gi.preflag = 1;
                recalc = 1;
            }
        }
        for (i = 0; i < 4; i++) {
            l3_side.scfsi[ch][i] = 0;
        }
        if (gfc.mode_gr === 2 &&
            gr === 1 &&
            l3_side.tt[0][ch].block_type !== SHORT_TYPE &&
            l3_side.tt[1][ch].block_type !== SHORT_TYPE) {
            this.scfsi_calc(ch, l3_side);
            recalc = 0;
        }
        for (sfb = 0; sfb < gi.sfbmax; sfb++) {
            if (gi.scalefac[sfb] === -2) {
                gi.scalefac[sfb] = 0;
            }
        }
        if (recalc !== 0) {
            if (gfc.mode_gr === 2) {
                this.scale_bitcount(gi);
            }
            else {
                this.scale_bitcount_lsf(gfc, gi);
            }
        }
    };
    Takehiro.prototype.all_scalefactors_not_negative = function (scalefac, n) {
        for (var i = 0; i < n; ++i) {
            if (scalefac[i] < 0)
                return false;
        }
        return true;
    };
    Takehiro.prototype.scale_bitcount = function (cod_info) {
        var k;
        var sfb;
        var max_slen1 = 0;
        var max_slen2 = 0;
        var tab;
        var scalefac = cod_info.scalefac;
        assert(this.all_scalefactors_not_negative(scalefac, cod_info.sfbmax));
        if (cod_info.block_type === SHORT_TYPE) {
            tab = this.scale_short;
            if (cod_info.mixed_block_flag !== 0)
                tab = this.scale_mixed;
        }
        else {
            tab = this.scale_long;
            if (cod_info.preflag === 0) {
                for (sfb = 11; sfb < SBPSY_l; sfb++)
                    if (scalefac[sfb] < this.qupvt.pretab[sfb])
                        break;
                if (sfb === SBPSY_l) {
                    cod_info.preflag = 1;
                    for (sfb = 11; sfb < SBPSY_l; sfb++)
                        scalefac[sfb] -= this.qupvt.pretab[sfb];
                }
            }
        }
        for (sfb = 0; sfb < cod_info.sfbdivide; sfb++) {
            if (max_slen1 < scalefac[sfb]) {
                max_slen1 = scalefac[sfb];
            }
        }
        for (; sfb < cod_info.sfbmax; sfb++) {
            if (max_slen2 < scalefac[sfb]) {
                max_slen2 = scalefac[sfb];
            }
        }
        cod_info.part2_length = Takehiro.LARGE_BITS;
        for (k = 0; k < 16; k++) {
            if (max_slen1 < this.slen1_n[k] &&
                max_slen2 < this.slen2_n[k] &&
                cod_info.part2_length > tab[k]) {
                cod_info.part2_length = tab[k];
                cod_info.scalefac_compress = k;
            }
        }
        return cod_info.part2_length === Takehiro.LARGE_BITS;
    };
    Takehiro.prototype.scale_bitcount_lsf = function (_gfc, cod_info) {
        var table_number;
        var row_in_table;
        var partition;
        var nr_sfb;
        var window;
        var over;
        var i;
        var sfb;
        var max_sfac = new Int32Array(4);
        var scalefac = cod_info.scalefac;
        if (cod_info.preflag !== 0) {
            table_number = 2;
        }
        else {
            table_number = 0;
        }
        for (i = 0; i < 4; i++) {
            max_sfac[i] = 0;
        }
        if (cod_info.block_type === SHORT_TYPE) {
            row_in_table = 1;
            var partition_table = this.qupvt.nr_of_sfb_block[table_number][row_in_table];
            for (sfb = 0, partition = 0; partition < 4; partition++) {
                nr_sfb = partition_table[partition] / 3;
                for (i = 0; i < nr_sfb; i++, sfb++) {
                    for (window = 0; window < 3; window++) {
                        if (scalefac[sfb * 3 + window] > max_sfac[partition]) {
                            max_sfac[partition] = scalefac[sfb * 3 + window];
                        }
                    }
                }
            }
        }
        else {
            row_in_table = 0;
            var partition_table = this.qupvt.nr_of_sfb_block[table_number][row_in_table];
            for (sfb = 0, partition = 0; partition < 4; partition++) {
                nr_sfb = partition_table[partition];
                for (i = 0; i < nr_sfb; i++, sfb++) {
                    if (scalefac[sfb] > max_sfac[partition]) {
                        max_sfac[partition] = scalefac[sfb];
                    }
                }
            }
        }
        for (over = false, partition = 0; partition < 4; partition++) {
            if (max_sfac[partition] > this.max_range_sfac_tab[table_number][partition]) {
                over = true;
            }
        }
        if (!over) {
            cod_info.sfb_partition_table =
                this.qupvt.nr_of_sfb_block[table_number][row_in_table];
            for (partition = 0; partition < 4; partition++) {
                cod_info.slen[partition] = this.log2tab[max_sfac[partition]];
            }
            var slen1 = cod_info.slen[0];
            var slen2 = cod_info.slen[1];
            var slen3 = cod_info.slen[2];
            var slen4 = cod_info.slen[3];
            switch (table_number) {
                case 0:
                    cod_info.scalefac_compress =
                        ((slen1 * 5 + slen2) << 4) + (slen3 << 2) + slen4;
                    break;
                case 1:
                    cod_info.scalefac_compress = 400 + ((slen1 * 5 + slen2) << 2) + slen3;
                    break;
                case 2:
                    cod_info.scalefac_compress = 500 + slen1 * 3 + slen2;
                    break;
                default:
                    console.warn('intensity stereo not implemented yet');
                    break;
            }
        }
        if (!over) {
            assert(cod_info.sfb_partition_table !== null);
            cod_info.part2_length = 0;
            for (partition = 0; partition < 4; partition++)
                cod_info.part2_length +=
                    cod_info.slen[partition] * cod_info.sfb_partition_table[partition];
        }
        return over;
    };
    Takehiro.prototype.huffman_init = function (gfc) {
        for (var i = 2; i <= 576; i += 2) {
            var scfb_anz = 0;
            var bv_index = void 0;
            while (gfc.scalefac_band.l[++scfb_anz] < i)
                ;
            bv_index = this.subdv_table[scfb_anz][0];
            while (gfc.scalefac_band.l[bv_index + 1] > i)
                bv_index--;
            if (bv_index < 0) {
                bv_index = this.subdv_table[scfb_anz][0];
            }
            gfc.bv_scf[i - 2] = bv_index;
            bv_index = this.subdv_table[scfb_anz][1];
            while (gfc.scalefac_band.l[bv_index + gfc.bv_scf[i - 2] + 2] > i)
                bv_index--;
            if (bv_index < 0) {
                bv_index = this.subdv_table[scfb_anz][1];
            }
            gfc.bv_scf[i - 1] = bv_index;
        }
    };
    Takehiro.LARGE_BITS = 100000;
    Takehiro.slen1_tab = [
        0, 0, 0, 0, 3, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4,
    ];
    Takehiro.slen2_tab = [
        0, 1, 2, 3, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 2, 3,
    ];
    return Takehiro;
}());

var TotalBytes = /** @class */ (function () {
    function TotalBytes() {
        this.total = 0;
    }
    return TotalBytes;
}());

var VBRTag = /** @class */ (function () {
    function VBRTag() {
        this.crc16Lookup = [
            0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601,
            0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0,
            0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81,
            0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941,
            0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01,
            0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0,
            0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081,
            0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240,
            0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00,
            0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0,
            0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981,
            0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41,
            0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700,
            0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0,
            0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281,
            0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441,
            0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01,
            0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1,
            0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80,
            0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541,
            0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101,
            0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0,
            0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481,
            0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40,
            0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801,
            0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1,
            0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581,
            0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341,
            0x4100, 0x81c1, 0x8081, 0x4040,
        ];
    }
    VBRTag.prototype.crcUpdateLookup = function (value, crc) {
        var tmp = crc ^ value;
        crc = (crc >> 8) ^ this.crc16Lookup[tmp & 0xff];
        return crc;
    };
    VBRTag.prototype.updateMusicCRC = function (crc, buffer, bufferPos, size) {
        for (var i = 0; i < size; ++i) {
            crc[0] = this.crcUpdateLookup(buffer[bufferPos + i], crc[0]);
        }
    };
    return VBRTag;
}());

var bitratesMap = {
    mpeg2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1],
    mpeg1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1],
    mpeg2_5: [0, 8, 16, 24, 32, 40, 48, 56, 64, -1, -1, -1, -1, -1, -1, -1],
};
var LOW_SAMPLE_RATE_THRESHOLD = 16000;
var getBitrates = function (version, samplerate) {
    if (samplerate === void 0) { samplerate = LOW_SAMPLE_RATE_THRESHOLD; }
    if (samplerate < 16000) {
        return bitratesMap.mpeg2_5;
    }
    if (version === 0) {
        return bitratesMap.mpeg2;
    }
    return bitratesMap.mpeg1;
};
function findNearestBitrate(bRate, version, samplerate) {
    var bitrates = getBitrates(version, samplerate);
    var matchingBitrate = bitrates[1];
    for (var i = 2; i <= 14; i++) {
        var bitrate = bitrates[i];
        if (bitrate !== 0 && bitrate !== -1) {
            if (Math.abs(bitrate - bRate) < Math.abs(matchingBitrate - bRate)) {
                matchingBitrate = bitrate;
            }
        }
    }
    return matchingBitrate;
}
function findBitrateIndex(bRate, version, samplerate) {
    var bitrates = getBitrates(version, samplerate);
    for (var i = 1; i <= 14; i++) {
        var bitrate = bitrates[i];
        if (bitrate > 0) {
            if (bitrate === bRate) {
                return i;
            }
        }
    }
    throw new Error("Invalid bitrate ".concat(bRate));
}
function getBitrate(version, index) {
    var bitrates = getBitrates(version);
    return bitrates[index];
}

var LAME_MAJOR_VERSION = 3;
var LAME_MINOR_VERSION = 98;
var LAME_PATCH_VERSION = 4;
function getLameShortVersion() {
    return "".concat(LAME_MAJOR_VERSION, ".").concat(LAME_MINOR_VERSION, ".").concat(LAME_PATCH_VERSION);
}

var BitStream = /** @class */ (function () {
    function BitStream() {
        this.ga = new GainAnalysis();
        this.vbr = new VBRTag();
        this.buf = new Uint8Array(LAME_MAXMP3BUFFER);
        this.totbit = 0;
        this.bufByteIdx = -1;
        this.bufBitIdx = 0;
    }
    BitStream.prototype.resetPointers = function (gfc) {
        gfc.w_ptr = 0;
        gfc.h_ptr = 0;
        gfc.header[gfc.h_ptr].write_timing = 0;
    };
    BitStream.prototype.getframebits = function (gfp) {
        var gfc = gfp.internal_flags;
        var bit_rate;
        if (gfc.bitrate_index !== 0) {
            bit_rate = getBitrate(gfp.version, gfc.bitrate_index);
        }
        else {
            bit_rate = gfp.brate;
        }
        var bytes = Math.trunc(((gfp.version + 1) * 72000 * bit_rate) / gfp.out_samplerate + gfc.padding);
        return 8 * bytes;
    };
    BitStream.prototype.putheader_bits = function (gfc) {
        copyArray(gfc.header[gfc.w_ptr].buf, 0, this.buf, this.bufByteIdx, gfc.sideinfo_len);
        this.bufByteIdx += gfc.sideinfo_len;
        this.totbit += gfc.sideinfo_len * 8;
        gfc.w_ptr = (gfc.w_ptr + 1) & (MAX_HEADER_BUF - 1);
    };
    BitStream.prototype.putbits2 = function (gfc, val, j) {
        while (j > 0) {
            if (this.bufBitIdx === 0) {
                this.bufBitIdx = 8;
                this.bufByteIdx++;
                assert(this.bufByteIdx < LAME_MAXMP3BUFFER);
                assert(gfc.header[gfc.w_ptr].write_timing >= this.totbit);
                if (gfc.header[gfc.w_ptr].write_timing === this.totbit) {
                    this.putheader_bits(gfc);
                }
                this.buf[this.bufByteIdx] = 0;
            }
            var k = Math.min(j, this.bufBitIdx);
            j -= k;
            this.bufBitIdx -= k;
            assert(this.bufBitIdx < BitStream.MAX_LENGTH);
            this.buf[this.bufByteIdx] |= (val >> j) << this.bufBitIdx;
            this.totbit += k;
        }
    };
    BitStream.prototype.drain_into_ancillary = function (gfp, remainingBits) {
        var gfc = gfp.internal_flags;
        var i;
        if (remainingBits >= 8) {
            this.putbits2(gfc, 0x4c, 8);
            remainingBits -= 8;
        }
        if (remainingBits >= 8) {
            this.putbits2(gfc, 0x41, 8);
            remainingBits -= 8;
        }
        if (remainingBits >= 8) {
            this.putbits2(gfc, 0x4d, 8);
            remainingBits -= 8;
        }
        if (remainingBits >= 8) {
            this.putbits2(gfc, 0x45, 8);
            remainingBits -= 8;
        }
        if (remainingBits >= 32) {
            var version = getLameShortVersion();
            if (remainingBits >= 32)
                for (i = 0; i < version.length && remainingBits >= 8; ++i) {
                    remainingBits -= 8;
                    this.putbits2(gfc, version.charCodeAt(i), 8);
                }
        }
        for (; remainingBits >= 1; remainingBits -= 1) {
            this.putbits2(gfc, 0, 1);
        }
    };
    BitStream.prototype.writeheader = function (gfc, val, j) {
        var ptr = gfc.header[gfc.h_ptr].ptr;
        while (j > 0) {
            var k = Math.min(j, 8 - (ptr & 7));
            j -= k;
            gfc.header[gfc.h_ptr].buf[ptr >> 3] |= (val >> j) << (8 - (ptr & 7) - k);
            ptr += k;
        }
        gfc.header[gfc.h_ptr].ptr = ptr;
    };
    BitStream.prototype.encodeSideInfo2 = function (gfp, bitsPerFrame) {
        var gfc = gfp.internal_flags;
        var gr;
        var ch;
        var l3_side = gfc.l3_side;
        gfc.header[gfc.h_ptr].ptr = 0;
        fillArray(gfc.header[gfc.h_ptr].buf, 0, gfc.sideinfo_len, 0);
        if (gfp.out_samplerate < 16000) {
            this.writeheader(gfc, 0xffe, 12);
        }
        else {
            this.writeheader(gfc, 0xfff, 12);
        }
        this.writeheader(gfc, gfp.version, 1);
        this.writeheader(gfc, 4 - 3, 2);
        this.writeheader(gfc, 1, 1);
        this.writeheader(gfc, gfc.bitrate_index, 4);
        this.writeheader(gfc, gfc.samplerate_index, 2);
        this.writeheader(gfc, gfc.padding, 1);
        this.writeheader(gfc, 0, 1);
        this.writeheader(gfc, gfp.mode.ordinal, 2);
        this.writeheader(gfc, gfc.mode_ext, 2);
        this.writeheader(gfc, 0, 1);
        this.writeheader(gfc, 1, 1);
        this.writeheader(gfc, 0, 2);
        if (gfp.version === 1) {
            assert(l3_side.main_data_begin >= 0);
            this.writeheader(gfc, l3_side.main_data_begin, 9);
            if (gfc.channels_out === 2)
                this.writeheader(gfc, l3_side.private_bits, 3);
            else
                this.writeheader(gfc, l3_side.private_bits, 5);
            for (ch = 0; ch < gfc.channels_out; ch++) {
                for (var band = 0; band < 4; band++) {
                    this.writeheader(gfc, l3_side.scfsi[ch][band], 1);
                }
            }
            for (gr = 0; gr < 2; gr++) {
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    var gi = l3_side.tt[gr][ch];
                    this.writeheader(gfc, gi.part2_3_length + gi.part2_length, 12);
                    this.writeheader(gfc, gi.big_values / 2, 9);
                    this.writeheader(gfc, gi.global_gain, 8);
                    this.writeheader(gfc, gi.scalefac_compress, 4);
                    if (gi.block_type !== NORM_TYPE) {
                        this.writeheader(gfc, 1, 1);
                        this.writeheader(gfc, gi.block_type, 2);
                        this.writeheader(gfc, gi.mixed_block_flag, 1);
                        if (gi.table_select[0] === 14)
                            gi.table_select[0] = 16;
                        this.writeheader(gfc, gi.table_select[0], 5);
                        if (gi.table_select[1] === 14)
                            gi.table_select[1] = 16;
                        this.writeheader(gfc, gi.table_select[1], 5);
                        this.writeheader(gfc, gi.subblock_gain[0], 3);
                        this.writeheader(gfc, gi.subblock_gain[1], 3);
                        this.writeheader(gfc, gi.subblock_gain[2], 3);
                    }
                    else {
                        this.writeheader(gfc, 0, 1);
                        if (gi.table_select[0] === 14)
                            gi.table_select[0] = 16;
                        this.writeheader(gfc, gi.table_select[0], 5);
                        if (gi.table_select[1] === 14)
                            gi.table_select[1] = 16;
                        this.writeheader(gfc, gi.table_select[1], 5);
                        if (gi.table_select[2] === 14)
                            gi.table_select[2] = 16;
                        this.writeheader(gfc, gi.table_select[2], 5);
                        assert(gi.region0_count >= 0 && gi.region0_count < 16);
                        assert(gi.region1_count >= 0 && gi.region1_count < 8);
                        this.writeheader(gfc, gi.region0_count, 4);
                        this.writeheader(gfc, gi.region1_count, 3);
                    }
                    this.writeheader(gfc, gi.preflag, 1);
                    this.writeheader(gfc, gi.scalefac_scale, 1);
                    this.writeheader(gfc, gi.count1table_select, 1);
                }
            }
        }
        else {
            assert(l3_side.main_data_begin >= 0);
            this.writeheader(gfc, l3_side.main_data_begin, 8);
            this.writeheader(gfc, l3_side.private_bits, gfc.channels_out);
            gr = 0;
            for (ch = 0; ch < gfc.channels_out; ch++) {
                var gi = l3_side.tt[gr][ch];
                this.writeheader(gfc, gi.part2_3_length + gi.part2_length, 12);
                this.writeheader(gfc, gi.big_values / 2, 9);
                this.writeheader(gfc, gi.global_gain, 8);
                this.writeheader(gfc, gi.scalefac_compress, 9);
                if (gi.block_type !== NORM_TYPE) {
                    this.writeheader(gfc, 1, 1);
                    this.writeheader(gfc, gi.block_type, 2);
                    this.writeheader(gfc, gi.mixed_block_flag, 1);
                    if (gi.table_select[0] === 14)
                        gi.table_select[0] = 16;
                    this.writeheader(gfc, gi.table_select[0], 5);
                    if (gi.table_select[1] === 14)
                        gi.table_select[1] = 16;
                    this.writeheader(gfc, gi.table_select[1], 5);
                    this.writeheader(gfc, gi.subblock_gain[0], 3);
                    this.writeheader(gfc, gi.subblock_gain[1], 3);
                    this.writeheader(gfc, gi.subblock_gain[2], 3);
                }
                else {
                    this.writeheader(gfc, 0, 1);
                    if (gi.table_select[0] === 14)
                        gi.table_select[0] = 16;
                    this.writeheader(gfc, gi.table_select[0], 5);
                    if (gi.table_select[1] === 14)
                        gi.table_select[1] = 16;
                    this.writeheader(gfc, gi.table_select[1], 5);
                    if (gi.table_select[2] === 14)
                        gi.table_select[2] = 16;
                    this.writeheader(gfc, gi.table_select[2], 5);
                    assert(gi.region0_count >= 0 && gi.region0_count < 16);
                    assert(gi.region1_count >= 0 && gi.region1_count < 8);
                    this.writeheader(gfc, gi.region0_count, 4);
                    this.writeheader(gfc, gi.region1_count, 3);
                }
                this.writeheader(gfc, gi.scalefac_scale, 1);
                this.writeheader(gfc, gi.count1table_select, 1);
            }
        }
        var old = gfc.h_ptr;
        assert(gfc.header[old].ptr === gfc.sideinfo_len * 8);
        gfc.h_ptr = (old + 1) & (MAX_HEADER_BUF - 1);
        gfc.header[gfc.h_ptr].write_timing =
            gfc.header[old].write_timing + bitsPerFrame;
        if (gfc.h_ptr === gfc.w_ptr) {
            console.warn('MAX_HEADER_BUF too small in bitstream.');
        }
    };
    BitStream.prototype.huffman_coder_count1 = function (gfc, gi) {
        var h = ht[gi.count1table_select + 32];
        var i;
        var bits = 0;
        var ix = gi.big_values;
        var xr = gi.big_values;
        assert(gi.count1table_select < 2);
        for (i = (gi.count1 - gi.big_values) / 4; i > 0; --i) {
            var huffbits = 0;
            var p = 0;
            var v = void 0;
            v = gi.l3_enc[ix + 0];
            if (v !== 0) {
                p += 8;
                if (gi.xr[xr + 0] < 0)
                    huffbits++;
            }
            v = gi.l3_enc[ix + 1];
            if (v !== 0) {
                p += 4;
                huffbits *= 2;
                if (gi.xr[xr + 1] < 0)
                    huffbits++;
            }
            v = gi.l3_enc[ix + 2];
            if (v !== 0) {
                p += 2;
                huffbits *= 2;
                if (gi.xr[xr + 2] < 0)
                    huffbits++;
            }
            v = gi.l3_enc[ix + 3];
            if (v !== 0) {
                p++;
                huffbits *= 2;
                if (gi.xr[xr + 3] < 0)
                    huffbits++;
            }
            assert(h.table !== undefined);
            assert(h.hlen !== undefined);
            ix += 4;
            xr += 4;
            this.putbits2(gfc, huffbits + h.table[p], h.hlen[p]);
            bits += h.hlen[p];
        }
        return bits;
    };
    BitStream.prototype.huffmancode = function (gfc, tableindex, start, end, gi) {
        var h = ht[tableindex];
        var bits = 0;
        if (tableindex === 0)
            return bits;
        for (var i = start; i < end; i += 2) {
            var cbits = 0;
            var xbits = 0;
            var linbits = h.xlen;
            var xlen = h.xlen;
            var ext = 0;
            var x1 = gi.l3_enc[i];
            var x2 = gi.l3_enc[i + 1];
            if (x1 !== 0) {
                if (gi.xr[i] < 0)
                    ext++;
                cbits--;
            }
            if (tableindex > 15) {
                if (x1 > 14) {
                    var linbits_x1 = x1 - 15;
                    assert(linbits_x1 <= h.linmax);
                    ext |= linbits_x1 << 1;
                    xbits = linbits;
                    x1 = 15;
                }
                if (x2 > 14) {
                    var linbits_x2 = x2 - 15;
                    assert(linbits_x2 <= h.linmax);
                    ext <<= linbits;
                    ext |= linbits_x2;
                    xbits += linbits;
                    x2 = 15;
                }
                xlen = 16;
            }
            if (x2 !== 0) {
                ext <<= 1;
                if (gi.xr[i + 1] < 0)
                    ext++;
                cbits--;
            }
            assert(h.hlen !== undefined);
            assert(h.table !== undefined);
            x1 = x1 * xlen + x2;
            xbits -= cbits;
            cbits += h.hlen[x1];
            assert(h.table !== undefined);
            this.putbits2(gfc, h.table[x1], cbits);
            this.putbits2(gfc, ext, xbits);
            bits += cbits + xbits;
        }
        return bits;
    };
    BitStream.prototype.shortHuffmancodebits = function (gfc, gi) {
        var region1Start = 3 * gfc.scalefac_band.s[3];
        if (region1Start > gi.big_values)
            region1Start = gi.big_values;
        var bits = this.huffmancode(gfc, gi.table_select[0], 0, region1Start, gi);
        bits += this.huffmancode(gfc, gi.table_select[1], region1Start, gi.big_values, gi);
        return bits;
    };
    BitStream.prototype.longHuffmancodebits = function (gfc, gi) {
        var bits;
        var region1Start;
        var region2Start;
        var bigvalues = gi.big_values;
        var i = gi.region0_count + 1;
        assert(i < gfc.scalefac_band.l.length);
        region1Start = gfc.scalefac_band.l[i];
        i += gi.region1_count + 1;
        assert(i < gfc.scalefac_band.l.length);
        region2Start = gfc.scalefac_band.l[i];
        if (region1Start > bigvalues) {
            region1Start = bigvalues;
        }
        if (region2Start > bigvalues) {
            region2Start = bigvalues;
        }
        bits = this.huffmancode(gfc, gi.table_select[0], 0, region1Start, gi);
        bits += this.huffmancode(gfc, gi.table_select[1], region1Start, region2Start, gi);
        bits += this.huffmancode(gfc, gi.table_select[2], region2Start, bigvalues, gi);
        return bits;
    };
    BitStream.prototype.writeMainData = function (gfp) {
        var gr;
        var ch;
        var sfb;
        var data_bits;
        var tot_bits = 0;
        var gfc = gfp.internal_flags;
        var l3_side = gfc.l3_side;
        if (gfp.version === 1) {
            for (gr = 0; gr < 2; gr++) {
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    var gi = l3_side.tt[gr][ch];
                    var slen1 = Takehiro.slen1_tab[gi.scalefac_compress];
                    var slen2 = Takehiro.slen2_tab[gi.scalefac_compress];
                    data_bits = 0;
                    for (sfb = 0; sfb < gi.sfbdivide; sfb++) {
                        if (gi.scalefac[sfb] === -1) {
                            continue;
                        }
                        this.putbits2(gfc, gi.scalefac[sfb], slen1);
                        data_bits += slen1;
                    }
                    for (; sfb < gi.sfbmax; sfb++) {
                        if (gi.scalefac[sfb] === -1) {
                            continue;
                        }
                        this.putbits2(gfc, gi.scalefac[sfb], slen2);
                        data_bits += slen2;
                    }
                    assert(data_bits === gi.part2_length);
                    if (gi.block_type === SHORT_TYPE) {
                        data_bits += this.shortHuffmancodebits(gfc, gi);
                    }
                    else {
                        data_bits += this.longHuffmancodebits(gfc, gi);
                    }
                    data_bits += this.huffman_coder_count1(gfc, gi);
                    assert(data_bits === gi.part2_3_length + gi.part2_length);
                    tot_bits += data_bits;
                }
            }
            return tot_bits;
        }
        gr = 0;
        for (ch = 0; ch < gfc.channels_out; ch++) {
            var gi = l3_side.tt[gr][ch];
            var i = void 0;
            var sfb_partition = void 0;
            var scale_bits = 0;
            assert(gi.sfb_partition_table !== null);
            data_bits = 0;
            sfb = 0;
            sfb_partition = 0;
            if (gi.block_type === SHORT_TYPE) {
                for (; sfb_partition < 4; sfb_partition++) {
                    var sfbs = gi.sfb_partition_table[sfb_partition] / 3;
                    var slen = gi.slen[sfb_partition];
                    for (i = 0; i < sfbs; i++, sfb++) {
                        this.putbits2(gfc, Math.max(gi.scalefac[sfb * 3 + 0], 0), slen);
                        this.putbits2(gfc, Math.max(gi.scalefac[sfb * 3 + 1], 0), slen);
                        this.putbits2(gfc, Math.max(gi.scalefac[sfb * 3 + 2], 0), slen);
                        scale_bits += 3 * slen;
                    }
                }
                data_bits += this.shortHuffmancodebits(gfc, gi);
            }
            else {
                for (; sfb_partition < 4; sfb_partition++) {
                    var sfbs = gi.sfb_partition_table[sfb_partition];
                    var slen = gi.slen[sfb_partition];
                    for (i = 0; i < sfbs; i++, sfb++) {
                        this.putbits2(gfc, Math.max(gi.scalefac[sfb], 0), slen);
                        scale_bits += slen;
                    }
                }
                data_bits += this.longHuffmancodebits(gfc, gi);
            }
            data_bits += this.huffman_coder_count1(gfc, gi);
            assert(data_bits === gi.part2_3_length);
            assert(scale_bits === gi.part2_length);
            tot_bits += scale_bits + data_bits;
        }
        return tot_bits;
    };
    BitStream.prototype.compute_flushbits = function (gfp, total_bytes_output) {
        var gfc = gfp.internal_flags;
        var flushbits;
        var remaining_headers;
        var last_ptr;
        var first_ptr = gfc.w_ptr;
        last_ptr = gfc.h_ptr - 1;
        if (last_ptr === -1)
            last_ptr = MAX_HEADER_BUF - 1;
        flushbits = gfc.header[last_ptr].write_timing - this.totbit;
        total_bytes_output.total = flushbits;
        if (flushbits >= 0) {
            remaining_headers = 1 + last_ptr - first_ptr;
            if (last_ptr < first_ptr) {
                remaining_headers = 1 + last_ptr - first_ptr + MAX_HEADER_BUF;
            }
            flushbits -= remaining_headers * 8 * gfc.sideinfo_len;
        }
        var bitsPerFrame = this.getframebits(gfp);
        flushbits += bitsPerFrame;
        total_bytes_output.total += bitsPerFrame;
        if (total_bytes_output.total % 8 !== 0)
            total_bytes_output.total = 1 + total_bytes_output.total / 8;
        else
            total_bytes_output.total /= 8;
        total_bytes_output.total += this.bufByteIdx + 1;
        if (flushbits < 0) {
            console.warn('strange error flushing buffer ... ');
        }
        return flushbits;
    };
    BitStream.prototype.flush_bitstream = function (gfp) {
        var gfc = gfp.internal_flags;
        var flushbits;
        var last_ptr = gfc.h_ptr - 1;
        if (last_ptr === -1)
            last_ptr = MAX_HEADER_BUF - 1;
        var l3_side = gfc.l3_side;
        if ((flushbits = this.compute_flushbits(gfp, new TotalBytes())) < 0)
            return;
        this.drain_into_ancillary(gfp, flushbits);
        assert(gfc.header[last_ptr].write_timing + this.getframebits(gfp) ===
            this.totbit);
        gfc.ResvSize = 0;
        l3_side.main_data_begin = 0;
        if (gfc.findReplayGain) {
            var radioGain = this.ga.getTitleGain(gfc.rgdata);
            gfc.RadioGain = Math.floor(radioGain * 10.0 + 0.5);
        }
        if (gfc.findPeakSample) {
            gfc.noclipGainChange = Math.ceil(Math.log10(gfc.PeakSample / 32767.0) * 20.0 * 10.0);
            if (gfc.noclipGainChange > 0) {
                if (isCloseToEachOther(gfp.scale, 1.0) ||
                    isCloseToEachOther(gfp.scale, 0.0)) {
                    gfc.noclipScale =
                        Math.floor((32767.0 / gfc.PeakSample) * 100.0) / 100.0;
                }
                else {
                    gfc.noclipScale = -1;
                }
            }
            else {
                gfc.noclipScale = -1;
            }
        }
    };
    BitStream.prototype.format_bitstream = function (gfp) {
        var gfc = gfp.internal_flags;
        var l3_side = gfc.l3_side;
        var bitsPerFrame = this.getframebits(gfp);
        this.drain_into_ancillary(gfp, l3_side.resvDrain_pre);
        this.encodeSideInfo2(gfp, bitsPerFrame);
        var bits = 8 * gfc.sideinfo_len;
        bits += this.writeMainData(gfp);
        this.drain_into_ancillary(gfp, l3_side.resvDrain_post);
        bits += l3_side.resvDrain_post;
        l3_side.main_data_begin += (bitsPerFrame - bits) / 8;
        if (this.compute_flushbits(gfp, new TotalBytes()) !== gfc.ResvSize) {
            console.warn('Internal buffer inconsistency. flushbits <> ResvSize');
        }
        if (l3_side.main_data_begin * 8 !== gfc.ResvSize) {
            console.warn("bit reservoir error: \n" +
                "l3_side.main_data_begin: ".concat(8 * l3_side.main_data_begin, " \n") +
                "Resvoir size:             ".concat(gfc.ResvSize, " \n") +
                "resv drain (post)         ".concat(l3_side.resvDrain_post, " \n") +
                "resv drain (pre)          ".concat(l3_side.resvDrain_pre, " \n") +
                "header and sideinfo:      ".concat(8 * gfc.sideinfo_len, " \n") +
                "data bits:                ".concat(bits - l3_side.resvDrain_post - 8 * gfc.sideinfo_len, " \n") +
                "total bits:               ".concat(bits, " (remainder: ").concat(bits % 8, ") \n") +
                "bitsperframe:             ".concat(bitsPerFrame));
            console.warn('This is a fatal error.  It has several possible causes:');
            console.warn('90%%  LAME compiled with buggy version of gcc using advanced optimizations');
            console.warn(' 9%%  Your system is overclocked');
            console.warn(' 1%%  bug in LAME encoding library');
            gfc.ResvSize = l3_side.main_data_begin * 8;
        }
        assert(this.totbit % 8 === 0);
        if (this.totbit > 1000000000) {
            for (var i = 0; i < MAX_HEADER_BUF; ++i) {
                gfc.header[i].write_timing -= this.totbit;
            }
            this.totbit = 0;
        }
        return 0;
    };
    BitStream.prototype.copyMetadata = function (gfc, buffer, bufferPos, size) {
        return this.copyBuffer(gfc, buffer, bufferPos, size, false);
    };
    BitStream.prototype.copyFrameData = function (gfc, buffer, bufferPos, size) {
        return this.copyBuffer(gfc, buffer, bufferPos, size, true);
    };
    BitStream.prototype.copyBuffer = function (gfc, buffer, bufferPos, size, mp3data) {
        var minimum = this.bufByteIdx + 1;
        if (minimum <= 0) {
            return 0;
        }
        if (size !== 0 && minimum > size) {
            return -1;
        }
        copyArray(this.buf, 0, buffer, bufferPos, minimum);
        this.bufByteIdx = -1;
        this.bufBitIdx = 0;
        if (mp3data) {
            var crc = new Int32Array(1);
            crc[0] = gfc.nMusicCRC;
            this.vbr.updateMusicCRC(crc, buffer, bufferPos, minimum);
            gfc.nMusicCRC = crc[0];
            if (minimum > 0) {
                gfc.VBR_seek_table.nBytesWritten += minimum;
            }
        }
        return minimum;
    };
    BitStream.MAX_LENGTH = 32;
    return BitStream;
}());

var MeanBits = /** @class */ (function () {
    function MeanBits(bits) {
        this.bits = bits;
    }
    return MeanBits;
}());

var CBRNewIterationLoop = /** @class */ (function () {
    function CBRNewIterationLoop(quantize) {
        this.quantize = quantize;
    }
    CBRNewIterationLoop.prototype.iteration_loop = function (gfp, pe, ms_ener_ratio, ratio) {
        var gfc = gfp.internal_flags;
        var l3_xmin = new Float32Array(SFBMAX);
        var xrpow = new Float32Array(576);
        var targ_bits = new Int32Array(2);
        var mean_bits = 0;
        var max_bits;
        var l3_side = gfc.l3_side;
        var mb = new MeanBits(mean_bits);
        this.quantize.rv.ResvFrameBegin(gfp, mb);
        mean_bits = mb.bits;
        for (var gr = 0; gr < gfc.mode_gr; gr++) {
            max_bits = this.on_pe(gfp, pe, targ_bits, mean_bits, gr, gr);
            if (gfc.mode_ext === MPG_MD_MS_LR) {
                this.quantize.ms_convert(gfc.l3_side, gr);
                this.quantize.qupvt.reduce_side(targ_bits, ms_ener_ratio[gr], mean_bits, max_bits);
            }
            for (var ch = 0; ch < gfc.channels_out; ch++) {
                var adjust = void 0;
                var masking_lower_db = void 0;
                var cod_info = l3_side.tt[gr][ch];
                if (cod_info.block_type !== SHORT_TYPE) {
                    // NORM, START or STOP type
                    adjust = 0;
                    masking_lower_db = gfc.PSY.mask_adjust - adjust;
                }
                else {
                    adjust = 0;
                    masking_lower_db = gfc.PSY.mask_adjust_short - adjust;
                }
                gfc.masking_lower = Math.pow(10.0, masking_lower_db * 0.1);
                this.quantize.init_outer_loop(gfc, cod_info);
                if (this.quantize.init_xrpow(gfc, cod_info, xrpow)) {
                    this.quantize.qupvt.calc_xmin(gfp, ratio[gr][ch], cod_info, l3_xmin);
                    this.quantize.outer_loop(gfp, cod_info, l3_xmin, xrpow, ch, targ_bits[ch]);
                }
                this.quantize.iteration_finish_one(gfc, gr, ch);
                assert(cod_info.part2_3_length <= MAX_BITS_PER_CHANNEL);
                assert(cod_info.part2_3_length <= targ_bits[ch]);
            }
        }
        this.quantize.rv.ResvFrameEnd(gfc, mean_bits);
    };
    CBRNewIterationLoop.prototype.on_pe = function (gfp, pe, targ_bits, mean_bits, gr, cbr) {
        var gfc = gfp.internal_flags;
        var tbits = 0;
        var bits;
        var add_bits = new Int32Array(2);
        var ch;
        var mb = new MeanBits(tbits);
        var extra_bits = this.quantize.rv.ResvMaxBits(gfp, mean_bits, mb, cbr);
        tbits = mb.bits;
        var max_bits = tbits + extra_bits;
        if (max_bits > MAX_BITS_PER_GRANULE) {
            max_bits = MAX_BITS_PER_GRANULE;
        }
        for (bits = 0, ch = 0; ch < gfc.channels_out; ++ch) {
            targ_bits[ch] = Math.min(MAX_BITS_PER_CHANNEL, tbits / gfc.channels_out);
            add_bits[ch] = Math.trunc((targ_bits[ch] * pe[gr][ch]) / 700.0 - targ_bits[ch]);
            if (add_bits[ch] > (mean_bits * 3) / 4)
                add_bits[ch] = (mean_bits * 3) / 4;
            if (add_bits[ch] < 0)
                add_bits[ch] = 0;
            if (add_bits[ch] + targ_bits[ch] > MAX_BITS_PER_CHANNEL)
                add_bits[ch] = Math.max(0, MAX_BITS_PER_CHANNEL - targ_bits[ch]);
            bits += add_bits[ch];
        }
        if (bits > extra_bits) {
            for (ch = 0; ch < gfc.channels_out; ++ch) {
                add_bits[ch] = (extra_bits * add_bits[ch]) / bits;
            }
        }
        for (ch = 0; ch < gfc.channels_out; ++ch) {
            targ_bits[ch] += add_bits[ch];
            extra_bits -= add_bits[ch];
        }
        for (bits = 0, ch = 0; ch < gfc.channels_out; ++ch) {
            bits += targ_bits[ch];
        }
        if (bits > MAX_BITS_PER_GRANULE) {
            var sum = 0;
            for (ch = 0; ch < gfc.channels_out; ++ch) {
                targ_bits[ch] *= MAX_BITS_PER_GRANULE;
                targ_bits[ch] /= bits;
                sum += targ_bits[ch];
            }
        }
        return max_bits;
    };
    return CBRNewIterationLoop;
}());

var III_psy_xmin = /** @class */ (function () {
    function III_psy_xmin() {
        this.l = new Float32Array(SBMAX_l);
        this.s = Array.from({ length: SBMAX_s }, function () { return new Float32Array(3); });
    }
    III_psy_xmin.prototype.assign = function (iii_psy_xmin) {
        copyArray(iii_psy_xmin.l, 0, this.l, 0, SBMAX_l);
        for (var i = 0; i < SBMAX_s; i++) {
            for (var j = 0; j < 3; j++) {
                this.s[i][j] = iii_psy_xmin.s[i][j];
            }
        }
    };
    return III_psy_xmin;
}());

var III_psy_ratio = /** @class */ (function () {
    function III_psy_ratio() {
        this.thm = new III_psy_xmin();
        this.en = new III_psy_xmin();
    }
    return III_psy_ratio;
}());

var MPEGMode = /** @class */ (function () {
    function MPEGMode(ordinal) {
        this.ordinal = ordinal;
    }
    MPEGMode.STEREO = new MPEGMode(0);
    MPEGMode.JOINT_STEREO = new MPEGMode(1);
    MPEGMode.DUAL_CHANNEL = new MPEGMode(2);
    MPEGMode.MONO = new MPEGMode(3);
    MPEGMode.NOT_SET = new MPEGMode(4);
    return MPEGMode;
}());

var NewMDCT = /** @class */ (function () {
    function NewMDCT() {
        this.enwindow = [
            (-4.77e-7 * 0.740951125354959) / 2.384e-6,
            (1.03951e-4 * 0.740951125354959) / 2.384e-6,
            (9.53674e-4 * 0.740951125354959) / 2.384e-6,
            (2.841473e-3 * 0.740951125354959) / 2.384e-6,
            (3.5758972e-2 * 0.740951125354959) / 2.384e-6,
            (3.401756e-3 * 0.740951125354959) / 2.384e-6,
            (9.83715e-4 * 0.740951125354959) / 2.384e-6,
            (9.9182e-5 * 0.740951125354959) / 2.384e-6,
            (1.2398e-5 * 0.740951125354959) / 2.384e-6,
            (1.91212e-4 * 0.740951125354959) / 2.384e-6,
            (2.283096e-3 * 0.740951125354959) / 2.384e-6,
            (1.6994476e-2 * 0.740951125354959) / 2.384e-6,
            (-1.8756866e-2 * 0.740951125354959) / 2.384e-6,
            (-2.630711e-3 * 0.740951125354959) / 2.384e-6,
            (-2.47478e-4 * 0.740951125354959) / 2.384e-6,
            (-1.4782e-5 * 0.740951125354959) / 2.384e-6,
            9.063471690191471e-1,
            1.960342806591213e-1,
            (-4.77e-7 * 0.773010453362737) / 2.384e-6,
            (1.05858e-4 * 0.773010453362737) / 2.384e-6,
            (9.30786e-4 * 0.773010453362737) / 2.384e-6,
            (2.521515e-3 * 0.773010453362737) / 2.384e-6,
            (3.5694122e-2 * 0.773010453362737) / 2.384e-6,
            (3.643036e-3 * 0.773010453362737) / 2.384e-6,
            (9.91821e-4 * 0.773010453362737) / 2.384e-6,
            (9.6321e-5 * 0.773010453362737) / 2.384e-6,
            (1.1444e-5 * 0.773010453362737) / 2.384e-6,
            (1.65462e-4 * 0.773010453362737) / 2.384e-6,
            (2.110004e-3 * 0.773010453362737) / 2.384e-6,
            (1.6112804e-2 * 0.773010453362737) / 2.384e-6,
            (-1.9634247e-2 * 0.773010453362737) / 2.384e-6,
            (-2.803326e-3 * 0.773010453362737) / 2.384e-6,
            (-2.77042e-4 * 0.773010453362737) / 2.384e-6,
            (-1.6689e-5 * 0.773010453362737) / 2.384e-6,
            8.206787908286602e-1,
            3.901806440322567e-1,
            (-4.77e-7 * 0.803207531480645) / 2.384e-6,
            (1.07288e-4 * 0.803207531480645) / 2.384e-6,
            (9.02653e-4 * 0.803207531480645) / 2.384e-6,
            (2.174854e-3 * 0.803207531480645) / 2.384e-6,
            (3.5586357e-2 * 0.803207531480645) / 2.384e-6,
            (3.858566e-3 * 0.803207531480645) / 2.384e-6,
            (9.95159e-4 * 0.803207531480645) / 2.384e-6,
            (9.346e-5 * 0.803207531480645) / 2.384e-6,
            (1.0014e-5 * 0.803207531480645) / 2.384e-6,
            (1.4019e-4 * 0.803207531480645) / 2.384e-6,
            (1.937389e-3 * 0.803207531480645) / 2.384e-6,
            (1.5233517e-2 * 0.803207531480645) / 2.384e-6,
            (-2.0506859e-2 * 0.803207531480645) / 2.384e-6,
            (-2.974033e-3 * 0.803207531480645) / 2.384e-6,
            (-3.0756e-4 * 0.803207531480645) / 2.384e-6,
            (-1.812e-5 * 0.803207531480645) / 2.384e-6,
            7.416505462720353e-1,
            5.805693545089249e-1,
            (-4.77e-7 * 0.831469612302545) / 2.384e-6,
            (1.08242e-4 * 0.831469612302545) / 2.384e-6,
            (8.68797e-4 * 0.831469612302545) / 2.384e-6,
            (1.800537e-3 * 0.831469612302545) / 2.384e-6,
            (3.54352e-2 * 0.831469612302545) / 2.384e-6,
            (4.049301e-3 * 0.831469612302545) / 2.384e-6,
            (9.94205e-4 * 0.831469612302545) / 2.384e-6,
            (9.0599e-5 * 0.831469612302545) / 2.384e-6,
            (9.06e-6 * 0.831469612302545) / 2.384e-6,
            (1.16348e-4 * 0.831469612302545) / 2.384e-6,
            (1.766682e-3 * 0.831469612302545) / 2.384e-6,
            (1.4358521e-2 * 0.831469612302545) / 2.384e-6,
            (-2.1372318e-2 * 0.831469612302545) / 2.384e-6,
            (-3.14188e-3 * 0.831469612302545) / 2.384e-6,
            (-3.39031e-4 * 0.831469612302545) / 2.384e-6,
            (-1.955e-5 * 0.831469612302545) / 2.384e-6,
            6.681786379192989e-1,
            7.653668647301797e-1,
            (-4.77e-7 * 0.857728610000272) / 2.384e-6,
            (1.08719e-4 * 0.857728610000272) / 2.384e-6,
            (8.2922e-4 * 0.857728610000272) / 2.384e-6,
            (1.399517e-3 * 0.857728610000272) / 2.384e-6,
            (3.5242081e-2 * 0.857728610000272) / 2.384e-6,
            (4.21524e-3 * 0.857728610000272) / 2.384e-6,
            (9.89437e-4 * 0.857728610000272) / 2.384e-6,
            (8.7261e-5 * 0.857728610000272) / 2.384e-6,
            (8.106e-6 * 0.857728610000272) / 2.384e-6,
            (9.3937e-5 * 0.857728610000272) / 2.384e-6,
            (1.597881e-3 * 0.857728610000272) / 2.384e-6,
            (1.3489246e-2 * 0.857728610000272) / 2.384e-6,
            (-2.2228718e-2 * 0.857728610000272) / 2.384e-6,
            (-3.306866e-3 * 0.857728610000272) / 2.384e-6,
            (-3.71456e-4 * 0.857728610000272) / 2.384e-6,
            (-2.1458e-5 * 0.857728610000272) / 2.384e-6,
            5.993769336819237e-1,
            9.427934736519954e-1,
            (-4.77e-7 * 0.881921264348355) / 2.384e-6,
            (1.08719e-4 * 0.881921264348355) / 2.384e-6,
            (7.8392e-4 * 0.881921264348355) / 2.384e-6,
            (9.71317e-4 * 0.881921264348355) / 2.384e-6,
            (3.5007e-2 * 0.881921264348355) / 2.384e-6,
            (4.357815e-3 * 0.881921264348355) / 2.384e-6,
            (9.80854e-4 * 0.881921264348355) / 2.384e-6,
            (8.3923e-5 * 0.881921264348355) / 2.384e-6,
            (7.629e-6 * 0.881921264348355) / 2.384e-6,
            (7.2956e-5 * 0.881921264348355) / 2.384e-6,
            (1.432419e-3 * 0.881921264348355) / 2.384e-6,
            (1.2627602e-2 * 0.881921264348355) / 2.384e-6,
            (-2.307415e-2 * 0.881921264348355) / 2.384e-6,
            (-3.467083e-3 * 0.881921264348355) / 2.384e-6,
            (-4.04358e-4 * 0.881921264348355) / 2.384e-6,
            (-2.3365e-5 * 0.881921264348355) / 2.384e-6,
            5.345111359507916e-1,
            1.111140466039205,
            (-9.54e-7 * 0.903989293123443) / 2.384e-6,
            (1.08242e-4 * 0.903989293123443) / 2.384e-6,
            (7.31945e-4 * 0.903989293123443) / 2.384e-6,
            (5.15938e-4 * 0.903989293123443) / 2.384e-6,
            (3.4730434e-2 * 0.903989293123443) / 2.384e-6,
            (4.477024e-3 * 0.903989293123443) / 2.384e-6,
            (9.68933e-4 * 0.903989293123443) / 2.384e-6,
            (8.0585e-5 * 0.903989293123443) / 2.384e-6,
            (6.676e-6 * 0.903989293123443) / 2.384e-6,
            (5.2929e-5 * 0.903989293123443) / 2.384e-6,
            (1.269817e-3 * 0.903989293123443) / 2.384e-6,
            (1.1775017e-2 * 0.903989293123443) / 2.384e-6,
            (-2.3907185e-2 * 0.903989293123443) / 2.384e-6,
            (-3.622532e-3 * 0.903989293123443) / 2.384e-6,
            (-4.38213e-4 * 0.903989293123443) / 2.384e-6,
            (-2.5272e-5 * 0.903989293123443) / 2.384e-6,
            4.729647758913199e-1,
            1.268786568327291,
            (-9.54e-7 * 0.9238795325112867) / 2.384e-6,
            (1.06812e-4 * 0.9238795325112867) / 2.384e-6,
            (6.74248e-4 * 0.9238795325112867) / 2.384e-6,
            (3.3379e-5 * 0.9238795325112867) / 2.384e-6,
            (3.4412861e-2 * 0.9238795325112867) / 2.384e-6,
            (4.573822e-3 * 0.9238795325112867) / 2.384e-6,
            (9.54151e-4 * 0.9238795325112867) / 2.384e-6,
            (7.6771e-5 * 0.9238795325112867) / 2.384e-6,
            (6.199e-6 * 0.9238795325112867) / 2.384e-6,
            (3.4332e-5 * 0.9238795325112867) / 2.384e-6,
            (1.111031e-3 * 0.9238795325112867) / 2.384e-6,
            (1.0933399e-2 * 0.9238795325112867) / 2.384e-6,
            (-2.4725437e-2 * 0.9238795325112867) / 2.384e-6,
            (-3.771782e-3 * 0.9238795325112867) / 2.384e-6,
            (-4.72546e-4 * 0.9238795325112867) / 2.384e-6,
            (-2.7657e-5 * 0.9238795325112867) / 2.384e-6,
            0.41421356237309503,
            1.414213562373095,
            (-9.54e-7 * 0.941544065183021) / 2.384e-6,
            (1.05381e-4 * 0.941544065183021) / 2.384e-6,
            (6.10352e-4 * 0.941544065183021) / 2.384e-6,
            (-4.75883e-4 * 0.941544065183021) / 2.384e-6,
            (3.405571e-2 * 0.941544065183021) / 2.384e-6,
            (4.649162e-3 * 0.941544065183021) / 2.384e-6,
            (9.35555e-4 * 0.941544065183021) / 2.384e-6,
            (7.3433e-5 * 0.941544065183021) / 2.384e-6,
            (5.245e-6 * 0.941544065183021) / 2.384e-6,
            (1.7166e-5 * 0.941544065183021) / 2.384e-6,
            (9.56535e-4 * 0.941544065183021) / 2.384e-6,
            (1.0103703e-2 * 0.941544065183021) / 2.384e-6,
            (-2.5527e-2 * 0.941544065183021) / 2.384e-6,
            (-3.914356e-3 * 0.941544065183021) / 2.384e-6,
            (-5.07355e-4 * 0.941544065183021) / 2.384e-6,
            (-3.0041e-5 * 0.941544065183021) / 2.384e-6,
            3.578057213145241e-1,
            1.546020906725474,
            (-9.54e-7 * 0.956940335732209) / 2.384e-6,
            (1.0252e-4 * 0.956940335732209) / 2.384e-6,
            (5.39303e-4 * 0.956940335732209) / 2.384e-6,
            (-1.011848e-3 * 0.956940335732209) / 2.384e-6,
            (3.3659935e-2 * 0.956940335732209) / 2.384e-6,
            (4.703045e-3 * 0.956940335732209) / 2.384e-6,
            (9.15051e-4 * 0.956940335732209) / 2.384e-6,
            (7.0095e-5 * 0.956940335732209) / 2.384e-6,
            (4.768e-6 * 0.956940335732209) / 2.384e-6,
            (9.54e-7 * 0.956940335732209) / 2.384e-6,
            (8.06808e-4 * 0.956940335732209) / 2.384e-6,
            (9.287834e-3 * 0.956940335732209) / 2.384e-6,
            (-2.6310921e-2 * 0.956940335732209) / 2.384e-6,
            (-4.048824e-3 * 0.956940335732209) / 2.384e-6,
            (-5.42164e-4 * 0.956940335732209) / 2.384e-6,
            (-3.2425e-5 * 0.956940335732209) / 2.384e-6,
            3.033466836073424e-1,
            1.66293922460509,
            (-1.431e-6 * 0.970031253194544) / 2.384e-6,
            (9.9182e-5 * 0.970031253194544) / 2.384e-6,
            (4.62532e-4 * 0.970031253194544) / 2.384e-6,
            (-1.573563e-3 * 0.970031253194544) / 2.384e-6,
            (3.3225536e-2 * 0.970031253194544) / 2.384e-6,
            (4.737377e-3 * 0.970031253194544) / 2.384e-6,
            (8.91685e-4 * 0.970031253194544) / 2.384e-6,
            (6.628e-5 * 0.970031253194544) / 2.384e-6,
            (4.292e-6 * 0.970031253194544) / 2.384e-6,
            (-1.3828e-5 * 0.970031253194544) / 2.384e-6,
            (6.6185e-4 * 0.970031253194544) / 2.384e-6,
            (8.487225e-3 * 0.970031253194544) / 2.384e-6,
            (-2.707386e-2 * 0.970031253194544) / 2.384e-6,
            (-4.174709e-3 * 0.970031253194544) / 2.384e-6,
            (-5.76973e-4 * 0.970031253194544) / 2.384e-6,
            (-3.4809e-5 * 0.970031253194544) / 2.384e-6,
            2.504869601913055e-1,
            1.76384252869671,
            (-1.431e-6 * 0.98078528040323) / 2.384e-6,
            (9.5367e-5 * 0.98078528040323) / 2.384e-6,
            (3.78609e-4 * 0.98078528040323) / 2.384e-6,
            (-2.161503e-3 * 0.98078528040323) / 2.384e-6,
            (3.2754898e-2 * 0.98078528040323) / 2.384e-6,
            (4.752159e-3 * 0.98078528040323) / 2.384e-6,
            (8.66413e-4 * 0.98078528040323) / 2.384e-6,
            (6.2943e-5 * 0.98078528040323) / 2.384e-6,
            (3.815e-6 * 0.98078528040323) / 2.384e-6,
            (-2.718e-5 * 0.98078528040323) / 2.384e-6,
            (5.22137e-4 * 0.98078528040323) / 2.384e-6,
            (7.703304e-3 * 0.98078528040323) / 2.384e-6,
            (-2.7815342e-2 * 0.98078528040323) / 2.384e-6,
            (-4.290581e-3 * 0.98078528040323) / 2.384e-6,
            (-6.11782e-4 * 0.98078528040323) / 2.384e-6,
            (-3.767e-5 * 0.98078528040323) / 2.384e-6,
            1.98912367379658e-1,
            1.847759065022573,
            (-1.907e-6 * 0.989176509964781) / 2.384e-6,
            (9.0122e-5 * 0.989176509964781) / 2.384e-6,
            (2.88486e-4 * 0.989176509964781) / 2.384e-6,
            (-2.774239e-3 * 0.989176509964781) / 2.384e-6,
            (3.224802e-2 * 0.989176509964781) / 2.384e-6,
            (4.748821e-3 * 0.989176509964781) / 2.384e-6,
            (8.38757e-4 * 0.989176509964781) / 2.384e-6,
            (5.9605e-5 * 0.989176509964781) / 2.384e-6,
            (3.338e-6 * 0.989176509964781) / 2.384e-6,
            (-3.9577e-5 * 0.989176509964781) / 2.384e-6,
            (3.88145e-4 * 0.989176509964781) / 2.384e-6,
            (6.937027e-3 * 0.989176509964781) / 2.384e-6,
            (-2.8532982e-2 * 0.989176509964781) / 2.384e-6,
            (-4.395962e-3 * 0.989176509964781) / 2.384e-6,
            (-6.46591e-4 * 0.989176509964781) / 2.384e-6,
            (-4.0531e-5 * 0.989176509964781) / 2.384e-6,
            1.483359875383474e-1,
            1.913880671464418,
            (-1.907e-6 * 0.995184726672197) / 2.384e-6,
            (8.44e-5 * 0.995184726672197) / 2.384e-6,
            (1.91689e-4 * 0.995184726672197) / 2.384e-6,
            (-3.411293e-3 * 0.995184726672197) / 2.384e-6,
            (3.170681e-2 * 0.995184726672197) / 2.384e-6,
            (4.728317e-3 * 0.995184726672197) / 2.384e-6,
            (8.09669e-4 * 0.995184726672197) / 2.384e-6,
            (5.579e-5 * 0.995184726672197) / 2.384e-6,
            (3.338e-6 * 0.995184726672197) / 2.384e-6,
            (-5.0545e-5 * 0.995184726672197) / 2.384e-6,
            (2.59876e-4 * 0.995184726672197) / 2.384e-6,
            (6.189346e-3 * 0.995184726672197) / 2.384e-6,
            (-2.9224873e-2 * 0.995184726672197) / 2.384e-6,
            (-4.489899e-3 * 0.995184726672197) / 2.384e-6,
            (-6.80923e-4 * 0.995184726672197) / 2.384e-6,
            (-4.3392e-5 * 0.995184726672197) / 2.384e-6,
            9.849140335716425e-2,
            1.961570560806461,
            (-2.384e-6 * 0.998795456205172) / 2.384e-6,
            (7.7724e-5 * 0.998795456205172) / 2.384e-6,
            (8.8215e-5 * 0.998795456205172) / 2.384e-6,
            (-4.072189e-3 * 0.998795456205172) / 2.384e-6,
            (3.1132698e-2 * 0.998795456205172) / 2.384e-6,
            (4.691124e-3 * 0.998795456205172) / 2.384e-6,
            (7.79152e-4 * 0.998795456205172) / 2.384e-6,
            (5.2929e-5 * 0.998795456205172) / 2.384e-6,
            (2.861e-6 * 0.998795456205172) / 2.384e-6,
            (-6.0558e-5 * 0.998795456205172) / 2.384e-6,
            (1.37329e-4 * 0.998795456205172) / 2.384e-6,
            (5.46217e-3 * 0.998795456205172) / 2.384e-6,
            (-2.989006e-2 * 0.998795456205172) / 2.384e-6,
            (-4.570484e-3 * 0.998795456205172) / 2.384e-6,
            (-7.14302e-4 * 0.998795456205172) / 2.384e-6,
            (-4.6253e-5 * 0.998795456205172) / 2.384e-6,
            4.912684976946725e-2,
            1.990369453344394,
            (3.5780907e-2 * Math.SQRT2 * 0.5) / 2.384e-6,
            (1.7876148e-2 * Math.SQRT2 * 0.5) / 2.384e-6,
            (3.134727e-3 * Math.SQRT2 * 0.5) / 2.384e-6,
            (2.457142e-3 * Math.SQRT2 * 0.5) / 2.384e-6,
            (9.71317e-4 * Math.SQRT2 * 0.5) / 2.384e-6,
            (2.18868e-4 * Math.SQRT2 * 0.5) / 2.384e-6,
            (1.01566e-4 * Math.SQRT2 * 0.5) / 2.384e-6,
            (1.3828e-5 * Math.SQRT2 * 0.5) / 2.384e-6,
            3.0526638e-2 / 2.384e-6,
            4.638195e-3 / 2.384e-6,
            7.47204e-4 / 2.384e-6,
            4.9591e-5 / 2.384e-6,
            4.756451e-3 / 2.384e-6,
            2.1458e-5 / 2.384e-6,
            -6.9618e-5 / 2.384e-6,
        ];
        this.win = [
            [
                2.382191739347913e-13, 6.423305872147834e-13, 9.400849094049688e-13,
                1.122435026096556e-12, 1.183840321267481e-12, 1.122435026096556e-12,
                9.40084909404969e-13, 6.423305872147839e-13, 2.382191739347918e-13,
                5.456116108943412e-12, 4.878985199565852e-12, 4.240448995017367e-12,
                3.559909094758252e-12, 2.858043359288075e-12, 2.156177623817898e-12,
                1.475637723558783e-12, 8.371015190102974e-13, 2.599706096327376e-13,
                -5.456116108943412e-12, -4.878985199565852e-12, -4.240448995017367e-12,
                -3.559909094758252e-12, -2.858043359288076e-12, -2.156177623817898e-12,
                -1.475637723558783e-12, -8.371015190102975e-13, -2.599706096327376e-13,
                -2.382191739347923e-13, -6.423305872147843e-13, -9.400849094049696e-13,
                -1.122435026096556e-12, -1.183840321267481e-12, -1.122435026096556e-12,
                -9.400849094049694e-13, -6.42330587214784e-13, -2.382191739347918e-13,
            ],
            [
                2.382191739347913e-13, 6.423305872147834e-13, 9.400849094049688e-13,
                1.122435026096556e-12, 1.183840321267481e-12, 1.122435026096556e-12,
                9.400849094049688e-13, 6.423305872147841e-13, 2.382191739347918e-13,
                5.456116108943413e-12, 4.878985199565852e-12, 4.240448995017367e-12,
                3.559909094758253e-12, 2.858043359288075e-12, 2.156177623817898e-12,
                1.475637723558782e-12, 8.371015190102975e-13, 2.599706096327376e-13,
                -5.461314069809755e-12, -4.921085770524055e-12, -4.343405037091838e-12,
                -3.732668368707687e-12, -3.093523840190885e-12, -2.430835727329465e-12,
                -1.734679010007751e-12, -9.748253656609281e-13, -2.797435120168326e-13,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -2.283748241799531e-13,
                -4.037858874020686e-13, -2.146547464825323e-13,
            ],
            [
                1.316524975873958e-1, 4.14213562373095e-1, 7.673269879789602e-1,
                1.091308501069271, 1.303225372841206, 1.56968557711749, 1.920982126971166,
                2.414213562373094, 3.171594802363212, 4.510708503662055,
                7.595754112725146, 2.290376554843115e1,
                0.98480775301220802032, 0.64278760968653936292, 0.34202014332566882393,
                0.93969262078590842791, -0.17364817766693030343, -0.76604444311897790243,
                0.86602540378443870761, 0.5,
                -5.144957554275265e-1, -4.717319685649723e-1, -3.133774542039019e-1,
                -1.819131996109812e-1, -9.457419252642064e-2, -4.096558288530405e-2,
                -1.419856857247115e-2, -3.699974673760037e-3,
                8.574929257125442e-1, 8.817419973177052e-1, 9.496286491027329e-1,
                9.833145924917901e-1, 9.955178160675857e-1, 9.991605581781475e-1,
                9.99899195244447e-1, 9.999931550702802e-1,
            ],
            [
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.283748241799531e-13,
                4.037858874020686e-13, 2.146547464825323e-13,
                5.461314069809755e-12, 4.921085770524055e-12, 4.343405037091838e-12,
                3.732668368707687e-12, 3.093523840190885e-12, 2.430835727329466e-12,
                1.734679010007751e-12, 9.748253656609281e-13, 2.797435120168326e-13,
                -5.456116108943413e-12, -4.878985199565852e-12, -4.240448995017367e-12,
                -3.559909094758253e-12, -2.858043359288075e-12, -2.156177623817898e-12,
                -1.475637723558782e-12, -8.371015190102975e-13, -2.599706096327376e-13,
                -2.382191739347913e-13, -6.423305872147834e-13, -9.400849094049688e-13,
                -1.122435026096556e-12, -1.183840321267481e-12, -1.122435026096556e-12,
                -9.400849094049688e-13, -6.423305872147841e-13, -2.382191739347918e-13,
            ],
        ];
        this.tantab_l = this.win[SHORT_TYPE];
        this.cx = this.win[SHORT_TYPE];
        this.ca = this.win[SHORT_TYPE];
        this.cs = this.win[SHORT_TYPE];
        this.order = [
            0, 1, 16, 17, 8, 9, 24, 25, 4, 5, 20, 21, 12, 13, 28, 29, 2, 3, 18, 19, 10,
            11, 26, 27, 6, 7, 22, 23, 14, 15, 30, 31,
        ];
    }
    NewMDCT.prototype.window_subband = function (x1, x1Pos, a) {
        var wp = 10;
        var x2 = x1Pos + 238 - 14 - 286;
        for (var i = -15; i < 0; i++) {
            var w = void 0;
            var s_1 = void 0;
            var t_1 = void 0;
            w = this.enwindow[wp + -10];
            s_1 = x1[x2 + -224] * w;
            t_1 = x1[x1Pos + 224] * w;
            w = this.enwindow[wp + -9];
            s_1 += x1[x2 + -160] * w;
            t_1 += x1[x1Pos + 160] * w;
            w = this.enwindow[wp + -8];
            s_1 += x1[x2 + -96] * w;
            t_1 += x1[x1Pos + 96] * w;
            w = this.enwindow[wp + -7];
            s_1 += x1[x2 + -32] * w;
            t_1 += x1[x1Pos + 32] * w;
            w = this.enwindow[wp + -6];
            s_1 += x1[x2 + 32] * w;
            t_1 += x1[x1Pos + -32] * w;
            w = this.enwindow[wp + -5];
            s_1 += x1[x2 + 96] * w;
            t_1 += x1[x1Pos + -96] * w;
            w = this.enwindow[wp + -4];
            s_1 += x1[x2 + 160] * w;
            t_1 += x1[x1Pos + -160] * w;
            w = this.enwindow[wp + -3];
            s_1 += x1[x2 + 224] * w;
            t_1 += x1[x1Pos + -224] * w;
            w = this.enwindow[wp + -2];
            s_1 += x1[x1Pos + -256] * w;
            t_1 -= x1[x2 + 256] * w;
            w = this.enwindow[wp + -1];
            s_1 += x1[x1Pos + -192] * w;
            t_1 -= x1[x2 + 192] * w;
            w = this.enwindow[wp + 0];
            s_1 += x1[x1Pos + -128] * w;
            t_1 -= x1[x2 + 128] * w;
            w = this.enwindow[wp + 1];
            s_1 += x1[x1Pos + -64] * w;
            t_1 -= x1[x2 + 64] * w;
            w = this.enwindow[wp + 2];
            s_1 += x1[x1Pos + 0] * w;
            t_1 -= x1[x2 + 0] * w;
            w = this.enwindow[wp + 3];
            s_1 += x1[x1Pos + 64] * w;
            t_1 -= x1[x2 + -64] * w;
            w = this.enwindow[wp + 4];
            s_1 += x1[x1Pos + 128] * w;
            t_1 -= x1[x2 + -128] * w;
            w = this.enwindow[wp + 5];
            s_1 += x1[x1Pos + 192] * w;
            t_1 -= x1[x2 + -192] * w;
            s_1 *= this.enwindow[wp + 6];
            w = t_1 - s_1;
            a[30 + i * 2] = t_1 + s_1;
            a[31 + i * 2] = this.enwindow[wp + 7] * w;
            wp += 18;
            x1Pos--;
            x2++;
        }
        var s;
        var t;
        t = x1[x1Pos + -16] * this.enwindow[wp + -10];
        s = x1[x1Pos + -32] * this.enwindow[wp + -2];
        t += (x1[x1Pos + -48] - x1[x1Pos + 16]) * this.enwindow[wp + -9];
        s += x1[x1Pos + -96] * this.enwindow[wp + -1];
        t += (x1[x1Pos + -80] + x1[x1Pos + 48]) * this.enwindow[wp + -8];
        s += x1[x1Pos + -160] * this.enwindow[wp + 0];
        t += (x1[x1Pos + -112] - x1[x1Pos + 80]) * this.enwindow[wp + -7];
        s += x1[x1Pos + -224] * this.enwindow[wp + 1];
        t += (x1[x1Pos + -144] + x1[x1Pos + 112]) * this.enwindow[wp + -6];
        s -= x1[x1Pos + 32] * this.enwindow[wp + 2];
        t += (x1[x1Pos + -176] - x1[x1Pos + 144]) * this.enwindow[wp + -5];
        s -= x1[x1Pos + 96] * this.enwindow[wp + 3];
        t += (x1[x1Pos + -208] + x1[x1Pos + 176]) * this.enwindow[wp + -4];
        s -= x1[x1Pos + 160] * this.enwindow[wp + 4];
        t += (x1[x1Pos + -240] - x1[x1Pos + 208]) * this.enwindow[wp + -3];
        s -= x1[x1Pos + 224];
        var u = s - t;
        var v = s + t;
        t = a[14];
        s = a[15] - t;
        a[31] = v + t;
        a[30] = u + s;
        a[15] = u - s;
        a[14] = v - t;
        var xr;
        xr = a[28] - a[0];
        a[0] += a[28];
        a[28] = xr * this.enwindow[wp + -2 * 18 + 7];
        xr = a[29] - a[1];
        a[1] += a[29];
        a[29] = xr * this.enwindow[wp + -2 * 18 + 7];
        xr = a[26] - a[2];
        a[2] += a[26];
        a[26] = xr * this.enwindow[wp + -4 * 18 + 7];
        xr = a[27] - a[3];
        a[3] += a[27];
        a[27] = xr * this.enwindow[wp + -4 * 18 + 7];
        xr = a[24] - a[4];
        a[4] += a[24];
        a[24] = xr * this.enwindow[wp + -6 * 18 + 7];
        xr = a[25] - a[5];
        a[5] += a[25];
        a[25] = xr * this.enwindow[wp + -6 * 18 + 7];
        xr = a[22] - a[6];
        a[6] += a[22];
        a[22] = xr * Math.SQRT2;
        xr = a[23] - a[7];
        a[7] += a[23];
        a[23] = xr * Math.SQRT2 - a[7];
        a[7] -= a[6];
        a[22] -= a[7];
        a[23] -= a[22];
        xr = a[6];
        a[6] = a[31] - xr;
        a[31] += xr;
        xr = a[7];
        a[7] = a[30] - xr;
        a[30] += xr;
        xr = a[22];
        a[22] = a[15] - xr;
        a[15] += xr;
        xr = a[23];
        a[23] = a[14] - xr;
        a[14] += xr;
        xr = a[20] - a[8];
        a[8] += a[20];
        a[20] = xr * this.enwindow[wp + -10 * 18 + 7];
        xr = a[21] - a[9];
        a[9] += a[21];
        a[21] = xr * this.enwindow[wp + -10 * 18 + 7];
        xr = a[18] - a[10];
        a[10] += a[18];
        a[18] = xr * this.enwindow[wp + -12 * 18 + 7];
        xr = a[19] - a[11];
        a[11] += a[19];
        a[19] = xr * this.enwindow[wp + -12 * 18 + 7];
        xr = a[16] - a[12];
        a[12] += a[16];
        a[16] = xr * this.enwindow[wp + -14 * 18 + 7];
        xr = a[17] - a[13];
        a[13] += a[17];
        a[17] = xr * this.enwindow[wp + -14 * 18 + 7];
        xr = -a[20] + a[24];
        a[20] += a[24];
        a[24] = xr * this.enwindow[wp + -12 * 18 + 7];
        xr = -a[21] + a[25];
        a[21] += a[25];
        a[25] = xr * this.enwindow[wp + -12 * 18 + 7];
        xr = a[4] - a[8];
        a[4] += a[8];
        a[8] = xr * this.enwindow[wp + -12 * 18 + 7];
        xr = a[5] - a[9];
        a[5] += a[9];
        a[9] = xr * this.enwindow[wp + -12 * 18 + 7];
        xr = a[0] - a[12];
        a[0] += a[12];
        a[12] = xr * this.enwindow[wp + -4 * 18 + 7];
        xr = a[1] - a[13];
        a[1] += a[13];
        a[13] = xr * this.enwindow[wp + -4 * 18 + 7];
        xr = a[16] - a[28];
        a[16] += a[28];
        a[28] = xr * this.enwindow[wp + -4 * 18 + 7];
        xr = -a[17] + a[29];
        a[17] += a[29];
        a[29] = xr * this.enwindow[wp + -4 * 18 + 7];
        xr = Math.SQRT2 * (a[2] - a[10]);
        a[2] += a[10];
        a[10] = xr;
        xr = Math.SQRT2 * (a[3] - a[11]);
        a[3] += a[11];
        a[11] = xr;
        xr = Math.SQRT2 * (-a[18] + a[26]);
        a[18] += a[26];
        a[26] = xr - a[18];
        xr = Math.SQRT2 * (-a[19] + a[27]);
        a[19] += a[27];
        a[27] = xr - a[19];
        xr = a[2];
        a[19] -= a[3];
        a[3] -= xr;
        a[2] = a[31] - xr;
        a[31] += xr;
        xr = a[3];
        a[11] -= a[19];
        a[18] -= xr;
        a[3] = a[30] - xr;
        a[30] += xr;
        xr = a[18];
        a[27] -= a[11];
        a[19] -= xr;
        a[18] = a[15] - xr;
        a[15] += xr;
        xr = a[19];
        a[10] -= xr;
        a[19] = a[14] - xr;
        a[14] += xr;
        xr = a[10];
        a[11] -= xr;
        a[10] = a[23] - xr;
        a[23] += xr;
        xr = a[11];
        a[26] -= xr;
        a[11] = a[22] - xr;
        a[22] += xr;
        xr = a[26];
        a[27] -= xr;
        a[26] = a[7] - xr;
        a[7] += xr;
        xr = a[27];
        a[27] = a[6] - xr;
        a[6] += xr;
        xr = Math.SQRT2 * (a[0] - a[4]);
        a[0] += a[4];
        a[4] = xr;
        xr = Math.SQRT2 * (a[1] - a[5]);
        a[1] += a[5];
        a[5] = xr;
        xr = Math.SQRT2 * (a[16] - a[20]);
        a[16] += a[20];
        a[20] = xr;
        xr = Math.SQRT2 * (a[17] - a[21]);
        a[17] += a[21];
        a[21] = xr;
        xr = -Math.SQRT2 * (a[8] - a[12]);
        a[8] += a[12];
        a[12] = xr - a[8];
        xr = -Math.SQRT2 * (a[9] - a[13]);
        a[9] += a[13];
        a[13] = xr - a[9];
        xr = -Math.SQRT2 * (a[25] - a[29]);
        a[25] += a[29];
        a[29] = xr - a[25];
        xr = -Math.SQRT2 * (a[24] + a[28]);
        a[24] -= a[28];
        a[28] = xr - a[24];
        xr = a[24] - a[16];
        a[24] = xr;
        xr = a[20] - xr;
        a[20] = xr;
        xr = a[28] - xr;
        a[28] = xr;
        xr = a[25] - a[17];
        a[25] = xr;
        xr = a[21] - xr;
        a[21] = xr;
        xr = a[29] - xr;
        a[29] = xr;
        xr = a[17] - a[1];
        a[17] = xr;
        xr = a[9] - xr;
        a[9] = xr;
        xr = a[25] - xr;
        a[25] = xr;
        xr = a[5] - xr;
        a[5] = xr;
        xr = a[21] - xr;
        a[21] = xr;
        xr = a[13] - xr;
        a[13] = xr;
        xr = a[29] - xr;
        a[29] = xr;
        xr = a[1] - a[0];
        a[1] = xr;
        xr = a[16] - xr;
        a[16] = xr;
        xr = a[17] - xr;
        a[17] = xr;
        xr = a[8] - xr;
        a[8] = xr;
        xr = a[9] - xr;
        a[9] = xr;
        xr = a[24] - xr;
        a[24] = xr;
        xr = a[25] - xr;
        a[25] = xr;
        xr = a[4] - xr;
        a[4] = xr;
        xr = a[5] - xr;
        a[5] = xr;
        xr = a[20] - xr;
        a[20] = xr;
        xr = a[21] - xr;
        a[21] = xr;
        xr = a[12] - xr;
        a[12] = xr;
        xr = a[13] - xr;
        a[13] = xr;
        xr = a[28] - xr;
        a[28] = xr;
        xr = a[29] - xr;
        a[29] = xr;
        xr = a[0];
        a[0] += a[31];
        a[31] -= xr;
        xr = a[1];
        a[1] += a[30];
        a[30] -= xr;
        xr = a[16];
        a[16] += a[15];
        a[15] -= xr;
        xr = a[17];
        a[17] += a[14];
        a[14] -= xr;
        xr = a[8];
        a[8] += a[23];
        a[23] -= xr;
        xr = a[9];
        a[9] += a[22];
        a[22] -= xr;
        xr = a[24];
        a[24] += a[7];
        a[7] -= xr;
        xr = a[25];
        a[25] += a[6];
        a[6] -= xr;
        xr = a[4];
        a[4] += a[27];
        a[27] -= xr;
        xr = a[5];
        a[5] += a[26];
        a[26] -= xr;
        xr = a[20];
        a[20] += a[11];
        a[11] -= xr;
        xr = a[21];
        a[21] += a[10];
        a[10] -= xr;
        xr = a[12];
        a[12] += a[19];
        a[19] -= xr;
        xr = a[13];
        a[13] += a[18];
        a[18] -= xr;
        xr = a[28];
        a[28] += a[3];
        a[3] -= xr;
        xr = a[29];
        a[29] += a[2];
        a[2] -= xr;
    };
    NewMDCT.prototype.mdct_short = function (inout, inoutPos) {
        for (var l = 0; l < 3; l++) {
            var tc0 = void 0;
            var tc1 = void 0;
            var tc2 = void 0;
            var ts0 = void 0;
            var ts1 = void 0;
            var ts2 = void 0;
            ts0 =
                inout[inoutPos + 2 * 3] * this.win[SHORT_TYPE][0] -
                    inout[inoutPos + 5 * 3];
            tc0 =
                inout[inoutPos + 0 * 3] * this.win[SHORT_TYPE][2] -
                    inout[inoutPos + 3 * 3];
            tc1 = ts0 + tc0;
            tc2 = ts0 - tc0;
            ts0 =
                inout[inoutPos + 5 * 3] * this.win[SHORT_TYPE][0] +
                    inout[inoutPos + 2 * 3];
            tc0 =
                inout[inoutPos + 3 * 3] * this.win[SHORT_TYPE][2] +
                    inout[inoutPos + 0 * 3];
            ts1 = ts0 + tc0;
            ts2 = -ts0 + tc0;
            tc0 =
                (inout[inoutPos + 1 * 3] * this.win[SHORT_TYPE][1] -
                    inout[inoutPos + 4 * 3]) *
                    2.069978111953089e-11;
            ts0 =
                (inout[inoutPos + 4 * 3] * this.win[SHORT_TYPE][1] +
                    inout[inoutPos + 1 * 3]) *
                    2.069978111953089e-11;
            inout[inoutPos + 3 * 0] = tc1 * 1.90752519173728e-11 + tc0;
            inout[inoutPos + 3 * 5] = -ts1 * 1.90752519173728e-11 + ts0;
            tc2 = tc2 * 0.86602540378443870761 * 1.907525191737281e-11;
            ts1 = ts1 * 0.5 * 1.907525191737281e-11 + ts0;
            inout[inoutPos + 3 * 1] = tc2 - ts1;
            inout[inoutPos + 3 * 2] = tc2 + ts1;
            tc1 = tc1 * 0.5 * 1.907525191737281e-11 - tc0;
            ts2 = ts2 * 0.86602540378443870761 * 1.907525191737281e-11;
            inout[inoutPos + 3 * 3] = tc1 + ts2;
            inout[inoutPos + 3 * 4] = tc1 - ts2;
            inoutPos++;
        }
    };
    NewMDCT.prototype.mdct_long = function (out, outPos, _in) {
        var ct;
        var st;
        {
            var tc1 = _in[17] - _in[9];
            var tc3 = _in[15] - _in[11];
            var tc4 = _in[14] - _in[12];
            var ts5 = _in[0] + _in[8];
            var ts6 = _in[1] + _in[7];
            var ts7 = _in[2] + _in[6];
            var ts8 = _in[3] + _in[5];
            out[outPos + 17] = ts5 + ts7 - ts8 - (ts6 - _in[4]);
            st = (ts5 + ts7 - ts8) * this.cx[12 + 7] + (ts6 - _in[4]);
            ct = (tc1 - tc3 - tc4) * this.cx[12 + 6];
            out[outPos + 5] = ct + st;
            out[outPos + 6] = ct - st;
            var tc2 = (_in[16] - _in[10]) * this.cx[12 + 6];
            ts6 = ts6 * this.cx[12 + 7] + _in[4];
            ct =
                tc1 * this.cx[12 + 0] +
                    tc2 +
                    tc3 * this.cx[12 + 1] +
                    tc4 * this.cx[12 + 2];
            st =
                -ts5 * this.cx[12 + 4] +
                    ts6 -
                    ts7 * this.cx[12 + 5] +
                    ts8 * this.cx[12 + 3];
            out[outPos + 1] = ct + st;
            out[outPos + 2] = ct - st;
            ct =
                tc1 * this.cx[12 + 1] -
                    tc2 -
                    tc3 * this.cx[12 + 2] +
                    tc4 * this.cx[12 + 0];
            st =
                -ts5 * this.cx[12 + 5] +
                    ts6 -
                    ts7 * this.cx[12 + 3] +
                    ts8 * this.cx[12 + 4];
            out[outPos + 9] = ct + st;
            out[outPos + 10] = ct - st;
            ct =
                tc1 * this.cx[12 + 2] -
                    tc2 +
                    tc3 * this.cx[12 + 0] -
                    tc4 * this.cx[12 + 1];
            st =
                ts5 * this.cx[12 + 3] -
                    ts6 +
                    ts7 * this.cx[12 + 4] -
                    ts8 * this.cx[12 + 5];
            out[outPos + 13] = ct + st;
            out[outPos + 14] = ct - st;
        }
        {
            var ts1 = _in[8] - _in[0];
            var ts3 = _in[6] - _in[2];
            var ts4 = _in[5] - _in[3];
            var tc5 = _in[17] + _in[9];
            var tc6 = _in[16] + _in[10];
            var tc7 = _in[15] + _in[11];
            var tc8 = _in[14] + _in[12];
            out[outPos + 0] = tc5 + tc7 + tc8 + (tc6 + _in[13]);
            ct = (tc5 + tc7 + tc8) * this.cx[12 + 7] - (tc6 + _in[13]);
            st = (ts1 - ts3 + ts4) * this.cx[12 + 6];
            out[outPos + 11] = ct + st;
            out[outPos + 12] = ct - st;
            var ts2 = (_in[7] - _in[1]) * this.cx[12 + 6];
            tc6 = _in[13] - tc6 * this.cx[12 + 7];
            ct =
                tc5 * this.cx[12 + 3] -
                    tc6 +
                    tc7 * this.cx[12 + 4] +
                    tc8 * this.cx[12 + 5];
            st =
                ts1 * this.cx[12 + 2] +
                    ts2 +
                    ts3 * this.cx[12 + 0] +
                    ts4 * this.cx[12 + 1];
            out[outPos + 3] = ct + st;
            out[outPos + 4] = ct - st;
            ct =
                -tc5 * this.cx[12 + 5] +
                    tc6 -
                    tc7 * this.cx[12 + 3] -
                    tc8 * this.cx[12 + 4];
            st =
                ts1 * this.cx[12 + 1] +
                    ts2 -
                    ts3 * this.cx[12 + 2] -
                    ts4 * this.cx[12 + 0];
            out[outPos + 7] = ct + st;
            out[outPos + 8] = ct - st;
            ct =
                -tc5 * this.cx[12 + 4] +
                    tc6 -
                    tc7 * this.cx[12 + 5] -
                    tc8 * this.cx[12 + 3];
            st =
                ts1 * this.cx[12 + 0] -
                    ts2 +
                    ts3 * this.cx[12 + 1] -
                    ts4 * this.cx[12 + 2];
            out[outPos + 15] = ct + st;
            out[outPos + 16] = ct - st;
        }
    };
    NewMDCT.prototype.mdct_sub48 = function (gfc, w0, w1) {
        var wk = w0;
        var wkPos = 286;
        for (var ch = 0; ch < gfc.channels_out; ch++) {
            for (var gr = 0; gr < gfc.mode_gr; gr++) {
                var band = void 0;
                var gi = gfc.l3_side.tt[gr][ch];
                var mdct_enc = gi.xr;
                var mdct_encPos = 0;
                var samp = gfc.sb_sample[ch][1 - gr];
                var sampPos = 0;
                for (var k = 0; k < 18 / 2; k++) {
                    this.window_subband(wk, wkPos, samp[sampPos]);
                    this.window_subband(wk, wkPos + 32, samp[sampPos + 1]);
                    sampPos += 2;
                    wkPos += 64;
                    for (band = 1; band < 32; band += 2) {
                        samp[sampPos - 1][band] *= -1;
                    }
                }
                for (band = 0; band < 32; band++, mdct_encPos += 18) {
                    var type = gi.block_type;
                    var band0 = gfc.sb_sample[ch][gr];
                    var band1 = gfc.sb_sample[ch][1 - gr];
                    if (gi.mixed_block_flag !== 0 && band < 2)
                        type = 0;
                    if (gfc.amp_filter[band] < 1e-12) {
                        fillArray(mdct_enc, mdct_encPos + 0, mdct_encPos + 18, 0);
                    }
                    else {
                        if (gfc.amp_filter[band] < 1.0) {
                            for (var k = 0; k < 18; k++)
                                band1[k][this.order[band]] *= gfc.amp_filter[band];
                        }
                        if (type === SHORT_TYPE) {
                            for (var k = -NewMDCT.NS / 4; k < 0; k++) {
                                var w = this.win[SHORT_TYPE][k + 3];
                                mdct_enc[mdct_encPos + k * 3 + 9] =
                                    band0[9 + k][this.order[band]] * w -
                                        band0[8 - k][this.order[band]];
                                mdct_enc[mdct_encPos + k * 3 + 18] =
                                    band0[14 - k][this.order[band]] * w +
                                        band0[15 + k][this.order[band]];
                                mdct_enc[mdct_encPos + k * 3 + 10] =
                                    band0[15 + k][this.order[band]] * w -
                                        band0[14 - k][this.order[band]];
                                mdct_enc[mdct_encPos + k * 3 + 19] =
                                    band1[2 - k][this.order[band]] * w +
                                        band1[3 + k][this.order[band]];
                                mdct_enc[mdct_encPos + k * 3 + 11] =
                                    band1[3 + k][this.order[band]] * w -
                                        band1[2 - k][this.order[band]];
                                mdct_enc[mdct_encPos + k * 3 + 20] =
                                    band1[8 - k][this.order[band]] * w +
                                        band1[9 + k][this.order[band]];
                            }
                            this.mdct_short(mdct_enc, mdct_encPos);
                        }
                        else {
                            var work = new Float32Array(18);
                            for (var k = -NewMDCT.NL / 4; k < 0; k++) {
                                var a = this.win[type][k + 27] * band1[k + 9][this.order[band]] +
                                    this.win[type][k + 36] * band1[8 - k][this.order[band]];
                                var b = this.win[type][k + 9] * band0[k + 9][this.order[band]] -
                                    this.win[type][k + 18] * band0[8 - k][this.order[band]];
                                work[k + 9] = a - b * this.tantab_l[3 + k + 9];
                                work[k + 18] = a * this.tantab_l[3 + k + 9] + b;
                            }
                            this.mdct_long(mdct_enc, mdct_encPos, work);
                        }
                    }
                    if (type !== SHORT_TYPE && band !== 0) {
                        for (var k = 7; k >= 0; --k) {
                            var bu = mdct_enc[mdct_encPos + k] * this.ca[20 + k] +
                                mdct_enc[mdct_encPos + -1 - k] * this.cs[28 + k];
                            var bd = mdct_enc[mdct_encPos + k] * this.cs[28 + k] -
                                mdct_enc[mdct_encPos + -1 - k] * this.ca[20 + k];
                            mdct_enc[mdct_encPos + -1 - k] = bu;
                            mdct_enc[mdct_encPos + k] = bd;
                        }
                    }
                }
            }
            wk = w1;
            wkPos = 286;
            if (gfc.mode_gr === 1) {
                for (var i = 0; i < 18; i++) {
                    copyArray(gfc.sb_sample[ch][1][i], 0, gfc.sb_sample[ch][0][i], 0, 32);
                }
            }
        }
    };
    NewMDCT.NS = 12;
    NewMDCT.NL = 36;
    return NewMDCT;
}());

var Encoder = /** @class */ (function () {
    function Encoder(bs, psy) {
        this.newMDCT = new NewMDCT();
        this.bs = bs;
        this.psy = psy;
    }
    Encoder.prototype.adjust_ATH = function (gfc) {
        if (gfc.ATH.useAdjust === 0) {
            gfc.ATH.adjust = 1.0;
            return;
        }
        var max_pow = gfc.loudness_sq[0][0];
        var gr2_max = gfc.loudness_sq[1][0];
        if (gfc.channels_out === 2) {
            max_pow += gfc.loudness_sq[0][1];
            gr2_max += gfc.loudness_sq[1][1];
        }
        else {
            max_pow += max_pow;
            gr2_max += gr2_max;
        }
        if (gfc.mode_gr === 2) {
            max_pow = Math.max(max_pow, gr2_max);
        }
        max_pow *= 0.5;
        max_pow *= gfc.ATH.aaSensitivityP;
        if (max_pow > 0.03125) {
            if (gfc.ATH.adjust >= 1.0) {
                gfc.ATH.adjust = 1.0;
            }
            else if (gfc.ATH.adjust < gfc.ATH.adjustLimit) {
                gfc.ATH.adjust = gfc.ATH.adjustLimit;
            }
            gfc.ATH.adjustLimit = 1.0;
        }
        else {
            var adj_lim_new = 31.98 * max_pow + 0.000625;
            if (gfc.ATH.adjust >= adj_lim_new) {
                gfc.ATH.adjust *= adj_lim_new * 0.075 + 0.925;
                if (gfc.ATH.adjust < adj_lim_new) {
                    gfc.ATH.adjust = adj_lim_new;
                }
            }
            else if (gfc.ATH.adjustLimit >= adj_lim_new) {
                gfc.ATH.adjust = adj_lim_new;
            }
            else if (gfc.ATH.adjust < gfc.ATH.adjustLimit) {
                gfc.ATH.adjust = gfc.ATH.adjustLimit;
            }
            gfc.ATH.adjustLimit = adj_lim_new;
        }
    };
    Encoder.prototype.updateStats = function (gfc) {
        var gr;
        var ch;
        assert(gfc.bitrate_index >= 0 && gfc.bitrate_index < 16);
        assert(gfc.mode_ext >= 0 && gfc.mode_ext < 4);
        gfc.bitrate_stereoMode_Hist[gfc.bitrate_index][4]++;
        gfc.bitrate_stereoMode_Hist[15][4]++;
        if (gfc.channels_out === 2) {
            gfc.bitrate_stereoMode_Hist[gfc.bitrate_index][gfc.mode_ext]++;
            gfc.bitrate_stereoMode_Hist[15][gfc.mode_ext]++;
        }
        for (gr = 0; gr < gfc.mode_gr; ++gr) {
            for (ch = 0; ch < gfc.channels_out; ++ch) {
                var bt = Math.trunc(gfc.l3_side.tt[gr][ch].block_type);
                if (gfc.l3_side.tt[gr][ch].mixed_block_flag !== 0)
                    bt = 4;
                gfc.bitrate_blockType_Hist[gfc.bitrate_index][bt]++;
                gfc.bitrate_blockType_Hist[gfc.bitrate_index][5]++;
                gfc.bitrate_blockType_Hist[15][bt]++;
                gfc.bitrate_blockType_Hist[15][5]++;
            }
        }
    };
    Encoder.prototype.lame_encode_frame_init = function (gfp, inbuf) {
        var gfc = gfp.internal_flags;
        var ch;
        var gr;
        if (!gfc.lame_encode_frame_init) {
            var i = void 0;
            var j = void 0;
            var primebuff0 = new Float32Array(286 + 1152 + 576);
            var primebuff1 = new Float32Array(286 + 1152 + 576);
            gfc.lame_encode_frame_init = true;
            for (i = 0, j = 0; i < 286 + 576 * (1 + gfc.mode_gr); ++i) {
                if (i < 576 * gfc.mode_gr) {
                    primebuff0[i] = 0;
                    if (gfc.channels_out === 2)
                        primebuff1[i] = 0;
                }
                else {
                    primebuff0[i] = inbuf[0][j];
                    if (gfc.channels_out === 2)
                        primebuff1[i] = inbuf[1][j];
                    ++j;
                }
            }
            for (gr = 0; gr < gfc.mode_gr; gr++) {
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    gfc.l3_side.tt[gr][ch].block_type = SHORT_TYPE;
                }
            }
            this.newMDCT.mdct_sub48(gfc, primebuff0, primebuff1);
            assert(gfc.mf_size >= BLKSIZE + gfp.framesize - FFTOFFSET);
            assert(gfc.mf_size >= 512 + gfp.framesize - 32);
        }
    };
    Encoder.prototype.lame_encode_mp3_frame = function (gfp, inbuf_l, inbuf_r, mp3buf, mp3bufPos, mp3buf_size) {
        var masking_LR = Array.from({ length: 2 }, function () {
            return Array.from({ length: 2 }, function () { return new III_psy_ratio(); });
        });
        var masking_MS = Array.from({ length: 2 }, function () {
            return Array.from({ length: 2 }, function () { return new III_psy_ratio(); });
        });
        masking_MS[0][0] = new III_psy_ratio();
        masking_MS[0][1] = new III_psy_ratio();
        masking_MS[1][0] = new III_psy_ratio();
        masking_MS[1][1] = new III_psy_ratio();
        var masking;
        var gfc = gfp.internal_flags;
        var tot_ener = Array.from({ length: 2 }, function () { return new Float32Array(4); });
        var ms_ener_ratio = [0.5, 0.5];
        var pe = [
            [0, 0],
            [0, 0],
        ];
        var pe_MS = [
            [0, 0],
            [0, 0],
        ];
        var pe_use;
        var ch;
        var gr;
        var inbuf = [inbuf_l, inbuf_r];
        if (!gfc.lame_encode_frame_init) {
            this.lame_encode_frame_init(gfp, inbuf);
        }
        gfc.padding = 0;
        if ((gfc.slot_lag -= gfc.frac_SpF) < 0) {
            gfc.slot_lag += gfp.out_samplerate;
            gfc.padding = 1;
        }
        if (gfc.psymodel !== 0) {
            var ret = void 0;
            var bufpPos = 0;
            var blocktype = new Int32Array(2);
            var bufp = [];
            for (gr = 0; gr < gfc.mode_gr; gr++) {
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    bufp[ch] = inbuf[ch];
                    bufpPos = 576 + gr * 576 - FFTOFFSET;
                }
                if (gfp.VBR === 4 /* VbrMode.vbr_mtrh */ || gfp.VBR === 1 /* VbrMode.vbr_mt */) {
                    ret = this.psy.L3psycho_anal_vbr(gfp, bufp, bufpPos, gr, masking_LR, masking_MS, pe[gr], pe_MS[gr], tot_ener[gr], blocktype);
                }
                else {
                    ret = this.psy.L3psycho_anal_ns(gfp, bufp, bufpPos, gr, masking_LR, masking_MS, pe[gr], pe_MS[gr], tot_ener[gr], blocktype);
                }
                if (ret !== 0)
                    return -4;
                if (gfp.mode === MPEGMode.JOINT_STEREO) {
                    ms_ener_ratio[gr] = tot_ener[gr][2] + tot_ener[gr][3];
                    if (ms_ener_ratio[gr] > 0)
                        ms_ener_ratio[gr] = tot_ener[gr][3] / ms_ener_ratio[gr];
                }
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    var cod_info = gfc.l3_side.tt[gr][ch];
                    cod_info.block_type = blocktype[ch];
                    cod_info.mixed_block_flag = 0;
                }
            }
        }
        else {
            for (gr = 0; gr < gfc.mode_gr; gr++)
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    gfc.l3_side.tt[gr][ch].block_type = NORM_TYPE;
                    gfc.l3_side.tt[gr][ch].mixed_block_flag = 0;
                    pe_MS[gr][ch] = 700;
                    pe[gr][ch] = 700;
                }
        }
        this.adjust_ATH(gfc);
        this.newMDCT.mdct_sub48(gfc, inbuf[0], inbuf[1]);
        gfc.mode_ext = MPG_MD_LR_LR;
        if (gfp.mode === MPEGMode.JOINT_STEREO) {
            var sum_pe_MS = 0;
            var sum_pe_LR = 0;
            for (gr = 0; gr < gfc.mode_gr; gr++) {
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    sum_pe_MS += pe_MS[gr][ch];
                    sum_pe_LR += pe[gr][ch];
                }
            }
            if (sum_pe_MS <= 1.0 * sum_pe_LR) {
                var gi0 = gfc.l3_side.tt[0];
                var gi1 = gfc.l3_side.tt[gfc.mode_gr - 1];
                if (gi0[0].block_type === gi0[1].block_type &&
                    gi1[0].block_type === gi1[1].block_type) {
                    gfc.mode_ext = MPG_MD_MS_LR;
                }
            }
        }
        if (gfc.mode_ext === MPG_MD_MS_LR) {
            masking = masking_MS;
            pe_use = pe_MS;
        }
        else {
            masking = masking_LR;
            pe_use = pe;
        }
        if (gfp.VBR === 0 /* VbrMode.vbr_off */ || gfp.VBR === 3 /* VbrMode.vbr_abr */) {
            var i = void 0;
            var f = void 0;
            for (i = 0; i < 18; i++)
                gfc.nsPsy.pefirbuf[i] = gfc.nsPsy.pefirbuf[i + 1];
            f = 0.0;
            for (gr = 0; gr < gfc.mode_gr; gr++)
                for (ch = 0; ch < gfc.channels_out; ch++)
                    f += pe_use[gr][ch];
            gfc.nsPsy.pefirbuf[18] = f;
            f = gfc.nsPsy.pefirbuf[9];
            for (i = 0; i < 9; i++)
                f +=
                    (gfc.nsPsy.pefirbuf[i] + gfc.nsPsy.pefirbuf[18 - i]) *
                        Encoder.fircoef[i];
            f = (670 * 5 * gfc.mode_gr * gfc.channels_out) / f;
            for (gr = 0; gr < gfc.mode_gr; gr++) {
                for (ch = 0; ch < gfc.channels_out; ch++) {
                    pe_use[gr][ch] *= f;
                }
            }
        }
        assert(gfc.iteration_loop !== null);
        gfc.iteration_loop.iteration_loop(gfp, pe_use, ms_ener_ratio, masking);
        this.bs.format_bitstream(gfp);
        var mp3count = this.bs.copyFrameData(gfc, mp3buf, mp3bufPos, mp3buf_size);
        this.updateStats(gfc);
        return mp3count;
    };
    Encoder.fircoef = [
        -0.0207887 * 5,
        -0.0378413 * 5,
        -0.0432472 * 5,
        -0.031183 * 5,
        7.79609e-18 * 5,
        0.0467745 * 5,
        0.10091 * 5,
        0.151365 * 5,
        0.187098 * 5,
    ];
    return Encoder;
}());

var InOut = /** @class */ (function () {
    function InOut() {
        this.n_in = 0;
        this.n_out = 0;
    }
    return InOut;
}());

var ATH = /** @class */ (function () {
    function ATH() {
        this.useAdjust = 0;
        this.aaSensitivityP = 0;
        this.adjust = 0;
        this.adjustLimit = 0;
        this.decay = 0;
        this.floor = 0;
        this.l = new Float32Array(SBMAX_l);
        this.s = new Float32Array(SBMAX_s);
        this.psfb21 = new Float32Array(PSFB21);
        this.psfb12 = new Float32Array(PSFB12);
        this.cb_l = new Float32Array(CBANDS);
        this.cb_s = new Float32Array(CBANDS);
        this.eql_w = new Float32Array(BLKSIZE / 2);
    }
    return ATH;
}());

var Header = /** @class */ (function () {
    function Header() {
        this.write_timing = 0;
        this.ptr = 0;
        this.buf = new Uint8Array(40);
    }
    return Header;
}());

var IIISideInfo = /** @class */ (function () {
    function IIISideInfo() {
        this.tt = Array.from({ length: 2 }, function () {
            return Array.from({ length: 2 }, function () { return new GrInfo(); });
        });
        this.main_data_begin = 0;
        this.private_bits = 0;
        this.resvDrain_pre = 0;
        this.resvDrain_post = 0;
        this.scfsi = Array.from({ length: 2 }, function () { return new Int32Array(4); });
    }
    return IIISideInfo;
}());

var NsPsy = /** @class */ (function () {
    function NsPsy() {
        this.last_en_subshort = Array.from({ length: 4 }, function () { return new Float32Array(9); });
        this.lastAttacks = new Int32Array(4);
        this.pefirbuf = new Float32Array(19);
        this.longfact = new Float32Array(SBMAX_l);
        this.shortfact = new Float32Array(SBMAX_s);
        this.attackthre = -1;
        this.attackthre_s = -1;
    }
    return NsPsy;
}());

var PSY = /** @class */ (function () {
    function PSY() {
        this.mask_adjust = 0;
        this.mask_adjust_short = 0;
        this.bo_l_weight = new Float32Array(SBMAX_l);
        this.bo_s_weight = new Float32Array(SBMAX_s);
    }
    return PSY;
}());

var ReplayGain = /** @class */ (function () {
    function ReplayGain() {
        this.linprebuf = new Float32Array(GainAnalysis.MAX_ORDER * 2);
        this.linpre = 0;
        this.lstepbuf = new Float32Array(GainAnalysis.MAX_SAMPLES_PER_WINDOW + GainAnalysis.MAX_ORDER);
        this.lstep = 0;
        this.loutbuf = new Float32Array(GainAnalysis.MAX_SAMPLES_PER_WINDOW + GainAnalysis.MAX_ORDER);
        this.lout = 0;
        this.rinprebuf = new Float32Array(GainAnalysis.MAX_ORDER * 2);
        this.rinpre = 0;
        this.rstepbuf = new Float32Array(GainAnalysis.MAX_SAMPLES_PER_WINDOW + GainAnalysis.MAX_ORDER);
        this.rstep = 0;
        this.routbuf = new Float32Array(GainAnalysis.MAX_SAMPLES_PER_WINDOW + GainAnalysis.MAX_ORDER);
        this.rout = 0;
        this.sampleWindow = 0;
        this.totsamp = 0;
        this.lsum = 0;
        this.rsum = 0;
        this.freqindex = 0;
        this.first = 0;
        this.A = new Int32Array(GainAnalysis.STEPS_per_dB * GainAnalysis.MAX_dB);
        this.B = new Int32Array(GainAnalysis.STEPS_per_dB * GainAnalysis.MAX_dB);
        this.reqindex = 0;
    }
    return ReplayGain;
}());

var ScaleFac = /** @class */ (function () {
    function ScaleFac() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.l = new Int32Array(1 + SBMAX_l);
        this.s = new Int32Array(1 + SBMAX_s);
        this.psfb21 = new Int32Array(1 + PSFB21);
        this.psfb12 = new Int32Array(1 + PSFB12);
        var l = this.l;
        var s = this.s;
        if (args.length === 4) {
            this.arrL = args[0], this.arrS = args[1], this.arr21 = args[2], this.arr12 = args[3];
            copyArray(this.arrL, 0, l, 0, Math.min(this.arrL.length, this.l.length));
            copyArray(this.arrS, 0, s, 0, Math.min(this.arrS.length, this.s.length));
            copyArray(this.arr21, 0, this.psfb21, 0, Math.min(this.arr21.length, this.psfb21.length));
            copyArray(this.arr12, 0, this.psfb12, 0, Math.min(this.arr12.length, this.psfb12.length));
        }
    }
    return ScaleFac;
}());

var LameInternalFlags = /** @class */ (function () {
    function LameInternalFlags() {
        this.Class_ID = 0;
        this.lame_encode_frame_init = false;
        this.iteration_init_init = false;
        this.fill_buffer_resample_init = false;
        this.mfbuf = Array.from({ length: 2 }, function () { return new Float32Array(MFSIZE); });
        this.mode_gr = 0;
        this.channels_in = 0;
        this.channels_out = 0;
        this.resample_ratio = 1;
        this.mf_samples_to_encode = ENCDELAY + POSTDELAY;
        this.mf_size = ENCDELAY - MDCTDELAY;
        this.VBR_min_bitrate = 1;
        this.VBR_max_bitrate = 13;
        this.bitrate_index = 0;
        this.samplerate_index = 0;
        this.mode_ext = 0;
        this.lowpass1 = 0;
        this.lowpass2 = 0;
        this.highpass1 = 0;
        this.highpass2 = 0;
        this.noise_shaping = 0;
        this.noise_shaping_amp = 0;
        this.substep_shaping = 0;
        this.psymodel = 0;
        this.noise_shaping_stop = 0;
        this.subblock_gain = -1;
        this.use_best_huffman = 0;
        this.full_outer_loop = 0;
        this.l3_side = new IIISideInfo();
        this.padding = 0;
        this.frac_SpF = 0;
        this.slot_lag = 0;
        this.nMusicCRC = 0;
        this.oldValue = new Int32Array([180, 180]);
        this.currentStep = new Int32Array([4, 4]);
        this.masking_lower = 1;
        this.bv_scf = new Int32Array(576);
        this.pseudohalf = new Int32Array(SFBMAX);
        this.sfb21_extra = false;
        this.inbuf_old = Array.from({ length: 2 }, function () { return new Float32Array(); });
        this.blackfilt = Array.from({ length: 2 * BPC + 1 }, function () { return new Float32Array(); });
        this.itime = new Float64Array(2);
        this.sideinfo_len = 0;
        this.sb_sample = Array.from({ length: 2 }, function () {
            return Array.from({ length: 2 }, function () {
                return Array.from({ length: 18 }, function () { return new Float32Array(SBLIMIT); });
            });
        });
        this.amp_filter = new Float32Array(32);
        this.header = Array.from({ length: MAX_HEADER_BUF }, function () { return new Header(); });
        this.h_ptr = 0;
        this.w_ptr = 0;
        this.ResvSize = 0;
        this.scalefac_band = new ScaleFac();
        this.minval_l = new Float32Array(CBANDS);
        this.minval_s = new Float32Array(CBANDS);
        this.nb_1 = Array.from({ length: 4 }, function () { return new Float32Array(CBANDS); });
        this.nb_2 = Array.from({ length: 4 }, function () { return new Float32Array(CBANDS); });
        this.nb_s1 = Array.from({ length: 4 }, function () { return new Float32Array(CBANDS); });
        this.nb_s2 = Array.from({ length: 4 }, function () { return new Float32Array(CBANDS); });
        this.s3_ss = null;
        this.s3_ll = null;
        this.decay = 0;
        this.thm = Array.from({ length: 4 }, function () { return new III_psy_xmin(); });
        this.en = Array.from({ length: 4 }, function () { return new III_psy_xmin(); });
        this.tot_ener = new Float32Array(4);
        this.loudness_sq = Array.from({ length: 2 }, function () { return new Float32Array(2); });
        this.loudness_sq_save = new Float32Array(2);
        this.mld_l = new Float32Array(SBMAX_l);
        this.mld_s = new Float32Array(SBMAX_s);
        this.bm_l = new Int32Array(SBMAX_l);
        this.bo_l = new Int32Array(SBMAX_l);
        this.bm_s = new Int32Array(SBMAX_s);
        this.bo_s = new Int32Array(SBMAX_s);
        this.npart_l = 0;
        this.npart_s = 0;
        this.s3ind = Array.from({ length: CBANDS }, function () { return new Int32Array(2); });
        this.s3ind_s = Array.from({ length: CBANDS }, function () { return new Int32Array(2); });
        this.numlines_s = new Int32Array(CBANDS);
        this.numlines_l = new Int32Array(CBANDS);
        this.rnumlines_l = new Float32Array(CBANDS);
        this.mld_cb_l = new Float32Array(CBANDS);
        this.mld_cb_s = new Float32Array(CBANDS);
        this.ms_ener_ratio_old = 0;
        this.blocktype_old = new Int32Array(2);
        this.nsPsy = new NsPsy();
        this.VBR_seek_table = {
            nBytesWritten: 0,
        };
        this.ATH = new ATH();
        this.PSY = new PSY();
        this.findReplayGain = false;
        this.findPeakSample = false;
        this.PeakSample = 0;
        this.RadioGain = 0;
        this.AudiophileGain = 0;
        this.rgdata = new ReplayGain();
        this.noclipGainChange = 0;
        this.noclipScale = -1.0;
        this.bitrate_stereoMode_Hist = Array.from({ length: 16 }, function () { return new Int32Array(4 + 1); });
        this.bitrate_blockType_Hist = Array.from({ length: 16 }, function () { return new Int32Array(4 + 1 + 1); });
        this.in_buffer_nsamples = 0;
        this.in_buffer_0 = null;
        this.in_buffer_1 = null;
        this.iteration_loop = null;
    }
    return LameInternalFlags;
}());

var LameGlobalFlags = /** @class */ (function () {
    function LameGlobalFlags(channels, samplerate, kbps) {
        this.out_samplerate = 0;
        this.scale = -1;
        this.quality = 3;
        this.mode = MPEGMode.STEREO;
        this.compression_ratio = 0;
        this.quant_comp = -1;
        this.quant_comp_short = -1;
        this.experimentalY = false;
        this.exp_nspsytune = 0;
        this.preset = 0;
        this.VBR = 0 /* VbrMode.vbr_off */;
        this.VBR_q = 4;
        this.VBR_mean_bitrate_kbps = 128;
        this.VBR_min_bitrate_kbps = 0;
        this.VBR_max_bitrate_kbps = 0;
        this.lowpassfreq = 0;
        this.maskingadjust = 0;
        this.maskingadjust_short = 0;
        this.ATHtype = -1;
        this.ATHcurve = -1;
        this.ATHlower = 0;
        this.athaa_loudapprox = -1;
        this.athaa_sensitivity = 0;
        this.short_blocks = null;
        this.interChRatio = -1;
        this.msfix = -1;
        this.version = 0;
        this.framesize = 0;
        this.frameNum = 0;
        this.internal_flags = new LameInternalFlags();
        this.num_channels = channels;
        this.in_samplerate = samplerate;
        this.brate = kbps;
    }
    return LameGlobalFlags;
}());

var NumUsed = /** @class */ (function () {
    function NumUsed() {
        this.num_used = 0;
    }
    return NumUsed;
}());

var ABRPresets = /** @class */ (function () {
    function ABRPresets() {
        this.fullBitrates = [
            8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320,
        ];
        this.presetMap = [
            {
                kbps: 8,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -30,
                ath_curve: 11,
                interch: 0.0012,
                sfscale: 1,
            },
            {
                kbps: 16,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -25,
                ath_curve: 11,
                interch: 0.001,
                sfscale: 1,
            },
            {
                kbps: 24,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -20,
                ath_curve: 11,
                interch: 0.001,
                sfscale: 1,
            },
            {
                kbps: 32,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -15,
                ath_curve: 11,
                interch: 0.001,
                sfscale: 1,
            },
            {
                kbps: 40,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -10,
                ath_curve: 11,
                interch: 0.0009,
                sfscale: 1,
            },
            {
                kbps: 48,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -10,
                ath_curve: 11,
                interch: 0.0009,
                sfscale: 1,
            },
            {
                kbps: 56,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -6,
                ath_curve: 11,
                interch: 0.0008,
                sfscale: 1,
            },
            {
                kbps: 64,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: -2,
                ath_curve: 11,
                interch: 0.0008,
                sfscale: 1,
            },
            {
                kbps: 80,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 0,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: 0,
                ath_curve: 8,
                interch: 0.0007,
                sfscale: 1,
            },
            {
                kbps: 96,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 2.5,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: 1,
                ath_curve: 5.5,
                interch: 0.0006,
                sfscale: 1,
            },
            {
                kbps: 112,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 2.25,
                st_lrm: 6.6,
                st_s: 145,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: 2,
                ath_curve: 4.5,
                interch: 0.0005,
                sfscale: 1,
            },
            {
                kbps: 128,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 0,
                nsmsfix: 1.95,
                st_lrm: 6.4,
                st_s: 140,
                nsbass: 0,
                scale: 0.95,
                masking_adj: 0,
                ath_lower: 3,
                ath_curve: 4,
                interch: 0.0002,
                sfscale: 1,
            },
            {
                kbps: 160,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 1,
                nsmsfix: 1.79,
                st_lrm: 6,
                st_s: 135,
                nsbass: 0,
                scale: 0.95,
                masking_adj: -2,
                ath_lower: 5,
                ath_curve: 3.5,
                interch: 0,
                sfscale: 1,
            },
            {
                kbps: 192,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 1,
                nsmsfix: 1.49,
                st_lrm: 5.6,
                st_s: 125,
                nsbass: 0,
                scale: 0.97,
                masking_adj: -4,
                ath_lower: 7,
                ath_curve: 3,
                interch: 0,
                sfscale: 0,
            },
            {
                kbps: 224,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 1,
                nsmsfix: 1.25,
                st_lrm: 5.2,
                st_s: 125,
                nsbass: 0,
                scale: 0.98,
                masking_adj: -6,
                ath_lower: 9,
                ath_curve: 2,
                interch: 0,
                sfscale: 0,
            },
            {
                kbps: 256,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 1,
                nsmsfix: 0.97,
                st_lrm: 5.2,
                st_s: 125,
                nsbass: 0,
                scale: 1,
                masking_adj: -8,
                ath_lower: 10,
                ath_curve: 1,
                interch: 0,
                sfscale: 0,
            },
            {
                kbps: 320,
                quant_comp: 9,
                quant_comp_s: 9,
                safejoint: 1,
                nsmsfix: 0.9,
                st_lrm: 5.2,
                st_s: 125,
                nsbass: 0,
                scale: 1,
                masking_adj: -10,
                ath_lower: 12,
                ath_curve: 0,
                interch: 0,
                sfscale: 0,
            },
        ];
        this.optimumBandwidths = [
            { bitrate: 8, lowpass: 2000 },
            { bitrate: 16, lowpass: 3700 },
            { bitrate: 24, lowpass: 3900 },
            { bitrate: 32, lowpass: 5500 },
            { bitrate: 40, lowpass: 7000 },
            { bitrate: 48, lowpass: 7500 },
            { bitrate: 56, lowpass: 10000 },
            { bitrate: 64, lowpass: 11000 },
            { bitrate: 80, lowpass: 13500 },
            { bitrate: 96, lowpass: 15100 },
            { bitrate: 112, lowpass: 15600 },
            { bitrate: 128, lowpass: 17000 },
            { bitrate: 160, lowpass: 17500 },
            { bitrate: 192, lowpass: 18600 },
            { bitrate: 224, lowpass: 19400 },
            { bitrate: 256, lowpass: 19700 },
            { bitrate: 320, lowpass: 20500 },
        ];
    }
    ABRPresets.prototype.findNearestFullBitrateIndex = function (bitrate) {
        var lowerRange = this.fullBitrates.length - 1;
        var upperRange = this.fullBitrates.length - 1;
        for (var maybeLowerRange = 0; maybeLowerRange < this.fullBitrates.length - 1; maybeLowerRange++) {
            var maybeUpperRange = maybeLowerRange + 1;
            if (this.fullBitrates[maybeUpperRange] > bitrate) {
                lowerRange = maybeLowerRange;
                upperRange = maybeUpperRange;
                break;
            }
        }
        return bitrate - this.fullBitrates[lowerRange] <
            this.fullBitrates[upperRange] - bitrate
            ? lowerRange
            : upperRange;
    };
    ABRPresets.prototype.apply = function (gfp, bitrate) {
        var preset = this.presetMap[this.findNearestFullBitrateIndex(bitrate)];
        gfp.VBR = 3 /* VbrMode.vbr_abr */;
        gfp.VBR_mean_bitrate_kbps = bitrate;
        gfp.VBR_mean_bitrate_kbps = Math.min(gfp.VBR_mean_bitrate_kbps, 320);
        gfp.VBR_mean_bitrate_kbps = Math.max(gfp.VBR_mean_bitrate_kbps, 8);
        gfp.brate = gfp.VBR_mean_bitrate_kbps;
        if (preset.safejoint > 0) {
            gfp.exp_nspsytune |= 2;
        }
        if (preset.sfscale > 0) {
            gfp.internal_flags.noise_shaping = 2;
        }
        if (Math.abs(preset.nsbass) > 0) {
            var k = Math.trunc(preset.nsbass * 4);
            if (k < 0) {
                k += 64;
            }
            gfp.exp_nspsytune |= k << 2;
        }
        if (equals(gfp.quant_comp, -1)) {
            gfp.quant_comp = preset.quant_comp;
        }
        if (equals(gfp.quant_comp_short, -1)) {
            gfp.quant_comp_short = preset.quant_comp_s;
        }
        if (equals(gfp.msfix, -1)) {
            gfp.msfix = preset.nsmsfix;
        }
        if (equals(gfp.internal_flags.nsPsy.attackthre, -1)) {
            gfp.internal_flags.nsPsy.attackthre = preset.st_lrm;
        }
        if (equals(gfp.internal_flags.nsPsy.attackthre_s, -1)) {
            gfp.internal_flags.nsPsy.attackthre_s = preset.st_s;
        }
        if (equals(gfp.scale, -1)) {
            gfp.scale = preset.scale;
        }
        if (equals(gfp.maskingadjust, 0)) {
            gfp.maskingadjust = preset.masking_adj;
        }
        if (preset.masking_adj > 0) {
            if (equals(gfp.maskingadjust_short, 0)) {
                gfp.maskingadjust_short = preset.masking_adj * 0.9;
            }
        }
        else if (equals(gfp.maskingadjust_short, 0)) {
            gfp.maskingadjust_short = preset.masking_adj * 1.1;
        }
        if (equals(-gfp.ATHlower * 10, 0)) {
            gfp.ATHlower = -preset.ath_lower / 10;
        }
        if (equals(gfp.ATHcurve, -1)) {
            gfp.ATHcurve = preset.ath_curve;
        }
        if (equals(gfp.interChRatio, -1)) {
            gfp.interChRatio = preset.interch;
        }
        return bitrate;
    };
    ABRPresets.prototype.getOptimumBandwidth = function (bitrate) {
        var table_index = this.findNearestFullBitrateIndex(bitrate);
        return this.optimumBandwidths[table_index].lowpass;
    };
    return ABRPresets;
}());

var VBRPresets = /** @class */ (function () {
    function VBRPresets() {
        this.oldSwitchMap = [
            {
                vbr_q: 0,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 0,
                st_lrm: 5.2,
                st_s: 125,
                masking_adj: -4.2,
                masking_adj_short: -6.3,
                ath_lower: 4.8,
                ath_curve: 1,
                ath_sensitivity: 0,
                interch: 0,
                safejoint: 2,
                sfb21mod: 21,
                msfix: 0.97,
            },
            {
                vbr_q: 1,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 0,
                st_lrm: 5.3,
                st_s: 125,
                masking_adj: -3.6,
                masking_adj_short: -5.6,
                ath_lower: 4.5,
                ath_curve: 1.5,
                ath_sensitivity: 0,
                interch: 0,
                safejoint: 2,
                sfb21mod: 21,
                msfix: 1.35,
            },
            {
                vbr_q: 2,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 0,
                st_lrm: 5.6,
                st_s: 125,
                masking_adj: -2.2,
                masking_adj_short: -3.5,
                ath_lower: 2.8,
                ath_curve: 2,
                ath_sensitivity: 0,
                interch: 0,
                safejoint: 2,
                sfb21mod: 21,
                msfix: 1.49,
            },
            {
                vbr_q: 3,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 5.8,
                st_s: 130,
                masking_adj: -1.8,
                masking_adj_short: -2.8,
                ath_lower: 2.6,
                ath_curve: 3,
                ath_sensitivity: -4,
                interch: 0,
                safejoint: 2,
                sfb21mod: 20,
                msfix: 1.64,
            },
            {
                vbr_q: 4,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 6,
                st_s: 135,
                masking_adj: -0.7,
                masking_adj_short: -1.1,
                ath_lower: 1.1,
                ath_curve: 3.5,
                ath_sensitivity: -8,
                interch: 0,
                safejoint: 2,
                sfb21mod: 0,
                msfix: 1.79,
            },
            {
                vbr_q: 5,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 6.4,
                st_s: 140,
                masking_adj: 0.5,
                masking_adj_short: 0.4,
                ath_lower: -7.5,
                ath_curve: 4,
                ath_sensitivity: -12,
                interch: 0.0002,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 1.95,
            },
            {
                vbr_q: 6,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 6.6,
                st_s: 145,
                masking_adj: 0.67,
                masking_adj_short: 0.65,
                ath_lower: -14.7,
                ath_curve: 6.5,
                ath_sensitivity: -19,
                interch: 0.0004,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 2.3,
            },
            {
                vbr_q: 7,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 6.6,
                st_s: 145,
                masking_adj: 0.8,
                masking_adj_short: 0.75,
                ath_lower: -19.7,
                ath_curve: 8,
                ath_sensitivity: -22,
                interch: 0.0006,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 2.7,
            },
            {
                vbr_q: 8,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 6.6,
                st_s: 145,
                masking_adj: 1.2,
                masking_adj_short: 1.15,
                ath_lower: -27.5,
                ath_curve: 10,
                ath_sensitivity: -23,
                interch: 0.0007,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 0,
            },
            {
                vbr_q: 9,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 6.6,
                st_s: 145,
                masking_adj: 1.6,
                masking_adj_short: 1.6,
                ath_lower: -36,
                ath_curve: 11,
                ath_sensitivity: -25,
                interch: 0.0008,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 0,
            },
        ];
        this.switchMap = [
            {
                vbr_q: 0,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 0,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: -7,
                masking_adj_short: -4,
                ath_lower: 7.5,
                ath_curve: 1,
                ath_sensitivity: 0,
                interch: 0,
                safejoint: 2,
                sfb21mod: 26,
                msfix: 0.97,
            },
            {
                vbr_q: 1,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 0,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: -5.6,
                masking_adj_short: -3.6,
                ath_lower: 4.5,
                ath_curve: 1.5,
                ath_sensitivity: 0,
                interch: 0,
                safejoint: 2,
                sfb21mod: 21,
                msfix: 1.35,
            },
            {
                vbr_q: 2,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 0,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: -4.4,
                masking_adj_short: -1.8,
                ath_lower: 2,
                ath_curve: 2,
                ath_sensitivity: 0,
                interch: 0,
                safejoint: 2,
                sfb21mod: 18,
                msfix: 1.49,
            },
            {
                vbr_q: 3,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: -3.4,
                masking_adj_short: -1.25,
                ath_lower: 1.1,
                ath_curve: 3,
                ath_sensitivity: -4,
                interch: 0,
                safejoint: 2,
                sfb21mod: 15,
                msfix: 1.64,
            },
            {
                vbr_q: 4,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: -2.2,
                masking_adj_short: 0.1,
                ath_lower: 0,
                ath_curve: 3.5,
                ath_sensitivity: -8,
                interch: 0,
                safejoint: 2,
                sfb21mod: 0,
                msfix: 1.79,
            },
            {
                vbr_q: 5,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: -1,
                masking_adj_short: 1.65,
                ath_lower: -7.7,
                ath_curve: 4,
                ath_sensitivity: -12,
                interch: 0.0002,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 1.95,
            },
            {
                vbr_q: 6,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: -0,
                masking_adj_short: 2.47,
                ath_lower: -7.7,
                ath_curve: 6.5,
                ath_sensitivity: -19,
                interch: 0.0004,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 2,
            },
            {
                vbr_q: 7,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: 0.5,
                masking_adj_short: 2,
                ath_lower: -14.5,
                ath_curve: 8,
                ath_sensitivity: -22,
                interch: 0.0006,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 2,
            },
            {
                vbr_q: 8,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: 1,
                masking_adj_short: 2.4,
                ath_lower: -22,
                ath_curve: 10,
                ath_sensitivity: -23,
                interch: 0.0007,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 2,
            },
            {
                vbr_q: 9,
                quant_comp: 9,
                quant_comp_s: 9,
                expY: 1,
                st_lrm: 4.2,
                st_s: 25,
                masking_adj: 1.5,
                masking_adj_short: 2.95,
                ath_lower: -30,
                ath_curve: 11,
                ath_sensitivity: -25,
                interch: 0.0008,
                safejoint: 0,
                sfb21mod: 0,
                msfix: 2,
            },
        ];
    }
    VBRPresets.prototype.setVBRQuality = function (gfp, VBR_q) {
        if (VBR_q < 0) {
            VBR_q = 0;
        }
        if (VBR_q > 9) {
            VBR_q = 9;
        }
        gfp.VBR_q = VBR_q;
    };
    VBRPresets.prototype.apply = function (gfp, a) {
        var presetMap = gfp.VBR === 2 /* VbrMode.vbr_rh */ ? this.oldSwitchMap : this.switchMap;
        var set = presetMap[a];
        this.setVBRQuality(gfp, set.vbr_q);
        if (equals(gfp.quant_comp, -1)) {
            gfp.quant_comp = set.quant_comp;
        }
        if (equals(gfp.quant_comp_short, -1)) {
            gfp.quant_comp_short = set.quant_comp_s;
        }
        if (set.expY !== 0) {
            gfp.experimentalY = true;
        }
        if (equals(gfp.internal_flags.nsPsy.attackthre, -1)) {
            gfp.internal_flags.nsPsy.attackthre = set.st_lrm;
        }
        if (equals(gfp.internal_flags.nsPsy.attackthre_s, -1)) {
            gfp.internal_flags.nsPsy.attackthre_s = set.st_s;
        }
        if (equals(gfp.maskingadjust, 0)) {
            gfp.maskingadjust = set.masking_adj;
        }
        if (equals(gfp.maskingadjust_short, 0)) {
            gfp.maskingadjust_short = set.masking_adj_short;
        }
        if (equals(-gfp.ATHlower * 10.0, 0)) {
            gfp.ATHlower = -set.ath_lower / 10.0;
        }
        if (equals(gfp.ATHcurve, -1)) {
            gfp.ATHcurve = set.ath_curve;
        }
        if (equals(gfp.athaa_sensitivity, -1)) {
            gfp.athaa_sensitivity = set.ath_sensitivity;
        }
        if (set.interch > 0 && equals(gfp.interChRatio, -1)) {
            gfp.interChRatio = set.interch;
        }
        if (set.safejoint > 0) {
            gfp.exp_nspsytune |= set.safejoint;
        }
        if (set.sfb21mod > 0) {
            gfp.exp_nspsytune |= set.sfb21mod << 20;
        }
        if (equals(gfp.msfix, -1)) {
            gfp.msfix = set.msfix;
        }
        gfp.VBR_q = a;
    };
    return VBRPresets;
}());

var Presets = /** @class */ (function () {
    function Presets() {
        this.vbrPresets = new VBRPresets();
        this.abrPresets = new ABRPresets();
    }
    Presets.prototype.apply = function (gfp, preset) {
        switch (preset) {
            case 1000 /* Preset.R3MIX */: {
                preset = 470 /* Preset.V3 */;
                gfp.VBR = 4 /* VbrMode.vbr_mtrh */;
                break;
            }
            case 1006 /* Preset.MEDIUM */: {
                preset = 460 /* Preset.V4 */;
                gfp.VBR = 2 /* VbrMode.vbr_rh */;
                break;
            }
            case 1007 /* Preset.MEDIUM_FAST */: {
                preset = 460 /* Preset.V4 */;
                gfp.VBR = 4 /* VbrMode.vbr_mtrh */;
                break;
            }
            case 1001 /* Preset.STANDARD */: {
                preset = 480 /* Preset.V2 */;
                gfp.VBR = 2 /* VbrMode.vbr_rh */;
                break;
            }
            case 1004 /* Preset.STANDARD_FAST */: {
                preset = 480 /* Preset.V2 */;
                gfp.VBR = 4 /* VbrMode.vbr_mtrh */;
                break;
            }
            case 1002 /* Preset.EXTREME */: {
                preset = 500 /* Preset.V0 */;
                gfp.VBR = 2 /* VbrMode.vbr_rh */;
                break;
            }
            case 1005 /* Preset.EXTREME_FAST */: {
                preset = 500 /* Preset.V0 */;
                gfp.VBR = 4 /* VbrMode.vbr_mtrh */;
                break;
            }
            case 1003 /* Preset.INSANE */: {
                gfp.preset = 320;
                gfp.VBR = 0 /* VbrMode.vbr_off */;
                this.abrPresets.apply(gfp, 320);
                return 320;
            }
        }
        gfp.preset = preset;
        switch (preset) {
            case 410 /* Preset.V9 */:
                this.vbrPresets.apply(gfp, 9);
                return preset;
            case 420 /* Preset.V8 */:
                this.vbrPresets.apply(gfp, 8);
                return preset;
            case 430 /* Preset.V7 */:
                this.vbrPresets.apply(gfp, 7);
                return preset;
            case 440 /* Preset.V6 */:
                this.vbrPresets.apply(gfp, 6);
                return preset;
            case 450 /* Preset.V5 */:
                this.vbrPresets.apply(gfp, 5);
                return preset;
            case 460 /* Preset.V4 */:
                this.vbrPresets.apply(gfp, 4);
                return preset;
            case 470 /* Preset.V3 */:
                this.vbrPresets.apply(gfp, 3);
                return preset;
            case 480 /* Preset.V2 */:
                this.vbrPresets.apply(gfp, 2);
                return preset;
            case 490 /* Preset.V1 */:
                this.vbrPresets.apply(gfp, 1);
                return preset;
            case 500 /* Preset.V0 */:
                this.vbrPresets.apply(gfp, 0);
                return preset;
        }
        if (preset >= 8 && preset <= 320) {
            return this.abrPresets.apply(gfp, preset);
        }
        gfp.preset = 0;
        return preset;
    };
    Presets.prototype.applyPresetFromQuality = function (gfp, quality) {
        return this.apply(gfp, 500 - 10 * quality);
    };
    return Presets;
}());

var FFT = /** @class */ (function () {
    function FFT() {
        this.window = new Float32Array(BLKSIZE);
        this.window_s = new Float32Array(BLKSIZE_s / 2);
        this.costab = [
            9.238795325112867e-1, 3.826834323650898e-1, 9.951847266721969e-1,
            9.80171403295606e-2, 9.996988186962042e-1, 2.454122852291229e-2,
            9.999811752826011e-1, 6.135884649154475e-3,
        ];
        this.rv_tbl = [
            0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0, 0x10, 0x90, 0x50, 0xd0,
            0x30, 0xb0, 0x70, 0xf0, 0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
            0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8, 0x04, 0x84, 0x44, 0xc4,
            0x24, 0xa4, 0x64, 0xe4, 0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
            0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec, 0x1c, 0x9c, 0x5c, 0xdc,
            0x3c, 0xbc, 0x7c, 0xfc, 0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
            0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2, 0x0a, 0x8a, 0x4a, 0xca,
            0x2a, 0xaa, 0x6a, 0xea, 0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
            0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6, 0x16, 0x96, 0x56, 0xd6,
            0x36, 0xb6, 0x76, 0xf6, 0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
            0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        ];
    }
    FFT.prototype.fht = function (fz, fzPos, n) {
        var tri = 0;
        var k4;
        var fi;
        var gi;
        n <<= 1;
        var fn = fzPos + n;
        k4 = 4;
        do {
            var s1 = void 0;
            var c1 = void 0;
            var i = void 0;
            var kx = k4 >> 1;
            var k1 = k4;
            var k2 = k4 << 1;
            var k3 = k2 + k1;
            k4 = k2 << 1;
            fi = fzPos;
            gi = fi + kx;
            do {
                var f0 = void 0;
                var f1 = void 0;
                var f2 = void 0;
                var f3 = void 0;
                f1 = fz[fi + 0] - fz[fi + k1];
                f0 = fz[fi + 0] + fz[fi + k1];
                f3 = fz[fi + k2] - fz[fi + k3];
                f2 = fz[fi + k2] + fz[fi + k3];
                fz[fi + k2] = f0 - f2;
                fz[fi + 0] = f0 + f2;
                fz[fi + k3] = f1 - f3;
                fz[fi + k1] = f1 + f3;
                f1 = fz[gi + 0] - fz[gi + k1];
                f0 = fz[gi + 0] + fz[gi + k1];
                f3 = Math.SQRT2 * fz[gi + k3];
                f2 = Math.SQRT2 * fz[gi + k2];
                fz[gi + k2] = f0 - f2;
                fz[gi + 0] = f0 + f2;
                fz[gi + k3] = f1 - f3;
                fz[gi + k1] = f1 + f3;
                gi += k4;
                fi += k4;
            } while (fi < fn);
            c1 = this.costab[tri + 0];
            s1 = this.costab[tri + 1];
            for (i = 1; i < kx; i++) {
                var c2 = 1 - 2 * s1 * s1;
                var s2 = 2 * s1 * c1;
                fi = fzPos + i;
                gi = fzPos + k1 - i;
                do {
                    var a = void 0;
                    var b = void 0;
                    b = s2 * fz[fi + k1] - c2 * fz[gi + k1];
                    a = c2 * fz[fi + k1] + s2 * fz[gi + k1];
                    var f1 = fz[fi + 0] - a;
                    var f0 = fz[fi + 0] + a;
                    var g1 = fz[gi + 0] - b;
                    var g0 = fz[gi + 0] + b;
                    b = s2 * fz[fi + k3] - c2 * fz[gi + k3];
                    a = c2 * fz[fi + k3] + s2 * fz[gi + k3];
                    var f3 = fz[fi + k2] - a;
                    var f2 = fz[fi + k2] + a;
                    var g3 = fz[gi + k2] - b;
                    var g2 = fz[gi + k2] + b;
                    b = s1 * f2 - c1 * g3;
                    a = c1 * f2 + s1 * g3;
                    fz[fi + k2] = f0 - a;
                    fz[fi + 0] = f0 + a;
                    fz[gi + k3] = g1 - b;
                    fz[gi + k1] = g1 + b;
                    b = c1 * g2 - s1 * f3;
                    a = s1 * g2 + c1 * f3;
                    fz[gi + k2] = g0 - a;
                    fz[gi + 0] = g0 + a;
                    fz[fi + k3] = f1 - b;
                    fz[fi + k1] = f1 + b;
                    gi += k4;
                    fi += k4;
                } while (fi < fn);
                c2 = c1;
                c1 = c2 * this.costab[tri + 0] - s1 * this.costab[tri + 1];
                s1 = c2 * this.costab[tri + 1] + s1 * this.costab[tri + 0];
            }
            tri += 2;
        } while (k4 < n);
    };
    FFT.prototype.fft_short = function (_gfc, x_real, chn, buffer, bufPos) {
        for (var b = 0; b < 3; b++) {
            var x = BLKSIZE_s / 2;
            var k = 0xffff & ((576 / 3) * (b + 1));
            var j = BLKSIZE_s / 8 - 1;
            do {
                var f0 = void 0;
                var f1 = void 0;
                var f2 = void 0;
                var f3 = void 0;
                var w = void 0;
                var i = this.rv_tbl[j << 2] & 0xff;
                f0 = this.window_s[i] * buffer[chn][bufPos + i + k];
                w = this.window_s[0x7f - i] * buffer[chn][bufPos + i + k + 0x80];
                f1 = f0 - w;
                f0 += w;
                f2 = this.window_s[i + 0x40] * buffer[chn][bufPos + i + k + 0x40];
                w = this.window_s[0x3f - i] * buffer[chn][bufPos + i + k + 0xc0];
                f3 = f2 - w;
                f2 += w;
                x -= 4;
                x_real[b][x + 0] = f0 + f2;
                x_real[b][x + 2] = f0 - f2;
                x_real[b][x + 1] = f1 + f3;
                x_real[b][x + 3] = f1 - f3;
                f0 = this.window_s[i + 0x01] * buffer[chn][bufPos + i + k + 0x01];
                w = this.window_s[0x7e - i] * buffer[chn][bufPos + i + k + 0x81];
                f1 = f0 - w;
                f0 += w;
                f2 = this.window_s[i + 0x41] * buffer[chn][bufPos + i + k + 0x41];
                w = this.window_s[0x3e - i] * buffer[chn][bufPos + i + k + 0xc1];
                f3 = f2 - w;
                f2 += w;
                x_real[b][x + BLKSIZE_s / 2 + 0] = f0 + f2;
                x_real[b][x + BLKSIZE_s / 2 + 2] = f0 - f2;
                x_real[b][x + BLKSIZE_s / 2 + 1] = f1 + f3;
                x_real[b][x + BLKSIZE_s / 2 + 3] = f1 - f3;
            } while (--j >= 0);
            this.fht(x_real[b], x, BLKSIZE_s / 2);
        }
    };
    FFT.prototype.fft_long = function (_gfc, y, chn, buffer, bufPos) {
        var jj = BLKSIZE / 8 - 1;
        var x = BLKSIZE / 2;
        do {
            var f0 = void 0;
            var f1 = void 0;
            var f2 = void 0;
            var f3 = void 0;
            var w = void 0;
            var i = this.rv_tbl[jj] & 0xff;
            f0 = this.window[i] * buffer[chn][bufPos + i];
            w = this.window[i + 0x200] * buffer[chn][bufPos + i + 0x200];
            f1 = f0 - w;
            f0 += w;
            f2 = this.window[i + 0x100] * buffer[chn][bufPos + i + 0x100];
            w = this.window[i + 0x300] * buffer[chn][bufPos + i + 0x300];
            f3 = f2 - w;
            f2 += w;
            x -= 4;
            y[x + 0] = f0 + f2;
            y[x + 2] = f0 - f2;
            y[x + 1] = f1 + f3;
            y[x + 3] = f1 - f3;
            f0 = this.window[i + 0x001] * buffer[chn][bufPos + i + 0x001];
            w = this.window[i + 0x201] * buffer[chn][bufPos + i + 0x201];
            f1 = f0 - w;
            f0 += w;
            f2 = this.window[i + 0x101] * buffer[chn][bufPos + i + 0x101];
            w = this.window[i + 0x301] * buffer[chn][bufPos + i + 0x301];
            f3 = f2 - w;
            f2 += w;
            y[x + BLKSIZE / 2 + 0] = f0 + f2;
            y[x + BLKSIZE / 2 + 2] = f0 - f2;
            y[x + BLKSIZE / 2 + 1] = f1 + f3;
            y[x + BLKSIZE / 2 + 3] = f1 - f3;
        } while (--jj >= 0);
        this.fht(y, x, BLKSIZE / 2);
    };
    FFT.prototype.init = function () {
        for (var i = 0; i < BLKSIZE; i++) {
            this.window[i] =
                0.42 -
                    0.5 * Math.cos((2 * Math.PI * (i + 0.5)) / BLKSIZE) +
                    0.08 * Math.cos((4 * Math.PI * (i + 0.5)) / BLKSIZE);
        }
        for (var i = 0; i < BLKSIZE_s / 2; i++) {
            this.window_s[i] =
                0.5 * (1.0 - Math.cos((2.0 * Math.PI * (i + 0.5)) / BLKSIZE_s));
        }
    };
    return FFT;
}());

var PsyModel = /** @class */ (function () {
    function PsyModel() {
        this.fft = new FFT();
        this.rpelev = 2;
        this.rpelev2 = 16;
        this.rpelev_s = 2;
        this.rpelev2_s = 16;
        this.temporalmask_sustain_sec = 0.01;
        this.ma_max_i1 = 0;
        this.ma_max_i2 = 0;
        this.ma_max_m = 0;
        this.tab = [
            1.0, 0.79433, 0.63096, 0.63096, 0.63096, 0.63096, 0.63096, 0.25119, 0.11749,
        ];
        this.table1 = [
            3.3246 * 3.3246,
            3.23837 * 3.23837,
            3.15437 * 3.15437,
            3.00412 * 3.00412,
            2.86103 * 2.86103,
            2.65407 * 2.65407,
            2.46209 * 2.46209,
            2.284 * 2.284,
            2.11879 * 2.11879,
            1.96552 * 1.96552,
            1.82335 * 1.82335,
            1.69146 * 1.69146,
            1.56911 * 1.56911,
            1.46658 * 1.46658,
            1.37074 * 1.37074,
            1.31036 * 1.31036,
            1.25264 * 1.25264,
            1.20648 * 1.20648,
            1.16203 * 1.16203,
            1.12765 * 1.12765,
            1.09428 * 1.09428,
            1.0659 * 1.0659,
            1.03826 * 1.03826,
            1.01895 * 1.01895,
            1,
        ];
        this.table2 = [
            1.33352 * 1.33352,
            1.35879 * 1.35879,
            1.38454 * 1.38454,
            1.39497 * 1.39497,
            1.40548 * 1.40548,
            1.3537 * 1.3537,
            1.30382 * 1.30382,
            1.22321 * 1.22321,
            1.14758 * 1.14758,
            1,
        ];
        this.table3 = [
            2.35364 * 2.35364,
            2.29259 * 2.29259,
            2.23313 * 2.23313,
            2.12675 * 2.12675,
            2.02545 * 2.02545,
            1.87894 * 1.87894,
            1.74303 * 1.74303,
            1.61695 * 1.61695,
            1.49999 * 1.49999,
            1.39148 * 1.39148,
            1.29083 * 1.29083,
            1.19746 * 1.19746,
            1.11084 * 1.11084,
            1.03826 * 1.03826,
        ];
        this.table2_ = [
            1.33352 * 1.33352,
            1.35879 * 1.35879,
            1.38454 * 1.38454,
            1.39497 * 1.39497,
            1.40548 * 1.40548,
            1.3537 * 1.3537,
            1.30382 * 1.30382,
            1.22321 * 1.22321,
            1.14758 * 1.14758,
            1,
        ];
        this.regcoef_s = [
            11.8, 13.6, 17.2, 32, 46.5, 51.3, 57.5, 67.1, 71.5, 84.6, 97.6, 130,
        ];
        this.regcoef_l = [
            6.8, 5.8, 5.8, 6.4, 6.5, 9.9, 12.1, 14.4, 15, 18.9, 21.6, 26.9, 34.2, 40.2,
            46.8, 56.5, 60.7, 73.9, 85.7, 93.4, 126.1,
        ];
        this.fircoef = [
            -8.65163e-18 * 2,
            -0.00851586 * 2,
            -6.74764e-18 * 2,
            0.0209036 * 2,
            -3.36639e-17 * 2,
            -0.0438162 * 2,
            -1.54175e-17 * 2,
            0.0931738 * 2,
            -5.52212e-17 * 2,
            -0.313819 * 2,
        ];
        this.fircoef_ = [
            -8.65163e-18 * 2,
            -0.00851586 * 2,
            -6.74764e-18 * 2,
            0.0209036 * 2,
            -3.36639e-17 * 2,
            -0.0438162 * 2,
            -1.54175e-17 * 2,
            0.0931738 * 2,
            -5.52212e-17 * 2,
            -0.313819 * 2,
        ];
    }
    PsyModel.prototype.psycho_loudness_approx = function (energy, gfc) {
        var loudness_power = 0.0;
        for (var i = 0; i < BLKSIZE / 2; ++i) {
            loudness_power += energy[i] * gfc.ATH.eql_w[i];
        }
        loudness_power *= PsyModel.VO_SCALE;
        return loudness_power;
    };
    PsyModel.prototype.compute_ffts = function (gfp, fftenergy, fftenergy_s, wsamp_l, wsamp_lPos, wsamp_s, wsamp_sPos, gr_out, chn, buffer, bufPos) {
        var gfc = gfp.internal_flags;
        if (chn < 2) {
            this.fft.fft_long(gfc, wsamp_l[wsamp_lPos], chn, buffer, bufPos);
            this.fft.fft_short(gfc, wsamp_s[wsamp_sPos], chn, buffer, bufPos);
        }
        else if (chn === 2) {
            for (var j = BLKSIZE - 1; j >= 0; --j) {
                var l = wsamp_l[wsamp_lPos + 0][j];
                var r = wsamp_l[wsamp_lPos + 1][j];
                wsamp_l[wsamp_lPos + 0][j] = (l + r) * Math.SQRT2 * 0.5;
                wsamp_l[wsamp_lPos + 1][j] = (l - r) * Math.SQRT2 * 0.5;
            }
            for (var b = 2; b >= 0; --b) {
                for (var j = BLKSIZE_s - 1; j >= 0; --j) {
                    var l = wsamp_s[wsamp_sPos + 0][b][j];
                    var r = wsamp_s[wsamp_sPos + 1][b][j];
                    wsamp_s[wsamp_sPos + 0][b][j] = (l + r) * Math.SQRT2 * 0.5;
                    wsamp_s[wsamp_sPos + 1][b][j] = (l - r) * Math.SQRT2 * 0.5;
                }
            }
        }
        fftenergy[0] = wsamp_l[wsamp_lPos + 0][0];
        fftenergy[0] *= fftenergy[0];
        for (var j = BLKSIZE / 2 - 1; j >= 0; --j) {
            var re = wsamp_l[wsamp_lPos + 0][BLKSIZE / 2 - j];
            var im = wsamp_l[wsamp_lPos + 0][BLKSIZE / 2 + j];
            fftenergy[BLKSIZE / 2 - j] = (re * re + im * im) * 0.5;
        }
        for (var b = 2; b >= 0; --b) {
            fftenergy_s[b][0] = wsamp_s[wsamp_sPos + 0][b][0];
            fftenergy_s[b][0] *= fftenergy_s[b][0];
            for (var j = BLKSIZE_s / 2 - 1; j >= 0; --j) {
                var re = wsamp_s[wsamp_sPos + 0][b][BLKSIZE_s / 2 - j];
                var im = wsamp_s[wsamp_sPos + 0][b][BLKSIZE_s / 2 + j];
                fftenergy_s[b][BLKSIZE_s / 2 - j] = (re * re + im * im) * 0.5;
            }
        }
        var totalenergy = 0.0;
        for (var j = 11; j < HBLKSIZE; j++) {
            totalenergy += fftenergy[j];
        }
        gfc.tot_ener[chn] = totalenergy;
        if (gfp.athaa_loudapprox === 2 && chn < 2) {
            gfc.loudness_sq[gr_out][chn] = gfc.loudness_sq_save[chn];
            gfc.loudness_sq_save[chn] = this.psycho_loudness_approx(fftenergy, gfc);
        }
    };
    PsyModel.prototype.init_mask_add_max_values = function () {
        this.ma_max_i1 = Math.pow(10, (PsyModel.I1LIMIT + 1) / 16.0);
        this.ma_max_i2 = Math.pow(10, (PsyModel.I2LIMIT + 1) / 16.0);
        this.ma_max_m = Math.pow(10, PsyModel.MLIMIT / 10.0);
    };
    PsyModel.prototype.mask_add = function (m1, m2, kk, b, gfc, shortblock) {
        var ratio;
        if (m2 > m1) {
            if (m2 < m1 * this.ma_max_i2)
                ratio = m2 / m1;
            else
                return m1 + m2;
        }
        else {
            if (m1 >= m2 * this.ma_max_i2)
                return m1 + m2;
            ratio = m1 / m2;
        }
        m1 += m2;
        if (b + 3 <= 3 + 3) {
            if (ratio >= this.ma_max_i1) {
                return m1;
            }
            var i_1 = Math.trunc(Math.log10(ratio) * 16.0);
            return m1 * this.table2[i_1];
        }
        var i = Math.trunc(Math.log10(ratio) * 16.0);
        if (shortblock !== 0) {
            m2 = gfc.ATH.cb_s[kk] * gfc.ATH.adjust;
        }
        else {
            m2 = gfc.ATH.cb_l[kk] * gfc.ATH.adjust;
        }
        if (m1 < this.ma_max_m * m2) {
            if (m1 > m2) {
                var f = void 0;
                f = 1.0;
                if (i <= 13)
                    f = this.table3[i];
                var r = Math.log10(m1 / m2) * (10.0 / 15.0);
                return m1 * ((this.table1[i] - f) * r + f);
            }
            if (i > 13) {
                return m1;
            }
            return m1 * this.table3[i];
        }
        return m1 * this.table1[i];
    };
    PsyModel.prototype.vbrpsy_mask_add = function (m1, m2, b) {
        var ratio;
        if (m1 < 0) {
            m1 = 0;
        }
        if (m2 < 0) {
            m2 = 0;
        }
        if (m1 <= 0) {
            return m2;
        }
        if (m2 <= 0) {
            return m1;
        }
        if (m2 > m1) {
            ratio = m2 / m1;
        }
        else {
            ratio = m1 / m2;
        }
        if (b >= -2 && b <= 2) {
            if (ratio >= this.ma_max_i1) {
                return m1 + m2;
            }
            var i = Math.trunc(Math.log10(ratio) * 16.0);
            return (m1 + m2) * this.table2_[i];
        }
        if (ratio < this.ma_max_i2) {
            return m1 + m2;
        }
        if (m1 < m2) {
            m1 = m2;
        }
        return m1;
    };
    PsyModel.prototype.calc_interchannel_masking = function (gfp, ratio) {
        var gfc = gfp.internal_flags;
        if (gfc.channels_out > 1) {
            for (var sb = 0; sb < SBMAX_l; sb++) {
                var l = gfc.thm[0].l[sb];
                var r = gfc.thm[1].l[sb];
                gfc.thm[0].l[sb] += r * ratio;
                gfc.thm[1].l[sb] += l * ratio;
            }
            for (var sb = 0; sb < SBMAX_s; sb++) {
                for (var sblock = 0; sblock < 3; sblock++) {
                    var l = gfc.thm[0].s[sb][sblock];
                    var r = gfc.thm[1].s[sb][sblock];
                    gfc.thm[0].s[sb][sblock] += r * ratio;
                    gfc.thm[1].s[sb][sblock] += l * ratio;
                }
            }
        }
    };
    PsyModel.prototype.msfix1 = function (gfc) {
        for (var sb = 0; sb < SBMAX_l; sb++) {
            if (gfc.thm[0].l[sb] > 1.58 * gfc.thm[1].l[sb] ||
                gfc.thm[1].l[sb] > 1.58 * gfc.thm[0].l[sb])
                continue;
            var mld = gfc.mld_l[sb] * gfc.en[3].l[sb];
            var rmid = Math.max(gfc.thm[2].l[sb], Math.min(gfc.thm[3].l[sb], mld));
            mld = gfc.mld_l[sb] * gfc.en[2].l[sb];
            var rside = Math.max(gfc.thm[3].l[sb], Math.min(gfc.thm[2].l[sb], mld));
            gfc.thm[2].l[sb] = rmid;
            gfc.thm[3].l[sb] = rside;
        }
        for (var sb = 0; sb < SBMAX_s; sb++) {
            for (var sblock = 0; sblock < 3; sblock++) {
                if (gfc.thm[0].s[sb][sblock] > 1.58 * gfc.thm[1].s[sb][sblock] ||
                    gfc.thm[1].s[sb][sblock] > 1.58 * gfc.thm[0].s[sb][sblock])
                    continue;
                var mld = gfc.mld_s[sb] * gfc.en[3].s[sb][sblock];
                var rmid = Math.max(gfc.thm[2].s[sb][sblock], Math.min(gfc.thm[3].s[sb][sblock], mld));
                mld = gfc.mld_s[sb] * gfc.en[2].s[sb][sblock];
                var rside = Math.max(gfc.thm[3].s[sb][sblock], Math.min(gfc.thm[2].s[sb][sblock], mld));
                gfc.thm[2].s[sb][sblock] = rmid;
                gfc.thm[3].s[sb][sblock] = rside;
            }
        }
    };
    PsyModel.prototype.ns_msfix = function (gfc, msfix, athadjust) {
        var msfix2 = msfix;
        var athlower = Math.pow(10, athadjust);
        msfix *= 2.0;
        msfix2 *= 2.0;
        for (var sb = 0; sb < SBMAX_l; sb++) {
            var thmM = void 0;
            var thmS = void 0;
            var ath = gfc.ATH.cb_l[gfc.bm_l[sb]] * athlower;
            var thmLR = Math.min(Math.max(gfc.thm[0].l[sb], ath), Math.max(gfc.thm[1].l[sb], ath));
            thmM = Math.max(gfc.thm[2].l[sb], ath);
            thmS = Math.max(gfc.thm[3].l[sb], ath);
            if (thmLR * msfix < thmM + thmS) {
                var f = (thmLR * msfix2) / (thmM + thmS);
                thmM *= f;
                thmS *= f;
            }
            gfc.thm[2].l[sb] = Math.min(thmM, gfc.thm[2].l[sb]);
            gfc.thm[3].l[sb] = Math.min(thmS, gfc.thm[3].l[sb]);
        }
        athlower *= BLKSIZE_s / BLKSIZE;
        for (var sb = 0; sb < SBMAX_s; sb++) {
            for (var sblock = 0; sblock < 3; sblock++) {
                var thmM = void 0;
                var thmS = void 0;
                var ath = gfc.ATH.cb_s[gfc.bm_s[sb]] * athlower;
                var thmLR = Math.min(Math.max(gfc.thm[0].s[sb][sblock], ath), Math.max(gfc.thm[1].s[sb][sblock], ath));
                thmM = Math.max(gfc.thm[2].s[sb][sblock], ath);
                thmS = Math.max(gfc.thm[3].s[sb][sblock], ath);
                if (thmLR * msfix < thmM + thmS) {
                    var f = (thmLR * msfix) / (thmM + thmS);
                    thmM *= f;
                    thmS *= f;
                }
                gfc.thm[2].s[sb][sblock] = Math.min(gfc.thm[2].s[sb][sblock], thmM);
                gfc.thm[3].s[sb][sblock] = Math.min(gfc.thm[3].s[sb][sblock], thmS);
            }
        }
    };
    PsyModel.prototype.convert_partition2scalefac_s = function (gfc, eb, thr, chn, sblock) {
        var sb = 0;
        var b = 0;
        var enn = 0.0;
        var thmm = 0.0;
        for (; sb < SBMAX_s; ++b, ++sb) {
            var bo_s_sb = gfc.bo_s[sb];
            var npart_s = gfc.npart_s;
            var b_lim = bo_s_sb < npart_s ? bo_s_sb : npart_s;
            while (b < b_lim) {
                assert(eb[b] >= 0);
                assert(thr[b] >= 0);
                enn += eb[b];
                thmm += thr[b];
                b++;
            }
            gfc.en[chn].s[sb][sblock] = enn;
            gfc.thm[chn].s[sb][sblock] = thmm;
            if (b >= npart_s) {
                ++sb;
                break;
            }
            assert(eb[b] >= 0);
            assert(thr[b] >= 0);
            var w_curr = gfc.PSY.bo_s_weight[sb];
            var w_next = 1.0 - w_curr;
            enn = w_curr * eb[b];
            thmm = w_curr * thr[b];
            gfc.en[chn].s[sb][sblock] += enn;
            gfc.thm[chn].s[sb][sblock] += thmm;
            enn = w_next * eb[b];
            thmm = w_next * thr[b];
        }
        for (; sb < SBMAX_s; ++sb) {
            gfc.en[chn].s[sb][sblock] = 0;
            gfc.thm[chn].s[sb][sblock] = 0;
        }
    };
    PsyModel.prototype.convert_partition2scalefac_l = function (gfc, eb, thr, chn) {
        var sb = 0;
        var b = 0;
        var enn = 0.0;
        var thmm = 0.0;
        for (; sb < SBMAX_l; ++b, ++sb) {
            var bo_l_sb = gfc.bo_l[sb];
            var npart_l = gfc.npart_l;
            var b_lim = bo_l_sb < npart_l ? bo_l_sb : npart_l;
            while (b < b_lim) {
                assert(eb[b] >= 0);
                assert(thr[b] >= 0);
                enn += eb[b];
                thmm += thr[b];
                b++;
            }
            gfc.en[chn].l[sb] = enn;
            gfc.thm[chn].l[sb] = thmm;
            if (b >= npart_l) {
                ++sb;
                break;
            }
            assert(eb[b] >= 0);
            assert(thr[b] >= 0);
            var w_curr = gfc.PSY.bo_l_weight[sb];
            var w_next = 1.0 - w_curr;
            enn = w_curr * eb[b];
            thmm = w_curr * thr[b];
            gfc.en[chn].l[sb] += enn;
            gfc.thm[chn].l[sb] += thmm;
            enn = w_next * eb[b];
            thmm = w_next * thr[b];
        }
        for (; sb < SBMAX_l; ++sb) {
            gfc.en[chn].l[sb] = 0;
            gfc.thm[chn].l[sb] = 0;
        }
    };
    PsyModel.prototype.compute_masking_s = function (gfp, fftenergy_s, eb, thr, chn, sblock) {
        var gfc = gfp.internal_flags;
        var j = 0;
        var b = 0;
        for (; b < gfc.npart_s; ++b) {
            var ebb = 0;
            var n = gfc.numlines_s[b];
            for (var i = 0; i < n; ++i, ++j) {
                var el = fftenergy_s[sblock][j];
                ebb += el;
            }
            eb[b] = ebb;
        }
        assert(b === gfc.npart_s);
        j = 0;
        b = 0;
        assert(gfc.s3_ss !== null);
        for (; b < gfc.npart_s; b++) {
            var kk = gfc.s3ind_s[b][0];
            var ecb = gfc.s3_ss[j++] * eb[kk];
            ++kk;
            while (kk <= gfc.s3ind_s[b][1]) {
                ecb += gfc.s3_ss[j] * eb[kk];
                ++j;
                ++kk;
            }
            var x = this.rpelev_s * gfc.nb_s1[chn][b];
            thr[b] = Math.min(ecb, x);
            if (gfc.blocktype_old[chn & 1] === SHORT_TYPE) {
                var x_1 = this.rpelev2_s * gfc.nb_s2[chn][b];
                var y = thr[b];
                thr[b] = Math.min(x_1, y);
            }
            gfc.nb_s2[chn][b] = gfc.nb_s1[chn][b];
            gfc.nb_s1[chn][b] = ecb;
            assert(thr[b] >= 0);
        }
        for (; b <= CBANDS; ++b) {
            eb[b] = 0;
            thr[b] = 0;
        }
    };
    PsyModel.prototype.block_type_set = function (gfp, uselongblock, blocktype_d, blocktype) {
        var gfc = gfp.internal_flags;
        if (gfp.short_blocks === 1 /* ShortBlock.short_block_coupled */ &&
            !(uselongblock[0] !== 0 && uselongblock[1] !== 0)) {
            uselongblock[0] = 0;
            uselongblock[1] = 0;
        }
        for (var chn = 0; chn < gfc.channels_out; chn++) {
            blocktype[chn] = NORM_TYPE;
            if (gfp.short_blocks === 2 /* ShortBlock.short_block_dispensed */)
                uselongblock[chn] = 1;
            if (gfp.short_blocks === 3 /* ShortBlock.short_block_forced */)
                uselongblock[chn] = 0;
            if (uselongblock[chn] !== 0) {
                assert(gfc.blocktype_old[chn] !== START_TYPE);
                if (gfc.blocktype_old[chn] === SHORT_TYPE)
                    blocktype[chn] = STOP_TYPE;
            }
            else {
                blocktype[chn] = SHORT_TYPE;
                if (gfc.blocktype_old[chn] === NORM_TYPE) {
                    gfc.blocktype_old[chn] = START_TYPE;
                }
                if (gfc.blocktype_old[chn] === STOP_TYPE)
                    gfc.blocktype_old[chn] = SHORT_TYPE;
            }
            blocktype_d[chn] = gfc.blocktype_old[chn];
            gfc.blocktype_old[chn] = blocktype[chn];
        }
    };
    PsyModel.prototype.nsInterp = function (x, y, r) {
        if (r >= 1.0) {
            return x;
        }
        if (r <= 0.0)
            return y;
        if (y > 0.0) {
            return Math.pow(x / y, r) * y;
        }
        return 0.0;
    };
    PsyModel.prototype.pecalc_s = function (mr, masking_lower) {
        var pe_s = 1236.28 / 4;
        for (var sb = 0; sb < SBMAX_s - 1; sb++) {
            for (var sblock = 0; sblock < 3; sblock++) {
                var thm = mr.thm.s[sb][sblock];
                assert(sb < this.regcoef_s.length);
                if (thm > 0.0) {
                    var x = thm * masking_lower;
                    var en = mr.en.s[sb][sblock];
                    if (en > x) {
                        if (en > x * 1e10) {
                            pe_s += this.regcoef_s[sb] * (10.0 * LOG10);
                        }
                        else {
                            pe_s += this.regcoef_s[sb] * Math.log10(en / x);
                        }
                    }
                }
            }
        }
        return pe_s;
    };
    PsyModel.prototype.pecalc_l = function (mr, masking_lower) {
        var pe_l = 1124.23 / 4;
        for (var sb = 0; sb < SBMAX_l - 1; sb++) {
            var thm = mr.thm.l[sb];
            assert(sb < this.regcoef_l.length);
            if (thm > 0.0) {
                var x = thm * masking_lower;
                var en = mr.en.l[sb];
                if (en > x) {
                    if (en > x * 1e10) {
                        pe_l += this.regcoef_l[sb] * (10.0 * LOG10);
                    }
                    else {
                        pe_l += this.regcoef_l[sb] * Math.log10(en / x);
                    }
                }
            }
        }
        return pe_l;
    };
    PsyModel.prototype.calc_energy = function (gfc, fftenergy, eb, max, avg) {
        var b = 0;
        var j = 0;
        for (; b < gfc.npart_l; ++b) {
            var ebb = 0;
            var m = 0;
            var i = void 0;
            for (i = 0; i < gfc.numlines_l[b]; ++i, ++j) {
                var el = fftenergy[j];
                ebb += el;
                if (m < el)
                    m = el;
            }
            eb[b] = ebb;
            max[b] = m;
            avg[b] = ebb * gfc.rnumlines_l[b];
            assert(gfc.rnumlines_l[b] >= 0);
            assert(eb[b] >= 0);
            assert(max[b] >= 0);
            assert(avg[b] >= 0);
        }
    };
    PsyModel.prototype.calc_mask_index_l = function (gfc, max, avg, mask_idx) {
        var last_tab_entry = this.tab.length - 1;
        var b = 0;
        var a = avg[b] + avg[b + 1];
        if (a > 0.0) {
            var m = max[b];
            if (m < max[b + 1])
                m = max[b + 1];
            assert(gfc.numlines_l[b] + gfc.numlines_l[b + 1] - 1 > 0);
            a =
                (20.0 * (m * 2.0 - a)) /
                    (a * (gfc.numlines_l[b] + gfc.numlines_l[b + 1] - 1));
            var k = Math.trunc(a);
            if (k > last_tab_entry)
                k = last_tab_entry;
            mask_idx[b] = k;
        }
        else {
            mask_idx[b] = 0;
        }
        for (b = 1; b < gfc.npart_l - 1; b++) {
            a = avg[b - 1] + avg[b] + avg[b + 1];
            if (a > 0.0) {
                var m = max[b - 1];
                if (m < max[b])
                    m = max[b];
                if (m < max[b + 1])
                    m = max[b + 1];
                assert(gfc.numlines_l[b - 1] +
                    gfc.numlines_l[b] +
                    gfc.numlines_l[b + 1] -
                    1 >
                    0);
                a =
                    (20.0 * (m * 3.0 - a)) /
                        (a *
                            (gfc.numlines_l[b - 1] +
                                gfc.numlines_l[b] +
                                gfc.numlines_l[b + 1] -
                                1));
                var k = Math.trunc(a);
                if (k > last_tab_entry)
                    k = last_tab_entry;
                mask_idx[b] = k;
            }
            else {
                mask_idx[b] = 0;
            }
        }
        assert(b === gfc.npart_l - 1);
        a = avg[b - 1] + avg[b];
        if (a > 0.0) {
            var m = max[b - 1];
            if (m < max[b])
                m = max[b];
            assert(gfc.numlines_l[b - 1] + gfc.numlines_l[b] - 1 > 0);
            a =
                (20.0 * (m * 2.0 - a)) /
                    (a * (gfc.numlines_l[b - 1] + gfc.numlines_l[b] - 1));
            var k = Math.trunc(a);
            if (k > last_tab_entry)
                k = last_tab_entry;
            mask_idx[b] = k;
        }
        else {
            mask_idx[b] = 0;
        }
        assert(b === gfc.npart_l - 1);
    };
    // eslint-disable-next-line complexity
    PsyModel.prototype.L3psycho_anal_ns = function (gfp, buffer, bufPos, gr_out, masking_ratio, masking_MS_ratio, percep_entropy, percep_MS_entropy, energy, blocktype_d) {
        var gfc = gfp.internal_flags;
        var wsamp_L = Array.from({ length: 2 }, function () { return new Float32Array(BLKSIZE); });
        var wsamp_S = Array.from({ length: 2 }, function () {
            return Array.from({ length: 3 }, function () { return new Float32Array(BLKSIZE_s); });
        });
        var eb_l = new Float32Array(CBANDS + 1);
        var eb_s = new Float32Array(CBANDS + 1);
        var thr = new Float32Array(CBANDS + 2);
        var blocktype = new Int32Array(2);
        var uselongblock = new Int32Array(2);
        var numchn;
        var chn;
        var b;
        var i;
        var j;
        var k;
        var sb;
        var sblock;
        var ns_hpfsmpl = Array.from({ length: 2 }, function () { return new Float32Array(576); });
        var pcfact;
        var mask_idx_l = new Int32Array(CBANDS + 2);
        var mask_idx_s = new Int32Array(CBANDS + 2);
        fillArray(mask_idx_s, 0);
        numchn = gfc.channels_out;
        if (gfp.mode === MPEGMode.JOINT_STEREO) {
            numchn = 4;
        }
        if (gfp.VBR === 0 /* VbrMode.vbr_off */) {
            pcfact = 0;
        }
        else if (gfp.VBR === 2 /* VbrMode.vbr_rh */ ||
            gfp.VBR === 4 /* VbrMode.vbr_mtrh */ ||
            gfp.VBR === 1 /* VbrMode.vbr_mt */) {
            pcfact = 0.6;
        }
        else
            pcfact = 1.0;
        for (chn = 0; chn < gfc.channels_out; chn++) {
            var firbuf = buffer[chn];
            var firbufPos = bufPos + 576 - 350 - PsyModel.NSFIRLEN + 192;
            assert(this.fircoef.length === (PsyModel.NSFIRLEN - 1) / 2);
            for (i = 0; i < 576; i++) {
                var sum1 = void 0;
                var sum2 = void 0;
                sum1 = firbuf[firbufPos + i + 10];
                sum2 = 0.0;
                for (j = 0; j < (PsyModel.NSFIRLEN - 1) / 2 - 1; j += 2) {
                    sum1 +=
                        this.fircoef[j] *
                            (firbuf[firbufPos + i + j] +
                                firbuf[firbufPos + i + PsyModel.NSFIRLEN - j]);
                    sum2 +=
                        this.fircoef[j + 1] *
                            (firbuf[firbufPos + i + j + 1] +
                                firbuf[firbufPos + i + PsyModel.NSFIRLEN - j - 1]);
                }
                ns_hpfsmpl[chn][i] = sum1 + sum2;
            }
            masking_ratio[gr_out][chn].en.assign(gfc.en[chn]);
            masking_ratio[gr_out][chn].thm.assign(gfc.thm[chn]);
            if (numchn > 2) {
                masking_MS_ratio[gr_out][chn].en.assign(gfc.en[chn + 2]);
                masking_MS_ratio[gr_out][chn].thm.assign(gfc.thm[chn + 2]);
            }
        }
        for (chn = 0; chn < numchn; chn++) {
            var en_subshort = new Float32Array(12);
            var en_short = [0, 0, 0, 0];
            var attack_intensity = new Float32Array(12);
            var ns_uselongblock = 1;
            var max = new Float32Array(CBANDS);
            var avg = new Float32Array(CBANDS);
            var ns_attacks = [0, 0, 0, 0];
            var fftenergy = new Float32Array(HBLKSIZE);
            var fftenergy_s = Array.from({ length: 3 }, function () { return new Float32Array(HBLKSIZE_s); });
            assert(gfc.npart_s <= CBANDS);
            assert(gfc.npart_l <= CBANDS);
            for (i = 0; i < 3; i++) {
                en_subshort[i] = gfc.nsPsy.last_en_subshort[chn][i + 6];
                assert(gfc.nsPsy.last_en_subshort[chn][i + 4] > 0);
                attack_intensity[i] =
                    en_subshort[i] / gfc.nsPsy.last_en_subshort[chn][i + 4];
                en_short[0] += en_subshort[i];
            }
            if (chn === 2) {
                for (i = 0; i < 576; i++) {
                    var l = ns_hpfsmpl[0][i];
                    var r = ns_hpfsmpl[1][i];
                    ns_hpfsmpl[0][i] = l + r;
                    ns_hpfsmpl[1][i] = l - r;
                }
            }
            var pf = ns_hpfsmpl[chn & 1];
            var pfPos = 0;
            for (i = 0; i < 9; i++) {
                var pfe = pfPos + 576 / 9;
                var p = 1;
                for (; pfPos < pfe; pfPos++)
                    if (p < Math.abs(pf[pfPos]))
                        p = Math.abs(pf[pfPos]);
                gfc.nsPsy.last_en_subshort[chn][i] = p;
                en_subshort[i + 3] = p;
                en_short[1 + i / 3] += p;
                if (p > en_subshort[i + 3 - 2]) {
                    assert(en_subshort[i + 3 - 2] > 0);
                    p /= en_subshort[i + 3 - 2];
                }
                else if (en_subshort[i + 3 - 2] > p * 10.0) {
                    p = en_subshort[i + 3 - 2] / (p * 10.0);
                }
                else
                    p = 0.0;
                attack_intensity[i + 3] = p;
            }
            var attackThreshold = chn === 3 ? gfc.nsPsy.attackthre_s : gfc.nsPsy.attackthre;
            for (i = 0; i < 12; i++) {
                if (ns_attacks[i / 3] === 0 && attack_intensity[i] > attackThreshold) {
                    ns_attacks[i / 3] = (i % 3) + 1;
                }
            }
            for (i = 1; i < 4; i++) {
                var ratio = void 0;
                if (en_short[i - 1] > en_short[i]) {
                    assert(en_short[i] > 0);
                    ratio = en_short[i - 1] / en_short[i];
                }
                else {
                    assert(en_short[i - 1] > 0);
                    ratio = en_short[i] / en_short[i - 1];
                }
                if (ratio < 1.7) {
                    ns_attacks[i] = 0;
                    if (i === 1)
                        ns_attacks[0] = 0;
                }
            }
            if (ns_attacks[0] !== 0 && gfc.nsPsy.lastAttacks[chn] !== 0)
                ns_attacks[0] = 0;
            if (gfc.nsPsy.lastAttacks[chn] === 3 ||
                ns_attacks[0] + ns_attacks[1] + ns_attacks[2] + ns_attacks[3] !== 0) {
                ns_uselongblock = 0;
                if (ns_attacks[1] !== 0 && ns_attacks[0] !== 0)
                    ns_attacks[1] = 0;
                if (ns_attacks[2] !== 0 && ns_attacks[1] !== 0)
                    ns_attacks[2] = 0;
                if (ns_attacks[3] !== 0 && ns_attacks[2] !== 0)
                    ns_attacks[3] = 0;
            }
            if (chn < 2) {
                uselongblock[chn] = ns_uselongblock;
            }
            else if (ns_uselongblock === 0) {
                uselongblock[0] = 0;
                uselongblock[1] = 0;
            }
            energy[chn] = gfc.tot_ener[chn];
            var wsamp_s = wsamp_S;
            var wsamp_l = wsamp_L;
            this.compute_ffts(gfp, fftenergy, fftenergy_s, wsamp_l, chn & 1, wsamp_s, chn & 1, gr_out, chn, buffer, bufPos);
            this.calc_energy(gfc, fftenergy, eb_l, max, avg);
            this.calc_mask_index_l(gfc, max, avg, mask_idx_l);
            for (sblock = 0; sblock < 3; sblock++) {
                var enn = void 0;
                var thmm = void 0;
                this.compute_masking_s(gfp, fftenergy_s, eb_s, thr, chn, sblock);
                this.convert_partition2scalefac_s(gfc, eb_s, thr, chn, sblock);
                for (sb = 0; sb < SBMAX_s; sb++) {
                    thmm = gfc.thm[chn].s[sb][sblock];
                    thmm *= PsyModel.NS_PREECHO_ATT0;
                    if (ns_attacks[sblock] >= 2 || ns_attacks[sblock + 1] === 1) {
                        var idx = sblock !== 0 ? sblock - 1 : 2;
                        var p = this.nsInterp(gfc.thm[chn].s[sb][idx], thmm, PsyModel.NS_PREECHO_ATT1 * pcfact);
                        thmm = Math.min(thmm, p);
                    }
                    if (ns_attacks[sblock] === 1) {
                        var idx = sblock !== 0 ? sblock - 1 : 2;
                        var p = this.nsInterp(gfc.thm[chn].s[sb][idx], thmm, PsyModel.NS_PREECHO_ATT2 * pcfact);
                        thmm = Math.min(thmm, p);
                    }
                    else if ((sblock !== 0 && ns_attacks[sblock - 1] === 3) ||
                        (sblock === 0 && gfc.nsPsy.lastAttacks[chn] === 3)) {
                        var idx = sblock !== 2 ? sblock + 1 : 0;
                        var p = this.nsInterp(gfc.thm[chn].s[sb][idx], thmm, PsyModel.NS_PREECHO_ATT2 * pcfact);
                        thmm = Math.min(thmm, p);
                    }
                    enn =
                        en_subshort[sblock * 3 + 3] +
                            en_subshort[sblock * 3 + 4] +
                            en_subshort[sblock * 3 + 5];
                    if (en_subshort[sblock * 3 + 5] * 6 < enn) {
                        thmm *= 0.5;
                        if (en_subshort[sblock * 3 + 4] * 6 < enn)
                            thmm *= 0.5;
                    }
                    gfc.thm[chn].s[sb][sblock] = thmm;
                }
            }
            gfc.nsPsy.lastAttacks[chn] = ns_attacks[2];
            k = 0;
            assert(gfc.s3_ll !== null);
            for (b = 0; b < gfc.npart_l; b++) {
                var kk = gfc.s3ind[b][0];
                var eb2 = eb_l[kk] * this.tab[mask_idx_l[kk]];
                var ecb = gfc.s3_ll[k++] * eb2;
                while (++kk <= gfc.s3ind[b][1]) {
                    eb2 = eb_l[kk] * this.tab[mask_idx_l[kk]];
                    ecb = this.mask_add(ecb, gfc.s3_ll[k++] * eb2, kk, kk - b, gfc, 0);
                }
                ecb *= 0.158489319246111;
                if (gfc.blocktype_old[chn & 1] === SHORT_TYPE)
                    thr[b] = ecb;
                else
                    thr[b] = this.nsInterp(Math.min(ecb, Math.min(this.rpelev * gfc.nb_1[chn][b], this.rpelev2 * gfc.nb_2[chn][b])), ecb, pcfact);
                gfc.nb_2[chn][b] = gfc.nb_1[chn][b];
                gfc.nb_1[chn][b] = ecb;
            }
            for (; b <= CBANDS; ++b) {
                eb_l[b] = 0;
                thr[b] = 0;
            }
            this.convert_partition2scalefac_l(gfc, eb_l, thr, chn);
        }
        if (gfp.mode === MPEGMode.STEREO || gfp.mode === MPEGMode.JOINT_STEREO) {
            if (gfp.interChRatio > 0.0) {
                this.calc_interchannel_masking(gfp, gfp.interChRatio);
            }
        }
        if (gfp.mode === MPEGMode.JOINT_STEREO) {
            this.msfix1(gfc);
            var msfix = gfp.msfix;
            if (Math.abs(msfix) > 0.0)
                this.ns_msfix(gfc, msfix, gfp.ATHlower * gfc.ATH.adjust);
        }
        this.block_type_set(gfp, uselongblock, blocktype_d, blocktype);
        for (chn = 0; chn < numchn; chn++) {
            var ppe = void 0;
            var ppePos = 0;
            var type = void 0;
            var mr = void 0;
            if (chn > 1) {
                ppe = percep_MS_entropy;
                ppePos = -2;
                type = NORM_TYPE;
                if (blocktype_d[0] === SHORT_TYPE || blocktype_d[1] === SHORT_TYPE)
                    type = SHORT_TYPE;
                mr = masking_MS_ratio[gr_out][chn - 2];
            }
            else {
                ppe = percep_entropy;
                ppePos = 0;
                type = blocktype_d[chn];
                mr = masking_ratio[gr_out][chn];
            }
            if (type === SHORT_TYPE)
                ppe[ppePos + chn] = this.pecalc_s(mr, gfc.masking_lower);
            else
                ppe[ppePos + chn] = this.pecalc_l(mr, gfc.masking_lower);
        }
        return 0;
    };
    PsyModel.prototype.vbrpsy_compute_fft_l = function (gfp, buffer, bufPos, chn, fftenergy, wsamp_l, wsamp_lPos) {
        var gfc = gfp.internal_flags;
        if (chn < 2) {
            this.fft.fft_long(gfc, wsamp_l[wsamp_lPos], chn, buffer, bufPos);
        }
        else if (chn === 2) {
            for (var j = BLKSIZE - 1; j >= 0; --j) {
                var l = wsamp_l[wsamp_lPos + 0][j];
                var r = wsamp_l[wsamp_lPos + 1][j];
                wsamp_l[wsamp_lPos + 0][j] = (l + r) * Math.SQRT2 * 0.5;
                wsamp_l[wsamp_lPos + 1][j] = (l - r) * Math.SQRT2 * 0.5;
            }
        }
        fftenergy[0] = wsamp_l[wsamp_lPos + 0][0];
        fftenergy[0] *= fftenergy[0];
        for (var j = BLKSIZE / 2 - 1; j >= 0; --j) {
            var re = wsamp_l[wsamp_lPos + 0][BLKSIZE / 2 - j];
            var im = wsamp_l[wsamp_lPos + 0][BLKSIZE / 2 + j];
            fftenergy[BLKSIZE / 2 - j] = (re * re + im * im) * 0.5;
        }
        var totalenergy = 0.0;
        for (var j = 11; j < HBLKSIZE; j++)
            totalenergy += fftenergy[j];
        gfc.tot_ener[chn] = totalenergy;
    };
    PsyModel.prototype.vbrpsy_compute_fft_s = function (gfp, buffer, bufPos, chn, sblock, fftenergy_s, wsamp_s, wsamp_sPos) {
        var gfc = gfp.internal_flags;
        if (sblock === 0 && chn < 2) {
            this.fft.fft_short(gfc, wsamp_s[wsamp_sPos], chn, buffer, bufPos);
        }
        if (chn === 2) {
            for (var j = BLKSIZE_s - 1; j >= 0; --j) {
                var l = wsamp_s[wsamp_sPos + 0][sblock][j];
                var r = wsamp_s[wsamp_sPos + 1][sblock][j];
                wsamp_s[wsamp_sPos + 0][sblock][j] = (l + r) * Math.SQRT2 * 0.5;
                wsamp_s[wsamp_sPos + 1][sblock][j] = (l - r) * Math.SQRT2 * 0.5;
            }
        }
        fftenergy_s[sblock][0] = wsamp_s[wsamp_sPos + 0][sblock][0];
        fftenergy_s[sblock][0] *= fftenergy_s[sblock][0];
        for (var j = BLKSIZE_s / 2 - 1; j >= 0; --j) {
            var re = wsamp_s[wsamp_sPos + 0][sblock][BLKSIZE_s / 2 - j];
            var im = wsamp_s[wsamp_sPos + 0][sblock][BLKSIZE_s / 2 + j];
            fftenergy_s[sblock][BLKSIZE_s / 2 - j] = (re * re + im * im) * 0.5;
        }
    };
    PsyModel.prototype.vbrpsy_compute_loudness_approximation_l = function (gfp, gr_out, chn, fftenergy) {
        var gfc = gfp.internal_flags;
        if (gfp.athaa_loudapprox === 2 && chn < 2) {
            gfc.loudness_sq[gr_out][chn] = gfc.loudness_sq_save[chn];
            gfc.loudness_sq_save[chn] = this.psycho_loudness_approx(fftenergy, gfc);
        }
    };
    // eslint-disable-next-line complexity
    PsyModel.prototype.vbrpsy_attack_detection = function (gfp, buffer, bufPos, gr_out, masking_ratio, masking_MS_ratio, energy, sub_short_factor, ns_attacks, uselongblock) {
        var ns_hpfsmpl = Array.from({ length: 2 }, function () { return new Float32Array(576); });
        var gfc = gfp.internal_flags;
        var n_chn_out = gfc.channels_out;
        var n_chn_psy = gfp.mode === MPEGMode.JOINT_STEREO ? 4 : n_chn_out;
        for (var chn = 0; chn < n_chn_out; chn++) {
            var firbuf = buffer[chn];
            var firbufPos = bufPos + 576 - 350 - PsyModel.NSFIRLEN + 192;
            assert(this.fircoef_.length === (PsyModel.NSFIRLEN - 1) / 2);
            for (var i = 0; i < 576; i++) {
                var sum1 = void 0;
                var sum2 = void 0;
                sum1 = firbuf[firbufPos + i + 10];
                sum2 = 0.0;
                for (var j = 0; j < (PsyModel.NSFIRLEN - 1) / 2 - 1; j += 2) {
                    sum1 +=
                        this.fircoef_[j] *
                            (firbuf[firbufPos + i + j] +
                                firbuf[firbufPos + i + PsyModel.NSFIRLEN - j]);
                    sum2 +=
                        this.fircoef_[j + 1] *
                            (firbuf[firbufPos + i + j + 1] +
                                firbuf[firbufPos + i + PsyModel.NSFIRLEN - j - 1]);
                }
                ns_hpfsmpl[chn][i] = sum1 + sum2;
            }
            masking_ratio[gr_out][chn].en.assign(gfc.en[chn]);
            masking_ratio[gr_out][chn].thm.assign(gfc.thm[chn]);
            if (n_chn_psy > 2) {
                masking_MS_ratio[gr_out][chn].en.assign(gfc.en[chn + 2]);
                masking_MS_ratio[gr_out][chn].thm.assign(gfc.thm[chn + 2]);
            }
        }
        for (var chn = 0; chn < n_chn_psy; chn++) {
            var attack_intensity = new Float32Array(12);
            var en_subshort = new Float32Array(12);
            var en_short = [0, 0, 0, 0];
            var pf = ns_hpfsmpl[chn & 1];
            var pfPos = 0;
            var attackThreshold = chn === 3 ? gfc.nsPsy.attackthre_s : gfc.nsPsy.attackthre;
            var ns_uselongblock = 1;
            if (chn === 2) {
                for (var i = 0, j = 576; j > 0; ++i, --j) {
                    var l = ns_hpfsmpl[0][i];
                    var r = ns_hpfsmpl[1][i];
                    ns_hpfsmpl[0][i] = l + r;
                    ns_hpfsmpl[1][i] = l - r;
                }
            }
            for (var i = 0; i < 3; i++) {
                en_subshort[i] = gfc.nsPsy.last_en_subshort[chn][i + 6];
                assert(gfc.nsPsy.last_en_subshort[chn][i + 4] > 0);
                attack_intensity[i] =
                    en_subshort[i] / gfc.nsPsy.last_en_subshort[chn][i + 4];
                en_short[0] += en_subshort[i];
            }
            for (var i = 0; i < 9; i++) {
                var pfe = pfPos + 576 / 9;
                var p = 1;
                for (; pfPos < pfe; pfPos++)
                    if (p < Math.abs(pf[pfPos]))
                        p = Math.abs(pf[pfPos]);
                gfc.nsPsy.last_en_subshort[chn][i] = p;
                en_subshort[i + 3] = p;
                en_short[1 + i / 3] += p;
                if (p > en_subshort[i + 3 - 2]) {
                    assert(en_subshort[i + 3 - 2] > 0);
                    p /= en_subshort[i + 3 - 2];
                }
                else if (en_subshort[i + 3 - 2] > p * 10.0) {
                    p = en_subshort[i + 3 - 2] / (p * 10.0);
                }
                else {
                    p = 0.0;
                }
                attack_intensity[i + 3] = p;
            }
            for (var i = 0; i < 3; ++i) {
                var enn = en_subshort[i * 3 + 3] +
                    en_subshort[i * 3 + 4] +
                    en_subshort[i * 3 + 5];
                var factor = 1;
                if (en_subshort[i * 3 + 5] * 6 < enn) {
                    factor *= 0.5;
                    if (en_subshort[i * 3 + 4] * 6 < enn) {
                        factor *= 0.5;
                    }
                }
                sub_short_factor[chn][i] = factor;
            }
            for (var i = 0; i < 12; i++) {
                if (ns_attacks[chn][i / 3] === 0 &&
                    attack_intensity[i] > attackThreshold) {
                    ns_attacks[chn][i / 3] = (i % 3) + 1;
                }
            }
            for (var i = 1; i < 4; i++) {
                var u = en_short[i - 1];
                var v = en_short[i];
                var m = Math.max(u, v);
                if (m < 40000) {
                    if (u < 1.7 * v && v < 1.7 * u) {
                        if (i === 1 && ns_attacks[chn][0] <= ns_attacks[chn][i]) {
                            ns_attacks[chn][0] = 0;
                        }
                        ns_attacks[chn][i] = 0;
                    }
                }
            }
            if (ns_attacks[chn][0] <= gfc.nsPsy.lastAttacks[chn]) {
                ns_attacks[chn][0] = 0;
            }
            if (gfc.nsPsy.lastAttacks[chn] === 3 ||
                ns_attacks[chn][0] +
                    ns_attacks[chn][1] +
                    ns_attacks[chn][2] +
                    ns_attacks[chn][3] !==
                    0) {
                ns_uselongblock = 0;
                if (ns_attacks[chn][1] !== 0 && ns_attacks[chn][0] !== 0) {
                    ns_attacks[chn][1] = 0;
                }
                if (ns_attacks[chn][2] !== 0 && ns_attacks[chn][1] !== 0) {
                    ns_attacks[chn][2] = 0;
                }
                if (ns_attacks[chn][3] !== 0 && ns_attacks[chn][2] !== 0) {
                    ns_attacks[chn][3] = 0;
                }
            }
            if (chn < 2) {
                uselongblock[chn] = ns_uselongblock;
            }
            else if (ns_uselongblock === 0) {
                uselongblock[0] = 0;
                uselongblock[1] = 0;
            }
            energy[chn] = gfc.tot_ener[chn];
        }
    };
    PsyModel.prototype.vbrpsy_skip_masking_s = function (gfc, chn, sblock) {
        if (sblock === 0) {
            for (var b = 0; b < gfc.npart_s; b++) {
                gfc.nb_s2[chn][b] = gfc.nb_s1[chn][b];
                gfc.nb_s1[chn][b] = 0;
            }
        }
    };
    PsyModel.prototype.vbrpsy_skip_masking_l = function (gfc, chn) {
        for (var b = 0; b < gfc.npart_l; b++) {
            gfc.nb_2[chn][b] = gfc.nb_1[chn][b];
            gfc.nb_1[chn][b] = 0;
        }
    };
    PsyModel.prototype.psyvbr_calc_mask_index_s = function (gfc, max, avg, mask_idx) {
        var last_tab_entry = this.tab.length - 1;
        var b = 0;
        var a = avg[b] + avg[b + 1];
        if (a > 0.0) {
            var m = max[b];
            if (m < max[b + 1])
                m = max[b + 1];
            assert(gfc.numlines_s[b] + gfc.numlines_s[b + 1] - 1 > 0);
            a =
                (20.0 * (m * 2.0 - a)) /
                    (a * (gfc.numlines_s[b] + gfc.numlines_s[b + 1] - 1));
            var k = Math.trunc(a);
            if (k > last_tab_entry)
                k = last_tab_entry;
            mask_idx[b] = k;
        }
        else {
            mask_idx[b] = 0;
        }
        for (b = 1; b < gfc.npart_s - 1; b++) {
            a = avg[b - 1] + avg[b] + avg[b + 1];
            assert(b + 1 < gfc.npart_s);
            if (a > 0.0) {
                var m = max[b - 1];
                if (m < max[b])
                    m = max[b];
                if (m < max[b + 1])
                    m = max[b + 1];
                assert(gfc.numlines_s[b - 1] +
                    gfc.numlines_s[b] +
                    gfc.numlines_s[b + 1] -
                    1 >
                    0);
                a =
                    (20.0 * (m * 3.0 - a)) /
                        (a *
                            (gfc.numlines_s[b - 1] +
                                gfc.numlines_s[b] +
                                gfc.numlines_s[b + 1] -
                                1));
                var k = Math.trunc(a);
                if (k > last_tab_entry)
                    k = last_tab_entry;
                mask_idx[b] = k;
            }
            else {
                mask_idx[b] = 0;
            }
        }
        assert(b === gfc.npart_s - 1);
        a = avg[b - 1] + avg[b];
        if (a > 0.0) {
            var m = max[b - 1];
            if (m < max[b])
                m = max[b];
            assert(gfc.numlines_s[b - 1] + gfc.numlines_s[b] - 1 > 0);
            a =
                (20.0 * (m * 2.0 - a)) /
                    (a * (gfc.numlines_s[b - 1] + gfc.numlines_s[b] - 1));
            var k = Math.trunc(a);
            if (k > last_tab_entry)
                k = last_tab_entry;
            mask_idx[b] = k;
        }
        else {
            mask_idx[b] = 0;
        }
        assert(b === gfc.npart_s - 1);
    };
    PsyModel.prototype.vbrpsy_compute_masking_s = function (gfp, fftenergy_s, eb, thr, chn, sblock) {
        var gfc = gfp.internal_flags;
        var max = new Array(CBANDS);
        var avg = new Float32Array(CBANDS);
        var i;
        var j = 0;
        var b = 0;
        var mask_idx_s = new Array(CBANDS);
        for (; b < gfc.npart_s; ++b) {
            var ebb = 0;
            var m = 0;
            var n = gfc.numlines_s[b];
            for (i = 0; i < n; ++i, ++j) {
                var el = fftenergy_s[sblock][j];
                ebb += el;
                if (m < el)
                    m = el;
            }
            eb[b] = ebb;
            max[b] = m;
            avg[b] = ebb / n;
            assert(avg[b] >= 0);
        }
        assert(b === gfc.npart_s);
        for (; b < CBANDS; ++b) {
            max[b] = 0;
            avg[b] = 0;
        }
        j = 0;
        b = 0;
        this.psyvbr_calc_mask_index_s(gfc, max, avg, mask_idx_s);
        assert(gfc.s3_ss !== null);
        for (; b < gfc.npart_s; b++) {
            var kk = gfc.s3ind_s[b][0];
            var last = gfc.s3ind_s[b][1];
            var dd = void 0;
            var dd_n = void 0;
            var x = void 0;
            var ecb = void 0;
            dd = mask_idx_s[kk];
            dd_n = 1;
            ecb = gfc.s3_ss[j] * eb[kk] * this.tab[mask_idx_s[kk]];
            ++j;
            ++kk;
            while (kk <= last) {
                dd += mask_idx_s[kk];
                dd_n += 1;
                x = gfc.s3_ss[j] * eb[kk] * this.tab[mask_idx_s[kk]];
                ecb = this.vbrpsy_mask_add(ecb, x, kk - b);
                ++j;
                ++kk;
            }
            dd = (1 + 2 * dd) / (2 * dd_n);
            var avg_mask = this.tab[dd] * 0.5;
            ecb *= avg_mask;
            thr[b] = ecb;
            gfc.nb_s2[chn][b] = gfc.nb_s1[chn][b];
            gfc.nb_s1[chn][b] = ecb;
            x = max[b];
            x *= gfc.minval_s[b];
            x *= avg_mask;
            if (thr[b] > x) {
                thr[b] = x;
            }
            if (gfc.masking_lower > 1) {
                thr[b] *= gfc.masking_lower;
            }
            if (thr[b] > eb[b]) {
                thr[b] = eb[b];
            }
            if (gfc.masking_lower < 1) {
                thr[b] *= gfc.masking_lower;
            }
            assert(thr[b] >= 0);
        }
        for (; b < CBANDS; ++b) {
            eb[b] = 0;
            thr[b] = 0;
        }
    };
    PsyModel.prototype.vbrpsy_compute_masking_l = function (gfc, fftenergy, eb_l, thr, chn) {
        var max = new Float32Array(CBANDS);
        var avg = new Float32Array(CBANDS);
        var mask_idx_l = new Int32Array(CBANDS + 2);
        var b;
        this.calc_energy(gfc, fftenergy, eb_l, max, avg);
        this.calc_mask_index_l(gfc, max, avg, mask_idx_l);
        var k = 0;
        assert(gfc.s3_ll !== null);
        for (b = 0; b < gfc.npart_l; b++) {
            var x = void 0;
            var ecb = void 0;
            var t = void 0;
            var kk = gfc.s3ind[b][0];
            var last = gfc.s3ind[b][1];
            var dd = 0;
            var dd_n = 0;
            dd = mask_idx_l[kk];
            dd_n += 1;
            ecb = gfc.s3_ll[k] * eb_l[kk] * this.tab[mask_idx_l[kk]];
            ++k;
            ++kk;
            while (kk <= last) {
                dd += mask_idx_l[kk];
                dd_n += 1;
                x = gfc.s3_ll[k] * eb_l[kk] * this.tab[mask_idx_l[kk]];
                t = this.vbrpsy_mask_add(ecb, x, kk - b);
                ecb = t;
                ++k;
                ++kk;
            }
            dd = (1 + 2 * dd) / (2 * dd_n);
            var avg_mask = this.tab[dd] * 0.5;
            ecb *= avg_mask;
            if (gfc.blocktype_old[chn & 0x01] === SHORT_TYPE) {
                var ecb_limit = this.rpelev * gfc.nb_1[chn][b];
                if (ecb_limit > 0) {
                    thr[b] = Math.min(ecb, ecb_limit);
                }
                else {
                    thr[b] = Math.min(ecb, eb_l[b] * PsyModel.NS_PREECHO_ATT2);
                }
            }
            else {
                var ecb_limit_2 = this.rpelev2 * gfc.nb_2[chn][b];
                var ecb_limit_1 = this.rpelev * gfc.nb_1[chn][b];
                var ecb_limit = void 0;
                if (ecb_limit_2 <= 0) {
                    ecb_limit_2 = ecb;
                }
                if (ecb_limit_1 <= 0) {
                    ecb_limit_1 = ecb;
                }
                if (gfc.blocktype_old[chn & 0x01] === NORM_TYPE) {
                    ecb_limit = Math.min(ecb_limit_1, ecb_limit_2);
                }
                else {
                    ecb_limit = ecb_limit_1;
                }
                thr[b] = Math.min(ecb, ecb_limit);
            }
            gfc.nb_2[chn][b] = gfc.nb_1[chn][b];
            gfc.nb_1[chn][b] = ecb;
            x = max[b];
            x *= gfc.minval_l[b];
            x *= avg_mask;
            if (thr[b] > x) {
                thr[b] = x;
            }
            if (gfc.masking_lower > 1) {
                thr[b] *= gfc.masking_lower;
            }
            if (thr[b] > eb_l[b]) {
                thr[b] = eb_l[b];
            }
            if (gfc.masking_lower < 1) {
                thr[b] *= gfc.masking_lower;
            }
            assert(thr[b] >= 0);
        }
        for (; b < CBANDS; ++b) {
            eb_l[b] = 0;
            thr[b] = 0;
        }
    };
    PsyModel.prototype.vbrpsy_compute_block_type = function (gfp, uselongblock) {
        var gfc = gfp.internal_flags;
        if (gfp.short_blocks === 1 /* ShortBlock.short_block_coupled */ &&
            !(uselongblock[0] !== 0 && uselongblock[1] !== 0)) {
            uselongblock[0] = 0;
            uselongblock[1] = 0;
        }
        for (var chn = 0; chn < gfc.channels_out; chn++) {
            if (gfp.short_blocks === 2 /* ShortBlock.short_block_dispensed */) {
                uselongblock[chn] = 1;
            }
            if (gfp.short_blocks === 3 /* ShortBlock.short_block_forced */) {
                uselongblock[chn] = 0;
            }
        }
    };
    PsyModel.prototype.vbrpsy_apply_block_type = function (gfp, uselongblock, blocktype_d) {
        var gfc = gfp.internal_flags;
        for (var chn = 0; chn < gfc.channels_out; chn++) {
            var blocktype = NORM_TYPE;
            if (uselongblock[chn] !== 0) {
                assert(gfc.blocktype_old[chn] !== START_TYPE);
                if (gfc.blocktype_old[chn] === SHORT_TYPE)
                    blocktype = STOP_TYPE;
            }
            else {
                blocktype = SHORT_TYPE;
                if (gfc.blocktype_old[chn] === NORM_TYPE) {
                    gfc.blocktype_old[chn] = START_TYPE;
                }
                if (gfc.blocktype_old[chn] === STOP_TYPE)
                    gfc.blocktype_old[chn] = SHORT_TYPE;
            }
            blocktype_d[chn] = gfc.blocktype_old[chn];
            gfc.blocktype_old[chn] = blocktype;
        }
    };
    PsyModel.prototype.vbrpsy_compute_MS_thresholds = function (eb, thr, cb_mld, ath_cb, athadjust, msfix, n) {
        var msfix2 = msfix * 2;
        var athlower = msfix > 0 ? Math.pow(10, athadjust) : 1;
        var rside;
        var rmid;
        for (var b = 0; b < n; ++b) {
            var ebM = eb[2][b];
            var ebS = eb[3][b];
            var thmL = thr[0][b];
            var thmR = thr[1][b];
            var thmM = thr[2][b];
            var thmS = thr[3][b];
            if (thmL <= 1.58 * thmR && thmR <= 1.58 * thmL) {
                var mld_m = cb_mld[b] * ebS;
                var mld_s = cb_mld[b] * ebM;
                rmid = Math.max(thmM, Math.min(thmS, mld_m));
                rside = Math.max(thmS, Math.min(thmM, mld_s));
            }
            else {
                rmid = thmM;
                rside = thmS;
            }
            if (msfix > 0) {
                var ath = ath_cb[b] * athlower;
                var thmLR = Math.min(Math.max(thmL, ath), Math.max(thmR, ath));
                thmM = Math.max(rmid, ath);
                thmS = Math.max(rside, ath);
                var thmMS = thmM + thmS;
                if (thmMS > 0 && thmLR * msfix2 < thmMS) {
                    var f = (thmLR * msfix2) / thmMS;
                    thmM *= f;
                    thmS *= f;
                }
                rmid = Math.min(thmM, rmid);
                rside = Math.min(thmS, rside);
            }
            if (rmid > ebM) {
                rmid = ebM;
            }
            if (rside > ebS) {
                rside = ebS;
            }
            thr[2][b] = rmid;
            thr[3][b] = rside;
        }
    };
    // eslint-disable-next-line complexity
    PsyModel.prototype.L3psycho_anal_vbr = function (gfp, buffer, bufPos, gr_out, masking_ratio, masking_MS_ratio, percep_entropy, percep_MS_entropy, energy, blocktype_d) {
        var gfc = gfp.internal_flags;
        var wsamp_l;
        var wsamp_s;
        var fftenergy = new Float32Array(HBLKSIZE);
        var fftenergy_s = Array.from({ length: 3 }, function () { return new Float32Array(HBLKSIZE_s); });
        var wsamp_L = Array.from({ length: 2 }, function () { return new Float32Array(BLKSIZE); });
        var wsamp_S = Array.from({ length: 2 }, function () {
            return Array.from({ length: 3 }, function () { return new Float32Array(BLKSIZE_s); });
        });
        var eb = Array.from({ length: 4 }, function () { return new Float32Array(CBANDS); });
        var thr = Array.from({ length: 4 }, function () { return new Float32Array(CBANDS); });
        var sub_short_factor = Array.from({ length: 4 }, function () { return new Float32Array(3); });
        var pcfact = 0.6;
        var ns_attacks = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        var uselongblock = new Int32Array(2);
        var n_chn_psy = gfp.mode === MPEGMode.JOINT_STEREO ? 4 : gfc.channels_out;
        this.vbrpsy_attack_detection(gfp, buffer, bufPos, gr_out, masking_ratio, masking_MS_ratio, energy, sub_short_factor, ns_attacks, uselongblock);
        this.vbrpsy_compute_block_type(gfp, uselongblock);
        for (var chn = 0; chn < n_chn_psy; chn++) {
            var ch01 = chn & 0x01;
            wsamp_l = wsamp_L;
            this.vbrpsy_compute_fft_l(gfp, buffer, bufPos, chn, fftenergy, wsamp_l, ch01);
            this.vbrpsy_compute_loudness_approximation_l(gfp, gr_out, chn, fftenergy);
            if (uselongblock[ch01] !== 0) {
                this.vbrpsy_compute_masking_l(gfc, fftenergy, eb[chn], thr[chn], chn);
            }
            else {
                this.vbrpsy_skip_masking_l(gfc, chn);
            }
        }
        if (uselongblock[0] + uselongblock[1] === 2) {
            if (gfp.mode === MPEGMode.JOINT_STEREO) {
                this.vbrpsy_compute_MS_thresholds(eb, thr, gfc.mld_cb_l, gfc.ATH.cb_l, gfp.ATHlower * gfc.ATH.adjust, gfp.msfix, gfc.npart_l);
            }
        }
        for (var chn = 0; chn < n_chn_psy; chn++) {
            var ch01 = chn & 0x01;
            if (uselongblock[ch01] !== 0) {
                this.convert_partition2scalefac_l(gfc, eb[chn], thr[chn], chn);
            }
        }
        for (var sblock = 0; sblock < 3; sblock++) {
            for (var chn = 0; chn < n_chn_psy; ++chn) {
                var ch01 = chn & 0x01;
                if (uselongblock[ch01] !== 0) {
                    this.vbrpsy_skip_masking_s(gfc, chn, sblock);
                }
                else {
                    wsamp_s = wsamp_S;
                    this.vbrpsy_compute_fft_s(gfp, buffer, bufPos, chn, sblock, fftenergy_s, wsamp_s, ch01);
                    this.vbrpsy_compute_masking_s(gfp, fftenergy_s, eb[chn], thr[chn], chn, sblock);
                }
            }
            if (uselongblock[0] + uselongblock[1] === 0) {
                if (gfp.mode === MPEGMode.JOINT_STEREO) {
                    this.vbrpsy_compute_MS_thresholds(eb, thr, gfc.mld_cb_s, gfc.ATH.cb_s, gfp.ATHlower * gfc.ATH.adjust, gfp.msfix, gfc.npart_s);
                }
            }
            for (var chn = 0; chn < n_chn_psy; ++chn) {
                var ch01 = chn & 0x01;
                if (uselongblock[ch01] === 0) {
                    this.convert_partition2scalefac_s(gfc, eb[chn], thr[chn], chn, sblock);
                }
            }
        }
        for (var chn = 0; chn < n_chn_psy; chn++) {
            var ch01 = chn & 0x01;
            if (uselongblock[ch01] !== 0) {
                continue;
            }
            for (var sb = 0; sb < SBMAX_s; sb++) {
                var new_thmm = new Float32Array(3);
                for (var sblock = 0; sblock < 3; sblock++) {
                    var thmm = gfc.thm[chn].s[sb][sblock];
                    thmm *= PsyModel.NS_PREECHO_ATT0;
                    if (ns_attacks[chn][sblock] >= 2 ||
                        ns_attacks[chn][sblock + 1] === 1) {
                        var idx = sblock !== 0 ? sblock - 1 : 2;
                        var p = this.nsInterp(gfc.thm[chn].s[sb][idx], thmm, PsyModel.NS_PREECHO_ATT1 * pcfact);
                        thmm = Math.min(thmm, p);
                    }
                    else if (ns_attacks[chn][sblock] === 1) {
                        var idx = sblock !== 0 ? sblock - 1 : 2;
                        var p = this.nsInterp(gfc.thm[chn].s[sb][idx], thmm, PsyModel.NS_PREECHO_ATT2 * pcfact);
                        thmm = Math.min(thmm, p);
                    }
                    else if ((sblock !== 0 && ns_attacks[chn][sblock - 1] === 3) ||
                        (sblock === 0 && gfc.nsPsy.lastAttacks[chn] === 3)) {
                        var idx = sblock !== 2 ? sblock + 1 : 0;
                        var p = this.nsInterp(gfc.thm[chn].s[sb][idx], thmm, PsyModel.NS_PREECHO_ATT2 * pcfact);
                        thmm = Math.min(thmm, p);
                    }
                    thmm *= sub_short_factor[chn][sblock];
                    new_thmm[sblock] = thmm;
                }
                for (var sblock = 0; sblock < 3; sblock++) {
                    gfc.thm[chn].s[sb][sblock] = new_thmm[sblock];
                }
            }
        }
        for (var chn = 0; chn < n_chn_psy; chn++) {
            gfc.nsPsy.lastAttacks[chn] = ns_attacks[chn][2];
        }
        this.vbrpsy_apply_block_type(gfp, uselongblock, blocktype_d);
        for (var chn = 0; chn < n_chn_psy; chn++) {
            var ppe = void 0;
            var ppePos = void 0;
            var type = void 0;
            var mr = void 0;
            if (chn > 1) {
                ppe = percep_MS_entropy;
                ppePos = -2;
                type = NORM_TYPE;
                if (blocktype_d[0] === SHORT_TYPE || blocktype_d[1] === SHORT_TYPE)
                    type = SHORT_TYPE;
                mr = masking_MS_ratio[gr_out][chn - 2];
            }
            else {
                ppe = percep_entropy;
                ppePos = 0;
                type = blocktype_d[chn];
                mr = masking_ratio[gr_out][chn];
            }
            if (type === SHORT_TYPE) {
                ppe[ppePos + chn] = this.pecalc_s(mr, gfc.masking_lower);
            }
            else {
                ppe[ppePos + chn] = this.pecalc_l(mr, gfc.masking_lower);
            }
        }
        return 0;
    };
    PsyModel.prototype.s3_func_x = function (bark, hf_slope) {
        var tempx = bark;
        var tempy;
        if (tempx >= 0) {
            tempy = -tempx * 27;
        }
        else {
            tempy = tempx * hf_slope;
        }
        if (tempy <= -72.0) {
            return 0;
        }
        return Math.exp(tempy * PsyModel.LN_TO_LOG10);
    };
    PsyModel.prototype.norm_s3_func_x = function (hf_slope) {
        var lim_a = 0;
        var lim_b = 0;
        var x = 0;
        var l;
        var h;
        for (x = 0; this.s3_func_x(x, hf_slope) > 1e-20; x -= 1)
            ;
        l = x;
        h = 0;
        while (Math.abs(h - l) > 1e-12) {
            x = (h + l) / 2;
            if (this.s3_func_x(x, hf_slope) > 0) {
                h = x;
            }
            else {
                l = x;
            }
        }
        lim_a = l;
        for (x = 0; this.s3_func_x(x, hf_slope) > 1e-20; x += 1)
            ;
        l = 0;
        h = x;
        while (Math.abs(h - l) > 1e-12) {
            x = (h + l) / 2;
            if (this.s3_func_x(x, hf_slope) > 0) {
                l = x;
            }
            else {
                h = x;
            }
        }
        lim_b = h;
        var sum = 0;
        var m = 1000;
        var i;
        for (i = 0; i <= m; ++i) {
            var x_2 = lim_a + (i * (lim_b - lim_a)) / m;
            var y = this.s3_func_x(x_2, hf_slope);
            sum += y;
        }
        var norm = (m + 1) / (sum * (lim_b - lim_a));
        return norm;
    };
    PsyModel.prototype.s3_func = function (bark) {
        var tempx;
        var x;
        var temp;
        tempx = bark;
        if (tempx >= 0)
            tempx *= 3;
        else
            tempx *= 1.5;
        if (tempx >= 0.5 && tempx <= 2.5) {
            temp = tempx - 0.5;
            x = 8.0 * (temp * temp - 2.0 * temp);
        }
        else
            x = 0.0;
        tempx += 0.474;
        var tempy = 15.811389 + 7.5 * tempx - 17.5 * Math.sqrt(1.0 + tempx * tempx);
        if (tempy <= -60.0)
            return 0.0;
        tempx = Math.exp((x + tempy) * PsyModel.LN_TO_LOG10);
        tempx /= 0.6609193;
        return tempx;
    };
    PsyModel.prototype.freq2bark = function (freq) {
        if (freq < 0)
            freq = 0;
        freq *= 0.001;
        return (13.0 * Math.atan(0.76 * freq) +
            3.5 * Math.atan((freq * freq) / (7.5 * 7.5)));
    };
    PsyModel.prototype.init_numline = function (numlines, bo, bm, bval, bval_width, mld, bo_w, sfreq, blksize, scalepos, deltafreq, sbmax) {
        var b_frq = new Float32Array(CBANDS + 1);
        var sample_freq_frac = sfreq / (sbmax > 15 ? 2 * 576 : 2 * 192);
        var partition = new Int32Array(HBLKSIZE);
        var i;
        sfreq /= blksize;
        var j = 0;
        var ni = 0;
        for (i = 0; i < CBANDS; i++) {
            var j2 = void 0;
            var bark1 = this.freq2bark(sfreq * j);
            b_frq[i] = sfreq * j;
            for (j2 = j; this.freq2bark(sfreq * j2) - bark1 < PsyModel.DELBARK &&
                j2 <= blksize / 2; j2++)
                ;
            numlines[i] = j2 - j;
            ni = i + 1;
            while (j < j2) {
                partition[j++] = i;
            }
            if (j > blksize / 2) {
                j = blksize / 2;
                ++i;
                break;
            }
        }
        b_frq[i] = sfreq * j;
        for (var sfb = 0; sfb < sbmax; sfb++) {
            var i1 = void 0;
            var i2 = void 0;
            var arg = void 0;
            var start = scalepos[sfb];
            var end = scalepos[sfb + 1];
            i1 = Math.floor(0.5 + deltafreq * (start - 0.5));
            if (i1 < 0)
                i1 = 0;
            i2 = Math.floor(0.5 + deltafreq * (end - 0.5));
            if (i2 > blksize / 2)
                i2 = blksize / 2;
            bm[sfb] = (partition[i1] + partition[i2]) / 2;
            bo[sfb] = partition[i2];
            var f_tmp = sample_freq_frac * end;
            bo_w[sfb] =
                (f_tmp - b_frq[bo[sfb]]) / (b_frq[bo[sfb] + 1] - b_frq[bo[sfb]]);
            if (bo_w[sfb] < 0) {
                bo_w[sfb] = 0;
            }
            else if (bo_w[sfb] > 1) {
                bo_w[sfb] = 1;
            }
            arg = this.freq2bark(sfreq * scalepos[sfb] * deltafreq);
            arg = Math.min(arg, 15.5) / 15.5;
            mld[sfb] = Math.pow(10.0, 1.25 * (1 - Math.cos(Math.PI * arg)) - 2.5);
        }
        j = 0;
        for (var k = 0; k < ni; k++) {
            var w = numlines[k];
            var bark1 = void 0;
            var bark2 = void 0;
            bark1 = this.freq2bark(sfreq * j);
            bark2 = this.freq2bark(sfreq * (j + w - 1));
            bval[k] = 0.5 * (bark1 + bark2);
            bark1 = this.freq2bark(sfreq * (j - 0.5));
            bark2 = this.freq2bark(sfreq * (j + w - 0.5));
            bval_width[k] = bark2 - bark1;
            j += w;
        }
        return ni;
    };
    PsyModel.prototype.init_s3_values = function (s3ind, npart, bval, bval_width, norm, use_old_s3) {
        var s3 = Array.from({ length: CBANDS }, function () { return new Float32Array(CBANDS); });
        var j;
        var numberOfNoneZero = 0;
        if (use_old_s3) {
            for (var i = 0; i < npart; i++) {
                for (j = 0; j < npart; j++) {
                    var v = this.s3_func(bval[i] - bval[j]) * bval_width[j];
                    s3[i][j] = v * norm[i];
                }
            }
        }
        else {
            for (j = 0; j < npart; j++) {
                var hf_slope = 15 + Math.min(21 / bval[j], 12);
                var s3_x_norm = this.norm_s3_func_x(hf_slope);
                for (var i = 0; i < npart; i++) {
                    var v = s3_x_norm *
                        this.s3_func_x(bval[i] - bval[j], hf_slope) *
                        bval_width[j];
                    s3[i][j] = v * norm[i];
                }
            }
        }
        for (var i = 0; i < npart; i++) {
            for (j = 0; j < npart; j++) {
                if (s3[i][j] > 0.0)
                    break;
            }
            s3ind[i][0] = j;
            for (j = npart - 1; j > 0; j--) {
                if (s3[i][j] > 0.0)
                    break;
            }
            s3ind[i][1] = j;
            numberOfNoneZero += s3ind[i][1] - s3ind[i][0] + 1;
        }
        var p = new Float32Array(numberOfNoneZero);
        var k = 0;
        for (var i = 0; i < npart; i++)
            for (j = s3ind[i][0]; j <= s3ind[i][1]; j++)
                p[k++] = s3[i][j];
        return p;
    };
    PsyModel.prototype.stereo_demask = function (f) {
        var arg = this.freq2bark(f);
        arg = Math.min(arg, 15.5) / 15.5;
        return Math.pow(10.0, 1.25 * (1 - Math.cos(Math.PI * arg)) - 2.5);
    };
    // eslint-disable-next-line complexity
    PsyModel.prototype.psymodel_init = function (gfp) {
        var gfc = gfp.internal_flags;
        var i;
        var useOldS3 = true;
        var bvl_a = 13;
        var bvl_b = 24;
        var snr_l_a = 0;
        var snr_l_b = 0;
        var snr_s_a = -8.25;
        var snr_s_b = -4.5;
        var bval = new Float32Array(CBANDS);
        var bval_width = new Float32Array(CBANDS);
        var norm = new Float32Array(CBANDS);
        var sfreq = gfp.out_samplerate;
        gfc.ms_ener_ratio_old = 0.25;
        gfc.blocktype_old[0] = NORM_TYPE;
        gfc.blocktype_old[1] = NORM_TYPE;
        for (i = 0; i < 4; ++i) {
            for (var j_1 = 0; j_1 < CBANDS; ++j_1) {
                gfc.nb_1[i][j_1] = 1e20;
                gfc.nb_2[i][j_1] = 1e20;
                gfc.nb_s1[i][j_1] = 1.0;
                gfc.nb_s2[i][j_1] = 1.0;
            }
            for (var sb = 0; sb < SBMAX_l; sb++) {
                gfc.en[i].l[sb] = 1e20;
                gfc.thm[i].l[sb] = 1e20;
            }
            for (var j_2 = 0; j_2 < 3; ++j_2) {
                for (var sb = 0; sb < SBMAX_s; sb++) {
                    gfc.en[i].s[sb][j_2] = 1e20;
                    gfc.thm[i].s[sb][j_2] = 1e20;
                }
                gfc.nsPsy.lastAttacks[i] = 0;
            }
            for (var j_3 = 0; j_3 < 9; j_3++)
                gfc.nsPsy.last_en_subshort[i][j_3] = 10;
        }
        gfc.loudness_sq_save[0] = 0.0;
        gfc.loudness_sq_save[1] = 0.0;
        gfc.npart_l = this.init_numline(gfc.numlines_l, gfc.bo_l, gfc.bm_l, bval, bval_width, gfc.mld_l, gfc.PSY.bo_l_weight, sfreq, BLKSIZE, gfc.scalefac_band.l, BLKSIZE / (2.0 * 576), SBMAX_l);
        assert(gfc.npart_l < CBANDS);
        for (i = 0; i < gfc.npart_l; i++) {
            var snr = snr_l_a;
            if (bval[i] >= bvl_a) {
                snr =
                    (snr_l_b * (bval[i] - bvl_a)) / (bvl_b - bvl_a) +
                        (snr_l_a * (bvl_b - bval[i])) / (bvl_b - bvl_a);
            }
            norm[i] = Math.pow(10.0, snr / 10.0);
            if (gfc.numlines_l[i] > 0) {
                gfc.rnumlines_l[i] = 1.0 / gfc.numlines_l[i];
            }
            else {
                gfc.rnumlines_l[i] = 0;
            }
        }
        gfc.s3_ll = this.init_s3_values(gfc.s3ind, gfc.npart_l, bval, bval_width, norm, useOldS3);
        var j = 0;
        for (i = 0; i < gfc.npart_l; i++) {
            var x = void 0;
            x = MAX_FLOAT32_VALUE;
            for (var k = 0; k < gfc.numlines_l[i]; k++, j++) {
                var freq = (sfreq * j) / (1000.0 * BLKSIZE);
                var level = void 0;
                level = this.ATHformula(freq * 1000, gfp) - 20;
                level = Math.pow(10, 0.1 * level);
                level *= gfc.numlines_l[i];
                if (x > level)
                    x = level;
            }
            gfc.ATH.cb_l[i] = x;
            x = -20 + (bval[i] * 20) / 10;
            if (x > 6) {
                x = 100;
            }
            if (x < -15) {
                x = -15;
            }
            x -= 8;
            gfc.minval_l[i] = Math.pow(10.0, x / 10) * gfc.numlines_l[i];
        }
        gfc.npart_s = this.init_numline(gfc.numlines_s, gfc.bo_s, gfc.bm_s, bval, bval_width, gfc.mld_s, gfc.PSY.bo_s_weight, sfreq, BLKSIZE_s, gfc.scalefac_band.s, BLKSIZE_s / (2.0 * 192), SBMAX_s);
        assert(gfc.npart_s < CBANDS);
        j = 0;
        for (i = 0; i < gfc.npart_s; i++) {
            var x = void 0;
            var snr = snr_s_a;
            if (bval[i] >= bvl_a) {
                snr =
                    (snr_s_b * (bval[i] - bvl_a)) / (bvl_b - bvl_a) +
                        (snr_s_a * (bvl_b - bval[i])) / (bvl_b - bvl_a);
            }
            norm[i] = Math.pow(10.0, snr / 10.0);
            x = MAX_FLOAT32_VALUE;
            for (var k = 0; k < gfc.numlines_s[i]; k++, j++) {
                var freq = (sfreq * j) / (1000.0 * BLKSIZE_s);
                var level = void 0;
                level = this.ATHformula(freq * 1000, gfp) - 20;
                level = Math.pow(10, 0.1 * level);
                level *= gfc.numlines_s[i];
                if (x > level)
                    x = level;
            }
            gfc.ATH.cb_s[i] = x;
            x = -7.0 + (bval[i] * 7.0) / 12.0;
            if (bval[i] > 12) {
                x *= 1 + Math.log(1 + x) * 3.1;
            }
            if (bval[i] < 12) {
                x *= 1 + Math.log(1 - x) * 2.3;
            }
            if (x < -15) {
                x = -15;
            }
            x -= 8;
            gfc.minval_s[i] = Math.pow(10.0, x / 10) * gfc.numlines_s[i];
        }
        gfc.s3_ss = this.init_s3_values(gfc.s3ind_s, gfc.npart_s, bval, bval_width, norm, useOldS3);
        this.init_mask_add_max_values();
        this.fft.init();
        gfc.decay = Math.exp((-1.0 * LOG10) / ((this.temporalmask_sustain_sec * sfreq) / 192.0));
        {
            var msfix = void 0;
            msfix = PsyModel.NS_MSFIX;
            if ((gfp.exp_nspsytune & 2) !== 0)
                msfix = 1.0;
            if (Math.abs(gfp.msfix) > 0.0)
                msfix = gfp.msfix;
            gfp.msfix = msfix;
            for (var b = 0; b < gfc.npart_l; b++)
                if (gfc.s3ind[b][1] > gfc.npart_l - 1)
                    gfc.s3ind[b][1] = gfc.npart_l - 1;
        }
        var frame_duration = (576 * gfc.mode_gr) / sfreq;
        gfc.ATH.decay = Math.pow(10, (-12 / 10) * frame_duration);
        gfc.ATH.adjust = 0.01;
        gfc.ATH.adjustLimit = 1.0;
        assert(gfc.bo_l[SBMAX_l - 1] <= gfc.npart_l);
        assert(gfc.bo_s[SBMAX_s - 1] <= gfc.npart_s);
        if (gfp.ATHtype !== -1) {
            var freq = void 0;
            var freq_inc = gfp.out_samplerate / BLKSIZE;
            var eql_balance = 0.0;
            freq = 0.0;
            for (i = 0; i < BLKSIZE / 2; ++i) {
                freq += freq_inc;
                gfc.ATH.eql_w[i] = 1 / Math.pow(10, this.ATHformula(freq, gfp) / 10);
                eql_balance += gfc.ATH.eql_w[i];
            }
            eql_balance = 1.0 / eql_balance;
            for (i = BLKSIZE / 2; --i >= 0;) {
                gfc.ATH.eql_w[i] *= eql_balance;
            }
        }
        {
            var b = 0;
            for (; b < gfc.npart_s; ++b) {
                for (i = 0; i < gfc.numlines_s[b]; ++i) {
                }
            }
            b = 0;
            for (; b < gfc.npart_l; ++b) {
                for (i = 0; i < gfc.numlines_l[b]; ++i) {
                }
            }
        }
        j = 0;
        for (i = 0; i < gfc.npart_l; i++) {
            var freq = (sfreq * (j + gfc.numlines_l[i] / 2)) / (1.0 * BLKSIZE);
            gfc.mld_cb_l[i] = this.stereo_demask(freq);
            j += gfc.numlines_l[i];
        }
        for (; i < CBANDS; ++i) {
            gfc.mld_cb_l[i] = 1;
        }
        j = 0;
        for (i = 0; i < gfc.npart_s; i++) {
            var freq = (sfreq * (j + gfc.numlines_s[i] / 2)) / (1.0 * BLKSIZE_s);
            gfc.mld_cb_s[i] = this.stereo_demask(freq);
            j += gfc.numlines_s[i];
        }
        for (; i < CBANDS; ++i) {
            gfc.mld_cb_s[i] = 1;
        }
        return 0;
    };
    PsyModel.prototype.ATHformula_GB = function (f, value) {
        if (f < -0.3)
            f = 3410;
        f /= 1000;
        f = Math.max(0.1, f);
        var ath = 3.64 * Math.pow(f, -0.8) -
            6.8 * Math.exp(-0.6 * Math.pow(f - 3.4, 2.0)) +
            6.0 * Math.exp(-0.15 * Math.pow(f - 8.7, 2.0)) +
            (0.6 + 0.04 * value) * 0.001 * Math.pow(f, 4.0);
        return ath;
    };
    PsyModel.prototype.ATHformula = function (f, gfp) {
        var ath;
        switch (gfp.ATHtype) {
            case 0:
                ath = this.ATHformula_GB(f, 9);
                break;
            case 1:
                ath = this.ATHformula_GB(f, -1);
                break;
            case 2:
                ath = this.ATHformula_GB(f, 0);
                break;
            case 3:
                ath = this.ATHformula_GB(f, 1) + 6;
                break;
            case 4:
                ath = this.ATHformula_GB(f, gfp.ATHcurve);
                break;
            default:
                ath = this.ATHformula_GB(f, 0);
                break;
        }
        return ath;
    };
    PsyModel.DELBARK = 0.34;
    PsyModel.VO_SCALE = 1 / (14752 * 14752) / (BLKSIZE / 2);
    PsyModel.NS_PREECHO_ATT0 = 0.8;
    PsyModel.NS_PREECHO_ATT1 = 0.6;
    PsyModel.NS_PREECHO_ATT2 = 0.3;
    PsyModel.NS_MSFIX = 3.5;
    PsyModel.NSATTACKTHRE = 4.4;
    PsyModel.NSATTACKTHRE_S = 25;
    PsyModel.NSFIRLEN = 21;
    PsyModel.LN_TO_LOG10 = 0.2302585093;
    PsyModel.I1LIMIT = 8;
    PsyModel.I2LIMIT = 23;
    PsyModel.MLIMIT = 15;
    return PsyModel;
}());

var CalcNoiseData = /** @class */ (function () {
    function CalcNoiseData() {
        this.global_gain = 0;
        this.sfb_count1 = 0;
        this.step = new Int32Array(39);
        this.noise = new Float32Array(39);
        this.noise_log = new Float32Array(39);
    }
    return CalcNoiseData;
}());

var CalcNoiseResult = /** @class */ (function () {
    function CalcNoiseResult() {
        this.over_noise = 0;
        this.tot_noise = 0;
        this.max_noise = 0;
        this.over_count = 0;
        this.over_SSD = 0;
        this.bits = 0;
    }
    return CalcNoiseResult;
}());

var Reservoir = /** @class */ (function () {
    function Reservoir(bs) {
        this.bs = bs;
    }
    Reservoir.prototype.ResvFrameBegin = function (gfp, mean_bits) {
        var _a, _b;
        var gfc = gfp.internal_flags;
        var maxmp3buf;
        var l3_side = gfc.l3_side;
        var frameLength = (_b = (_a = this.bs) === null || _a === void 0 ? void 0 : _a.getframebits(gfp)) !== null && _b !== void 0 ? _b : 0;
        mean_bits.bits = (frameLength - gfc.sideinfo_len * 8) / gfc.mode_gr;
        if (gfp.brate > 320) {
            maxmp3buf =
                8 *
                    Math.trunc((gfp.brate * 1000) / (gfp.out_samplerate / 1152) / 8 + 0.5);
        }
        else {
            maxmp3buf = 8 * 1440;
        }
        var fullFrameBits = mean_bits.bits * gfc.mode_gr + Math.min(gfc.ResvSize, 0);
        if (fullFrameBits > maxmp3buf)
            fullFrameBits = maxmp3buf;
        l3_side.resvDrain_pre = 0;
        return fullFrameBits;
    };
    Reservoir.prototype.ResvMaxBits = function (gfp, mean_bits, targ_bits, cbr) {
        var gfc = gfp.internal_flags;
        var add_bits;
        var ResvSize = gfc.ResvSize;
        if (cbr !== 0)
            ResvSize += mean_bits;
        targ_bits.bits = mean_bits;
        if (ResvSize * 10 > 0) {
            add_bits = ResvSize;
            targ_bits.bits += add_bits;
            gfc.substep_shaping |= 0x80;
        }
        else {
            add_bits = 0;
            gfc.substep_shaping &= 0x7f;
        }
        var extra_bits = ResvSize < 0 ? ResvSize : 0;
        extra_bits -= add_bits;
        if (extra_bits < 0)
            extra_bits = 0;
        return extra_bits;
    };
    Reservoir.prototype.ResvAdjust = function (gfc, gi) {
        gfc.ResvSize -= gi.part2_3_length + gi.part2_length;
    };
    Reservoir.prototype.ResvFrameEnd = function (gfc, mean_bits) {
        var over_bits;
        var l3_side = gfc.l3_side;
        gfc.ResvSize += mean_bits * gfc.mode_gr;
        var stuffingBits = 0;
        l3_side.resvDrain_post = 0;
        l3_side.resvDrain_pre = 0;
        if ((over_bits = gfc.ResvSize % 8) !== 0)
            stuffingBits += over_bits;
        over_bits = gfc.ResvSize - stuffingBits;
        if (over_bits > 0) {
            stuffingBits += over_bits;
        }
        var mdb_bytes = Math.min(l3_side.main_data_begin * 8, stuffingBits) / 8;
        l3_side.resvDrain_pre += 8 * mdb_bytes;
        stuffingBits -= 8 * mdb_bytes;
        gfc.ResvSize -= 8 * mdb_bytes;
        l3_side.main_data_begin -= mdb_bytes;
        l3_side.resvDrain_post += stuffingBits;
        gfc.ResvSize -= stuffingBits;
    };
    return Reservoir;
}());

var StartLine = /** @class */ (function () {
    function StartLine(s) {
        this.s = s;
    }
    return StartLine;
}());

var Quantize = /** @class */ (function () {
    function Quantize(bs) {
        this.rv = new Reservoir(bs);
        this.qupvt = new QuantizePVT(new PsyModel());
        this.tak = new Takehiro(this.qupvt);
    }
    Quantize.prototype.ms_convert = function (l3_side, gr) {
        for (var i = 0; i < 576; ++i) {
            var l = l3_side.tt[gr][0].xr[i];
            var r = l3_side.tt[gr][1].xr[i];
            l3_side.tt[gr][0].xr[i] = (l + r) * (Math.SQRT2 * 0.5);
            l3_side.tt[gr][1].xr[i] = (l - r) * (Math.SQRT2 * 0.5);
        }
    };
    Quantize.prototype.init_xrpow_core = function (cod_info, xrpow, upper, sum) {
        sum = 0;
        for (var i = 0; i <= upper; ++i) {
            var tmp = Math.abs(cod_info.xr[i]);
            sum += tmp;
            xrpow[i] = Math.sqrt(tmp * Math.sqrt(tmp));
            if (xrpow[i] > cod_info.xrpow_max)
                cod_info.xrpow_max = xrpow[i];
        }
        return sum;
    };
    Quantize.prototype.init_xrpow = function (gfc, cod_info, xrpow) {
        var sum = 0;
        var upper = Math.trunc(cod_info.max_nonzero_coeff);
        cod_info.xrpow_max = 0;
        fillArray(xrpow, upper, 576, 0);
        sum = this.init_xrpow_core(cod_info, xrpow, upper, sum);
        if (sum > 1e-20) {
            var j = 0;
            if ((gfc.substep_shaping & 2) !== 0)
                j = 1;
            for (var i = 0; i < cod_info.psymax; i++)
                gfc.pseudohalf[i] = j;
            return true;
        }
        fillArray(cod_info.l3_enc, 0, 576, 0);
        return false;
    };
    Quantize.prototype.psfb21_analogsilence = function (gfc, cod_info) {
        var ath = gfc.ATH;
        var xr = cod_info.xr;
        if (cod_info.block_type !== SHORT_TYPE) {
            var stop_1 = false;
            for (var gsfb = PSFB21 - 1; gsfb >= 0 && !stop_1; gsfb--) {
                var start = gfc.scalefac_band.psfb21[gsfb];
                var end = gfc.scalefac_band.psfb21[gsfb + 1];
                var ath21 = this.qupvt.athAdjust(ath.adjust, ath.psfb21[gsfb], ath.floor);
                if (gfc.nsPsy.longfact[21] > 1e-12)
                    ath21 *= gfc.nsPsy.longfact[21];
                for (var j = end - 1; j >= start; j--) {
                    if (Math.abs(xr[j]) < ath21)
                        xr[j] = 0;
                    else {
                        stop_1 = true;
                        break;
                    }
                }
            }
        }
        else {
            for (var block = 0; block < 3; block++) {
                var stop_2 = false;
                for (var gsfb = PSFB12 - 1; gsfb >= 0 && !stop_2; gsfb--) {
                    var start = gfc.scalefac_band.s[12] * 3 +
                        (gfc.scalefac_band.s[13] - gfc.scalefac_band.s[12]) * block +
                        (gfc.scalefac_band.psfb12[gsfb] - gfc.scalefac_band.psfb12[0]);
                    var end = start +
                        (gfc.scalefac_band.psfb12[gsfb + 1] -
                            gfc.scalefac_band.psfb12[gsfb]);
                    var ath12 = this.qupvt.athAdjust(ath.adjust, ath.psfb12[gsfb], ath.floor);
                    if (gfc.nsPsy.shortfact[12] > 1e-12)
                        ath12 *= gfc.nsPsy.shortfact[12];
                    for (var j = end - 1; j >= start; j--) {
                        if (Math.abs(xr[j]) < ath12)
                            xr[j] = 0;
                        else {
                            stop_2 = true;
                            break;
                        }
                    }
                }
            }
        }
    };
    Quantize.prototype.init_outer_loop = function (gfc, cod_info) {
        cod_info.part2_3_length = 0;
        cod_info.big_values = 0;
        cod_info.count1 = 0;
        cod_info.global_gain = 210;
        cod_info.scalefac_compress = 0;
        cod_info.table_select[0] = 0;
        cod_info.table_select[1] = 0;
        cod_info.table_select[2] = 0;
        cod_info.subblock_gain[0] = 0;
        cod_info.subblock_gain[1] = 0;
        cod_info.subblock_gain[2] = 0;
        cod_info.subblock_gain[3] = 0;
        cod_info.region0_count = 0;
        cod_info.region1_count = 0;
        cod_info.preflag = 0;
        cod_info.scalefac_scale = 0;
        cod_info.count1table_select = 0;
        cod_info.part2_length = 0;
        cod_info.sfb_lmax = SBPSY_l;
        cod_info.sfb_smin = SBPSY_s;
        cod_info.psy_lmax = gfc.sfb21_extra ? SBMAX_l : SBPSY_l;
        cod_info.psymax = cod_info.psy_lmax;
        cod_info.sfbmax = cod_info.sfb_lmax;
        cod_info.sfbdivide = 11;
        for (var sfb = 0; sfb < SBMAX_l; sfb++) {
            cod_info.width[sfb] =
                gfc.scalefac_band.l[sfb + 1] - gfc.scalefac_band.l[sfb];
            cod_info.window[sfb] = 3;
        }
        if (cod_info.block_type === SHORT_TYPE) {
            var ixwork = new Float32Array(576);
            cod_info.sfb_smin = 0;
            cod_info.sfb_lmax = 0;
            if (cod_info.mixed_block_flag !== 0) {
                cod_info.sfb_smin = 3;
                cod_info.sfb_lmax = gfc.mode_gr * 2 + 4;
            }
            cod_info.psymax =
                cod_info.sfb_lmax +
                    3 * ((gfc.sfb21_extra ? SBMAX_s : SBPSY_s) - cod_info.sfb_smin);
            cod_info.sfbmax = cod_info.sfb_lmax + 3 * (SBPSY_s - cod_info.sfb_smin);
            cod_info.sfbdivide = cod_info.sfbmax - 18;
            cod_info.psy_lmax = cod_info.sfb_lmax;
            var ix = gfc.scalefac_band.l[cod_info.sfb_lmax];
            copyArray(cod_info.xr, 0, ixwork, 0, 576);
            for (var sfb = cod_info.sfb_smin; sfb < SBMAX_s; sfb++) {
                var start = gfc.scalefac_band.s[sfb];
                var end = gfc.scalefac_band.s[sfb + 1];
                for (var window_1 = 0; window_1 < 3; window_1++) {
                    for (var l = start; l < end; l++) {
                        cod_info.xr[ix++] = ixwork[3 * l + window_1];
                    }
                }
            }
            var j = cod_info.sfb_lmax;
            for (var sfb = cod_info.sfb_smin; sfb < SBMAX_s; sfb++) {
                var y = gfc.scalefac_band.s[sfb + 1] - gfc.scalefac_band.s[sfb];
                cod_info.width[j] = y;
                cod_info.width[j + 1] = y;
                cod_info.width[j + 2] = y;
                cod_info.window[j] = 0;
                cod_info.window[j + 1] = 1;
                cod_info.window[j + 2] = 2;
                j += 3;
            }
        }
        cod_info.count1bits = 0;
        cod_info.sfb_partition_table = this.qupvt.nr_of_sfb_block[0][0];
        cod_info.slen[0] = 0;
        cod_info.slen[1] = 0;
        cod_info.slen[2] = 0;
        cod_info.slen[3] = 0;
        cod_info.max_nonzero_coeff = 575;
        fillArray(cod_info.scalefac, 0);
        this.psfb21_analogsilence(gfc, cod_info);
    };
    Quantize.prototype.bin_search_StepSize = function (gfc, cod_info, desired_rate, ch, xrpow) {
        var nBits;
        var CurrentStep = gfc.currentStep[ch];
        var flagGoneOver = false;
        var start = gfc.oldValue[ch];
        var direction = 0 /* BinSearchDirection.BINSEARCH_NONE */;
        cod_info.global_gain = start;
        desired_rate -= cod_info.part2_length;
        for (;;) {
            var step = void 0;
            nBits = this.tak.count_bits(gfc, xrpow, cod_info, null);
            if (CurrentStep === 1 || nBits === desired_rate)
                break;
            if (nBits > desired_rate) {
                if (direction === 2 /* BinSearchDirection.BINSEARCH_DOWN */)
                    flagGoneOver = true;
                if (flagGoneOver)
                    CurrentStep /= 2;
                direction = 1 /* BinSearchDirection.BINSEARCH_UP */;
                step = CurrentStep;
            }
            else {
                if (direction === 1 /* BinSearchDirection.BINSEARCH_UP */)
                    flagGoneOver = true;
                if (flagGoneOver)
                    CurrentStep /= 2;
                direction = 2 /* BinSearchDirection.BINSEARCH_DOWN */;
                step = -CurrentStep;
            }
            cod_info.global_gain += step;
            if (cod_info.global_gain < 0) {
                cod_info.global_gain = 0;
                flagGoneOver = true;
            }
            if (cod_info.global_gain > 255) {
                cod_info.global_gain = 255;
                flagGoneOver = true;
            }
        }
        assert(cod_info.global_gain >= 0);
        assert(cod_info.global_gain < 256);
        while (nBits > desired_rate && cod_info.global_gain < 255) {
            cod_info.global_gain++;
            nBits = this.tak.count_bits(gfc, xrpow, cod_info, null);
        }
        gfc.currentStep[ch] = start - cod_info.global_gain >= 4 ? 4 : 2;
        gfc.oldValue[ch] = cod_info.global_gain;
        cod_info.part2_3_length = nBits;
        return nBits;
    };
    Quantize.prototype.trancate_smallspectrums = function (gfc, gi, l3_xmin, work) {
        var distort = new Float32Array(SFBMAX);
        if (((gfc.substep_shaping & 4) === 0 && gi.block_type === SHORT_TYPE) ||
            (gfc.substep_shaping & 0x80) !== 0)
            return;
        this.calc_noise(gi, l3_xmin, distort, new CalcNoiseResult(), null);
        for (var j_1 = 0; j_1 < 576; j_1++) {
            var xr = 0.0;
            if (gi.l3_enc[j_1] !== 0)
                xr = Math.abs(gi.xr[j_1]);
            work[j_1] = xr;
        }
        var j = 0;
        var sfb = 8;
        if (gi.block_type === SHORT_TYPE)
            sfb = 6;
        do {
            var allowedNoise = void 0;
            var trancateThreshold = void 0;
            var nsame = void 0;
            var start = void 0;
            var width = gi.width[sfb];
            j += width;
            if (distort[sfb] >= 1.0)
                continue;
            sortArray(work, j - width, width);
            if (isCloseToEachOther(work[j - 1], 0.0))
                continue;
            allowedNoise = (1.0 - distort[sfb]) * l3_xmin[sfb];
            trancateThreshold = 0.0;
            start = 0;
            do {
                for (nsame = 1; start + nsame < width; nsame++)
                    if (!isCloseToEachOther(work[start + j - width], work[start + j + nsame - width]))
                        break;
                var noise = work[start + j - width] * work[start + j - width] * nsame;
                if (allowedNoise < noise) {
                    if (start !== 0)
                        trancateThreshold = work[start + j - width - 1];
                    break;
                }
                allowedNoise -= noise;
                start += nsame;
            } while (start < width);
            if (isCloseToEachOther(trancateThreshold, 0.0))
                continue;
            do {
                if (Math.abs(gi.xr[j - width]) <= trancateThreshold)
                    gi.l3_enc[j - width] = 0;
            } while (--width > 0);
        } while (++sfb < gi.psymax);
        gi.part2_3_length = this.tak.noquant_count_bits(gfc, gi, null);
    };
    Quantize.prototype.loop_break = function (cod_info) {
        for (var sfb = 0; sfb < cod_info.sfbmax; sfb++)
            if (cod_info.scalefac[sfb] +
                cod_info.subblock_gain[cod_info.window[sfb]] ===
                0)
                return false;
        return true;
    };
    Quantize.prototype.penalties = function (noise) {
        return Math.log10(0.368 + 0.632 * noise * noise * noise);
    };
    Quantize.prototype.get_klemm_noise = function (distort, gi) {
        var klemm_noise = 1e-37;
        for (var sfb = 0; sfb < gi.psymax; sfb++)
            klemm_noise += this.penalties(distort[sfb]);
        return Math.max(1e-20, klemm_noise);
    };
    // eslint-disable-next-line complexity
    Quantize.prototype.quant_compare = function (quant_comp, best, calc, gi, distort) {
        var better;
        switch (quant_comp) {
            default:
            case 9: {
                if (best.over_count > 0) {
                    better = calc.over_SSD <= best.over_SSD;
                    if (calc.over_SSD === best.over_SSD)
                        better = calc.bits < best.bits;
                }
                else {
                    better =
                        calc.max_noise < 0 &&
                            calc.max_noise * 10 + calc.bits <= best.max_noise * 10 + best.bits;
                }
                break;
            }
            case 0:
                better =
                    calc.over_count < best.over_count ||
                        (calc.over_count === best.over_count &&
                            calc.over_noise < best.over_noise) ||
                        (calc.over_count === best.over_count &&
                            isCloseToEachOther(calc.over_noise, best.over_noise) &&
                            calc.tot_noise < best.tot_noise);
                break;
            case 8:
                calc.max_noise = this.get_klemm_noise(distort, gi);
            // eslint-disable-next-line no-fallthrough
            case 1:
                better = calc.max_noise < best.max_noise;
                break;
            case 2:
                better = calc.tot_noise < best.tot_noise;
                break;
            case 3:
                better =
                    calc.tot_noise < best.tot_noise && calc.max_noise < best.max_noise;
                break;
            case 4:
                better =
                    (calc.max_noise <= 0.0 && best.max_noise > 0.2) ||
                        (calc.max_noise <= 0.0 &&
                            best.max_noise < 0.0 &&
                            best.max_noise > calc.max_noise - 0.2 &&
                            calc.tot_noise < best.tot_noise) ||
                        (calc.max_noise <= 0.0 &&
                            best.max_noise > 0.0 &&
                            best.max_noise > calc.max_noise - 0.2 &&
                            calc.tot_noise < best.tot_noise + best.over_noise) ||
                        (calc.max_noise > 0.0 &&
                            best.max_noise > -0.05 &&
                            best.max_noise > calc.max_noise - 0.1 &&
                            calc.tot_noise + calc.over_noise <
                                best.tot_noise + best.over_noise) ||
                        (calc.max_noise > 0.0 &&
                            best.max_noise > -0.1 &&
                            best.max_noise > calc.max_noise - 0.15 &&
                            calc.tot_noise + calc.over_noise + calc.over_noise <
                                best.tot_noise + best.over_noise + best.over_noise);
                break;
            case 5:
                better =
                    calc.over_noise < best.over_noise ||
                        (isCloseToEachOther(calc.over_noise, best.over_noise) &&
                            calc.tot_noise < best.tot_noise);
                break;
            case 6:
                better =
                    calc.over_noise < best.over_noise ||
                        (isCloseToEachOther(calc.over_noise, best.over_noise) &&
                            (calc.max_noise < best.max_noise ||
                                (isCloseToEachOther(calc.max_noise, best.max_noise) &&
                                    calc.tot_noise <= best.tot_noise)));
                break;
            case 7:
                better =
                    calc.over_count < best.over_count ||
                        calc.over_noise < best.over_noise;
                break;
        }
        if (best.over_count === 0) {
            better = better && calc.bits < best.bits;
        }
        return better;
    };
    Quantize.prototype.amp_scalefac_bands = function (gfp, cod_info, distort, xrpow, bRefine) {
        var gfc = gfp.internal_flags;
        var ifqstep34;
        if (cod_info.scalefac_scale === 0) {
            ifqstep34 = 1.29683955465100964055;
        }
        else {
            ifqstep34 = 1.68179283050742922612;
        }
        var trigger = 0;
        for (var sfb = 0; sfb < cod_info.sfbmax; sfb++) {
            if (trigger < distort[sfb])
                trigger = distort[sfb];
        }
        var noise_shaping_amp = gfc.noise_shaping_amp;
        if (noise_shaping_amp === 3) {
            if (bRefine)
                noise_shaping_amp = 2;
            else
                noise_shaping_amp = 1;
        }
        switch (noise_shaping_amp) {
            case 2:
                break;
            case 1:
                if (trigger > 1.0)
                    trigger = Math.pow(trigger, 0.5);
                else
                    trigger *= 0.95;
                break;
            case 0:
            default:
                if (trigger > 1.0)
                    trigger = 1.0;
                else
                    trigger *= 0.95;
                break;
        }
        var j = 0;
        for (var sfb = 0; sfb < cod_info.sfbmax; sfb++) {
            var width = cod_info.width[sfb];
            var l = void 0;
            j += width;
            if (distort[sfb] < trigger)
                continue;
            if ((gfc.substep_shaping & 2) !== 0) {
                gfc.pseudohalf[sfb] = gfc.pseudohalf[sfb] === 0 ? 1 : 0;
                if (gfc.pseudohalf[sfb] === 0 && gfc.noise_shaping_amp === 2)
                    return;
            }
            cod_info.scalefac[sfb]++;
            for (l = -width; l < 0; l++) {
                xrpow[j + l] *= ifqstep34;
                if (xrpow[j + l] > cod_info.xrpow_max)
                    cod_info.xrpow_max = xrpow[j + l];
            }
            if (gfc.noise_shaping_amp === 2)
                return;
        }
    };
    Quantize.prototype.inc_scalefac_scale = function (cod_info, xrpow) {
        var ifqstep34 = 1.29683955465100964055;
        var j = 0;
        for (var sfb = 0; sfb < cod_info.sfbmax; sfb++) {
            var width = cod_info.width[sfb];
            var s = cod_info.scalefac[sfb];
            if (cod_info.preflag !== 0)
                s += this.qupvt.pretab[sfb];
            j += width;
            if ((s & 1) !== 0) {
                s++;
                for (var l = -width; l < 0; l++) {
                    xrpow[j + l] *= ifqstep34;
                    if (xrpow[j + l] > cod_info.xrpow_max)
                        cod_info.xrpow_max = xrpow[j + l];
                }
            }
            cod_info.scalefac[sfb] = s >> 1;
        }
        cod_info.preflag = 0;
        cod_info.scalefac_scale = 1;
    };
    Quantize.prototype.inc_subblock_gain = function (gfc, cod_info, xrpow) {
        var sfb;
        var scalefac = cod_info.scalefac;
        for (sfb = 0; sfb < cod_info.sfb_lmax; sfb++) {
            if (scalefac[sfb] >= 16)
                return true;
        }
        for (var window_2 = 0; window_2 < 3; window_2++) {
            var s1 = 0;
            var s2 = 0;
            for (sfb = cod_info.sfb_lmax + window_2; sfb < cod_info.sfbdivide; sfb += 3) {
                if (s1 < scalefac[sfb])
                    s1 = scalefac[sfb];
            }
            for (; sfb < cod_info.sfbmax; sfb += 3) {
                if (s2 < scalefac[sfb])
                    s2 = scalefac[sfb];
            }
            if (s1 < 16 && s2 < 8)
                continue;
            if (cod_info.subblock_gain[window_2] >= 7)
                return true;
            cod_info.subblock_gain[window_2]++;
            var j = gfc.scalefac_band.l[cod_info.sfb_lmax];
            for (sfb = cod_info.sfb_lmax + window_2; sfb < cod_info.sfbmax; sfb += 3) {
                var amp_1 = void 0;
                var width = cod_info.width[sfb];
                var s = scalefac[sfb];
                s -= 4 >> cod_info.scalefac_scale;
                if (s >= 0) {
                    scalefac[sfb] = s;
                    j += width * 3;
                    continue;
                }
                scalefac[sfb] = 0;
                {
                    var gain = 210 + (s << (cod_info.scalefac_scale + 1));
                    amp_1 = this.qupvt.ipow20(gain);
                }
                j += width * (window_2 + 1);
                for (var l = -width; l < 0; l++) {
                    xrpow[j + l] *= amp_1;
                    if (xrpow[j + l] > cod_info.xrpow_max)
                        cod_info.xrpow_max = xrpow[j + l];
                }
                j += width * (3 - window_2 - 1);
            }
            var amp = this.qupvt.ipow20(202);
            j += cod_info.width[sfb] * (window_2 + 1);
            for (var l = -cod_info.width[sfb]; l < 0; l++) {
                xrpow[j + l] *= amp;
                if (xrpow[j + l] > cod_info.xrpow_max)
                    cod_info.xrpow_max = xrpow[j + l];
            }
        }
        return false;
    };
    Quantize.prototype.balance_noise = function (gfp, cod_info, distort, xrpow, bRefine) {
        var gfc = gfp.internal_flags;
        this.amp_scalefac_bands(gfp, cod_info, distort, xrpow, bRefine);
        var status = this.loop_break(cod_info);
        if (status)
            return false;
        if (gfc.mode_gr === 2)
            status = this.tak.scale_bitcount(cod_info);
        else
            status = this.tak.scale_bitcount_lsf(gfc, cod_info);
        if (!status)
            return true;
        if (gfc.noise_shaping > 1) {
            fillArray(gfc.pseudohalf, 0);
            if (cod_info.scalefac_scale === 0) {
                this.inc_scalefac_scale(cod_info, xrpow);
                status = false;
            }
            else if (cod_info.block_type === SHORT_TYPE && gfc.subblock_gain > 0) {
                status =
                    this.inc_subblock_gain(gfc, cod_info, xrpow) ||
                        this.loop_break(cod_info);
            }
        }
        if (!status) {
            if (gfc.mode_gr === 2)
                status = this.tak.scale_bitcount(cod_info);
            else
                status = this.tak.scale_bitcount_lsf(gfc, cod_info);
        }
        return !status;
    };
    // eslint-disable-next-line complexity
    Quantize.prototype.outer_loop = function (gfp, cod_info, l3_xmin, xrpow, ch, targ_bits) {
        var gfc = gfp.internal_flags;
        var cod_info_w = new GrInfo();
        var save_xrpow = new Float32Array(576);
        var distort = new Float32Array(SFBMAX);
        var best_noise_info = new CalcNoiseResult();
        var better;
        var prev_noise = new CalcNoiseData();
        var best_part2_3_length = 9999999;
        var bEndOfSearch = false;
        var bRefine = false;
        var best_ggain_pass1 = 0;
        this.bin_search_StepSize(gfc, cod_info, targ_bits, ch, xrpow);
        if (gfc.noise_shaping === 0) {
            return 100;
        }
        this.calc_noise(cod_info, l3_xmin, distort, best_noise_info, prev_noise);
        best_noise_info.bits = cod_info.part2_3_length;
        cod_info_w.assign(cod_info);
        var age = 0;
        copyArray(xrpow, 0, save_xrpow, 0, 576);
        while (!bEndOfSearch) {
            do {
                var noise_info = new CalcNoiseResult();
                var search_limit = void 0;
                var maxggain = 255;
                if ((gfc.substep_shaping & 2) !== 0) {
                    search_limit = 20;
                }
                else {
                    search_limit = 3;
                }
                if (gfc.sfb21_extra) {
                    if (distort[cod_info_w.sfbmax] > 1.0)
                        break;
                    if (cod_info_w.block_type === SHORT_TYPE &&
                        (distort[cod_info_w.sfbmax + 1] > 1.0 ||
                            distort[cod_info_w.sfbmax + 2] > 1.0))
                        break;
                }
                if (!this.balance_noise(gfp, cod_info_w, distort, xrpow, bRefine))
                    break;
                if (cod_info_w.scalefac_scale !== 0)
                    maxggain = 254;
                var huff_bits = targ_bits - cod_info_w.part2_length;
                if (huff_bits <= 0)
                    break;
                while ((cod_info_w.part2_3_length = this.tak.count_bits(gfc, xrpow, cod_info_w, prev_noise)) > huff_bits &&
                    cod_info_w.global_gain <= maxggain)
                    cod_info_w.global_gain++;
                if (cod_info_w.global_gain > maxggain)
                    break;
                if (best_noise_info.over_count === 0) {
                    while ((cod_info_w.part2_3_length = this.tak.count_bits(gfc, xrpow, cod_info_w, prev_noise)) > best_part2_3_length &&
                        cod_info_w.global_gain <= maxggain)
                        cod_info_w.global_gain++;
                    if (cod_info_w.global_gain > maxggain)
                        break;
                }
                this.calc_noise(cod_info_w, l3_xmin, distort, noise_info, prev_noise);
                noise_info.bits = cod_info_w.part2_3_length;
                if (cod_info.block_type !== SHORT_TYPE) {
                    better = gfp.quant_comp;
                }
                else
                    better = gfp.quant_comp_short;
                better = this.quant_compare(better, best_noise_info, noise_info, cod_info_w, distort)
                    ? 1
                    : 0;
                if (better !== 0) {
                    best_part2_3_length = cod_info.part2_3_length;
                    best_noise_info = noise_info;
                    cod_info.assign(cod_info_w);
                    age = 0;
                    copyArray(xrpow, 0, save_xrpow, 0, 576);
                }
                else if (gfc.full_outer_loop === 0) {
                    if (++age > search_limit && best_noise_info.over_count === 0)
                        break;
                    if (gfc.noise_shaping_amp === 3 && bRefine && age > 30)
                        break;
                    if (gfc.noise_shaping_amp === 3 &&
                        bRefine &&
                        cod_info_w.global_gain - best_ggain_pass1 > 15)
                        break;
                }
            } while (cod_info_w.global_gain + cod_info_w.scalefac_scale < 255);
            if (gfc.noise_shaping_amp === 3) {
                if (!bRefine) {
                    cod_info_w.assign(cod_info);
                    copyArray(save_xrpow, 0, xrpow, 0, 576);
                    age = 0;
                    best_ggain_pass1 = cod_info_w.global_gain;
                    bRefine = true;
                }
                else {
                    bEndOfSearch = true;
                }
            }
            else {
                bEndOfSearch = true;
            }
        }
        assert(cod_info.global_gain + cod_info.scalefac_scale <= 255);
        if (gfp.VBR === 2 /* VbrMode.vbr_rh */ || gfp.VBR === 4 /* VbrMode.vbr_mtrh */) {
            copyArray(save_xrpow, 0, xrpow, 0, 576);
        }
        else if ((gfc.substep_shaping & 1) !== 0) {
            this.trancate_smallspectrums(gfc, cod_info, l3_xmin, xrpow);
        }
        return best_noise_info.over_count;
    };
    Quantize.prototype.iteration_finish_one = function (gfc, gr, ch) {
        var l3_side = gfc.l3_side;
        var cod_info = l3_side.tt[gr][ch];
        this.tak.best_scalefac_store(gfc, gr, ch, l3_side);
        if (gfc.use_best_huffman === 1)
            this.tak.best_huffman_divide(gfc, cod_info);
        this.rv.ResvAdjust(gfc, cod_info);
    };
    Quantize.prototype.pow20 = function (x) {
        if (this._pow20 === undefined) {
            this._pow20 = new Float32Array(QuantizePVT.Q_MAX + QuantizePVT.Q_MAX2 + 1);
            for (var i = 0; i <= QuantizePVT.Q_MAX + QuantizePVT.Q_MAX2; i++) {
                this._pow20[i] = Math.pow(2.0, (i - 210 - QuantizePVT.Q_MAX2) * 0.25);
            }
        }
        return this._pow20[x + QuantizePVT.Q_MAX2];
    };
    Quantize.prototype.calc_noise_core = function (cod_info, startline, l, step) {
        var noise = 0;
        var j = startline.s;
        var ix = cod_info.l3_enc;
        if (j > cod_info.count1) {
            while (l-- !== 0) {
                var temp = void 0;
                temp = cod_info.xr[j];
                j++;
                noise += temp * temp;
                temp = cod_info.xr[j];
                j++;
                noise += temp * temp;
            }
        }
        else if (j > cod_info.big_values) {
            var ix01 = new Float32Array(2);
            ix01[0] = 0;
            ix01[1] = step;
            while (l-- !== 0) {
                var temp = void 0;
                temp = Math.abs(cod_info.xr[j]) - ix01[ix[j]];
                j++;
                noise += temp * temp;
                temp = Math.abs(cod_info.xr[j]) - ix01[ix[j]];
                j++;
                noise += temp * temp;
            }
        }
        else {
            while (l-- !== 0) {
                var temp = void 0;
                temp = Math.abs(cod_info.xr[j]) - this.qupvt.pow43(ix[j]) * step;
                j++;
                noise += temp * temp;
                temp = Math.abs(cod_info.xr[j]) - this.qupvt.pow43(ix[j]) * step;
                j++;
                noise += temp * temp;
            }
        }
        startline.s = j;
        return noise;
    };
    Quantize.prototype.calc_noise = function (cod_info, l3_xmin, distort, res, prev_noise) {
        var distortPos = 0;
        var l3_xminPos = 0;
        var sfb;
        var l;
        var over = 0;
        var over_noise_db = 0;
        var tot_noise_db = 0;
        var max_noise = -20.0;
        var j = 0;
        var scalefac = cod_info.scalefac;
        var scalefacPos = 0;
        res.over_SSD = 0;
        for (sfb = 0; sfb < cod_info.psymax; sfb++) {
            var s = cod_info.global_gain -
                ((scalefac[scalefacPos++] +
                    (cod_info.preflag !== 0 ? this.qupvt.pretab[sfb] : 0)) <<
                    (cod_info.scalefac_scale + 1)) -
                cod_info.subblock_gain[cod_info.window[sfb]] * 8;
            var noise = 0.0;
            if (prev_noise !== null && prev_noise.step[sfb] === s) {
                noise = prev_noise.noise[sfb];
                j += cod_info.width[sfb];
                distort[distortPos++] = noise / l3_xmin[l3_xminPos++];
                noise = prev_noise.noise_log[sfb];
            }
            else {
                var step = this.pow20(s);
                l = cod_info.width[sfb] >> 1;
                if (j + cod_info.width[sfb] > cod_info.max_nonzero_coeff) {
                    var usefullsize = cod_info.max_nonzero_coeff - j + 1;
                    if (usefullsize > 0)
                        l = usefullsize >> 1;
                    else
                        l = 0;
                }
                var sl = new StartLine(j);
                noise = this.calc_noise_core(cod_info, sl, l, step);
                j = sl.s;
                if (prev_noise !== null) {
                    prev_noise.step[sfb] = s;
                    prev_noise.noise[sfb] = noise;
                }
                noise /= l3_xmin[l3_xminPos++];
                distort[distortPos++] = noise;
                noise = Math.log10(Math.max(noise, 1e-20));
                if (prev_noise !== null) {
                    prev_noise.noise_log[sfb] = noise;
                }
            }
            if (prev_noise !== null) {
                prev_noise.global_gain = cod_info.global_gain;
            }
            tot_noise_db += noise;
            if (noise > 0.0) {
                var tmp = Math.max(Math.trunc(noise * 10 + 0.5), 1);
                res.over_SSD += tmp * tmp;
                over++;
                over_noise_db += noise;
            }
            max_noise = Math.max(max_noise, noise);
        }
        res.over_count = over;
        res.tot_noise = tot_noise_db;
        res.over_noise = over_noise_db;
        res.max_noise = max_noise;
        return over;
    };
    return Quantize;
}());

function findNearestSampleRate(freq) {
    if (freq <= 8000)
        return 8000;
    if (freq <= 11025)
        return 11025;
    if (freq <= 12000)
        return 12000;
    if (freq <= 16000)
        return 16000;
    if (freq <= 22050)
        return 22050;
    if (freq <= 24000)
        return 24000;
    if (freq <= 32000)
        return 32000;
    if (freq <= 44100)
        return 44100;
    return 48000;
}

var Lame = /** @class */ (function () {
    function Lame() {
        this.p = new Presets();
        this.sfBandIndex = [
            new ScaleFac([
                0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140, 168, 200, 238,
                284, 336, 396, 464, 522, 576,
            ], [0, 4, 8, 12, 18, 24, 32, 42, 56, 74, 100, 132, 174, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 114, 136, 162, 194, 232,
                278, 332, 394, 464, 540, 576,
            ], [0, 4, 8, 12, 18, 26, 36, 48, 62, 80, 104, 136, 180, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140, 168, 200, 238,
                284, 336, 396, 464, 522, 576,
            ], [0, 4, 8, 12, 18, 26, 36, 48, 62, 80, 104, 134, 174, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 52, 62, 74, 90, 110, 134, 162, 196,
                238, 288, 342, 418, 576,
            ], [0, 4, 8, 12, 16, 22, 30, 40, 52, 66, 84, 106, 136, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 4, 8, 12, 16, 20, 24, 30, 36, 42, 50, 60, 72, 88, 106, 128, 156, 190,
                230, 276, 330, 384, 576,
            ], [0, 4, 8, 12, 16, 22, 28, 38, 50, 64, 80, 100, 126, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 54, 66, 82, 102, 126, 156, 194,
                240, 296, 364, 448, 550, 576,
            ], [0, 4, 8, 12, 16, 22, 30, 42, 58, 78, 104, 138, 180, 192], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140, 168, 200, 238,
                284, 336, 396, 464, 522, 576,
            ], [
                0 / 3,
                12 / 3,
                24 / 3,
                36 / 3,
                54 / 3,
                78 / 3,
                108 / 3,
                144 / 3,
                186 / 3,
                240 / 3,
                312 / 3,
                402 / 3,
                522 / 3,
                576 / 3,
            ], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 6, 12, 18, 24, 30, 36, 44, 54, 66, 80, 96, 116, 140, 168, 200, 238,
                284, 336, 396, 464, 522, 576,
            ], [
                0 / 3,
                12 / 3,
                24 / 3,
                36 / 3,
                54 / 3,
                78 / 3,
                108 / 3,
                144 / 3,
                186 / 3,
                240 / 3,
                312 / 3,
                402 / 3,
                522 / 3,
                576 / 3,
            ], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
            new ScaleFac([
                0, 12, 24, 36, 48, 60, 72, 88, 108, 132, 160, 192, 232, 280, 336, 400,
                476, 566, 568, 570, 572, 574, 576,
            ], [
                0 / 3,
                24 / 3,
                48 / 3,
                72 / 3,
                108 / 3,
                156 / 3,
                216 / 3,
                288 / 3,
                372 / 3,
                480 / 3,
                486 / 3,
                492 / 3,
                498 / 3,
                576 / 3,
            ], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
        ];
        this.bs = new BitStream();
        this.qu = new Quantize(this.bs);
        this.enc = new Encoder(this.bs, this.qu.qupvt.psy);
    }
    Lame.prototype.lame_init = function (channels, samplerate, kbps) {
        var gfp = new LameGlobalFlags(channels, samplerate, kbps);
        this.lame_init_params(gfp);
        return gfp;
    };
    // eslint-disable-next-line complexity
    Lame.prototype.lame_init_params = function (gfp) {
        var gfc = gfp.internal_flags;
        gfc.Class_ID = 0;
        gfc.channels_in = gfp.num_channels;
        if (gfc.channels_in === 1) {
            gfp.mode = MPEGMode.MONO;
        }
        gfc.channels_out = gfp.mode === MPEGMode.MONO ? 1 : 2;
        gfc.mode_ext = MPG_MD_MS_LR;
        if (gfp.VBR === 0 /* VbrMode.vbr_off */ &&
            gfp.VBR_mean_bitrate_kbps !== 128 &&
            gfp.brate === 0) {
            gfp.brate = gfp.VBR_mean_bitrate_kbps;
        }
        if (gfp.VBR === 0 /* VbrMode.vbr_off */ && gfp.brate === 0) {
            if (isCloseToEachOther(gfp.compression_ratio, 0)) {
                gfp.compression_ratio = 11.025;
            }
        }
        if (gfp.VBR === 0 /* VbrMode.vbr_off */ && gfp.compression_ratio > 0) {
            if (gfp.out_samplerate === 0) {
                gfp.out_samplerate = findNearestSampleRate(Math.trunc(0.97 * gfp.in_samplerate));
            }
            gfp.brate = Math.trunc((gfp.out_samplerate * 16 * gfc.channels_out) /
                (1e3 * gfp.compression_ratio));
            Lame.smpFrqIndex(gfp);
            gfp.brate = findNearestBitrate(gfp.brate, gfp.version, gfp.out_samplerate);
        }
        if (gfp.out_samplerate !== 0) {
            if (gfp.out_samplerate < 16000) {
                gfp.VBR_mean_bitrate_kbps = Math.max(gfp.VBR_mean_bitrate_kbps, 8);
                gfp.VBR_mean_bitrate_kbps = Math.min(gfp.VBR_mean_bitrate_kbps, 64);
            }
            else if (gfp.out_samplerate < 32000) {
                gfp.VBR_mean_bitrate_kbps = Math.max(gfp.VBR_mean_bitrate_kbps, 8);
                gfp.VBR_mean_bitrate_kbps = Math.min(gfp.VBR_mean_bitrate_kbps, 160);
            }
            else {
                gfp.VBR_mean_bitrate_kbps = Math.max(gfp.VBR_mean_bitrate_kbps, 32);
                gfp.VBR_mean_bitrate_kbps = Math.min(gfp.VBR_mean_bitrate_kbps, 320);
            }
        }
        if (gfp.lowpassfreq === 0) {
            var lowpass = void 0;
            switch (gfp.VBR) {
                case 0 /* VbrMode.vbr_off */: {
                    lowpass = this.p.abrPresets.getOptimumBandwidth(gfp.brate);
                    break;
                }
                case 3 /* VbrMode.vbr_abr */: {
                    lowpass = this.p.abrPresets.getOptimumBandwidth(gfp.VBR_mean_bitrate_kbps);
                    break;
                }
                case 2 /* VbrMode.vbr_rh */: {
                    var x = [
                        19500, 19000, 18600, 18000, 17500, 16000, 15600, 14900, 12500,
                        10000, 3950,
                    ];
                    if (gfp.VBR_q >= 0 && gfp.VBR_q <= 9) {
                        lowpass = x[gfp.VBR_q];
                    }
                    else {
                        lowpass = 19500;
                    }
                    break;
                }
                default: {
                    var x = [
                        19500, 19000, 18500, 18000, 17500, 16500, 15500, 14500, 12500, 9500,
                        3950,
                    ];
                    if (gfp.VBR_q >= 0 && gfp.VBR_q <= 9) {
                        lowpass = x[gfp.VBR_q];
                    }
                    else {
                        lowpass = 19500;
                    }
                }
            }
            if (gfp.mode === MPEGMode.MONO &&
                (gfp.VBR === 0 /* VbrMode.vbr_off */ || gfp.VBR === 3 /* VbrMode.vbr_abr */)) {
                lowpass *= 1.5;
            }
            gfp.lowpassfreq = Math.trunc(lowpass);
        }
        if (gfp.out_samplerate === 0) {
            if (2 * gfp.lowpassfreq > gfp.in_samplerate) {
                gfp.lowpassfreq = gfp.in_samplerate / 2;
            }
            gfp.out_samplerate = this.optimum_samplefreq(Math.trunc(gfp.lowpassfreq), gfp.in_samplerate);
        }
        gfp.lowpassfreq = Math.min(20500, gfp.lowpassfreq);
        gfp.lowpassfreq = Math.min(gfp.out_samplerate / 2, gfp.lowpassfreq);
        if (gfp.VBR === 0 /* VbrMode.vbr_off */) {
            gfp.compression_ratio =
                (gfp.out_samplerate * 16 * gfc.channels_out) / (1e3 * gfp.brate);
        }
        if (gfp.VBR === 3 /* VbrMode.vbr_abr */) {
            gfp.compression_ratio =
                (gfp.out_samplerate * 16 * gfc.channels_out) /
                    (1e3 * gfp.VBR_mean_bitrate_kbps);
        }
        gfc.findPeakSample = false;
        gfc.findReplayGain = false;
        if (gfc.findReplayGain) {
            if (this.bs.ga.initGainAnalysis(gfc.rgdata, gfp.out_samplerate) ===
                GainAnalysis.INIT_GAIN_ANALYSIS_ERROR) {
                throw new Error('INIT_GAIN_ANALYSIS_ERROR');
            }
        }
        gfc.mode_gr = gfp.out_samplerate <= 24000 ? 1 : 2;
        gfp.framesize = 576 * gfc.mode_gr;
        gfc.resample_ratio = gfp.in_samplerate / gfp.out_samplerate;
        switch (gfp.VBR) {
            case 1 /* VbrMode.vbr_mt */:
            case 2 /* VbrMode.vbr_rh */:
            case 4 /* VbrMode.vbr_mtrh */:
                {
                    var cmp = [5.7, 6.5, 7.3, 8.2, 10, 11.9, 13, 14, 15, 16.5];
                    gfp.compression_ratio = cmp[gfp.VBR_q];
                }
                break;
            case 3 /* VbrMode.vbr_abr */:
                gfp.compression_ratio =
                    (gfp.out_samplerate * 16 * gfc.channels_out) /
                        (1e3 * gfp.VBR_mean_bitrate_kbps);
                break;
            default:
                gfp.compression_ratio =
                    (gfp.out_samplerate * 16 * gfc.channels_out) / (1e3 * gfp.brate);
                break;
        }
        if (gfp.mode === MPEGMode.NOT_SET) {
            gfp.mode = MPEGMode.JOINT_STEREO;
        }
        gfc.highpass1 = 0;
        gfc.highpass2 = 0;
        if (gfp.lowpassfreq > 0) {
            gfc.lowpass2 = 2 * gfp.lowpassfreq;
            gfc.lowpass1 = (1 - 0.0) * 2 * gfp.lowpassfreq;
            gfc.lowpass1 /= gfp.out_samplerate;
            gfc.lowpass2 /= gfp.out_samplerate;
        }
        else {
            gfc.lowpass1 = 0;
            gfc.lowpass2 = 0;
        }
        this.lame_init_params_ppflt(gfp);
        Lame.smpFrqIndex(gfp);
        if (gfc.samplerate_index < 0) {
            throw new Error('Invalid sample rate');
        }
        if (gfp.VBR === 0 /* VbrMode.vbr_off */) {
            gfp.brate = findNearestBitrate(gfp.brate, gfp.version, gfp.out_samplerate);
            gfc.bitrate_index = findBitrateIndex(gfp.brate, gfp.version, gfp.out_samplerate);
        }
        else {
            gfc.bitrate_index = 1;
        }
        this.bs.resetPointers(gfc);
        var j = gfc.samplerate_index +
            3 * gfp.version +
            6 * (gfp.out_samplerate < 16000 ? 1 : 0);
        for (var i = 0; i < SBMAX_l + 1; i++)
            gfc.scalefac_band.l[i] = this.sfBandIndex[j].l[i];
        for (var i = 0; i < PSFB21 + 1; i++) {
            var size = (gfc.scalefac_band.l[22] - gfc.scalefac_band.l[21]) / PSFB21;
            var start = gfc.scalefac_band.l[21] + i * size;
            gfc.scalefac_band.psfb21[i] = start;
        }
        gfc.scalefac_band.psfb21[PSFB21] = 576;
        for (var i = 0; i < SBMAX_s + 1; i++) {
            gfc.scalefac_band.s[i] = this.sfBandIndex[j].s[i];
        }
        for (var i = 0; i < PSFB12 + 1; i++) {
            var size = (gfc.scalefac_band.s[13] - gfc.scalefac_band.s[12]) / PSFB12;
            var start = gfc.scalefac_band.s[12] + i * size;
            gfc.scalefac_band.psfb12[i] = start;
        }
        gfc.scalefac_band.psfb12[PSFB12] = 192;
        if (gfp.version === 1) {
            gfc.sideinfo_len = gfc.channels_out === 1 ? 4 + 17 : 4 + 32;
        }
        else {
            gfc.sideinfo_len = gfc.channels_out === 1 ? 4 + 9 : 4 + 17;
        }
        this.lame_init_bitstream(gfp);
        gfc.Class_ID = LAME_ID;
        var k;
        for (k = 0; k < 19; k++) {
            gfc.nsPsy.pefirbuf[k] = 700 * gfc.mode_gr * gfc.channels_out;
        }
        if (gfp.ATHtype === -1) {
            gfp.ATHtype = 4;
        }
        assert(gfp.VBR_q <= 9);
        assert(gfp.VBR_q >= 0);
        switch (gfp.VBR) {
            case 1 /* VbrMode.vbr_mt */:
                gfp.VBR = 4 /* VbrMode.vbr_mtrh */;
            // eslint-disable-next-line no-fallthrough
            case 4 /* VbrMode.vbr_mtrh */: {
                this.p.applyPresetFromQuality(gfp, gfp.VBR_q);
                if (gfp.quality < 0)
                    gfp.quality = Lame.LAME_DEFAULT_QUALITY;
                if (gfp.quality < 5)
                    gfp.quality = 0;
                if (gfp.quality > 5)
                    gfp.quality = 5;
                gfc.PSY.mask_adjust = gfp.maskingadjust;
                gfc.PSY.mask_adjust_short = gfp.maskingadjust_short;
                if (gfp.experimentalY)
                    gfc.sfb21_extra = false;
                else
                    gfc.sfb21_extra = gfp.out_samplerate > 44000;
                gfc.iteration_loop = new CBRNewIterationLoop(this.qu);
                break;
            }
            case 2 /* VbrMode.vbr_rh */: {
                this.p.applyPresetFromQuality(gfp, gfp.VBR_q);
                gfc.PSY.mask_adjust = gfp.maskingadjust;
                gfc.PSY.mask_adjust_short = gfp.maskingadjust_short;
                if (gfp.experimentalY) {
                    gfc.sfb21_extra = false;
                }
                else
                    gfc.sfb21_extra = gfp.out_samplerate > 44000;
                if (gfp.quality > 6) {
                    gfp.quality = 6;
                }
                if (gfp.quality < 0) {
                    gfp.quality = Lame.LAME_DEFAULT_QUALITY;
                }
                gfc.iteration_loop = new CBRNewIterationLoop(this.qu);
                break;
            }
            default: {
                gfc.sfb21_extra = false;
                if (gfp.quality < 0) {
                    gfp.quality = Lame.LAME_DEFAULT_QUALITY;
                }
                var vbrmode = gfp.VBR;
                if (vbrmode === 0 /* VbrMode.vbr_off */) {
                    gfp.VBR_mean_bitrate_kbps = gfp.brate;
                }
                this.p.apply(gfp, gfp.VBR_mean_bitrate_kbps);
                gfp.VBR = vbrmode;
                gfc.PSY.mask_adjust = gfp.maskingadjust;
                gfc.PSY.mask_adjust_short = gfp.maskingadjust_short;
                if (vbrmode === 0 /* VbrMode.vbr_off */) {
                    gfc.iteration_loop = new CBRNewIterationLoop(this.qu);
                }
                else {
                    gfc.iteration_loop = new CBRNewIterationLoop(this.qu);
                }
                break;
            }
        }
        assert(gfp.scale >= 0);
        if (gfp.VBR !== 0 /* VbrMode.vbr_off */) {
            gfc.VBR_min_bitrate = 1;
            gfc.VBR_max_bitrate = 14;
            if (gfp.out_samplerate < 16000) {
                gfc.VBR_max_bitrate = 8;
            }
            if (gfp.VBR_min_bitrate_kbps !== 0) {
                gfp.VBR_min_bitrate_kbps = findNearestBitrate(gfp.VBR_min_bitrate_kbps, gfp.version, gfp.out_samplerate);
                gfc.VBR_min_bitrate = findBitrateIndex(gfp.VBR_min_bitrate_kbps, gfp.version, gfp.out_samplerate);
            }
            if (gfp.VBR_max_bitrate_kbps !== 0) {
                gfp.VBR_max_bitrate_kbps = findNearestBitrate(gfp.VBR_max_bitrate_kbps, gfp.version, gfp.out_samplerate);
                gfc.VBR_max_bitrate = findBitrateIndex(gfp.VBR_max_bitrate_kbps, gfp.version, gfp.out_samplerate);
            }
            gfp.VBR_min_bitrate_kbps = getBitrate(gfp.version, gfc.VBR_min_bitrate);
            gfp.VBR_max_bitrate_kbps = getBitrate(gfp.version, gfc.VBR_max_bitrate);
            gfp.VBR_mean_bitrate_kbps = Math.min(getBitrate(gfp.version, gfc.VBR_max_bitrate), gfp.VBR_mean_bitrate_kbps);
            gfp.VBR_mean_bitrate_kbps = Math.max(getBitrate(gfp.version, gfc.VBR_min_bitrate), gfp.VBR_mean_bitrate_kbps);
        }
        this.lame_init_qval(gfp);
        assert(gfp.scale >= 0);
        gfc.ATH.useAdjust = 3;
        gfc.ATH.aaSensitivityP = Math.pow(10.0, gfp.athaa_sensitivity / -10.0);
        if (gfp.short_blocks === null) {
            gfp.short_blocks = 0 /* ShortBlock.short_block_allowed */;
        }
        if (gfp.short_blocks === 0 /* ShortBlock.short_block_allowed */ &&
            (gfp.mode === MPEGMode.JOINT_STEREO || gfp.mode === MPEGMode.STEREO)) {
            gfp.short_blocks = 1 /* ShortBlock.short_block_coupled */;
        }
        if (gfp.quant_comp < 0) {
            gfp.quant_comp = 1;
        }
        if (gfp.quant_comp_short < 0) {
            gfp.quant_comp_short = 0;
        }
        if (gfp.msfix < 0) {
            gfp.msfix = 0;
        }
        gfp.exp_nspsytune |= 1;
        if (gfp.internal_flags.nsPsy.attackthre < 0) {
            gfp.internal_flags.nsPsy.attackthre = PsyModel.NSATTACKTHRE;
        }
        if (gfp.internal_flags.nsPsy.attackthre_s < 0) {
            gfp.internal_flags.nsPsy.attackthre_s = PsyModel.NSATTACKTHRE_S;
        }
        assert(gfp.scale >= 0);
        if (gfp.scale < 0) {
            gfp.scale = 1;
        }
        if (gfp.ATHtype < 0) {
            gfp.ATHtype = 4;
        }
        if (gfp.ATHcurve < 0) {
            gfp.ATHcurve = 4;
        }
        if (gfp.athaa_loudapprox < 0) {
            gfp.athaa_loudapprox = 2;
        }
        if (gfp.interChRatio < 0) {
            gfp.interChRatio = 0;
        }
        gfc.slot_lag = 0;
        gfc.frac_SpF = 0;
        if (gfp.VBR === 0 /* VbrMode.vbr_off */) {
            gfc.frac_SpF =
                ((gfp.version + 1) * 72000 * gfp.brate) %
                    Math.trunc(gfp.out_samplerate);
            gfc.slot_lag = gfc.frac_SpF;
        }
        this.qu.qupvt.iteration_init(gfp, this.qu.tak);
        this.qu.qupvt.psy.psymodel_init(gfp);
        assert(gfp.scale >= 0);
    };
    Lame.prototype.filterCoeficient = function (x) {
        if (x > 1.0) {
            return 0.0;
        }
        if (x <= 0.0) {
            return 1.0;
        }
        return Math.cos((Math.PI / 2) * x);
    };
    Lame.prototype.optimum_samplefreq = function (lowpassfreq, input_samplefreq) {
        var suggested_samplefreq = 44100;
        if (input_samplefreq >= 48000)
            suggested_samplefreq = 48000;
        else if (input_samplefreq >= 44100)
            suggested_samplefreq = 44100;
        else if (input_samplefreq >= 32000)
            suggested_samplefreq = 32000;
        else if (input_samplefreq >= 24000)
            suggested_samplefreq = 24000;
        else if (input_samplefreq >= 22050)
            suggested_samplefreq = 22050;
        else if (input_samplefreq >= 16000)
            suggested_samplefreq = 16000;
        else if (input_samplefreq >= 12000)
            suggested_samplefreq = 12000;
        else if (input_samplefreq >= 11025)
            suggested_samplefreq = 11025;
        else if (input_samplefreq >= 8000)
            suggested_samplefreq = 8000;
        if (lowpassfreq === -1)
            return suggested_samplefreq;
        if (lowpassfreq <= 15960)
            suggested_samplefreq = 44100;
        if (lowpassfreq <= 15250)
            suggested_samplefreq = 32000;
        if (lowpassfreq <= 11220)
            suggested_samplefreq = 24000;
        if (lowpassfreq <= 9970)
            suggested_samplefreq = 22050;
        if (lowpassfreq <= 7230)
            suggested_samplefreq = 16000;
        if (lowpassfreq <= 5420)
            suggested_samplefreq = 12000;
        if (lowpassfreq <= 4510)
            suggested_samplefreq = 11025;
        if (lowpassfreq <= 3970)
            suggested_samplefreq = 8000;
        if (input_samplefreq < suggested_samplefreq) {
            if (input_samplefreq > 44100)
                return 48000;
            if (input_samplefreq > 32000)
                return 44100;
            if (input_samplefreq > 24000)
                return 32000;
            if (input_samplefreq > 22050)
                return 24000;
            if (input_samplefreq > 16000)
                return 22050;
            if (input_samplefreq > 12000)
                return 16000;
            if (input_samplefreq > 11025)
                return 12000;
            if (input_samplefreq > 8000)
                return 11025;
            return 8000;
        }
        return suggested_samplefreq;
    };
    Lame.smpFrqIndex = function (gpf) {
        switch (gpf.out_samplerate) {
            case 44100:
                gpf.version = 1;
                gpf.internal_flags.samplerate_index = 0;
                return;
            case 48000:
                gpf.version = 1;
                gpf.internal_flags.samplerate_index = 1;
                return;
            case 32000:
                gpf.version = 1;
                gpf.internal_flags.samplerate_index = 2;
                return;
            case 22050:
                gpf.version = 0;
                gpf.internal_flags.samplerate_index = 0;
                return;
            case 24000:
                gpf.version = 0;
                gpf.internal_flags.samplerate_index = 1;
                return;
            case 16000:
                gpf.version = 0;
                gpf.internal_flags.samplerate_index = 2;
                return;
            case 11025:
                gpf.version = 0;
                gpf.internal_flags.samplerate_index = 0;
                return;
            case 12000:
                gpf.version = 0;
                gpf.internal_flags.samplerate_index = 1;
                return;
            case 8000:
                gpf.version = 0;
                gpf.internal_flags.samplerate_index = 2;
                return;
            default:
                gpf.version = 0;
                gpf.internal_flags.samplerate_index = -1;
        }
    };
    Lame.prototype.lame_init_params_ppflt = function (gfp) {
        var gfc = gfp.internal_flags;
        var lowpass_band = 32;
        var highpass_band = -1;
        if (gfc.lowpass1 > 0) {
            var minband = 999;
            for (var band = 0; band <= 31; band++) {
                var freq = band / 31.0;
                if (freq >= gfc.lowpass2) {
                    lowpass_band = Math.min(lowpass_band, band);
                }
                if (gfc.lowpass1 < freq && freq < gfc.lowpass2) {
                    minband = Math.min(minband, band);
                }
            }
            if (minband === 999) {
                gfc.lowpass1 = (lowpass_band - 0.75) / 31.0;
            }
            else {
                gfc.lowpass1 = (minband - 0.75) / 31.0;
            }
            gfc.lowpass2 = lowpass_band / 31.0;
        }
        if (gfc.highpass2 > 0) {
            if (gfc.highpass2 < 0.9 * (0.75 / 31.0)) {
                gfc.highpass1 = 0;
                gfc.highpass2 = 0;
                console.warn('Warning: highpass filter disabled. highpass frequency too small');
            }
        }
        if (gfc.highpass2 > 0) {
            var maxband = -1;
            for (var band = 0; band <= 31; band++) {
                var freq = band / 31.0;
                if (freq <= gfc.highpass1) {
                    highpass_band = Math.max(highpass_band, band);
                }
                if (gfc.highpass1 < freq && freq < gfc.highpass2) {
                    maxband = Math.max(maxband, band);
                }
            }
            gfc.highpass1 = highpass_band / 31.0;
            if (maxband === -1) {
                gfc.highpass2 = (highpass_band + 0.75) / 31.0;
            }
            else {
                gfc.highpass2 = (maxband + 0.75) / 31.0;
            }
        }
        for (var band = 0; band < 32; band++) {
            var fc1 = void 0;
            var fc2 = void 0;
            var freq = band / 31.0;
            if (gfc.highpass2 > gfc.highpass1) {
                fc1 = this.filterCoeficient((gfc.highpass2 - freq) / (gfc.highpass2 - gfc.highpass1 + 1e-20));
            }
            else {
                fc1 = 1.0;
            }
            if (gfc.lowpass2 > gfc.lowpass1) {
                fc2 = this.filterCoeficient((freq - gfc.lowpass1) / (gfc.lowpass2 - gfc.lowpass1 + 1e-20));
            }
            else {
                fc2 = 1.0;
            }
            gfc.amp_filter[band] = fc1 * fc2;
        }
    };
    Lame.prototype.lame_init_qval = function (gfp) {
        var gfc = gfp.internal_flags;
        switch (gfp.quality) {
            default:
            case 9:
                gfc.psymodel = 0;
                gfc.noise_shaping = 0;
                gfc.noise_shaping_amp = 0;
                gfc.noise_shaping_stop = 0;
                gfc.use_best_huffman = 0;
                gfc.full_outer_loop = 0;
                break;
            case 8:
                gfp.quality = 7;
            // eslint-disable-next-line no-fallthrough
            case 7:
                gfc.psymodel = 1;
                gfc.noise_shaping = 0;
                gfc.noise_shaping_amp = 0;
                gfc.noise_shaping_stop = 0;
                gfc.use_best_huffman = 0;
                gfc.full_outer_loop = 0;
                break;
            case 6:
                gfc.psymodel = 1;
                if (gfc.noise_shaping === 0)
                    gfc.noise_shaping = 1;
                gfc.noise_shaping_amp = 0;
                gfc.noise_shaping_stop = 0;
                if (gfc.subblock_gain === -1)
                    gfc.subblock_gain = 1;
                gfc.use_best_huffman = 0;
                gfc.full_outer_loop = 0;
                break;
            case 5:
                gfc.psymodel = 1;
                if (gfc.noise_shaping === 0)
                    gfc.noise_shaping = 1;
                gfc.noise_shaping_amp = 0;
                gfc.noise_shaping_stop = 0;
                if (gfc.subblock_gain === -1)
                    gfc.subblock_gain = 1;
                gfc.use_best_huffman = 0;
                gfc.full_outer_loop = 0;
                break;
            case 4:
                gfc.psymodel = 1;
                if (gfc.noise_shaping === 0)
                    gfc.noise_shaping = 1;
                gfc.noise_shaping_amp = 0;
                gfc.noise_shaping_stop = 0;
                if (gfc.subblock_gain === -1)
                    gfc.subblock_gain = 1;
                gfc.use_best_huffman = 1;
                gfc.full_outer_loop = 0;
                break;
            case 3:
                gfc.psymodel = 1;
                if (gfc.noise_shaping === 0)
                    gfc.noise_shaping = 1;
                gfc.noise_shaping_amp = 1;
                gfc.noise_shaping_stop = 1;
                if (gfc.subblock_gain === -1)
                    gfc.subblock_gain = 1;
                gfc.use_best_huffman = 1;
                gfc.full_outer_loop = 0;
                break;
            case 2:
                gfc.psymodel = 1;
                if (gfc.noise_shaping === 0)
                    gfc.noise_shaping = 1;
                if (gfc.substep_shaping === 0)
                    gfc.substep_shaping = 2;
                gfc.noise_shaping_amp = 1;
                gfc.noise_shaping_stop = 1;
                if (gfc.subblock_gain === -1)
                    gfc.subblock_gain = 1;
                gfc.use_best_huffman = 1;
                gfc.full_outer_loop = 0;
                break;
            case 1:
                gfc.psymodel = 1;
                if (gfc.noise_shaping === 0)
                    gfc.noise_shaping = 1;
                if (gfc.substep_shaping === 0)
                    gfc.substep_shaping = 2;
                gfc.noise_shaping_amp = 2;
                gfc.noise_shaping_stop = 1;
                if (gfc.subblock_gain === -1)
                    gfc.subblock_gain = 1;
                gfc.use_best_huffman = 1;
                gfc.full_outer_loop = 0;
                break;
            case 0:
                gfc.psymodel = 1;
                if (gfc.noise_shaping === 0)
                    gfc.noise_shaping = 1;
                if (gfc.substep_shaping === 0)
                    gfc.substep_shaping = 2;
                gfc.noise_shaping_amp = 2;
                gfc.noise_shaping_stop = 1;
                if (gfc.subblock_gain === -1)
                    gfc.subblock_gain = 1;
                gfc.use_best_huffman = 1;
                gfc.full_outer_loop = 0;
                break;
        }
    };
    Lame.prototype.lame_init_bitstream = function (gfp) {
        var gfc = gfp.internal_flags;
        gfp.frameNum = 0;
        gfc.PeakSample = 0.0;
    };
    Lame.prototype.lame_encode_flush = function (gfp, mp3buffer, mp3bufferPos, mp3buffer_size) {
        var gfc = gfp.internal_flags;
        if (gfc.mf_samples_to_encode < 1) {
            return 0;
        }
        var samples_to_encode = gfc.mf_samples_to_encode - POSTDELAY;
        if (gfp.in_samplerate !== gfp.out_samplerate) {
            samples_to_encode += (16 * gfp.out_samplerate) / gfp.in_samplerate;
        }
        var end_padding = gfp.framesize - (samples_to_encode % gfp.framesize);
        if (end_padding < 576)
            end_padding += gfp.framesize;
        var frames_left = (samples_to_encode + end_padding) / gfp.framesize;
        var buffer = Array.from({ length: 2 }, function () { return new Int16Array(1152); });
        var mf_needed = Lame.calcNeeded(gfp);
        var mp3count = 0;
        var imp3 = 0;
        var mp3buffer_size_remaining;
        while (frames_left > 0 && imp3 >= 0) {
            var bunch = mf_needed - gfc.mf_size;
            var frame_num = gfp.frameNum;
            bunch *= gfp.in_samplerate;
            bunch /= gfp.out_samplerate;
            if (bunch > 1152)
                bunch = 1152;
            if (bunch < 1)
                bunch = 1;
            mp3buffer_size_remaining = mp3buffer_size - mp3count;
            if (mp3buffer_size === 0)
                mp3buffer_size_remaining = 0;
            imp3 = this.lame_encode_buffer(gfp, buffer[0], buffer[1], bunch, mp3buffer, mp3bufferPos, mp3buffer_size_remaining);
            mp3bufferPos += imp3;
            mp3count += imp3;
            frames_left -= frame_num !== gfp.frameNum ? 1 : 0;
        }
        gfc.mf_samples_to_encode = 0;
        if (imp3 < 0) {
            return imp3;
        }
        mp3buffer_size_remaining = mp3buffer_size - mp3count;
        if (mp3buffer_size === 0)
            mp3buffer_size_remaining = 0;
        this.bs.flush_bitstream(gfp);
        imp3 = this.bs.copyFrameData(gfc, mp3buffer, mp3bufferPos, mp3buffer_size_remaining);
        if (imp3 < 0) {
            return imp3;
        }
        mp3bufferPos += imp3;
        mp3count += imp3;
        return mp3count;
    };
    Lame.prototype.lame_encode_buffer = function (gfp, buffer_l, buffer_r, nsamples, mp3buf, mp3bufPos, mp3buf_size) {
        var gfc = gfp.internal_flags;
        if (gfc.Class_ID !== LAME_ID)
            return -3;
        if (nsamples === 0)
            return 0;
        if (gfc.in_buffer_0 === null ||
            gfc.in_buffer_1 === null ||
            gfc.in_buffer_nsamples < nsamples) {
            gfc.in_buffer_0 = new Float32Array(nsamples);
            gfc.in_buffer_1 = new Float32Array(nsamples);
            gfc.in_buffer_nsamples = nsamples;
        }
        var in_buffer = [gfc.in_buffer_0, gfc.in_buffer_1];
        for (var i = 0; i < nsamples; i++) {
            in_buffer[0][i] = buffer_l[i];
            if (gfc.channels_in > 1) {
                in_buffer[1][i] = buffer_r[i];
            }
        }
        return this.lame_encode_buffer_sample(gfp, in_buffer[0], in_buffer[1], nsamples, mp3buf, mp3bufPos, mp3buf_size);
    };
    Lame.calcNeeded = function (gfp) {
        var mf_needed = BLKSIZE + gfp.framesize - FFTOFFSET;
        mf_needed = Math.max(mf_needed, 512 + gfp.framesize - 32);
        return mf_needed;
    };
    Lame.prototype.lame_encode_buffer_sample = function (gfp, buffer_l, buffer_r, nsamples, mp3buf, mp3bufPos, mp3buf_size) {
        var gfc = gfp.internal_flags;
        if (gfc.Class_ID !== LAME_ID)
            return -3;
        if (nsamples === 0)
            return 0;
        var mp3out = this.bs.copyMetadata(gfc, mp3buf, mp3bufPos, mp3buf_size);
        if (mp3out < 0)
            return mp3out;
        mp3bufPos += mp3out;
        var mp3size = mp3out;
        var in_buffer = [buffer_l, buffer_r];
        if (!isCloseToEachOther(gfp.scale, 0) &&
            !isCloseToEachOther(gfp.scale, 1.0)) {
            for (var i = 0; i < nsamples; ++i) {
                in_buffer[0][i] *= gfp.scale;
                if (gfc.channels_out === 2)
                    in_buffer[1][i] *= gfp.scale;
            }
        }
        if (gfp.num_channels === 2 && gfc.channels_out === 1) {
            for (var i = 0; i < nsamples; ++i) {
                in_buffer[0][i] = 0.5 * (in_buffer[0][i] + in_buffer[1][i]);
                in_buffer[1][i] = 0.0;
            }
        }
        var mf_needed = Lame.calcNeeded(gfp);
        var mfbuf = [gfc.mfbuf[0], gfc.mfbuf[1]];
        var in_bufferPos = 0;
        while (nsamples > 0) {
            var in_buffer_ptr = [
                in_buffer[0],
                in_buffer[1],
            ];
            var inOut = new InOut();
            Lame.fill_buffer(gfp, mfbuf, in_buffer_ptr, in_bufferPos, nsamples, inOut);
            var n_in = inOut.n_in;
            var n_out = inOut.n_out;
            if (gfc.findReplayGain)
                if (this.bs.ga.analyzeSamples(gfc.rgdata, mfbuf[0], gfc.mf_size, mfbuf[1], gfc.mf_size, n_out, gfc.channels_out) === GainAnalysis.GAIN_ANALYSIS_ERROR) {
                    return -6;
                }
            nsamples -= n_in;
            in_bufferPos += n_in;
            gfc.mf_size += n_out;
            assert(gfc.mf_size <= MFSIZE);
            if (gfc.mf_samples_to_encode < 1) {
                gfc.mf_samples_to_encode = ENCDELAY + POSTDELAY;
            }
            gfc.mf_samples_to_encode += n_out;
            if (gfc.mf_size >= mf_needed) {
                var buf_size = mp3buf_size - mp3size;
                if (mp3buf_size === 0)
                    buf_size = 0;
                var ret = this.lame_encode_frame(gfp, mfbuf[0], mfbuf[1], mp3buf, mp3bufPos, buf_size);
                if (ret < 0)
                    return ret;
                mp3bufPos += ret;
                mp3size += ret;
                gfc.mf_size -= gfp.framesize;
                gfc.mf_samples_to_encode -= gfp.framesize;
                for (var ch = 0; ch < gfc.channels_out; ch++) {
                    for (var i = 0; i < gfc.mf_size; i++) {
                        mfbuf[ch][i] = mfbuf[ch][i + gfp.framesize];
                    }
                }
            }
        }
        return mp3size;
    };
    Lame.prototype.lame_encode_frame = function (gfp, inbuf_l, inbuf_r, mp3buf, mp3bufPos, mp3buf_size) {
        var ret = this.enc.lame_encode_mp3_frame(gfp, inbuf_l, inbuf_r, mp3buf, mp3bufPos, mp3buf_size);
        gfp.frameNum++;
        return ret;
    };
    Lame.fill_buffer_resample = function (gfp, outbuf, outbufPos, desired_len, inbuf, in_bufferPos, len, num_used, ch) {
        var gfc = gfp.internal_flags;
        var i;
        var j = 0;
        var k;
        var bpc = gfp.out_samplerate / gcd(gfp.out_samplerate, gfp.in_samplerate);
        if (bpc > BPC)
            bpc = BPC;
        var intratio = Math.abs(gfc.resample_ratio - Math.floor(0.5 + gfc.resample_ratio)) <
            0.0001
            ? 1
            : 0;
        var fcn = 1.0 / gfc.resample_ratio;
        if (fcn > 1.0)
            fcn = 1.0;
        var filter_l = 31;
        if (filter_l % 2 === 0)
            --filter_l;
        filter_l += intratio;
        var BLACKSIZE = filter_l + 1;
        if (!gfc.fill_buffer_resample_init) {
            gfc.inbuf_old[0] = new Float32Array(BLACKSIZE);
            gfc.inbuf_old[1] = new Float32Array(BLACKSIZE);
            for (i = 0; i <= 2 * bpc; ++i)
                gfc.blackfilt[i] = new Float32Array(BLACKSIZE);
            gfc.itime[0] = 0;
            gfc.itime[1] = 0;
            for (j = 0; j <= 2 * bpc; j++) {
                var sum = 0;
                var offset = (j - bpc) / (2 * bpc);
                for (i = 0; i <= filter_l; i++) {
                    gfc.blackfilt[j][i] = blackmanWindow(i - offset, fcn, filter_l);
                    sum += gfc.blackfilt[j][i];
                }
                for (i = 0; i <= filter_l; i++)
                    gfc.blackfilt[j][i] /= sum;
            }
            gfc.fill_buffer_resample_init = true;
        }
        var inbuf_old = gfc.inbuf_old[ch];
        for (k = 0; k < desired_len; k++) {
            var time0 = k * gfc.resample_ratio;
            j = Math.floor(time0 - gfc.itime[ch]);
            if (filter_l + j - filter_l / 2 >= len)
                break;
            var offset = time0 - gfc.itime[ch] - (j + 0.5 * (filter_l % 2));
            var joff = Math.floor(offset * 2 * bpc + bpc + 0.5);
            var xvalue = 0;
            for (i = 0; i <= filter_l; ++i) {
                var j2 = Math.trunc(i + j - filter_l / 2);
                var y = j2 < 0 ? inbuf_old[BLACKSIZE + j2] : inbuf[in_bufferPos + j2];
                xvalue += y * gfc.blackfilt[joff][i];
            }
            outbuf[outbufPos + k] = xvalue;
        }
        num_used.num_used = Math.min(len, filter_l + j - filter_l / 2);
        gfc.itime[ch] += num_used.num_used - k * gfc.resample_ratio;
        if (num_used.num_used >= BLACKSIZE) {
            for (i = 0; i < BLACKSIZE; i++) {
                inbuf_old[i] = inbuf[in_bufferPos + num_used.num_used + i - BLACKSIZE];
            }
        }
        else {
            var n_shift = BLACKSIZE - num_used.num_used;
            for (i = 0; i < n_shift; ++i) {
                inbuf_old[i] = inbuf_old[i + num_used.num_used];
            }
            for (j = 0; i < BLACKSIZE; ++i, ++j) {
                inbuf_old[i] = inbuf[in_bufferPos + j];
            }
            assert(j === num_used.num_used);
        }
        return k;
    };
    Lame.fill_buffer = function (gfp, mfbuf, in_buffer, in_bufferPos, nsamples, io) {
        var gfc = gfp.internal_flags;
        if (gfc.resample_ratio < 0.9999 || gfc.resample_ratio > 1.0001) {
            for (var ch = 0; ch < gfc.channels_out; ch++) {
                var numUsed = new NumUsed();
                io.n_out = Lame.fill_buffer_resample(gfp, mfbuf[ch], gfc.mf_size, gfp.framesize, in_buffer[ch], in_bufferPos, nsamples, numUsed, ch);
                io.n_in = numUsed.num_used;
            }
        }
        else {
            io.n_out = Math.min(gfp.framesize, nsamples);
            io.n_in = io.n_out;
            for (var i = 0; i < io.n_out; ++i) {
                mfbuf[0][gfc.mf_size + i] = in_buffer[0][in_bufferPos + i];
                if (gfc.channels_out === 2)
                    mfbuf[1][gfc.mf_size + i] = in_buffer[1][in_bufferPos + i];
            }
        }
    };
    Lame.LAME_DEFAULT_QUALITY = 3;
    return Lame;
}());

var Mp3Encoder = /** @class */ (function () {
    function Mp3Encoder(channels, samplerate, kbps) {
        if (channels === void 0) { channels = 1; }
        if (samplerate === void 0) { samplerate = 44100; }
        if (kbps === void 0) { kbps = 128; }
        this.lame = new Lame();
        this.gfp = this.lame.lame_init(channels, samplerate, kbps);
        this.maxSamples = 1152;
        this.mp3buf_size = Math.trunc(1.25 * this.maxSamples + 7200);
        this.mp3buf = new Uint8Array(this.mp3buf_size);
    }
    Mp3Encoder.prototype.encodeBuffer = function (left, right) {
        if (right === void 0) { right = left; }
        if (left.length !== right.length) {
            throw new Error('left and right channel buffers must be the same length');
        }
        if (left.length > this.maxSamples) {
            this.maxSamples = left.length;
            this.mp3buf_size = Math.trunc(1.25 * this.maxSamples + 7200);
            this.mp3buf = new Uint8Array(this.mp3buf_size);
        }
        var size = this.lame.lame_encode_buffer(this.gfp, left, right, left.length, this.mp3buf, 0, this.mp3buf_size);
        return new Uint8Array(this.mp3buf.subarray(0, size));
    };
    Mp3Encoder.prototype.flush = function () {
        var size = this.lame.lame_encode_flush(this.gfp, this.mp3buf, 0, this.mp3buf_size);
        return new Uint8Array(this.mp3buf.subarray(0, size));
    };
    return Mp3Encoder;
}());

var encoder;
var maxSamples = 1152;
var samplesMono;
var dataBuffer;
function convertBuffer(arrayBuffer) {
    var input = new Float32Array(arrayBuffer);
    var output = new Int16Array(arrayBuffer.length);
    for (var i = 0; i < input.length; i++) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
}
function init(config) {
    config = config || {};
    encoder = new Mp3Encoder(config.numChannels || 1, config.sampleRate || 44100, config.bitRate || 32);
    dataBuffer = [];
}
function encode(arrayBuffer) {
    samplesMono = convertBuffer(arrayBuffer);
    var remaining = samplesMono.length;
    for (var i = 0; remaining >= 0; i += maxSamples) {
        var left = samplesMono.subarray(i, i + maxSamples);
        var buffer = encoder.encodeBuffer(left);
        dataBuffer.push(new Int8Array(buffer));
        remaining -= maxSamples;
    }
}
function finish() {
    var buffer = encoder.flush();
    dataBuffer.push(new Int8Array(buffer));
    self.postMessage({ command: 'end', buffer: dataBuffer });
    dataBuffer = [];
}
function onMessage(event) {
    switch (event.data.command) {
        case 'init':
            init(event.data.config);
            break;
        case 'encode':
            encode(event.data.buffer);
            break;
        case 'finish':
            finish();
            break;
    }
}
self.onmessage = onMessage;
//# sourceMappingURL=index.js.map
