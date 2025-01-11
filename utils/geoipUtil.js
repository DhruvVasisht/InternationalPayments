import geoip from "geoip-lite";

export const getUserCountry = (ip) => {
  const geo = geoip.lookup(ip);
  return geo ? geo.country : "IN"; 
};