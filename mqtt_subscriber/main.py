from enum import Enum
import json
import logging
import os
import sys
from typing import Any

from paho.mqtt.client import Client, MQTTMessage
from paho.mqtt.enums import CallbackAPIVersion
import requests
from requests import Response

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


class Event(str, Enum):
    EVENT_IN = "rfid_in"
    EVENT_OUT = "rfid_out"


def _get_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        logging.error(f"[env]: {name} is missing")
        sys.exit(2)

    return value


config = {
    "MQTT_SERVER": _get_env("MQTT_SERVER"),
    "MQTT_PORT": int(_get_env("MQTT_PORT")),
    "MQTT_LOGIN": _get_env("MQTT_LOGIN"),
    "MQTT_PASS": _get_env("MQTT_PASS"),
    "MQTT_TOPIC": _get_env("MQTT_TOPIC"),
    "WEBAPP_URL": _get_env("WEBAPP_URL"),
    "AUTH_TOKEN": _get_env("AUTH_TOKEN"),
}

client = Client(callback_api_version=CallbackAPIVersion.VERSION2)


def get_event(topic: str) -> Event | None:
    try:
        event = topic.split("/")[1]
        return Event(event)
    except:
        return None


def request_webapp(code: str, event: Event) -> Response:
    match event:
        case Event.EVENT_IN:
            type = "enter"
        case Event.EVENT_OUT:
            type = "exit"

    url = f"{config["WEBAPP_URL"]}/api/v1/rfid/{type}"

    return requests.post(
        url, headers={"X-Service-Key": config["AUTH_TOKEN"], "X-RFID-Key": str(code)}
    )


@client.connect_callback()
def on_connect(client: Client, userdata: Any, flags, reason_code, properties=None):
    logging.info(f"Connected with result code {reason_code}")
    client.subscribe(config["MQTT_TOPIC"])


@client.message_callback()
def on_message(client: Client, userdata: Any, msg: MQTTMessage):
    payload_dict = json.loads(msg.payload.decode())
    event = get_event(msg.topic)
    if "code" not in payload_dict or not event:
        log_record = {"payload": payload_dict, "event": event}
        logging.warning(json.dumps(log_record, indent=2))
        return

    res = request_webapp(payload_dict["code"], event)
    log_record = {
        "payload": payload_dict,
        "event": event,
        "response": res.text,
        "status_code": res.status_code,
    }
    logging.info(json.dumps(log_record, indent=2))


if __name__ == "__main__":
    client.username_pw_set(config["MQTT_LOGIN"], config["MQTT_PASS"])
    client.connect(config["MQTT_SERVER"], config["MQTT_PORT"], 60)
    client.loop_forever()
