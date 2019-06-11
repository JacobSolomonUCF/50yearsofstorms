export function getHurricanes(year){
  return fetch(`https://29pbedcrvh.execute-api.us-east-1.amazonaws.com/default/get?year=${year}`)
    .then(response => response.json())
    .then(result => result);
}
