import csv
import datetime
import boto3
import json
import decimal

hurricanes = {

}

# Format
# {
#   "type": "Feature",
#   "geometry": {
#     "type": "MultiPoint",
#     "coordinates": [/*array of [lng,lat] coordinates*/]
#   },
#   "properties": {
#     "time": [/*array of UNIX timestamps*/]
#   }
# }

def importData():
    with open('64-14_NOAA_Atlantic.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                print(f'Column names are {", ".join(row)}')
                line_count += 1
            else:
                if row[0] in hurricanes:
                    lat = float(row[6][:len(row[6])-1])
                    long = float(row[7][:len(row[7])-1])
                    if 'S' in row[6]:
                        lat = lat * -1
                    if 'W' in row[7]:
                        long = long * -1

                    if int(row[3]) == 0:
                        hour = 0
                        minute = 0
                    elif int(row[3]) == 600:
                        hour = 6
                        minute = 0
                    elif int(row[3]) == 1200:
                        hour = 12
                        minute = 0
                    elif int(row[3]) == 1800:
                        hour = 18
                        minute = 0
                    else:
                        hour = 0
                        minute = 0

                    hurricanes[row[0]]['geoJSON']['properties']['time'].append(int(datetime.datetime(int(row[2][0:4]),int(row[2][4:6]),int(row[2][6:]),hour,minute).strftime('%s'))*1000)
                    hurricanes[row[0]]['geoJSON']['geometry']['coordinates'].append([long,lat])
                    hurricanes[row[0]]['maximumWind'].append(row[8])
                    hurricanes[row[0]]['minimumPressure'].append(row[9])

                else:
                    if int(row[3]) == 0:
                        hour = 0
                        minute = 0
                    elif int(row[3]) == 600:
                        hour = 6
                        minute = 0
                    elif int(row[3]) == 1200:
                        hour = 12
                        minute = 0
                    elif int(row[3]) == 1800:
                        hour = 18
                        minute = 0
                    else:
                        hour = 0
                        minute = 0
                    lat = float(row[6][:len(row[6])-1])
                    long = float(row[7][:len(row[7])-1])
                    if 'S' in row[6]:
                        lat = lat * -1
                    if 'W' in row[7]:
                        long = long * -1
                    hurricanes[row[0]] = {
                        "name": row[1],
                        "year": int(row[2][0:4]),
                        "maximumWind":[
                            row[8]
                        ],
                        "minimumPressure": [
                            row[9]
                        ],
                        "geoJSON":{
                          "type": "Feature",
                          "geometry": {
                            "type": "MultiPoint",
                            "coordinates": [
                                [long,lat]
                            ]
                          },
                          "properties": {
                            "time": [
                                int(datetime.datetime(int(row[2][0:4]),int(row[2][4:6]),int(row[2][6:]),hour,minute).strftime('%s'))*1000
                            ]
                          }
                        }
                    }
                line_count += 1
        print(f'Processed {line_count} lines.')
    print('Last Hurricane')
    # print(str(hurricanes['AL122015']))

def writeData():
    with open("output.js", "w") as output:
        keyArray = []
        for key in hurricanes:
            output.write('var {}={};\n'.format(key,hurricanes[key]))
            keyArray.append(key)
        # output.write('var tracks=[')
        # for item in keyArray:
        #     output.write(key)
        # output.write(']')
def uploadData():
    boto3.setup_default_session(profile_name='personal')
    dynamodb = boto3.resource('dynamodb')


    table = dynamodb.Table('50yearsofstorms')

    for key in hurricanes:
            table.put_item(
               Item={
                    'id': str(key),
                    'geoJSON': str(hurricanes[key]['geoJSON']),
                    'maximumWind':str(hurricanes[key]['maximumWind']),
                    'minimumPressure':str(hurricanes[key]['minimumPressure']),
                    'name': str(hurricanes[key]['name']),
                    'year': int(hurricanes[key]['year']),
                }
            )


if __name__ == "__main__":
    """ This is executed when run from the command line """
    importData()
    # writeData()
    uploadData()
