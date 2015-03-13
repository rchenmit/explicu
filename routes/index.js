var express = require('express');
var router = express.Router();
var mongo_conn="mongodb://localhost:27017/explicu";
//var mongo_conn="mongodb://readonly:readonly@ds049631.mongolab.com:49631/heroku_app33408747";
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
  res.render('filter', { title: 'explICU' , menu: 'Filter' });
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
    'Marital Status':{
        type:'multiselect',
        options:['MARRIED','SINGLE','WIDOWED','DIVORCED','SEPARATED','UNKNOWN','LIFE PARTNER']
    },
    Race:{
        type:'multiselect',
        options:["WHITE","ASIAN","BLACK","UNKNOWN","OTHER","MULTI RACE ETHNICITY","AMERICAN INDIAN","PACIFIC ISLANDER"]
    },
    Religion:{
        type:'multiselect',
        options:['EPISCOPALIAN','GREEK ORTHODOX','JEWISH','OTHER','BUDDHIST','PROTESTANT QUAKER','CATHOLIC','NOT SPECIFIED','UNOBTAINABLE']
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
            query_obj[key+'.content']={'$in':selected_content};
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
      db.collection('patients').find(query_obj).count(function(err, count) {
        if(err) { 
            console.log(err); 
            res.send(JSON.stringify([]));  
            return; 
        }
        ret['count']=count;
        var chosen_cols={pid:1,'Marital Status':1,Race:1,Religion:1,Age:1,Sex:1,Mortality:1,_id:0};
        db.collection('patients').find(query_obj,chosen_cols).limit(100).toArray(function(err, items) {
          if(err) { 
            console.log(err); 
            res.send(JSON.stringify([]));  
            return; 
          }          
          var patients_reshaped=[];
          for (var i=0;i<items.length;i++){
            var pt=[];
            pt.push(items[i]['Marital Status']);
            pt.push(items[i]['Race']);
            pt.push(items[i]['Religion']);
            pt.push(items[i]['Age']);
            pt.push(items[i]['Sex']);
            pt.push(items[i]['Mortality']);
            var html='<a href="javascript:show_events('+items[i]['pid']+')">Show Events</a>';
            pt.push(html);
            patients_reshaped.push(pt);
          }
          ret['patients']=patients_reshaped;
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
            event.start=pt['DOD'];
            event.className='red';
            events.push(event);
          }
          res.send(JSON.stringify(events));  
      })
    });
})

module.exports = router;
