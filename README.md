# [50 Years of Storms](https://50yearsofstorms.com/)
(1964-2015) Atlantic hurricane data presented in a interactive way.

Original data source can be found [here](https://www.kaggle.com/noaa/hurricane-database)

![Architecture](https://github.com/JacobSolomonUCF/50yearsofstorms/blob/master/architecture.png?raw=true "Overview")

### Process
The data was parsed using python then was push to a DynamoDB Table. The site is hosted on S3 and server up via Cloudfront. To get the data to the front end there is a API Gateway setup to trigger a Lambda that interacts with the Table. 

### Running locally
 `$ npm i`
 `$ npm run start:dev`
 
### Building for deployment
  `$ npm run build`
