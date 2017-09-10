let connectionForm, subscriptionForm, state, tbody;

let client;

$(function () {
  $('#color').colorpicker();
  $('#connectButton').click(handleConnect);
  $('#subscribeButton').click(handleSubscribe);
});

function handleConnect(event) {
  connectionForm = connectionForm || $('#connectionForm');
  const formData = convertFormData(connectionForm.serializeArray());

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

function handleSubscribe(event) {
  subscriptionForm = subscriptionForm || $('#subscriptionForm');
  const formData = convertFormData(subscriptionForm.serializeArray());

  const {
    subscribeTopic: topic,
    subscribeQoS: qos,
    color
  } = formData;

  if (client) {
    client.subscribe(topic, {'qos': parseInt(qos)}, function (err) {
      if (err) {
        alert(`There has some problems when subscribe topic "${formData.topic}"!\nError:${err}`);
      } else {
        tbody = tbody || $('tbody');
        tbody.append(`<tr><td>${topic}</td><td><i style="background: ${color}"></i></td><td>${qos}</td></tr>`);
      }
    });
  } else {
    alert('You have to create connection first!');
  }

  event.preventDefault();
}

/**
 * 将 jQuery 序列化后的表单数据数组转换为对象
 * @param {Array} arr
 * @return {Object}
 */
function convertFormData(arr) {
  let obj = {};
  if (!arr || !arr.length) {
    return obj;
  }
  arr.forEach(function (item) {
    if (item.value) {
      obj[item.name] = item.value;
    }
  });
  return obj;
}

