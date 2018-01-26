# MQTT Client Showcase

This is a MQTT websocket client demo using mqtt.js. You can use it to test connections, subscriptions, publishing messages, etc.

## How to use

You can visit the https://hezhii.github.io/mqttjs-client directly.

On that page, you can test connect to MQTT broker. After connected, you can subscribe a topic and publish a message to the topic.Then you will receive the message that you just published.

You can choose the QoS level both subscribe and publish a topic. And when you publish a message, you can set the "retain" option. If the retain is true, MQTT broker will retain the message and send the message to new subscriber.
