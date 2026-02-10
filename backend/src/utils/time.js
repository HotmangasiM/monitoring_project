const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const WIB = 'Asia/Jakarta';

// waktu sekarang dalam UTC (untuk DB)
const nowUTC = () =>
  dayjs().utc().format('YYYY-MM-DD HH:mm:ss');


// Convert UTC -> WIB (untuk tampil)
const toWIB = (date) =>
    dayjs.utc(date).tz(WIB).format('YYYY-MM-DD HH:mm:ss');

// waktu sekarang langsung WIB
const nowWIB = () =>
    dayjs().tz(WIB).format('YYYY-MM-DD HH:mm:ss');
// ubah request WIB ke UTC
const fromWIBtoUTC = (dateString) =>
  dayjs.tz(dateString, WIB).utc().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    nowUTC,
    nowWIB,
    toWIB,
    fromWIBtoUTC
}