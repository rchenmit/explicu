var express = require('express');
var router = express.Router();
//var mongo_conn="mongodb://localhost:27017/explicu";
var mongo_conn="mongodb://readonly:readonly@ds049631.mongolab.com:49631/heroku_app33408747";
var MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'explICU', menu:'Home' });
});

/* GET background page. */
router.get('/background', function(req, res) {
  res.render('background', { title: 'explICU', menu:'Background Info' });
});

/* GET timeline page. */
router.get('/timelines', function(req, res) {
  res.render('timelines', { title: 'explICU' , menu: 'Timelines' });
});

/* GET clustering page. */
router.get('/clustering', function(req, res) {
  res.render('clustering', { title: 'explICU' , menu: 'Clustering' });
});

/* GET regressions page. */
router.get('/regression', function(req, res) {
  res.render('regression', { title: 'explICU' , menu: 'Regression' });
});

/* GET contact page. */
router.get('/contact', function(req, res) {
  res.render('contact', { title: 'explICU' , menu: 'Contact' });
});

/* Lifan's edit; alternate patient filter page. */
router.get('/filter', function(req, res) {
  res.render('filter', { title: 'explICU' , menu: 'Visualization' });
});

/* API for fetching data from MongoDB*/
var filters={
    Sex:{
        type:'yesno',
        options:['M','F']
    },
    Age:{
        type:'range',
        options:{max:100,min:0,step:1}
    },
    Race:{
        type:'multiselect',
        options:["WHITE","ASIAN","BLACK","UNKNOWN","OTHER","MULTI RACE ETHNICITY","AMERICAN INDIAN","PACIFIC ISLANDER"]
    },
    'Medication':{
        type:'multiselect_autocomplete',
        options:{id:'medication'}
    },
    'ICD9 Code':{
        type:'multiselect_autocomplete',
        options:{id:'icd9'}
    },
    Mortality:{
        type:'multiselect',
        options:['No','1 Year','1 Year+']
    },
    'Myocardial infarction':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Congestive heart failure':{
        type:'yesno',
        options:['Yes','No']
    },
    'Peripheral vascular disease':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Cerebrovascular disease':{
        type:'yesno',
        options:['Yes','No']
    },
    'Dementia':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Chronic pulmonary disease':{
        type:'yesno',
        options:['Yes','No']
    },
    'Rheumatic disease':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Peptic ulcer disease':{
        type:'yesno',
        options:['Yes','No']
    },
    'Mild liver disease':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Diabetes without chronic complication':{
        type:'yesno',
        options:['Yes','No']
    },
    'Diabetes with chronic complication':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Hemiplegia or paraplegia':{
        type:'yesno',
        options:['Yes','No']
    },
    'Renal disease':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Any malignancy':{
        type:'yesno',
        options:['Yes','No']
    },
    'Moderate or severe liver disease':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Metastatic solid tumor':{
        type:'yesno',
        options:['Yes','No']
    },
    'AIDS or HIV':{
        type:'yesno',
        options:['Yes','No']
    },    
    'Cardiac arrhythmias':{
        type:'yesno',
        options:['Yes','No']
    },
    'Valvular disease':{
        type:'yesno',
        options:['Yes','No']
    },
    'Pulmonary circulation disorders':{
        type:'yesno',
        options:['Yes','No']
    },
    'Peripheral vascular disorders':{
        type:'yesno',
        options:['Yes','No']
    },
    'Hypertension, uncomplicated':{
        type:'yesno',
        options:['Yes','No']
    },
    'Paralysis':{
        type:'yesno',
        options:['Yes','No']
    },
    'Other neurological disorders':{
        type:'yesno',
        options:['Yes','No']
    },
    'Chronic pulmonary disease':{
        type:'yesno',
        options:['Yes','No']
    },
    'Diabetes, uncomplicated':{
        type:'yesno',
        options:['Yes','No']
    },
    'Diabetes, complicated':{
        type:'yesno',
        options:['Yes','No']
    },
    'Hypothyroidism':{
        type:'yesno',
        options:['Yes','No']
    },
    'Renal failure':{
        type:'yesno',
        options:['Yes','No']
    },
    'Liver disease':{
        type:'yesno',
        options:['Yes','No']
    },
    'Peptic Ulcer Disease excluding bleeding':{
        type:'yesno',
        options:['Yes','No']
    },
    'Lymphoma':{
        type:'yesno',
        options:['Yes','No']
    },
    'Metastatic cancer':{
        type:'yesno',
        options:['Yes','No']
    },
    'Solid tumor without metastasis':{
        type:'yesno',
        options:['Yes','No']
    },
    'Rheumatoid arthritis or collagen vascular disease':{
        type:'yesno',
        options:['Yes','No']
    },
    'Coagulopathy':{
        type:'yesno',
        options:['Yes','No']
    },
    'Obesity':{
        type:'yesno',
        options:['Yes','No']
    },
    'Weight loss':{
        type:'yesno',
        options:['Yes','No']
    },
    'Fluid and electrolyte disorders':{
        type:'yesno',
        options:['Yes','No']
    },
    'Blood loss anemia':{
        type:'yesno',
        options:['Yes','No']
    },
    'Deficiency anemia':{
        type:'yesno',
        options:['Yes','No']
    },
    'Alcohol Abuse':{
        type:'yesno',
        options:['Yes','No']
    },
    'Drug abuse':{
        type:'yesno',
        options:['Yes','No']
    },
    'Psychoses':{
        type:'yesno',
        options:['Yes','No']
    },
    'Depression':{
        type:'yesno',
        options:['Yes','No']
    }
};

function build_query(filters,filter_state,query_obj){
  for (key in filter_state){
    if (!(key in filters)){
        continue;
    }
    if (filters[key]['type']==='multiselect' || filters[key]['type']==='yesno'){
        if (filter_state[key].length==0 || filter_state[key].length==filters[key]['options'].length){
            continue;
        }
        var selected_content=[];
        for (var i=0;i<filter_state[key].length;i++){
            selected_content.push(filter_state[key][i]);
        }
        query_obj[key]={'$in':selected_content};
    } else if (filters[key]['type']==='range'){
        if (!(filter_state[key]['max']===filters[key]['max'] && filter_state[key]['min']===filters[key]['min']) ){
            query_obj[key]={'$gte':filter_state[key]['min'],'$lte':filter_state[key]['max']};
        }
    } else if (filters[key]['type']==='multiselect_autocomplete'){
        if (filter_state[key].length>0){
            var selected_content=[]
            for (var i=0;i<filter_state[key].length;i++){
                selected_content.push(filter_state[key][i]);
            }
            if (key==='Medication' || key==='ICD9 Code'){
                var key_alt=key+'.content';
            } else {
                key_alt=key;
            }
            query_obj[key_alt]={'$in':selected_content};
        }
    }  
  }
}

router.post('/api/filter',function(req,res){
    var filter_state=JSON.parse(req.body.filter_state);
    MongoClient.connect(mongo_conn, function(err, db) {
        if(err) { 
            console.log(err); 
            res.send(JSON.stringify([])); 
            return; 
        }
        var query_obj={};
        build_query(filters,filter_state,query_obj);
        var ret={};
        var chosen_cols={pid:1,Race:1,Age:1,Sex:1,Mortality:1,_id:0};
        db.collection('patients').find(query_obj,chosen_cols).limit(100).toArray(function(err, items) {
          if(err) { 
            console.log(err); 
            res.send(JSON.stringify([]));  
            return; 
          }          
          var patients_reshaped=[];
          for (var i=0;i<items.length;i++){
            var pt=[];
            pt.push(items[i]['Race']);
            pt.push(items[i]['Age']);
            pt.push(items[i]['Sex']);
            pt.push(items[i]['Mortality']);
            var html='<button class="btn btn-default" onclick="show_history('+items[i]['pid']+',this)">Show Medical History</button>';
            pt.push(html);
            html='<button class="btn btn-default" onclick="show_events('+items[i]['pid']+')">Show Events</button>';
            pt.push(html);
            patients_reshaped.push(pt);
          }
          ret['patients']=patients_reshaped;
          db.collection('patients').aggregate([
            { $match:query_obj},
            { $group: { _id: "$Mortality", total: { $sum: 1 } } }
          ],function(err,result){
            if(err) { 
              console.log(err); 
              res.send(JSON.stringify([]));  
              return; 
            }
            var count=0;
            ret['mortality_stat']={}
            for (var i=0;i<result.length;i++){
                var cat=result[i]._id;
                ret['mortality_stat'][cat]=result[i].total;
                count+=result[i].total;
            }
            ret['count']=count;
            res.send(JSON.stringify(ret));  
          })
          
        })
    });
})

router.get('/api/autocomplete/:id',function(req,res){
    var id=req.params.id;
    if (id==='icd9'){
        res.redirect("/icd9.json");
    } else if (id==='medication'){
        res.redirect("/medication.json");
    } else {
        res.send(JSON.stringify([]));  
    }

})

router.get('/api/timeline/:pid',function(req,res){
    var pid=parseInt(req.params.pid)
    MongoClient.connect(mongo_conn, function(err, db) {
      if(err) { 
        console.log(err); 
        res.send(JSON.stringify([])); 
        return;  
      }
      db.collection('patients').findOne({'pid':pid},function(err,pt){
          if(err || !pt) { 
            console.log(err); 
            res.send(JSON.stringify([])); 
            return;  
          }
          var events=[]
          var event_count=0;
          items=['ICD9 Code','Medication','procedures']
          for (var i=0;i<items.length;i++){
              if (items[i] in pt && pt[items[i]]!=undefined){
                var item = items[i];
                for (var j=0;j<pt[item].length;j++){
                    event_count++;
                    var event=pt[items[i]][j];
                    event.id=event_count;
                    if (item==='ICD9 Code'){
                        event.className='';
                    } else if (item==='Medication'){
                        event.className='green';
                    } else if (item==='procedures'){
                        event.className='orange';
                    }
                    events.push(event);
                }
              }
          }
          if ('DOD' in pt && pt['DOD'] != undefined){
            var event={id:++event_count};
            event.content='Mortality'
            var dod=pt['DOD'];
            dod.setDate(dod.getDate() + 1); 
            event.start=dod;
            event.className='red';
            events.push(event);
          }
          res.send(JSON.stringify(events));  
      })
    });
})

var elixhauser=['Cerebrovascular disease', 'Peripheral vascular disease', 'Peptic ulcer disease', 'Hemiplegia or paraplegia', 'Other neurological disorders', 'AIDS or HIV', 'Coagulopathy', 'Renal failure', 'Moderate or severe liver disease', 'Obesity', 'Any malignancy', 'Psychoses', 'Metastatic solid tumor', 'Hypothyroidism', 'Diabetes, complicated', 'Diabetes, uncomplicated', 'Solid tumor without metastasis', 'Drug abuse', 'Diabetes with chronic complication', 'Diabetes without chronic complication', 'Deficiency anemia', 'Lymphoma', 'Peripheral vascular disorders', 'Fluid and electrolyte disorders', 'Valvular disease', 'Renal disease', 'Paralysis', 'Cardiac arrhythmias', 'Hypertension, uncomplicated', 'Alcohol Abuse', 'Rheumatoid arthritis or collagen vascular disease', 'Myocardial infarction', 'Peptic Ulcer Disease excluding bleeding', 'Liver disease', 'Depression', 'Weight loss', 'Mild liver disease', 'Pulmonary circulation disorders', 'Blood loss anemia', 'Metastatic cancer', 'Dementia', 'Rheumatic disease', 'Chronic pulmonary disease', 'Congestive heart failure'];

router.get('/api/elixhauser/:pid',function(req,res){
    var pid=parseInt(req.params.pid)
    MongoClient.connect(mongo_conn, function(err, db) {
      if(err) { 
        console.log(err); 
        res.send(JSON.stringify([])); 
        return;  
      }
      db.collection('patients').findOne({'pid':pid},function(err,pt){
          var output=[]
          for (var i=0;i<elixhauser.length;i++){
            if (pt[elixhauser[i]]==='Yes'){
                output.push(elixhauser[i]);
            }
          }
          res.send(JSON.stringify(output));  
      })
    })
})
module.exports = router;
