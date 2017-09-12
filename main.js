let connectionForm, subscriptionForm, publishForm, state, tbody, messageList;

let client;

const TOPIC_COLOR_MAP = {};

$(function () {
  $('#color').colorpicker();
  $('#connectButton').click(handleConnect);
  $('#subscribeButton').click(handleSubscribe);
  $('#publishButton').click(handlePublish);
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

  client.on('error', function (err) {
    alert('There has some problems when create connection!\n Error is:' + err.message);
  });

  client.on('message', handleMessage);

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
        alert(`There has some problems when subscribe topic "${formData.topic}"!\nError:${err.message}`);
      } else {
        TOPIC_COLOR_MAP[topic] = color;
        tbody = tbody || $('tbody');
        tbody.append(`<tr><td>${topic}</td><td><i style="background: ${color}"></i></td><td>${qos}</td></tr>`);
      }
    });
  } else {
    alert('You have to create connection first!');
  }

  event.preventDefault();
}

function handlePublish() {
  publishForm = publishForm || $('#publishForm');
  const formData = convertFormData(publishForm.serializeArray());

  const {
    publishTopic: topic,
    publishQoS: qos,
    publishRetain: retain,
    publishMessage: msg
  } = formData;

  if (client) {
    client.publish(topic, msg, {
      'qos': parseInt(qos),
      'retain': retain === 'on'
    });
  } else {
    alert('You have to create connection first!');
  }
  event.preventDefault();
}


function handleMessage(topic, msg, packet) {
  messageList = messageList || $('#messageList');
  messageList.append(`<li style="border-left: solid 10px ${getColorForSubscription(topic)};">
                  <div class="container-fluid message">
                    <div class="row small-text">
                      <div class="col-md-3">${new Date().toLocaleDateString()}</div>
                      <div class="col-md-5">Topic: ${topic}</div>
                      <div class="col-md-2">Qos: ${packet.qos}</div>
                      <div class="col-md-2">Retain: ${packet.retain}</div>
                    </div>
                    <div class="row">
                      <div class="col-md-12 message-content">
                        ${msg}
                      </div>
                    </div>
                  </div>
                </li>`);
}

/**
 * 将 jQuery 序列化后的表单数据数组转换为对象
 *
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

/**
 * 获取订阅主题相应的颜色
 *
 * @param {String} topic - 主题
 */
function getColorForSubscription(topic) {
  for (let _topic in TOPIC_COLOR_MAP) {
    if (this.containTopic(_topic, topic)) {
      return TOPIC_COLOR_MAP[_topic];
    }
  }
}

/**
 * 判断一个主题是否包含另外一个主题
 *
 * @param {String} topic -父主题
 * @param {String} subTopic - 子主题
 */
function containTopic(topic, subTopic) {
  var pattern = topic.replace("+", "(.+?)").replace("#", "(.*)");
  var regex = new RegExp("^" + pattern + "$");
  return regex.test(subTopic);
}

