const ipc = require('electron').ipcRenderer; 
const template = "<a href=\"#\" class=\"list-group-item list-group-item-action\">  <div class=\"d-flex w-100 justify-content-between\"> <h6 class=\"mb-1\" id=\"Name\">Past due plugin installation <small id=\"Alias\">Alias 1, alias 2</small></h6> </div> <p class=\"mb-1\" id=\"Body\">Nam eget mi lacus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vehicula urna augue, at semper metus rhoncus sed. Morbi sit amet leo vel libero luctus ornare ut non quam.</p> </a>";
let $list = $( "#SelectionList" );

let selected = 0;

let items = [
    {id: 0, name: "Test", body: "Test", aliases: ""},
    {id: 0, name: "Test 1", body: "Test", aliases: ""},
    {id: 0, name: "Test 2", body: "Test", aliases: ""},
    {id: 0, name: "Test 2", body: "Test", aliases: ""},
    {id: 0, name: "Test 2", body: "Test", aliases: ""},
]

ipc.on("list-items", (event, args) => {
    items = args;
    ProcessItems();
})

ipc.on("reload-query", (event, args) => {
    ProcessSearch();
})

function handleInput(event) {
    console.log(event)
    if(event.keyCode == 13) { // enter pressed
        // if modal is open, enter should be handled differently!
        if(IsModalOpen())
            return

        if(items.length > 0) {
            let reply = ipc.send('paste-snippet', items[selected]);
        } else {
            OpenCreate("INSERT CURRENT QUERY FIELD!!!")
        }

        $("#query-field").val("")

    } else if (event.keyCode == 27) { // esc pressed
        if(IsModalOpen()) {
            CloseModals()
        } else {
            let reply = ipc.send('close-window');
            $("#query-field").val("")
        }
        
    } else if (event.keyCode == 67 && event.ctrlKey) { // ctrl+C pressed
        let reply = ipc.send('copy-snippet', items[selected]);
        $("#query-field").val("")

    } else if (event.keyCode == 78 && event.ctrlKey) { // ctrl+N pressed
        OpenCreate()
    } else if (event.keyCode == 69 && event.ctrlKey) {
        OpenEdit(items[selected])
    } else if (event.keyCode == 40 && !IsModalOpen()) {
        SelectItem(selected + 1)
    } else if (event.keyCode == 38 && !IsModalOpen()) {
        SelectItem(selected - 1)
    }
}

function IsModalOpen() {
    return ($('#create-snippet').data('bs.modal') || {})._isShown || ($('#edit-snippet').data('bs.modal') || {})._isShown
}

function ProcessSearch(e) {
    if(e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 17 || e.ctrlKey)
        return;

    let reply = ipc.send('process-query', $("#query-field").val());
}

function CloseModals() {
    $('#create-snippet').modal("hide")
    $('#edit-snippet').modal("hide")

    $("#query-field").focus();
}

$('#create-snippet').on('shown.bs.modal', function (e) {
    $("#create-name").trigger("focus");
})

$('#edit-snippet').on('shown.bs.modal', function (e) {
    $("#edit-name").trigger("focus");
})

function OpenCreate(text = "") {
    $('#create-snippet').modal('show')
}

function OnCreate(e) {
    let data = {
        name: $("#create-name").val(),
        body: $("#create-body").val()
    }
    
    let reply = ipc.send('create-snippet', data);
    CloseModals();
}

function OpenEdit(item) {
    $('#edit-snippet').modal('show')

    $("#edit-name").val(items[selected].name);
    $("#edit-body").val(items[selected].body);
}

function OnEdit(e) {
    let data = items[selected]
    data.name = $("#edit-name").val();
    data.body =  $("#edit-body").val();
    
    let reply = ipc.send('update-snippet', data);
    CloseModals()
}

function DeleteItem(item) {
    
}

function CreateDomElement(item) {
    html = $.parseHTML( template );

    let body = item.body.substring(0,350);
    if(item.body.length > 350)
        body += "..."

    $(html).find("#Name").html(`#${item.id} - ${item.name}`)
    $(html).find("#Body").text(body)
    $list.append( html );
}

function SelectItem(newIndex) {
    if(newIndex >= $list.children().length || newIndex < 0)
        return

    $list = $( "#SelectionList" )

    console.log($list.children())
    if(selected < $list.children().length)
        $($list.children()[selected]).removeClass("active");

    selected = newIndex;
    $($list.children()[selected]).addClass("active");
    $list.children()[selected].scrollIntoView(false);
}

function ProcessItems() {
    $list.empty();

    items.forEach(item => {
        CreateDomElement(item);
    })
    
    SelectItem(0)
    $("#query-field").focus();
}

window.addEventListener('keydown', handleInput, true)