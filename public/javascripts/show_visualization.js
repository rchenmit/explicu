var current_pid=-1;
function show_events(pid){
    if (current_pid == pid){
        return;
    }
    current_pid = pid;
    $('#canvas').empty();
    var vis_div=$('#canvas')[0];
    var options={maxHeight:600,width:'90%',stack:true};
    $.ajax({
        url:'/api/timeline/'+pid,
        type:'GET',
        dataType:'json',
        success:function(data){
            if (data === []){
                return;
            }
            var timeline1 = new vis.Timeline(vis_div, data, options);
            window.location.replace('#timeline')
        }
    })

}

function show_history(pid,button){
    $.ajax({
        url:'/api/elixhauser/'+pid,
        type:'GET',
        dataType:'json',
        success:function(data){
            var text='';
            for (var i=0;i<data.length;i++){
                text+=data[i]+"<br>";
            }
            if (data.length==0){
                text='No medical data available';
            }
            button=$(button);
            button.attr('data-toggle','tooltip');
            button.attr('data-placement',"top");
            button.attr('title',text);
            button.attr('data-html','true');
            button.tooltip('show');
        }
    })
}
