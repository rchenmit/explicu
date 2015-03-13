var table_init=false;

var filter_state={};

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


function create_individual_form_obj(name,type,options,parent_node,filter_state){
    var name_no_space=name.replace(/ /g, '_');
    var panel=$('\
    <div class="panel panel-default">\
        <div class="panel-heading"> <h4 class="panel-title"><a data-toggle="collapse" data-target="#'+name_no_space+'_panel_container" href="javascript:;">'+name+'</a></h4></div>\
        <div id="'+name_no_space+'_panel_container" class="panel-collapse collapse"><div class="panel-body" ></div></div>\
    </div>\
    ');
    var panel_body=$(panel.children('.panel-collapse').children()[0]);
    if (type==='multiselect'){
        for (var i=0;i<options.length;i++){
            var checkbox=$('<input type="checkbox" name="'+name+'_checkbox" value="'+options[i]+'" checked="checked"> '+options[i]+'</input><br>');
            checkbox.on('click',function(){
                if (this.checked){
                    if (filter_state[name].indexOf($(this).val())<0){
                        filter_state[name].push($(this).val())
                    }
                } else {
                    filter_state[name].splice(filter_state[name].indexOf($(this).val()),1);
                }
                update_page(filter_state);
            })
            panel_body.append(checkbox);
        }
        parent_node.append(panel);
    } else if (type==='range'){
        var slider=$('<b>'+options.min+'</b> \xa0\xa0 <input id="'+name_no_space+'_slider" type="text" class="span3" value="" data-slider-min="'+options.min+'" data-slider-max="'+options.max+'" data-slider-step="'+options.step+'" data-slider-value="['+options.min+','+options.max+']" filter="'+name+'" /> \xa0\xa0 <b>'+options.max+'</b>');
        panel_body.append(slider);
        parent_node.append(panel);
        $('#'+name_no_space+'_slider').slider({}).on('slideStop',function(event){
            filter_state[name].min=event.value[0];
            filter_state[name].max=event.value[1];
            update_page(filter_state);
        });
    } else if (type==='multiselect_autocomplete'){
        //one textbox with autocomplete; multiple values may be submitted
        var text_box=$('<input type="text" id="'+name_no_space+'_textbox" filter="'+name+'" class="">');
        parent_node.append(panel);
        panel_body.append(text_box);
        $.get('/api/autocomplete/'+options.id, function(data){
            text_box.typeahead({ source:data });
        },'json');
        $('\xa0\xa0 <span class="glyphicon glyphicon-plus" aria-hidden="true" id="'+name_no_space+'_add_button"></span><br><div id="'+name_no_space+'_selected_container"></div>').insertAfter('#'+name_no_space+'_textbox');
        $('#'+name_no_space+'_add_button').click(function(){
            var chosen_item=$('#'+name_no_space+'_textbox').val();
            if (filter_state[name].indexOf(chosen_item) >-1){
                return false;
            }
            filter_state[name].push(chosen_item);
            var item_to_add=$('<div style="padding:4px;"></div>');
            item_to_add.append('<span>'+chosen_item+'</span>');
            var remove_button=$('<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>');
            remove_button.on('click',function(){
                var chosen_item=$(this).prev().text();
                console.log(chosen_item);
                filter_state[name].splice(filter_state[name].indexOf(chosen_item),1);
                $(this).parent().remove();
                update_page(filter_state);
            })
            item_to_add.append(remove_button);
            $('#'+name_no_space+'_selected_container').append(item_to_add);
            update_page(filter_state);
        })
    } else if (type==='yesno'){
        var select=$('<select id="'+name_no_space+'"></select>');
        select.append('<option>Both</option>');
        for (var i=0;i<2;i++){
            select.append('<option>'+options[i]+'</option>');
        }
        panel_body.append(select);
        select.on('change',function(){
            var val=select.val();
            if (val==="Both"){
                filter_state[name]=options;
            } else {
                filter_state[name]=val;
            }
            update_page(filter_state);
        })
        parent_node.append(panel);
    }
}

function create_all_form_obj(filters,filter_state,container_obj){
    for (key in filters){
        if (filters[key]['type']==='multiselect' || filters[key]['type']==='yesno'){
            filter_state[key]=filters[key]['options'].slice(0);
        } else if (filters[key]['type']==='range'){
            filter_state[key]={max:filters[key]['options']['max'],min:filters[key]['options']['min']};
        } else if (filters[key]['type']==='text_autocomplete'){
            filter_state[key]='';
        } else if (filters[key]['type']==='multiselect_autocomplete'){
            filter_state[key]=[];
        }
        create_individual_form_obj(key,filters[key]['type'],filters[key]['options'],container_obj,filter_state);
    }
}

function update_page(filter_state){
    //if hitting performance issues, add apply button
    var loading_logo=$('<div style="position: absolute;top: 200px;right: 200px"><img src="//i.stack.imgur.com/MnyxU.gif"></div>');
    $('body').append(loading_logo);
    $.ajax({
        url:'/api/filter',
        type:'POST',
        dataType:'json',
        data:{filter_state:JSON.stringify(filter_state),},
        success:function(data){
            $('#npts').text(data['count']);
            if (table_init){
                $("#patients").dataTable().fnDestroy();
            }
            table_init=true;
            console.log(data);
            $("#patients").dataTable({
                "data": data['patients'],
                "columns":[
                    { "title": "Marital Status" },
                    { "title": "Race" },
                    { "title": "Religion" },
                    { "title": "Age" },
                    { "title": "Sex" },
                    { "title": "Mortality" },
                    { "title": "" }
                ],
                autoWidth:true
            });
            loading_logo.remove();
        }
    })
}

$(document).ready(function(){
    create_all_form_obj(filters,filter_state,$('#filters_container'));
    update_page(filter_state);
})


