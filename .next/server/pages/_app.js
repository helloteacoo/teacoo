/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./src/firebase.ts":
/*!*************************!*\
  !*** ./src/firebase.ts ***!
  \*************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth)\n/* harmony export */ });\n/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ \"firebase/app\");\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/auth */ \"firebase/auth\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([firebase_app__WEBPACK_IMPORTED_MODULE_0__, firebase_auth__WEBPACK_IMPORTED_MODULE_1__]);\n([firebase_app__WEBPACK_IMPORTED_MODULE_0__, firebase_auth__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// src/firebase.ts\n\n\nconst firebaseConfig = {\n    apiKey: \"AIzaSyB-yWNeu1-9sr8yvzteVDz3Tn4NaC62rjE\",\n    authDomain: \"teacoo.firebaseapp.com\",\n    projectId: \"teacoo\",\n    storageBucket: \"teacoo.firebasestorage.app\",\n    messagingSenderId: \"877060205443\",\n    appId: \"1:877060205443:web:318430a7fa0868c15fe4b6\"\n};\nconst app = (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(firebaseConfig);\nconst auth = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_1__.getAuth)(app);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9maXJlYmFzZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxrQkFBa0I7QUFDMkI7QUFDTDtBQUV4QyxNQUFNRSxpQkFBaUI7SUFDckJDLFFBQVE7SUFDUkMsWUFBWTtJQUNaQyxXQUFXO0lBQ1hDLGVBQWU7SUFDZkMsbUJBQW1CO0lBQ25CQyxPQUFPO0FBQ1Q7QUFFQSxNQUFNQyxNQUFNVCwyREFBYUEsQ0FBQ0U7QUFDbkIsTUFBTVEsT0FBT1Qsc0RBQU9BLENBQUNRLEtBQUsiLCJzb3VyY2VzIjpbIkU6XFx0ZWFjb29cXHNyY1xcZmlyZWJhc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL2ZpcmViYXNlLnRzXHJcbmltcG9ydCB7IGluaXRpYWxpemVBcHAgfSBmcm9tIFwiZmlyZWJhc2UvYXBwXCI7XHJcbmltcG9ydCB7IGdldEF1dGggfSBmcm9tIFwiZmlyZWJhc2UvYXV0aFwiO1xyXG5cclxuY29uc3QgZmlyZWJhc2VDb25maWcgPSB7XHJcbiAgYXBpS2V5OiBcIkFJemFTeUIteVdOZXUxLTlzcjh5dnp0ZVZEejNUbjROYUM2MnJqRVwiLFxyXG4gIGF1dGhEb21haW46IFwidGVhY29vLmZpcmViYXNlYXBwLmNvbVwiLFxyXG4gIHByb2plY3RJZDogXCJ0ZWFjb29cIixcclxuICBzdG9yYWdlQnVja2V0OiBcInRlYWNvby5maXJlYmFzZXN0b3JhZ2UuYXBwXCIsXHJcbiAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiODc3MDYwMjA1NDQzXCIsXHJcbiAgYXBwSWQ6IFwiMTo4NzcwNjAyMDU0NDM6d2ViOjMxODQzMGE3ZmEwODY4YzE1ZmU0YjZcIixcclxufTtcclxuXHJcbmNvbnN0IGFwcCA9IGluaXRpYWxpemVBcHAoZmlyZWJhc2VDb25maWcpO1xyXG5leHBvcnQgY29uc3QgYXV0aCA9IGdldEF1dGgoYXBwKTtcclxuIl0sIm5hbWVzIjpbImluaXRpYWxpemVBcHAiLCJnZXRBdXRoIiwiZmlyZWJhc2VDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwicHJvamVjdElkIiwic3RvcmFnZUJ1Y2tldCIsIm1lc3NhZ2luZ1NlbmRlcklkIiwiYXBwSWQiLCJhcHAiLCJhdXRoIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/firebase.ts\n");

/***/ }),

/***/ "(pages-dir-node)/./src/i18n.ts":
/*!*********************!*\
  !*** ./src/i18n.ts ***!
  \*********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var i18next__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! i18next */ \"i18next\");\n/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-i18next */ \"react-i18next\");\n/* harmony import */ var i18next_browser_languagedetector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! i18next-browser-languagedetector */ \"i18next-browser-languagedetector\");\n/* harmony import */ var _locales_zh_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./locales/zh.json */ \"(pages-dir-node)/./src/locales/zh.json\");\n/* harmony import */ var _locales_en_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./locales/en.json */ \"(pages-dir-node)/./src/locales/en.json\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([i18next__WEBPACK_IMPORTED_MODULE_0__, react_i18next__WEBPACK_IMPORTED_MODULE_1__, i18next_browser_languagedetector__WEBPACK_IMPORTED_MODULE_2__]);\n([i18next__WEBPACK_IMPORTED_MODULE_0__, react_i18next__WEBPACK_IMPORTED_MODULE_1__, i18next_browser_languagedetector__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\ni18next__WEBPACK_IMPORTED_MODULE_0__[\"default\"].use(i18next_browser_languagedetector__WEBPACK_IMPORTED_MODULE_2__[\"default\"]) // 偵測語系\n.use(react_i18next__WEBPACK_IMPORTED_MODULE_1__.initReactI18next) // 套用到 React\n.init({\n    resources: {\n        zh: {\n            translation: _locales_zh_json__WEBPACK_IMPORTED_MODULE_3__\n        },\n        en: {\n            translation: _locales_en_json__WEBPACK_IMPORTED_MODULE_4__\n        }\n    },\n    fallbackLng: \"en\",\n    interpolation: {\n        escapeValue: false\n    }\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (i18next__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9pMThuLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUEyQjtBQUNzQjtBQUNlO0FBRTdCO0FBQ0E7QUFFbkNBLG1EQUNNLENBQUNFLHdFQUFnQkEsRUFBRSxPQUFPO0NBQzdCRyxHQUFHLENBQUNKLDJEQUFnQkEsRUFBRSxZQUFZO0NBQ2xDSyxJQUFJLENBQUM7SUFDSkMsV0FBVztRQUNUSixJQUFJO1lBQUVLLGFBQWFMLDZDQUFFQTtRQUFDO1FBQ3RCQyxJQUFJO1lBQUVJLGFBQWFKLDZDQUFFQTtRQUFDO0lBQ3hCO0lBQ0FLLGFBQWE7SUFDYkMsZUFBZTtRQUNiQyxhQUFhO0lBQ2Y7QUFDRjtBQUVGLGlFQUFlWCwrQ0FBSUEsRUFBQyIsInNvdXJjZXMiOlsiRTpcXHRlYWNvb1xcc3JjXFxpMThuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpMThuIGZyb20gXCJpMThuZXh0XCI7XHJcbmltcG9ydCB7IGluaXRSZWFjdEkxOG5leHQgfSBmcm9tIFwicmVhY3QtaTE4bmV4dFwiO1xyXG5pbXBvcnQgTGFuZ3VhZ2VEZXRlY3RvciBmcm9tIFwiaTE4bmV4dC1icm93c2VyLWxhbmd1YWdlZGV0ZWN0b3JcIjtcclxuXHJcbmltcG9ydCB6aCBmcm9tIFwiLi9sb2NhbGVzL3poLmpzb25cIjtcclxuaW1wb3J0IGVuIGZyb20gXCIuL2xvY2FsZXMvZW4uanNvblwiO1xyXG5cclxuaTE4blxyXG4gIC51c2UoTGFuZ3VhZ2VEZXRlY3RvcikgLy8g5YG15ris6Kqe57O7XHJcbiAgLnVzZShpbml0UmVhY3RJMThuZXh0KSAvLyDlpZfnlKjliLAgUmVhY3RcclxuICAuaW5pdCh7XHJcbiAgICByZXNvdXJjZXM6IHtcclxuICAgICAgemg6IHsgdHJhbnNsYXRpb246IHpoIH0sXHJcbiAgICAgIGVuOiB7IHRyYW5zbGF0aW9uOiBlbiB9LFxyXG4gICAgfSxcclxuICAgIGZhbGxiYWNrTG5nOiBcImVuXCIsIC8vIOWBtea4rOS4jeWIsOaZgumgkOioreiqnuiogFxyXG4gICAgaW50ZXJwb2xhdGlvbjoge1xyXG4gICAgICBlc2NhcGVWYWx1ZTogZmFsc2UsIC8vIHJlYWN0IOiHquW4tiBYU1Mg6JmV55CGXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaTE4bjtcclxuIl0sIm5hbWVzIjpbImkxOG4iLCJpbml0UmVhY3RJMThuZXh0IiwiTGFuZ3VhZ2VEZXRlY3RvciIsInpoIiwiZW4iLCJ1c2UiLCJpbml0IiwicmVzb3VyY2VzIiwidHJhbnNsYXRpb24iLCJmYWxsYmFja0xuZyIsImludGVycG9sYXRpb24iLCJlc2NhcGVWYWx1ZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/i18n.ts\n");

/***/ }),

/***/ "(pages-dir-node)/./src/locales/en.json":
/*!*****************************!*\
  !*** ./src/locales/en.json ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"login":{"title":"Login System","email":"Email","password":"Password","submit":"Sign In"}}');

/***/ }),

/***/ "(pages-dir-node)/./src/locales/zh.json":
/*!*****************************!*\
  !*** ./src/locales/zh.json ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"login":{"title":"登入系統","email":"電子郵件","password":"密碼","submit":"登入"}}');

/***/ }),

/***/ "(pages-dir-node)/./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-i18next */ \"react-i18next\");\n/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../i18n */ \"(pages-dir-node)/./src/i18n.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! firebase/auth */ \"firebase/auth\");\n/* harmony import */ var _firebase__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../firebase */ \"(pages-dir-node)/./src/firebase.ts\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/styles/globals.css */ \"(pages-dir-node)/./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var ag_grid_community_styles_ag_grid_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ag-grid-community/styles/ag-grid.css */ \"(pages-dir-node)/./node_modules/ag-grid-community/styles/ag-grid.css\");\n/* harmony import */ var ag_grid_community_styles_ag_grid_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(ag_grid_community_styles_ag_grid_css__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var ag_grid_community_styles_ag_theme_alpine_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ag-grid-community/styles/ag-theme-alpine.css */ \"(pages-dir-node)/./node_modules/ag-grid-community/styles/ag-theme-alpine.css\");\n/* harmony import */ var ag_grid_community_styles_ag_theme_alpine_css__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(ag_grid_community_styles_ag_theme_alpine_css__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var _styles_agGridCustom_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../styles/agGridCustom.css */ \"(pages-dir-node)/./src/styles/agGridCustom.css\");\n/* harmony import */ var _styles_agGridCustom_css__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_styles_agGridCustom_css__WEBPACK_IMPORTED_MODULE_10__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([react_i18next__WEBPACK_IMPORTED_MODULE_1__, _i18n__WEBPACK_IMPORTED_MODULE_2__, firebase_auth__WEBPACK_IMPORTED_MODULE_5__, _firebase__WEBPACK_IMPORTED_MODULE_6__]);\n([react_i18next__WEBPACK_IMPORTED_MODULE_1__, _i18n__WEBPACK_IMPORTED_MODULE_2__, firebase_auth__WEBPACK_IMPORTED_MODULE_5__, _firebase__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n// 全局樣式\n\n// AG Grid 樣式\n\n\n// 自定義樣式\n\n// 不需要認證的頁面路徑\nconst publicPaths = [\n    '/',\n    '/register'\n];\nfunction App({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const [authChecked, setAuthChecked] = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(false);\n    (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)({\n        \"App.useEffect\": ()=>{\n            const unsubscribe = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_5__.onAuthStateChanged)(_firebase__WEBPACK_IMPORTED_MODULE_6__.auth, {\n                \"App.useEffect.unsubscribe\": (user)=>{\n                    setAuthChecked(true);\n                    const isPublicPath = publicPaths.includes(router.pathname);\n                    if (!user && !isPublicPath) {\n                        // 如果用戶未登入且不在公開頁面，重定向到登入頁\n                        router.push('/');\n                    } else if (user && isPublicPath && router.pathname !== '/register') {\n                        // 如果用戶已登入且在登入頁，重定向到 LibraryPage\n                        router.push('/LibraryPage');\n                    }\n                }\n            }[\"App.useEffect.unsubscribe\"]);\n            return ({\n                \"App.useEffect\": ()=>unsubscribe()\n            })[\"App.useEffect\"];\n        }\n    }[\"App.useEffect\"], [\n        router.pathname\n    ]);\n    // 在認證狀態檢查完成前不渲染內容\n    if (!authChecked) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"min-h-screen flex items-center justify-center\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500\"\n            }, void 0, false, {\n                fileName: \"E:\\\\teacoo\\\\src\\\\pages\\\\_app.tsx\",\n                lineNumber: 44,\n                columnNumber: 7\n            }, this)\n        }, void 0, false, {\n            fileName: \"E:\\\\teacoo\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 43,\n            columnNumber: 12\n        }, this);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_i18next__WEBPACK_IMPORTED_MODULE_1__.I18nextProvider, {\n        i18n: _i18n__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"E:\\\\teacoo\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 50,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"E:\\\\teacoo\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 49,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNnRDtBQUNyQjtBQUNhO0FBQ0k7QUFDTztBQUNoQjtBQUVuQyxPQUFPO0FBQ3NCO0FBQzdCLGFBQWE7QUFDaUM7QUFDUTtBQUN0RCxRQUFRO0FBQzRCO0FBRXBDLGFBQWE7QUFDYixNQUFNTyxjQUFjO0lBQUM7SUFBSztDQUFZO0FBRXZCLFNBQVNDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDNUQsTUFBTUMsU0FBU1Qsc0RBQVNBO0lBQ3hCLE1BQU0sQ0FBQ1UsYUFBYUMsZUFBZSxHQUFHVCwrQ0FBUUEsQ0FBQztJQUUvQ0QsZ0RBQVNBO3lCQUFDO1lBQ1IsTUFBTVcsY0FBY1QsaUVBQWtCQSxDQUFDQywyQ0FBSUE7NkNBQUUsQ0FBQ1M7b0JBQzVDRixlQUFlO29CQUNmLE1BQU1HLGVBQWVULFlBQVlVLFFBQVEsQ0FBQ04sT0FBT08sUUFBUTtvQkFFekQsSUFBSSxDQUFDSCxRQUFRLENBQUNDLGNBQWM7d0JBQzFCLHlCQUF5Qjt3QkFDekJMLE9BQU9RLElBQUksQ0FBQztvQkFDZCxPQUFPLElBQUlKLFFBQVFDLGdCQUFnQkwsT0FBT08sUUFBUSxLQUFLLGFBQWE7d0JBQ2xFLGdDQUFnQzt3QkFDaENQLE9BQU9RLElBQUksQ0FBQztvQkFDZDtnQkFDRjs7WUFFQTtpQ0FBTyxJQUFNTDs7UUFDZjt3QkFBRztRQUFDSCxPQUFPTyxRQUFRO0tBQUM7SUFFcEIsa0JBQWtCO0lBQ2xCLElBQUksQ0FBQ04sYUFBYTtRQUNoQixxQkFBTyw4REFBQ1E7WUFBSUMsV0FBVTtzQkFDcEIsNEVBQUNEO2dCQUFJQyxXQUFVOzs7Ozs7Ozs7OztJQUVuQjtJQUVBLHFCQUNFLDhEQUFDckIsMERBQWVBO1FBQUNDLE1BQU1BLDZDQUFJQTtrQkFDekIsNEVBQUNRO1lBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7QUFHOUIiLCJzb3VyY2VzIjpbIkU6XFx0ZWFjb29cXHNyY1xccGFnZXNcXF9hcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCdcclxuaW1wb3J0IHsgSTE4bmV4dFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtaTE4bmV4dCc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uL2kxOG4nO1xyXG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcic7XHJcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IG9uQXV0aFN0YXRlQ2hhbmdlZCB9IGZyb20gJ2ZpcmViYXNlL2F1dGgnO1xyXG5pbXBvcnQgeyBhdXRoIH0gZnJvbSAnLi4vZmlyZWJhc2UnO1xyXG5cclxuLy8g5YWo5bGA5qij5byPXHJcbmltcG9ydCAnQC9zdHlsZXMvZ2xvYmFscy5jc3MnXHJcbi8vIEFHIEdyaWQg5qij5byPXHJcbmltcG9ydCAnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJztcclxuaW1wb3J0ICdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcyc7XHJcbi8vIOiHquWumue+qeaoo+W8j1xyXG5pbXBvcnQgJy4uL3N0eWxlcy9hZ0dyaWRDdXN0b20uY3NzJztcclxuXHJcbi8vIOS4jemcgOimgeiqjeitieeahOmggemdoui3r+W+kVxyXG5jb25zdCBwdWJsaWNQYXRocyA9IFsnLycsICcvcmVnaXN0ZXInXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XHJcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XHJcbiAgY29uc3QgW2F1dGhDaGVja2VkLCBzZXRBdXRoQ2hlY2tlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCB1bnN1YnNjcmliZSA9IG9uQXV0aFN0YXRlQ2hhbmdlZChhdXRoLCAodXNlcikgPT4ge1xyXG4gICAgICBzZXRBdXRoQ2hlY2tlZCh0cnVlKTtcclxuICAgICAgY29uc3QgaXNQdWJsaWNQYXRoID0gcHVibGljUGF0aHMuaW5jbHVkZXMocm91dGVyLnBhdGhuYW1lKTtcclxuXHJcbiAgICAgIGlmICghdXNlciAmJiAhaXNQdWJsaWNQYXRoKSB7XHJcbiAgICAgICAgLy8g5aaC5p6c55So5oi25pyq55m75YWl5LiU5LiN5Zyo5YWs6ZaL6aCB6Z2i77yM6YeN5a6a5ZCR5Yiw55m75YWl6aCBXHJcbiAgICAgICAgcm91dGVyLnB1c2goJy8nKTtcclxuICAgICAgfSBlbHNlIGlmICh1c2VyICYmIGlzUHVibGljUGF0aCAmJiByb3V0ZXIucGF0aG5hbWUgIT09ICcvcmVnaXN0ZXInKSB7XHJcbiAgICAgICAgLy8g5aaC5p6c55So5oi25bey55m75YWl5LiU5Zyo55m75YWl6aCB77yM6YeN5a6a5ZCR5YiwIExpYnJhcnlQYWdlXHJcbiAgICAgICAgcm91dGVyLnB1c2goJy9MaWJyYXJ5UGFnZScpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gKCkgPT4gdW5zdWJzY3JpYmUoKTtcclxuICB9LCBbcm91dGVyLnBhdGhuYW1lXSk7XHJcblxyXG4gIC8vIOWcqOiqjeitieeLgOaFi+aqouafpeWujOaIkOWJjeS4jea4suafk+WFp+WuuVxyXG4gIGlmICghYXV0aENoZWNrZWQpIHtcclxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFuaW1hdGUtc3BpbiByb3VuZGVkLWZ1bGwgaC04IHctOCBib3JkZXItYi0yIGJvcmRlci1ibHVlLTUwMFwiPjwvZGl2PlxyXG4gICAgPC9kaXY+O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxJMThuZXh0UHJvdmlkZXIgaTE4bj17aTE4bn0+XHJcbiAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cclxuICAgIDwvSTE4bmV4dFByb3ZpZGVyPlxyXG4gICk7XHJcbn0gIl0sIm5hbWVzIjpbIkkxOG5leHRQcm92aWRlciIsImkxOG4iLCJ1c2VSb3V0ZXIiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIm9uQXV0aFN0YXRlQ2hhbmdlZCIsImF1dGgiLCJwdWJsaWNQYXRocyIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInJvdXRlciIsImF1dGhDaGVja2VkIiwic2V0QXV0aENoZWNrZWQiLCJ1bnN1YnNjcmliZSIsInVzZXIiLCJpc1B1YmxpY1BhdGgiLCJpbmNsdWRlcyIsInBhdGhuYW1lIiwicHVzaCIsImRpdiIsImNsYXNzTmFtZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/styles/agGridCustom.css":
/*!*************************************!*\
  !*** ./src/styles/agGridCustom.css ***!
  \*************************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "firebase/app":
/*!*******************************!*\
  !*** external "firebase/app" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/app");;

/***/ }),

/***/ "firebase/auth":
/*!********************************!*\
  !*** external "firebase/auth" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/auth");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "i18next":
/*!**************************!*\
  !*** external "i18next" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = import("i18next");;

/***/ }),

/***/ "i18next-browser-languagedetector":
/*!***************************************************!*\
  !*** external "i18next-browser-languagedetector" ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("i18next-browser-languagedetector");;

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react-i18next":
/*!********************************!*\
  !*** external "react-i18next" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-i18next");;

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc","vendor-chunks/ag-grid-community"], () => (__webpack_exec__("(pages-dir-node)/./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();