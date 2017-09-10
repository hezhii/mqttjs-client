let connectionForm, client, state;

$(function () {
  $('#color').colorpicker();
  $('#connectButton').click(connect);
});

function connect(event) {
  connectionForm = connectionForm || $('#connectionForm');
  let data = connectionForm.serializeArray();
  let formData = {};

  data.forEach(function (item) {
    if (item.value) {
      formData[item.name] = item.value;
    }
  });

  client = mqtt.connect(`ws://${formData.host}:${formData.port}/mqtt`, {
    username: formData.username,
    password: formData.password,
    clientId: formData.clientId
  });

  client.on('connect', function () {
    state = state || $('#state');
    state.attr('class', 'color-green');
    state.children('span').text('connected');
  });

  event.preventDefault();
}