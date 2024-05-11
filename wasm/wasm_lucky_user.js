fetch("/blog/wasm/wasm_lucky_user.wasm")
.then((response) => response.arrayBuffer())
.then((bytes) => WebAssembly.instantiate(bytes))
.then((wasm_moudle) => {

let wasm = wasm_moudle.instance.exports;

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
* @param {number} seed
* @returns {string}
*/
function choice(seed) {
    let deferred1_0;
    let deferred1_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.choice(retptr, seed);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        deferred1_0 = r0;
        deferred1_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

//得到标准时区的时间的函数
//参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
function getLocalTime(i) {
if (typeof i !== "number") return;

    var d = new Date();
    //得到1970年一月一日到现在的秒数
    var len = d.getTime();
    //本地时间与GMT时间的时间偏移差(注意：GMT这是UTC的民间名称。GMT=UTC）
    var offset = d.getTimezoneOffset() * 60000;
    //得到现在的格林尼治时间
    var utcTime = len + offset;
    return new Date(utcTime + 3600000 * i);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return year*10000 + month*100 + day;
}

let date = formatDate(getLocalTime(8));
let version = 4;
document.getElementById("today").innerText = 
    "Version: " + version.toString() +
    "\nLast Update: 20240101\n" +
    "Today: " + date.toString();
document.getElementById("result").innerText = choice((version << 16) + date);

});
