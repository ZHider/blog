import * as wasm from "./wasm_hello_bg.wasm";
import { __wbg_set_wasm } from "./wasm_hello_bg.js";
__wbg_set_wasm(wasm);
export * from "./wasm_hello_bg.js";
