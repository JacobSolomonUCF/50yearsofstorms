console.log('function starts');

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback){
  console.log('processing event: %j', event);

  let scanningParameters = {
    TableName: process.env.TABLE_NAME,
  };

  if(event['queryStringParameters'] && event['queryStringParameters']['year'] ){
    scanningParameters.FilterExpression = "#Year = :id";
    scanningParameters.ExpressionAttributeNames = {
      '#Year': 'year'
    };
    scanningParameters.ExpressionAttributeValues = {
      ":id": parseInt(event['queryStringParameters']['year'])
    };

  }
  console.log(scanningParameters);
  //In dynamoDB scan looks through your entire table and fetches all data
  docClient.scan(scanningParameters, function(err,data){
    if(err){
      // return {
      //   'statusCode': 200,
      //   'headers': { 'Content-Type': 'application/json' },
      //   'body': 'error'
      // };
      callback(err, { "statusCode" : 200, "body" : 'ERROR'});
    }else{
      callback(err, { "statusCode" : 200, "body" : JSON.stringify(data)});
      // callback(null,data);
      // return {
      //   'statusCode': 200,
      //   'headers': { 'Content-Type': 'application/json' },
      //   'body': 'GOOD'
      // }
    }
  });
}