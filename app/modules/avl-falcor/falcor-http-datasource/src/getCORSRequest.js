const xhr = require('xmlhttprequest');

'use strict';
// Get CORS support even for older IE
module.exports = function getCORSRequest() {
    var request = null; 
    if(global.XMLHttpRequest) {
        //browser
        request =  new global.XMLHttpRequest()
    } else {
        // server
        request = new xhr.XMLHttpRequest()
    }   
    if ('withCredentials' in request) {
        return request;
    } else if (!!global.XDomainRequest) {
        return new XDomainRequest();
    } else {
        throw new Error('CORS is not supported by your browser');
    }
};