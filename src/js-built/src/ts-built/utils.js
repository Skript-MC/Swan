"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function padNumber(x) {
    return (x.toString().length < 2 ? "0" + x : x).toString();
}
exports.padNumber = padNumber;
function formatDate(date) {
    let end;
    if (date.getDate() === new Date(Date.now()).getDate())
        end = `aujourd'hui à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
    else if (date.getDate() - 1 === new Date(Date.now()).getDate())
        end = `demain à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
    else
        end = `le ${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${padNumber(date.getFullYear())} à ${padNumber(date.getHours())}h${padNumber(date.getMinutes())}'${padNumber(date.getSeconds())}`;
    return end;
}
exports.formatDate = formatDate;
