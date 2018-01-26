let connectionForm, subscriptionForm, publishForm, state, messageList, colorPicker;

let client, protol;

const TOPIC_COLOR_MAP = {};

const SUBSCRIBED_TOPICS = [];

$(function () {
  colorPicker = $('#color');
  colorPicker.colorpicker();
  $('#connectButton').click(handleConnect);
  $('#subscribeButton').click(handleSubscribe);
  $('#publishButton').click(handlePublish);
  $('#topicList').click(handleUnsubscribe);
  $('#clearMessage').click(clearMessage);

  if (window.location.protocol === 'https:') {
    protol = 'wss';
    $('#port').val(443);
  } else {
    protol = 'ws';
    $('#port').val(80);
  }
});

function handleConnect(event) {
  connectionForm = connectionForm || $('#connectionForm');
  const formData = convertFormData(connectionForm.serializeArray());


  client = mqtt.connect(`${protol}://${formData.host}:${formData.port}${formData.url}`, {
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

  return false;
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
    if (SUBSCRIBED_TOPICS.includes(topic)) {
      alert('You are already subscribed to this topic!');
      return false;
    }
    SUBSCRIBED_TOPICS.push(topic);
    client.subscribe(topic, { 'qos': parseInt(qos) }, function (err) {
      if (err) {
        alert(`There has some problems when subscribe topic "${formData.topic}"!\nError:${err.message}`);
      } else {
        TOPIC_COLOR_MAP[topic] = color;
        $('#topicList').append(
          `<li class='topic-item' style='border-left-color: ${color}'>
             <div class='content'>
               <a class='close' data-topic='${topic}'>x</a>
               <div class='qos'>Qos:${qos}</div>
               <div class='topic'>${topic}</div>
             </div>
           </li>`
        );
        colorPicker.colorpicker('setValue', getRandomColor());
      }
    });
  } else {
    alert('You have to create connection first!');
  }

  event.preventDefault();
}

function handleUnsubscribe(event) {
  const target = event.target;
  if (target.tagName === 'A') {
    const $target = $(target);
    const topic = $target.data('topic');
    client.unsubscribe(topic, function (err) {
      if (err) {
        alert(`Unsubscribe topic: ${topic} fail!`);
      } else {
        SUBSCRIBED_TOPICS.splice(SUBSCRIBED_TOPICS.indexOf(topic), 1);
        $target.parents('li').remove();
      }
    });
    return false;
  }
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

function clearMessage() {
  $('#messageList').empty();
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
  let pattern = topic.replace('+', '(.+?)').replace('#', '(.*)');
  let regex = new RegExp('^' + pattern + '$');
  return regex.test(subTopic);
}

function getRandomColor() {
  let r = (Math.round(Math.random() * 255)).toString(16);
  let g = (Math.round(Math.random() * 255)).toString(16);
  let b = (Math.round(Math.random() * 255)).toString(16);
  return r + g + b;
}
