const moment = require('moment')
const tz = require('moment-timezone')

function removeMinutes(horas, intervalo) {
    moment.locale('pt');
    var format = moment(horas, 'HH:mm');
    var formatintervalo = moment(format).subtract(intervalo, 'm')
    return formatintervalo.format('HH:mm');
}

function addMinutes(horas, intervalo) {
    moment.locale('pt');
    var format = moment(horas, 'HH:mm');
    var formatintervalo = moment(format).add(intervalo, 'm')
    return formatintervalo.format('HH:mm');
}

function horasAtuais() {
    moment.locale('pt');
    return moment().tz('Europe/Lisbon').format('HH:mm');
}

function addAtuais(n) {
    moment.locale('pt');
    return moment().tz('Europe/Lisbon').add(n, 'hour').format('HH:mm');
}

function todayDate(){
    moment.locale('pt');
    return moment().tz('Europe/Lisbon').format('YYYY-MM-DD');
}

function addToDate(n){
    moment.locale('pt');
    return moment(moment().tz('Europe/Lisbon').add(n, 'days')).format('YYYY-MM-DD')
}

function getFriday(){
    moment.locale('pt');
    return moment().tz('Europe/Lisbon').day(moment().tz('Europe/Lisbon').day() >= 5 ? 5 :-2).format("yyyy-MM-DD");
}

function getMonth(data){
    moment.locale('pt');
    return moment(moment(data).tz('Europe/Lisbon')).format('MM')
}

function getYear(){
    moment.locale('pt');
    return moment(moment().tz('Europe/Lisbon')).format('YYYY')
}

function removeDuplicates(arr, n)
{
    // Return, if array is empty
    // or contains a single element
    if (n==0 || n==1)
        return n;
 
    var temp = new Array(n);
 
    // Start traversing elements
    var j = 0;
    for (var i=0; i<n-1; i++)
 
        // If current element is not equal
        // to next element then store that
        // current element
        if (arr[i] != arr[i+1])
            temp[j++] = arr[i];
 
    // Store the last element as whether
    // it is unique or repeated, it hasn't
    // stored previously
    temp[j++] = arr[n-1];
 
    // Modify original array
    for (var i=0; i<j; i++)
        arr[i] = temp[i];
 
    return j;
}

module.exports = { removeMinutes, horasAtuais, todayDate, addToDate, getFriday, getMonth, getYear, addMinutes, removeDuplicates, addAtuais }