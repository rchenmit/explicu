'''
Load DEMOGRAPHIC_DETAIL.csv using mongo's loading util: 
$ mongoimport --type csv -d explicu --collection patients --file ~/explicu-ETL/csv/DEMOGRAPHIC_DETAIL.csv --headerline --upsert --upsertFields pid

Connect to remote mongo:
$mongo --host ds049631.mongolab.com --port 49631 -u lifan -p lifan heroku_app33408747
'''

import pymongo,csv
from dateutil import parser

"mongodb://readonly:readonly@ds049631.mongolab.com:49631/heroku_app33408747"
#client = pymongo.MongoClient('localhost', 27017)
#db = client['explicu']
client = pymongo.MongoClient('ds049631.mongolab.com',49631)
client['heroku_app33408747'].authenticate('lifan', 'lifan')
db=client['heroku_app33408747']

#Also create index: 
#db['patients'].ensure_index('pid',background=False,unique=True)

csvfile=open('/home/zzxx53/explicu-ETL/csv/DEMOGRAPHIC_DETAIL.csv', 'rb')
reader = csv.DictReader(csvfile)
for row in reader:
    pt=db.patients.find_one({'pid':int(row['pid'])})
    if pt==None:
        db.patients.save(row)


csvfile=open('/home/zzxx53/explicu-ETL/csv/D_PATIENTS.csv', 'rb')
reader = csv.DictReader(csvfile)
i=0
for row in reader:
    print row['pid']
    pt=db.patients.find_one({'pid':int(row['pid'])})
    if pt==None:
        pt={'pid':row['pid']}
    for item in row.keys():
        if item=='pid':
            continue
        if (item=='DOB' or item=='DOD') and item!='':
            pt[item]=parser.parse(row[item])
        else:
            pt[item]=row[item]
    db.patients.save(pt)
    
csvfile=open('/home/zzxx53/explicu-ETL/csv/PROCEDURE_BOOLEAN.csv', 'rb')
reader = csv.DictReader(csvfile)
for row in reader:
    row['subject_id']=int(row['subject_id'])
    pt=db.patients.find_one({'pid':row['subject_id']})
    if pt==None:
        pt={'pid':row['subject_id']}
    if 'procedures' not in pt.keys():
        pt['procedures']=[]
    pt['procedures'].append({'content':'PROC'+row['itemid'],'start':parser.parse(row['proc_dt'])})
    db.patients.save(pt)
    
csvfile=open('/home/zzxx53/explicu-ETL/csv/MEDICATION_JOINED_BOOLEAN.csv', 'rb')
reader = csv.DictReader(csvfile)
for row in reader:
    row['subject_id']=int(row['subject_id'])
    pt=db.patients.find_one({'pid':row['subject_id']})
    if pt==None:
        pt={'pid':row['subject_id']}
    if 'medication' not in pt.keys():
        pt['medication']=[]
    pt['medication'].append({'content':row['med_name'],'start':parser.parse(row['date'])})
    db.patients.save(pt)
    
icd9_db={}    
csvfile=open('/home/zzxx53/explicu-ETL/csv/ICD9-2-PheWAS.csv', 'rb')
reader = csv.reader(csvfile)
for row in reader:
    icd9_db[row[0]]=row[1]

    
csvfile=open('/home/zzxx53/explicu-ETL/csv/DIAGNOSTIC.csv', 'rb')
reader = csv.DictReader(csvfile)
for row in reader:
    row['subject_id']=int(row['subject_id'])
    pt=db.patients.find_one({'pid':row['subject_id']})
    if pt==None:
        pt={'pid':row['subject_id']}
    if 'ICD9 Code' not in pt.keys():
        pt['ICD9 Code']=[]
    try:
        icd9_descr=' '+icd9_db[row['code']]
    except:
        icd9_descr=''
    pt['ICD9 Code'].append({'content':row['code']+icd9_descr,'start':parser.parse(row['date'])})
    db.patients.save(pt)    


#Mortality    
csvfile=open('/home/zzxx53/explicu-ETL/csv/MORTALITY_NULL.csv', 'rb')
reader = csv.DictReader(csvfile)
for row in reader:
    row['subject_id']=int(row['subject_id'])
    pt=db.patients.find_one({'pid':row['subject_id']})
    if pt==None:
        pt={'pid':row['subject_id']}
    pt['Mortality']='No'
    db.patients.save(pt)

csvfile=open('/home/zzxx53/explicu-ETL/csv/MORTALITY_ONEYEAR.csv', 'rb')
reader = csv.DictReader(csvfile)
for row in reader:
    row['subject_id']=int(row['subject_id'])
    pt=db.patients.find_one({'pid':row['subject_id']})
    if pt==None:
        pt={'pid':row['subject_id']}
    pt['Mortality']='1 Year'
    db.patients.save(pt)

csvfile=open('/home/zzxx53/explicu-ETL/csv/MORTALITY_MORETHANONEYEAR.csv', 'rb')
reader = csv.DictReader(csvfile)
for row in reader:
    row['subject_id']=int(row['subject_id'])
    pt=db.patients.find_one({'pid':row['subject_id']})
    if pt==None:
        pt={'pid':row['subject_id']}
    pt['Mortality']='1 Year+'
    db.patients.save(pt)
    
#clean up inputs
import re
cursor=db.patients.find()
for pt in cursor:
    write=False
    if 'Marital Status' in pt.keys():
        if pt['Marital Status']=='':
            pt['Marital Status']='UNKNOWN'
            write=True
        if pt['Marital Status']=='UNKNOWN (DEFAULT)':
            pt['Marital Status']='UNKNOWN'
            write=True
    else:
        pt['Marital Status']='UNKNOWN'
        write=True
    special_races=["PATIENT DECLINED TO ANSWER","MULTI RACE ETHNICITY","AMERICAN INDIAN/ALASKA NATIVE",
        "UNABLE TO OBTAIN","PORTUGUESE","SOUTH AMERICAN","NATIVE HAWAIIAN OR OTHER PACIFIC ISLAND",
        "MIDDLE EASTERN","CARIBBEAN ISLAND"]
    if 'Race' in pt.keys():
        race=pt['Race']
        if race in special_races:
            write=True
            if race=="PATIENT DECLINED TO ANSWER" or race=="UNABLE TO OBTAIN":
                pt['Race']='UNKNOWN'
            if race=="AMERICAN INDIAN/ALASKA NATIVE":
                pt['Race']="AMERICAN INDIAN"
            if race=="NATIVE HAWAIIAN OR OTHER PACIFIC ISLAND":
                pt['Race']="PACIFIC ISLANDER"  
            if race== "SOUTH AMERICAN" or race==  "CARIBBEAN ISLAND":
                pt['Race']="HISPANIC"
            if race== "PORTUGUESE":
                pt['Race']="WHITE"
            if race=="MIDDLE EASTERN":
                pt['Race']="ASIAN"
        else:
            race_arr=re.split('[ /]',race)
            if len(race_arr)>1:
                pt['Race']=race_arr[0]
                write=True
    else:
        pt['Race']='UNKNOWN'
        write=True
    if write:
        db.patients.save(pt)

#More indices
db['patients'].ensure_index('Sex',background=False)
db['patients'].ensure_index('Marital_Status',background=False)
db['patients'].ensure_index('Race',background=False)
db['patients'].ensure_index('Religion',background=False)
db['patients'].ensure_index('Race',background=False)
db['patients'].ensure_index('medication',background=False)
db['patients'].ensure_index('ICD9 Code',background=False)
db['patients'].ensure_index('Mortality',background=False)   

#calculate age
cursor=db.patients.find()
for pt in cursor:
    age_timedelta=pt['DOD']-pt['DOB']
    age=age_timedelta.days/365
    if age<0:
        del pt['DOD']
    else:
        pt['Age']=age
    db.patients.save(pt)
    
db['patients'].ensure_index('Age',background=False) 





#some extra cleanup; run in mongo shell
db.patients.update({},{'$rename':{'medication':'Medication','Marital_Status':'Marital Status'}},{'multi':true})

db['patients'].ensure_index('Marital Status',background=False)
db['patients'].ensure_index('Medication',background=False)

db['patients'].distinct('Marital Status') 
db['patients'].distinct('Race') 

#generate ICD9 code table
import os,json    
icd9_db_list=[]
for icd9 in icd9_db.keys():
    icd9_db_list.append(icd9+' '+icd9_db[icd9])
f = os.open('/home/zzxx53/explicu/public/icd9.json', os.O_WRONLY|os.O_CREAT)
os.write(f,json.dumps(icd9_db_list))
os.close(f)

medication_list=[]
csvfile=open('/home/zzxx53/explicu-ETL/csv/D_MEDITEMS.csv','r')
reader = csv.reader(csvfile)
for row in reader:
    medication_list.append(row[1])

f = os.open('/home/zzxx53/explicu/public/medication.json', os.O_WRONLY|os.O_CREAT|os.O_TRUNC)
os.write(f,json.dumps(medication_list))
os.close(f)
    
#recompute age
csvfile=open('/home/zzxx53/explicu-ETL/csv/DIAGNOSTIC2.csv', 'rb')
reader = csv.DictReader(csvfile)
computed_ids=[]
for row in reader:
     subject_id=int(row['subject_id'])
     if subject_id in computed_ids:
        continue
     computed_ids.append(subject_id)
     date=parser.parse(row['date'])
     pt=db.patients.find_one({'pid':subject_id})
     if not pt:
        continue
     age_timedelta=date-pt['DOB']
     pt['Age']=age_timedelta.days/365
     db.patients.save(pt)
        
#Elixhauser indicators
#cursor=db.patients.find({'Myocardial infarction':subject_id})   
db.patients.find_one({'ICD9 Code.content':{'$regex':'^41(0|2)\.'}})
#Myocardial infarction
db.patients.update({'ICD9 Code.content':{'$regex':'^41(0|2)\.'}},{'$set':{'Myocardial infarction':'Yes'}},multi=True)    
db.patients.update({'Myocardial infarction':None},{'$set':{'Myocardial infarction':'No'}},multi=True)       
#Congestive heart failure
db.patients.update({'ICD9 Code.content':{'$regex':'^398\.91'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True)    
db.patients.update({'ICD9 Code.content':{'$regex':'^402\.01'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True)      
db.patients.update({'ICD9 Code.content':{'$regex':'^402\.11'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^402\.91'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^404\.01'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^404\.03'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^404\.11'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^404\.13'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^404\.91'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^404\.93'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^425\.[456789]'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'ICD9 Code.content':{'$regex':'^428\.d+'}},{'$set':{'Congestive heart failure':'Yes'}},multi=True) 
db.patients.update({'Congestive heart failure':None},{'$set':{'Congestive heart failure':'No'}},multi=True)  


#rest of elixhauser code in elixhauser.py

#copy database to remote

client_local = pymongo.MongoClient('localhost', 27017)
db_local = client_local['explicu']
client_remote = pymongo.MongoClient('ds049631.mongolab.com',49631)
client_remote['heroku_app33408747'].authenticate('lifan', 'lifan')
db_remote=client_remote['heroku_app33408747']

cursor=db_local.patients.find()
for pt in cursor:
    db_remote.patients.insert(pt)
