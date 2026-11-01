// Curated Nigerian word dictionary for passphrases (Yoruba, Igbo, Hausa, Pidgin, places, foods).
export const NG_WORDS = [
  "jollof","suya","egusi","ogbono","amala","eba","fufu","moimoi","akara","puffpuff","chinchin","zobo","kunu","fura","tuwo","masa","dodo","efo","ofada","abacha",
  "okpa","nkwobi","isiewu","ofe","banga","edikaikong","afang","kilishi","garri","boli","ewa","agege","asun","ugba","ukwa",
  "lagos","abuja","umuahia","enugu","owerri","kano","kaduna","ibadan","calabar","uyo","jos","benin","warri","aba","onitsha","abeokuta","ilorin","sokoto","yola","makurdi","lokoja","asaba","akure","osogbo","bauchi","gombe","minna","awka","ikeja","lekki","ikoyi","yaba","surulere","maitama","wuse","asokoro","gwarinpa","trans","rumuola",
  "oga","madam","wahala","jara","shakara","gbedu","owambe","danfo","okada","keke","naija","ehen","abeg","oya","sabi","chop","kpatakpata","gidi","yawa","shayo","aso","ebi","agbada","gele","buba","iro","isiagu","babanriga","kaftan",
  "omo","ola","ade","ayo","femi","tunde","bisi","sade","ngozi","chidi","emeka","ada","obinna","nneka","uche","ifeoma","musa","aisha","fatima","bello","sani","hauwa","zainab","yakubu","ibrahim",
  "niger","benue","zuma","olumo","idanre","ogun","osun","ikogosi","obudu","yankari","kainji","nok","igbo","yoruba","hausa","ijaw","efik","tiv","nupe","edo","itsekiri",
  "naira","kobo","ise","ire","alafia","daalu","nagode","imela","ekaabo","sannu","nnoo","oluwa","chukwu","allah","ubuntu","odogwu","ezinne","ugo","ugwu","oke","ile","oko","ulo","gida",
];
const SET = new Set(NG_WORDS);
export function checkPassphrase(p: string): string | null {
  const words = p.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 2) return "Use 2 or more Nigerian words, separated by spaces.";
  const bad = words.filter((w) => !SET.has(w));
  if (bad.length) return `Not in the Nigerian word list: ${bad.join(", ")}`;
  if (new Set(words).size < 2) return "Use at least 2 different words.";
  return null;
}
export function randomPhrase(n = 2): string {
  const c = require("crypto") as typeof import("crypto");
  return Array.from({ length: n }, () => NG_WORDS[c.randomInt(NG_WORDS.length)]).join(" ");
}
