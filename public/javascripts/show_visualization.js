var current_pid=-1;
function show_events(pid){
    if (current_pid == pid){
        return;
    }
    current_pid = pid;
    $('#canvas').empty();
    var vis_div=$('#canvas')[0];
    var options={maxHeight:300,width:'90%',stack:true};
    $.ajax({
        url:'/api/timeline/'+pid,
        type:'GET',
        dataType:'json',
        success:function(data){
            if (data === []){
                return;
            }
            var timeline1 = new vis.Timeline(vis_div, data, options);
        }
    })

}
